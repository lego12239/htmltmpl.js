
.PHONY: clean minify

clean:
	find . -name '*~' -exec rm -f '{}' \+

minify: htmltmpl.js
	awk 'BEGIN { is_comment = 0;\
	print("/* Version 0.1.0 , for copyright see LICENSE file */");\
	}\
	start_a_comment { start_a_comment = 0; is_comment = 1; }\
	$$0 ~ /\/\*/ { start_a_comment = 1; }\
	(! is_comment ) && ($$0 ~ /\/\/.*$$/ ) { gsub(/\/\/.*$$/, ""); }\
	(! is_comment) && ( $$0 ~ /^htmltmpl.prototype/ ) { $$0 = "; " $$0; }\
	! is_comment { gsub(/[[:space:]]+/, " ");\
	gsub(/\/\*.*$$/, " ");\
	printf("%s ", $$0);\
	}\
	$$0 ~ /\*\// { is_comment = 0; }' $^ > htmltmpl.min.js
