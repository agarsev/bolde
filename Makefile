CSS:=$(patsubst src/%.less, build/%.css, $(wildcard src/*.less))
JS:=$(patsubst src/%.jsx, build/%.js, $(wildcard src/*.jsx))

all: $(CSS) $(JS)

build/%.css: src/%.less
	lessc $< --autoprefix="last 3 versions" >$@

build/%.js: src/%.jsx
	jsx --harmony $< >$@
