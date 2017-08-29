#include "espressif/esp_common.h"
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"

#include <esp/uart.h>
#include <esp/spi.h>
#include <math.h>

#include "NodeMCU_pinmap.h"
#include "lwip_tcp_server.h"
#include "httpd/httpd.h"
#include "ota-tftp.h"
#include <sys/socket.h>
#include "pb.h"
#include "pb_decode.h"
#include "command.pb.h"
#include "sigma_delta_speed.h"
#include "quadrature_decoder.h"

#include "private_ssid_config.h"
bool updateWirelessSettings = true;

#define debug_printf printf

// Software Sigma-delta modulation (cause there are no hardware PWMs)
sigma_delta_speed<int16_t, 256, NODE_D3, NODE_D4> left_motor;
sigma_delta_speed<int16_t, 256, NODE_D6, NODE_D5> right_motor;

// Quadrature position encoders
quadrature_decoder<int32_t, 360, NODE_D1, NODE_D2> left_encoder;
quadrature_decoder<int32_t, 360, NODE_D7, NODE_D8> right_encoder;

static void frc1_interrupt_handler(void) {
	uint32_t out  = left_motor()    | right_motor();
	uint32_t mask = left_motor.mask | right_motor.mask;
	GPIO.OUT_SET   = mask &  out;
	GPIO.OUT_CLEAR = mask & ~out;
}

static void gpio_interrupt_handler(void) {
	uint32_t status = GPIO.STATUS;
	GPIO.STATUS_CLEAR = status;
	
	uint32_t data = GPIO.IN;
	left_encoder(data);
	right_encoder(data);
}

// nano protobuf related code
bool pb_istream_callback(pb_istream_t *stream, pb_byte_t *buf, size_t count) {
	debug_printf("PBISCB(%p, %p, %d)", stream, buf, count);
	int client = *((int*)stream->state);
	size_t i = 0;
	while (i != count) {
		ssize_t r = lwip_read(client, buf+i, count-i);
		if (r < 0) {
			debug_printf(" = %d\n", 0);
			return false;
		}
		if (!r)
			vTaskDelay(1);
		i += r;
	}
	debug_printf(" = %d\n", 1);
	return true;
}

void vsss_handle_client(int client) {
	pb_istream_s istream;
	debug_printf("INICIO");
	istream.callback = &pb_istream_callback;
	istream.state = &client;
	istream.bytes_left = ~(size_t)0;
	debug_printf("OLAR2");
	_vss_command_Robot_Command rcmd;
	while(pb_decode_delimited(&istream, vss_command_Robot_Command_fields, &rcmd)) {
		debug_printf("TCP-RCMD(%f,%f)\n", rcmd.left_vel, rcmd.right_vel);
		left_motor.setSpeed(256 * rcmd.left_vel);
		right_motor.setSpeed(256 * rcmd.right_vel);
	}
}

void vsss_server_task(void *) {
	int server = lwip_tcp_server(5556);
	if (server < 0 )
		return;
	debug_printf("VSSS server started on port 5556.\n");
	
	while (true) {
		vTaskDelay(1);
		int client = lwip_accept(server, 0, 0);
		if (client < 0)
			continue;
		debug_printf("VSSS client in.\n");

		vsss_handle_client(client);
		
		debug_printf("VSSS client out.\n");
		lwip_close(client);
	}
}

void onWebSocketData(struct tcp_pcb *pcb, uint8_t *data, u16_t data_len, uint8_t mode) {
	if (!data) {
		// No-data means client disconnect, at least on 
		printf("onWebSocketData: No data.\n");
		tcp_close(pcb);
		return;
	}
	if (mode == WS_TEXT_MODE) {
		printf("onWebSocketData: Text data, %d bytes.\n", data_len);
		if (strncmp((char *)data, "PING?", data_len) == 0) {
			websocket_write(pcb, (const uint8_t*)"PONG!", 5, WS_TEXT_MODE);
			printf("PONG!\n");
		}
		return;
	}
	
	printf("onWebSocketData: %d RAW bytes, {", data_len);
	for (u16_t i=0; i<data_len; ++i) {
		printf(" %d", data[i]);
	}
	printf(" }.\n");
	
	pb_istream_t istream = pb_istream_from_buffer(data, data_len);
	_vss_command_Robot_Command rcmd;
	if(pb_decode_delimited(&istream, vss_command_Robot_Command_fields, &rcmd)) {
		debug_printf("WS-RCMD(%f,%f)\n", rcmd.left_vel, rcmd.right_vel);
		left_motor.setSpeed(256 * rcmd.left_vel);
		right_motor.setSpeed(256 * rcmd.right_vel);
	}
}

