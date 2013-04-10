build:
	@echo "Building.."
	@echo whoami: `whoami`
	@echo pwd: `pwd`
	@echo component: `which component`
	@component build --dev

all: build test-build

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test-build:
	cd ./test && grunt --force

.PHONY: clean all components clean test-build build
