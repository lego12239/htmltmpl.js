/* htmltmpl.core | htmltmpl 3.0.1 | License - GNU LGPL 3 */
/*
  This library is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

  https://github.com/lego12239/htmltmpl
*/
{
	"use strict";
/*
  prms = {
  	case_sensitive: 0/1,
	global_vars: 0/1,
	loop_context_vars: 0/1,
	tmpl_is_commented: 0/1,
	err_on_no_data: 0/1,
	ret_dom: 0/1,
	strip_wrap_spaces: 0/1,
	escape_defval: ETEXT/AVAL/NO,
	name: TEMPLATE_NAME }

  Process the tmpl as string or as html element.
  case_sensitive
	process template constructs in case-sensitive mode.
	1 by default.
  global_vars
	make variables defined outside a loop visible.
	0 by default.
  loop_context_vars
	Enable loop variables (__first__, __last__, __inner__,
	__outer__, __odd__, __even__, __counter__, __index__).
	0 by default.
  tmpl_is_commented
	Enable this if a template is enclosed in <!--/-->. Thus,
	the comment constuct is striped from a result.
	1 by default.
  err_on_no_data
	If we found a template tag and have no such property in a supplied
	data, throw an error.
	0 by default.
  ret_dom
	Return a dom instead of an html code. Dom is generated by creating an
	HTML element(the element to create is autodetected by a first element
	in a result string - out_str), assigning to it innerHTML property a
	result string and returning childNodes of this HTML element.
	0 by default.
  strip_wrap_spaces
	Remove white space at start and at end of a template.
	1 by default.
  escape_defval
	Default value for ESCAPE attribute(ETEXT, AVAL or NO).
	ETEXT by default.
  name
	a template name for using in an error message. If null, then
	use container element name and its id or the first 10 characters
	of the template string(if a template is a string instead of
	some element node).
	null by default.
*/
function htmltmpl(tmpl, prms)
{
	this.p = {};
	this.tmpl = "";
	this.tmpl_parsed = [];
	this.tmpls = {};
	/* used in _throw() */
	this.ctx = {
		tag_name: null,
		lineno: 1};
	this.name = ""; /* used in _throw() */
	this._s = { parse: [[]],
		priv: [],
		data: [],
		v: [{data_lookup_depth: 1}] };

	this._set_prms(prms);

	if (typeof(tmpl) === "undefined")
		this.tmpl = "";
	else if (typeof(tmpl) === "string") {
		this.tmpl = tmpl;
		this.name = tmpl.substring(0, 10);
	} else if (typeof(tmpl) === "object") {
		this.tmpl = tmpl.innerHTML;
		this.name = this._fmt("%s#%s", tmpl.nodeName, tmpl.id);
	}
	if (this.p.name != null)
		this.name = this.p.name;

	if (this.p.tmpl_is_commented)
		this.tmpl = this.tmpl.replace(/^\s*<!--([^]+)-->\s*$/, "$1");

	this._cb_run(this.cb.init);

	this.tmpl_prepare();
}

htmltmpl.p = {
	case_sensitive: 1,
	global_vars: 0,
	loop_context_vars: 0,
	tmpl_is_commented: 1,
	err_on_no_data: 0,
	ret_dom: 0,
	strip_wrap_spaces: 1,
	escape_defval: "ETEXT",
	name: null };

htmltmpl.prototype._set_prms = function (prms)
{
	var p;

	if (prms == undefined)
		prms = {};

	for(p in htmltmpl.p)
		this._set_prm(p, prms[p]);
}

htmltmpl.prototype._set_prm = function (n, v)
{
	if (v == undefined)
		this.p[n] = htmltmpl.p[n];
	else
		this.p[n] = v;
}

htmltmpl.prototype._cb_run = function (cb)
{
	var i;

	for(i = 0; i < cb.length; i++)
		cb[i].call(this);
}

htmltmpl.prototype.tmpl_prepare = function()
{
	var chunks, txt;
	var i, pos, pi;
	var rex;
	var m;

	if (this.p.case_sensitive)
		rex = /^(\/?TMPL_.+?)%}([^]*)$/;
	else
		rex = /^(\/?TMPL_.+?)%}([^]*)$/i;

	chunks = this.tmpl.split(/{%/);

	/* The first chunk is always a TEXT chunk, due to split() work. */
	this._s.parse[0].push({name: "TEXT", data: chunks[0]});
	this.ctx.lineno += this._count_lines(chunks[0]);
	chunks.shift();

	for(i = 0; i < chunks.length; i++) {
		this.ctx.tag_name = null;
		txt = null;
		rex.lastIndex = 0;
		m = rex.exec(chunks[i]);
		if (m) {
			this.parse_tag(m[1]);
			if (m[2] != "")
				txt = m[2];
		} else {
			this._s.parse[0].push({name: "TEXT", data: "{%"});
			txt = chunks[i];
		}
		if (txt != null) {
			this._s.parse[0].push({name: "TEXT", data: txt});
			this.ctx.lineno += this._count_lines(txt);
		}
	}
	this.tmpl_parsed = this._s.parse.shift();
	/* An indicator of a preparation finish (for _throw())*/
	this.ctx.lineno = -1;
	this.ctx.tag_name = null;

	if (this._s.parse.length > 0) {
		txt = "";
		for(i = 0; i < this._s.parse.length; i++) {
			pi = this._s.parse[i][this._s.parse[i].length - 1];
			txt += this._fmt("\n%s at line %d isn't closed",
			  pi.name, pi.lineno);
		}
		this._throw("%s", txt);
	}

	if (this._s.priv.length > 0)
		this._throw("priv stack isn't empty at finish");
}

