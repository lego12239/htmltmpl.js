SRC_MIN := htmltmpl/core.min.js htmltmpl/ifdef.min.js htmltmpl/func.min.js
SRC := htmltmpl/core.js htmltmpl/ifdef.js htmltmpl/func.js

.PHONY: build clean minify

build: minify

clean:
	find . -name '*~' -exec rm -f '{}' \+

minify: $(SRC_MIN)

%.min.js: %.js
	jsmin < $^ > $@
	sed -ne '1 p; 3 q' $^ > $@.tmp
	cat $@ >> $@.tmp
	mv $@.tmp $@