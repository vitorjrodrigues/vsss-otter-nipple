// Node-MCU pin mapping
#define NODE_D0  16
#define NODE_D1   5
#define NODE_D2   4
#define NODE_D3   0
#define NODE_D4   2
#define NODE_D5  14
#define NODE_D6  12
#define NODE_D7  13
#define NODE_D8  15
#define NODE_D9   3
#define NODE_D10  1
#define NODE_D11  9
#define NODE_D12 10

inline void gpio_set_iomux_as_gpio(int pin) {
	switch(pin) {
//	case NODE_D0:  gpio_set_iomux_function(16, IOMUX_GPIO16_FUNC_GPIO); break;
	case NODE_D1:  gpio_set_iomux_function( 5, IOMUX_GPIO5_FUNC_GPIO ); break;
	case NODE_D2:  gpio_set_iomux_function( 4, IOMUX_GPIO4_FUNC_GPIO ); break;
	case NODE_D3:  gpio_set_iomux_function( 0, IOMUX_GPIO0_FUNC_GPIO ); break;
	case NODE_D4:  gpio_set_iomux_function( 2, IOMUX_GPIO2_FUNC_GPIO ); break;
	case NODE_D5:  gpio_set_iomux_function(14, IOMUX_GPIO14_FUNC_GPIO); break;
	case NODE_D6:  gpio_set_iomux_function(12, IOMUX_GPIO12_FUNC_GPIO); break;
	case NODE_D7:  gpio_set_iomux_function(13, IOMUX_GPIO13_FUNC_GPIO); break;
	case NODE_D8:  gpio_set_iomux_function(15, IOMUX_GPIO15_FUNC_GPIO); break;
	case NODE_D9:  gpio_set_iomux_function( 3, IOMUX_GPIO3_FUNC_GPIO ); break;
	case NODE_D10: gpio_set_iomux_function( 1, IOMUX_GPIO1_FUNC_GPIO ); break;
	case NODE_D11: gpio_set_iomux_function( 9, IOMUX_GPIO9_FUNC_GPIO ); break;
	case NODE_D12: gpio_set_iomux_function(10, IOMUX_GPIO10_FUNC_GPIO); break;
	}
}