htmltmpl.prototype._count_lines = function (str)
{
	var pos = -1;
	var cnt = 0;

	while ((pos = str.indexOf("\n", pos + 1)) >= 0)
		cnt++;

	return cnt;
}

htmltmpl.prototype.parse_tag = function (tag)
{
	var m, ret;
	var def, tag_attrs;

	// Split a tag to a name and a body
	this.rex.tag.lastIndex = 0;
	m = this.rex.tag.exec(tag);
	if (!m)
		this._throw("parse_tag err: wrong tag format: %s", tag);

	if (!this.p.case_sensitive)
		this.ctx.tag_name = m[1].toUpperCase();
	else
		this.ctx.tag_name = m[1];
	def = this.tags[this.ctx.tag_name];
	if (def == null)
		this._throw("unknown tag");

	tag_attrs = this._parse_tag_attrs(def, m[2]);

	// Call a tag handler
	def.pfunc.call(this, def, tag_attrs);
}

htmltmpl.prototype._parse_tag_attrs = function(def, attrs)
{
	var m, mmv;
	var name, val;
	var res = {};

	this.rex.tag_attrs.lastIndex = 0;
	while ( m = this.rex.tag_attrs.exec(attrs) ) {
		name = m[1];
		if (!this.p.case_sensitive)
			name = name.toUpperCase();

		if (m[2] != null) {
			val = this.__parse_tag_attr_val(m[2]);
		} else {
			this.rex.tag_attr_mv.lastIndex = 0;
			val = [];
			while (mmv = this.rex.tag_attr_mv.exec(m[3]))
				val.push(this.__parse_tag_attr_val(mmv[1]));
		}
		if ((def.pafuncs != null) && (def.pafuncs[name] != null))
			val = def.pafuncs[name].call(this, val);
		res[name] = val;
	}

	return res;
}

htmltmpl.prototype.__parse_tag_attr_val = function (val)
{
	if ((val.charAt(0) == "'") || (val.charAt(0) == '"'))
		val = val.substr(1, val.length - 2).replaceAll(/\\(.)/g, "$1");
	return val;
}

htmltmpl.prototype._parse_tag_attr_NAME = function (val)
{
	if (typeof(val) != "string")
		this._throw("attribute NAME must be with single value");
	return val.split(".");
}

htmltmpl.prototype._parse_tag_attr_ESCAPE = function (val)
{
	if (typeof(val) != "string")
		this._throw("attribute ESCAPE must be with single value");
	if (!this.p.case_sensitive)
		val = val.toUpperCase();
	switch (val) {
	case "NO":
		val = 0;
		break;
	case "ETEXT":
		val = 1;
		break;
	case "AVAL":
		val = 2;
		break;
	default:
		this._throw("ESCAPE attribute bad value: '%s'", val);
	}

	return val;
}

