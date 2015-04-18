SRC:=$(wildcard src/*.*) $(wildcard src/**/*)

OUT:=$(notdir $(SRC))
OUT:=$(patsubst %.jsx, %.js, $(OUT))
OUT:=$(patsubst %.less, %.css, $(OUT))
OUT:=$(addprefix build/, $(OUT))

VPATH:=src:src/components:src/styles:src/stores

all: $(OUT)
	webpack

build/%.css: %.less
	lessc $< --autoprefix="last 3 versions" >$@

build/%.js: %.jsx
	jsx --harmony $< >$@

update:
	npm install
	bower install
	mkdir -p build

clean:
	rm -rf build/*

.PHONY: update clean
