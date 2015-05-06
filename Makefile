SRC:=$(wildcard src/**/*.less)

OUT:=$(notdir $(SRC))
OUT:=$(patsubst %.less, %.css, $(OUT))
OUT:=$(addprefix build/, $(OUT))

WORKERS:=build/example.js

VPATH:=src/styles src/workers

all: $(OUT) build/bundle.js $(WORKERS)

build/bundle.js: $(wildcard src/*.jsx) $(wildcard src/**/*.jsx)
	browserifyinc -v --extension=.jsx -t [ reactify --es6 ] src/main.jsx -o build/bundle.js

$(WORKERS): build/%.js: %.jsx
	browserifyinc -v --extension=.jsx -t [ reactify --es6 ] $< -o $@

build/%.css: %.less
	lessc $< --autoprefix="last 3 versions" >$@

update:
	npm install
	bower install
	mkdir -p build

clean:
	rm -rf build/*

.PHONY: update clean
