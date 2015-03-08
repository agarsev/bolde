CSS:=$(patsubst src/%.less, build/%.css, $(wildcard src/*.less))
JS:=$(patsubst src/%.jsx, build/%.js, $(wildcard src/*.jsx))

all: $(CSS) $(JS)

build/%.css: src/%.less
	lessc $< >$@

build/%.js: src/%.jsx
	jsx $< >$@
