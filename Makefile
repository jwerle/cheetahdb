
build: components test-build index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test-build:
	cd ./test && grunt --force

.PHONY: clean
