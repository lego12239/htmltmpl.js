
.PHONY: clean minify

clean:
	find . -name '*~' -exec rm -f '{}' \+

minify: htmltmpl.js
	jsmin < $^ > htmltmpl.min.js
	echo "/* htmltmpl | Version 1.0.0 | License - GNU LGPL 3 */" > htmltmpl.min.js.tmp
	cat htmltmpl.min.js >> htmltmpl.min.js.tmp
	mv htmltmpl.min.js.tmp htmltmpl.min.js