htmltmpl.prototype._escape_tag_attr_val = function (escape_type, val)
{
	switch (escape_type) {
	case 0:
		break;
	case 1:
		val = val.toString().replaceAll(/\&/g, "\&amp;");
		val = val.replaceAll(/</g, "\&lt;");
		val = val.replaceAll(/>/g, "\&gt;");
		break;
	case 2:
		val = val.toString().replaceAll(/"/g, "\&quot;");
		val = val.replaceAll(/'/g, "\&#39;");
		break;
	default:
		this._throw("unknown ESCAPE code: %s", escape_type);
	}

	return val;
}

htmltmpl.prototype._get_data = function(name)
{
	var len, v;
	var j;

	if (this.p.global_vars)
		len = this._s.data.length;
	else
		len = this._s.v[0].data_lookup_depth;

	if (name == null)
		return this._s.data[0];

	for(j = 0; j < len; j++) {
		if (typeof(this._s.data[j]) != "object")
			continue;
		v = this.__get_data(this._s.data[j], name);
		if (v != undefined)
			return v;
	}

	return;
}

htmltmpl.prototype.__get_data = function(obj, name)
{
	var len = name.length - 1;
	var i;

	for(i = 0; i < len; i++) {
		if (obj[name[i]] == undefined)
			return;
		obj = obj[name[i]];
	}

	return obj[name[len]];
}

htmltmpl.prototype.is_tag_match = function(tag_name, tags)
{
	var i;

	for(i = 0; i < tags.length; i++) {
		if ( tag_name == tags[i].name )
			return true;
	}

	return false;
}

htmltmpl.prototype._fmt = function (fstr)
{
	var args = arguments;
	var i = 0;

	return fstr.replace(/%([%sd])/g, function (m, conv) {
		var ret;

		switch (conv) {
		case '%':
			ret = '%';
			break;
		case 's':
			ret = String(args[++i]);
			break;
		case 'd':
			ret = Number(args[++i]).toString();
			break;
		default:
			throw("_fmt: unknown conversion specifier: " + conv);
		}
		return ret;
	});
}

htmltmpl.prototype._throw = function ()
{
	var prefix = this.name + ": ";

	if (this.ctx.lineno > 0)
		prefix = this._fmt("%sline %d: ", prefix, this.ctx.lineno);
	if (this.ctx.tag_name != null)
		prefix = this._fmt("%s%s: ", prefix, this.ctx.tag_name);
	arguments[0] = prefix + arguments[0];
	throw(this._fmt.apply(null, arguments));
}


/**********************************************************************
 * TMPL_VAR HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_var_parse = function(def, attrs)
{
	/* Optional attribute, but must be set for an apply fun. Thus,
	   set it with default value in any case. */
	if (attrs.ESCAPE == null)
		attrs.ESCAPE = def.pafuncs.ESCAPE.call(this, this.p.escape_defval);
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {attrs: attrs}});
}

htmltmpl.prototype.hdlr_var_apply = function(def, data)
{
	var attrs;
	var val;

	val = this._get_data(data.attrs.NAME);
	if (val == null)
		val = data.attrs.DEFAULT;

	if (val == null)
		if (this.p.err_on_no_data)
			this._throw("Cann't find var '%s'.", data.attrs.NAME);
		else
			return;

	val = this._escape_tag_attr_val(data.attrs.ESCAPE, val);
	this.out_str += val;
}