void onWebSocketOpen(struct tcp_pcb *pcb, const char *uri) {
	printf("onWebSocketOpen(pcb, %s)\n", uri);
}

extern "C" void user_init(void)
{	
	uart_set_baud(0, 115200);
	printf("SDK version:%s\n", sdk_system_get_sdk_version());
	printf("Flash Memory ID:0x%X\n", sdk_spi_flash_get_id());
	printf("Pi = %f\n", M_PI);
	
	// If enabled this will replace ESP's persistent WiFi settings
	if (updateWirelessSettings) {
		sdk_station_config config;
		strcpy((char*)config.ssid, WIFI_SSID);
		strcpy((char*)config.password, WIFI_PASS);
		
		/* required to call wifi_set_opmode before station_set_config */
		sdk_wifi_set_opmode(STATION_MODE);
		sdk_wifi_station_set_config(&config);
	}
	
	xTaskCreate(vsss_server_task, "VSSS", 2048, NULL, 5, NULL);
	
	// Motors setup: Software sigma-delta modulator
	_xt_isr_attach(INUM_TIMER_FRC1, frc1_interrupt_handler);
	timer_set_load(FRC1, 80*100); // Is this how you say 1000us?
	timer_set_reload(FRC1, true);
	timer_set_interrupts(FRC1, true);
	timer_set_run(FRC1, true);
	
	// Motors setup: GPIO
	gpio_set_iomux_as_gpio(left_motor.fwd_pin);
	gpio_set_iomux_as_gpio(left_motor.rwd_pin);
	gpio_set_iomux_as_gpio(right_motor.fwd_pin);
	gpio_set_iomux_as_gpio(right_motor.rwd_pin);
	gpio_enable(left_motor.fwd_pin,  GPIO_OUTPUT);
	gpio_enable(left_motor.rwd_pin,  GPIO_OUTPUT);
	gpio_enable(right_motor.fwd_pin, GPIO_OUTPUT);
	gpio_enable(right_motor.rwd_pin, GPIO_OUTPUT);
	GPIO.OUT_CLEAR = left_motor.mask | right_motor.mask;
	
	// Encoders
	_xt_isr_attach(INUM_GPIO, gpio_interrupt_handler);
	gpio_set_iomux_as_gpio(left_encoder.a_pin);
	gpio_set_iomux_as_gpio(left_encoder.b_pin);
	gpio_set_iomux_as_gpio(right_encoder.a_pin);
	gpio_set_iomux_as_gpio(right_encoder.b_pin);
	gpio_enable(left_encoder.a_pin,  GPIO_INPUT);
	gpio_enable(left_encoder.b_pin,  GPIO_INPUT);
	gpio_enable(right_encoder.a_pin, GPIO_INPUT);
	gpio_enable(right_encoder.b_pin, GPIO_INPUT);
	gpio_set_interrupt(left_encoder.a_pin,  GPIO_INTTYPE_EDGE_ANY, 0);
	gpio_set_interrupt(left_encoder.b_pin,  GPIO_INTTYPE_EDGE_ANY, 0);
	gpio_set_interrupt(right_encoder.a_pin, GPIO_INTTYPE_EDGE_ANY, 0);
	gpio_set_interrupt(right_encoder.b_pin, GPIO_INTTYPE_EDGE_ANY, 0);
	
	// HTTP server
	websocket_register_callbacks(onWebSocketOpen, onWebSocketData);
	httpd_init();
	
	// Over-the-air updates
	ota_tftp_init_server(69);
}
