
build: components index.js
	@component build --dev
	@make test-build

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test-build:
	cd ./test && grunt --force

.PHONY: clean