/**********************************************************************
 * TMPL_LOOP HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_loop_parse = function(def, attrs)
{
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {
	    attrs: attrs}});
	this._s.parse.unshift([]);
}

htmltmpl.prototype.hdlr_loop_end_parse = function(def)
{
	var pi;
	var loop;

	loop = this._s.parse.shift();
	pi = this._s.parse[0][this._s.parse[0].length - 1];
	if (!this.is_tag_match(pi.name, def.start_tag))
		this._throw("%s was opened, but %s is being closed",
		  pi.name, def.name);
	pi.data.loop = loop;
}

htmltmpl.prototype.hdlr_loop_apply = function(def, data)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(data.attrs.NAME);
	this._s.v.unshift(Object.assign({}, this._s.v[0], {data_lookup_depth: 2}));

	if ((val != undefined) && (Array.isArray(val))) {
		this._s.data.unshift({}, {});
		for(i = 0; i < val.length; i++) {
			this._s.data[0] = val[i];
			if (this.p.loop_context_vars)
				this._s.data[1] = this.create_loop_context_vars(i, val.length);
			this._apply(data.loop);
		}
		this._s.data.shift();
		this._s.data.shift();
	} else if (this.p.err_on_no_data) {
		this._throw("Cann't find loop '%s'.", data.attrs.NAME);
	}
	this._s.v.shift();
}

htmltmpl.prototype.create_loop_context_vars = function (loopidx, looplen)
{
	// Reset the vars
	var vars = {
	  __first__: 0,
	  __last__: 0,
	  __inner__: 0,
	  __outer__: 0};

	// Set the vars
	if (loopidx == 0) {
		vars.__first__ = 1;
		vars.__outer__ = 1;
	}
	if (loopidx == (looplen - 1)) {
		vars.__last__ = 1;
		vars.__outer__ = 1;
	}

	if (!vars.__outer__)
		vars.__inner__ = 1;

	if ((loopidx + 1) % 2 == 0) {
		vars.__odd__ = 0;
		vars.__even__ = 1;
	} else {
		vars.__odd__ = 1;
		vars.__even__ = 0;
	}

	vars.__index__ = loopidx;
	vars.__counter__ = loopidx + 1;

	return vars;
}

/**********************************************************************
 * TMPL_IF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_if_parse = function(def, attrs)
{
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {
	    attrs: attrs}});
	this._s.parse.unshift([]);
}

htmltmpl.prototype.hdlr_else_parse = function(def)
{
	var pi;
	var body;

	body = this._s.parse.shift();
	pi = this._s.parse[0][this._s.parse[0].length - 1];
	if (!this.is_tag_match(pi.name, def.start_tag))
		this._throw("parse err: %s was opened, but %s is being closed",
		  pi.name, def.name);
	this._s.priv.unshift({name: def.name, prevbody: body});
	this._s.parse.unshift([]);
}

htmltmpl.prototype.hdlr_if_end_parse = function(def)
{
	var pi;
	var elsebody, ifbody;

	ifbody = this._s.parse.shift();
	pi = this._s.parse[0][this._s.parse[0].length - 1];
	if (!this.is_tag_match(pi.name, def.start_tag))
		this._throw("%s was opened, but %s is being closed",
		  pi.name, def.name);
	if ((this._s.priv.length > 0) && (this._s.priv[0].name == "TMPL_ELSE")) {
		elsebody = ifbody;
		ifbody = this._s.priv[0].prevbody;
		this._s.priv.shift();
	}

	pi.data.ifbody = ifbody;
	pi.data.elsebody = elsebody;
}

htmltmpl.prototype.hdlr_if_apply = function(def, data)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(data.attrs.NAME);

	if (val)
		this._apply(data.ifbody);
	else if (data.elsebody != null)
		this._apply(data.elsebody);
	else if (this.p.err_on_no_data)
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
}

/**********************************************************************
 * TMPL_UNLESS HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_unless_apply = function(def, data)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(data.attrs.NAME);

	if (!val)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
	else if (this.p.err_on_no_data)
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
}

/**********************************************************************
 * TMPL_INCLUDE HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_include_parse = function(def, attrs)
{
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {attrs: attrs}});
}

htmltmpl.prototype.hdlr_include_apply = function(def, data)
{
	var attrs;
	var val;

	if (data.attrs.VAR != null) {
		val = this._get_data(data.attrs.VAR);
		if (val == null) {
			if (this.p.err_on_no_data)
				this._throw("Cann't find var '%s'.", data.attrs.VAR);
			return;
		}
	}

	if (this.tmpls[data.attrs.NAME] != null) {
		if (val != null)
			this._s.data.unshift(val);
		this._apply(this.tmpls[data.attrs.NAME].tmpl_parsed);
		if (val != null)
			this._s.data.shift();
	} else if (this.p.err_on_no_data)
		this._throw("Cann't find template '%s'.", data.attrs.NAME);
}

/**********************************************************************
 * APPLY STUFF
 **********************************************************************/
