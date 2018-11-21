SRC := htmltmpl/core.js htmltmpl/ifdef.js htmltmpl/func.js htmltmpl/ifeq.js
SRC_MIN := $(patsubst %.js, %.min.js,$(SRC))
VERSION := 1.4.0

.PHONY: build upd_version clean minify solid

build: upd_version
	$(MAKE) minify

clean:
	find . -name '*~' -exec rm -f '{}' \+

upd_version: $(SRC)
	sed -i -re 's/\| htmltmpl ([0-9.]+)/| htmltmpl $(VERSION)/' $^

minify: $(SRC_MIN)

solid: $(SRC_MIN)
	cat $^ > htmltmpl.solid.min.js

%.min.js: %.js
	jsmin < $^ > $@
	sed -ne '1 p; 2 q' $^ > $@.tmp
	cat $@ >> $@.tmp
	mv $@.tmp $@
