STYLES:=$(patsubst src/styles/%.less, build/%.css, $(wildcard src/styles/*))
ENGINES:=$(patsubst src/%.jsx, build/%.js, $(wildcard src/engines/*))

all: $(STYLES) build/bundle.js $(ENGINES)

build/bundle.js: $(wildcard src/*.jsx) $(wildcard src/**/*.jsx) welcome.md
	mkdir -p build
	browserifyinc -v --ignore-missing --extension=.jsx -t [ reactify --es6 ] -t brfs src/main.jsx -o build/bundle.js

$(ENGINES): build/%.js: src/%.jsx
	mkdir -p build/engines
	browserifyinc -v --extension=.jsx -t [ reactify --es6 ] $< -o $@

$(STYLES): build/%.css: src/styles/%.less
	mkdir -p build
	lessc $< --autoprefix="last 3 versions" >$@

update:
	npm install
	bower install

clean:
	rm -rf build/*

.PHONY: update clean