htmltmpl.prototype._apply = function(tmpl)
{
	var i, j;
	var found_d;

	for(i = 0; i < tmpl.length; i++) {
		if (tmpl[i].name == "TEXT")
			this.out_str += tmpl[i].data;
		else if (this.tags[tmpl[i].name] != undefined) {
			this.ctx.lineno = tmpl[i].lineno;
			this.ctx.tag_name = tmpl[i].name;
			this.tags[tmpl[i].name].afunc.call(this,
			  this.tags[tmpl[i].name], tmpl[i].data);
		} else {
			this.ctx.lineno = -1;
			this.ctx.tag_name = null;
			this._throw("_apply err: unknown tag: %s", tmpl[i].name);
		}
	}

	return 1;
}

htmltmpl.prototype.apply = function(data)
{
	var el;

	this.out_str = new String();
	this._s.data = [data];

	this._apply(this.tmpl_parsed);

	if (this.p.strip_wrap_spaces)
		this.out_str = this.out_str.replace(/^\s*([^]+?)\s*$/, "$1");

	if (this.p.ret_dom) {
		el = document.createElement(this._get_first_element_name());
		el.innerHTML = this.out_str;
		if (el.childNodes.length == 1)
			return el.childNodes[0];
		else
			return el.childNodes;
	} else {
		return this.out_str;
	}
}

htmltmpl.prototype._get_first_element_name = function ()
{
	var el_name;

	el_name = this.out_str.toLowerCase().match(this.rex.first_out_el);
	if (el_name != null)
		switch (el_name[1]) {
		case "thead":
			return "table";
		case "tfoot":
			return "table";
		case "tbody":
			return "table";
		case "tr":
			return "tbody";
		case "th":
			return "tr";
		case "td":
			return "tr";
		}

	return "div";
}

/* callbacks for extensions */
htmltmpl.prototype.cb = {init: []};

htmltmpl.prototype.rex = {
	tag: /^(\S+)(\s+.+)?$/,
	tag_attrs: /\s+([^\s=]+)\s*=\s*(?:("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"'\s,\[\]]+)|\[((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"'\s,\[\]]+)(?:\s*,\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"'\s,\[\]]+))*)\])/g,
	tag_attr_mv: /(?:\s*,\s*)?("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^"'\s,\[\]]+)/g,
	first_out_el: /^\s*<([^\s>]+)(?:\s|>)/ };

htmltmpl.prototype.tags = {};

htmltmpl.prototype.tags["TMPL_VAR"] = {
	pfunc: htmltmpl.prototype.hdlr_var_parse,
	afunc: htmltmpl.prototype.hdlr_var_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  ESCAPE: htmltmpl.prototype._parse_tag_attr_ESCAPE},
	name: "TMPL_VAR" };
htmltmpl.prototype.tags["TMPL_LOOP"] = {
	pfunc: htmltmpl.prototype.hdlr_loop_parse,
	afunc: htmltmpl.prototype.hdlr_loop_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_LOOP" };
htmltmpl.prototype.tags["/TMPL_LOOP"] = {
	pfunc: htmltmpl.prototype.hdlr_loop_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_LOOP"]],
	name: "/TMPL_LOOP" };
htmltmpl.prototype.tags["TMPL_IF"] = {
	pfunc: htmltmpl.prototype.hdlr_if_parse,
	afunc: htmltmpl.prototype.hdlr_if_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IF" };
htmltmpl.prototype.tags["TMPL_UNLESS"] = {
	pfunc: htmltmpl.prototype.hdlr_if_parse,
	afunc: htmltmpl.prototype.hdlr_unless_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_UNLESS" };
htmltmpl.prototype.tags["TMPL_ELSE"] = {
	pfunc: htmltmpl.prototype.hdlr_else_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IF"],
		htmltmpl.prototype.tags["TMPL_UNLESS"]],
	name: "TMPL_ELSE" };
htmltmpl.prototype.tags["/TMPL_IF"] = {
	pfunc: htmltmpl.prototype.hdlr_if_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IF"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IF" };
htmltmpl.prototype.tags["/TMPL_UNLESS"] = {
	pfunc: htmltmpl.prototype.hdlr_if_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_UNLESS"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_UNLESS" };
htmltmpl.prototype.tags["TMPL_INCLUDE"] = {
	pfunc: htmltmpl.prototype.hdlr_include_parse,
	afunc: htmltmpl.prototype.hdlr_include_apply,
	pafuncs: {VAR: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_INCLUDE" };

}