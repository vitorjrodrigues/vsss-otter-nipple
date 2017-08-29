# Component makefile for nanopb
# Make the component headers accessible to the main project
INC_DIRS += $(nanopb_ROOT)..

# args for passing into compile rule generation
nanopb_SRC_DIR = $(nanopb_ROOT)

nanopb_CFLAGS = $(CFLAGS)

$(eval $(call component_compile_rules,nanopb))
