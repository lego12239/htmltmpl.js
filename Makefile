SRC_MIN := htmltmpl/core.min.js htmltmpl/ifdef.min.js htmltmpl/func.min.js
SRC := htmltmpl/core.js htmltmpl/ifdef.js htmltmpl/func.js
VERSION := 1.1.0

.PHONY: build upd_version clean minify

build: upd_version
	$(MAKE) minify

clean:
	find . -name '*~' -exec rm -f '{}' \+

upd_version: $(SRC)
	sed -i -re 's/\| htmltmpl ([0-9.]+)/| htmltmpl $(VERSION)/' $^

minify: $(SRC_MIN)

%.min.js: %.js
	jsmin < $^ > $@
	sed -ne '1 p; 2 q' $^ > $@.tmp
	cat $@ >> $@.tmp
	mv $@.tmp $@