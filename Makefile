SRC:=$(wildcard src/**/*.less)

OUT:=$(notdir $(SRC))
OUT:=$(patsubst %.less, %.css, $(OUT))
OUT:=$(addprefix build/, $(OUT))

VPATH:=src/styles

all: $(OUT)
	browserifyinc -v --extension=.jsx -t [ reactify --es6 ] src/main.jsx -o build/bundle.js

build/%.css: %.less
	lessc $< --autoprefix="last 3 versions" >$@

update:
	npm install
	bower install
	mkdir -p build

clean:
	rm -rf build/*

.PHONY: update clean
