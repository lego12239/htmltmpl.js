/*
  Version 1.0.0

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
  prms = { case_sensitive: 0/1,
           global_vars: 0/1,
	   loop_context_vars: 0/1,
	   tmpl_is_commented: 0/1,
	   err_on_no_data: 0/1,
           ret_dom: 0/1,
	   strip_wrap_spaces: 0/1 }

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
*/
function htmltmpl(tmpl, prms)
{
    this.p = {};
    this.tmpl = "";
    this.tmpl_parsed = [];
    this._s = { parse: [[]],
		priv: [],
		data: [] };
    this.funcs = {};

    if ( prms == undefined )
	prms = {};
    this._set_prm("case_sensitive", prms.case_sensitive);
    this._set_prm("global_vars", prms.global_vars);
    this._set_prm("loop_context_vars", prms.loop_context_vars);
    this._set_prm("tmpl_is_commented", prms.tmpl_is_commented);
    this._set_prm("err_on_no_data", prms.err_on_no_data);
    this._set_prm("ret_dom", prms.ret_dom);
    this._set_prm("strip_wrap_spaces", prms.strip_wrap_spaces);

    if ( typeof(tmpl) === "undefined" )
	this.tmpl = "";
    else if ( typeof(tmpl) === "string" )
	this.tmpl = tmpl;
    else if ( typeof(tmpl) === "object" )
	this.tmpl = tmpl.innerHTML;

    if ( this.p.tmpl_is_commented )
	this.tmpl = this.tmpl.replace(/^\s*<!--([^]+)-->\s*$/, "$1");
    if ( this.p.strip_wrap_spaces )
	this.tmpl = this.tmpl.replace(/^\s*([^]+?)\s*$/, "$1");

    this.tmpl_prepare();
}

htmltmpl.p = {
    case_sensitive: 1,
    global_vars: 0,
    loop_context_vars: 0,
    tmpl_is_commented: 1,
    err_on_no_data: 0,
    ret_dom: 0,
    strip_wrap_spaces: 1 };

htmltmpl.prototype._set_prm = function (n, v)
{
    if ( v == undefined )
	this.p[n] = htmltmpl.p[n];
    else
	this.p[n] = v;
}

htmltmpl.prototype.tmpl_prepare = function()
{
    var chunks;
    var i;
    var rex;
    var m;


    if ( this.p.case_sensitive )
	rex = /^(\/?TMPL_.+?)%}([^]*)$/;
    else
	rex = /^(\/?TMPL_.+?)%}([^]*)$/i;

    chunks = this.tmpl.split(/{%/);

    for(i = 0; i < chunks.length; i++) {
	m = rex.exec(chunks[i]);
	if ( m ) {
	    this.parse_tag(m[1]);
	    if ( m[2] != "" )
		this._s.parse[0].push(["TEXT", m[2] ]);
	} else
	    this._s.parse[0].push(["TEXT", chunks[i] ]);
    }

    this.tmpl_parsed = this._s.parse[0];
}

htmltmpl.prototype.parse_tag = function (tag)
{
    var m;
    var tag_name, tag_attrs;


    // Split a tag to a name and a body
    m = this.rex.tag.exec(tag);
    if ( ! m )
	throw("parse_tag err: wrong tag format: " + tag);

    if ( ! this.p.case_sensitive )
	tag_name = m[1].toUpperCase();
    else
	tag_name = m[1];
    tag_attrs = m[2];

    // Call a tag handler
    if ( this.tags[tag_name] != undefined )
	return this.tags[tag_name].pfunc.call(this,
					      this.tags[tag_name], tag_attrs);

    throw("parse_tag err: unknown tag: " + tag_name);
}

htmltmpl.prototype._parse_tag_attrs = function(attrs)
{
    var m;
    var name, val;
    var res = {};


    while ( m = this.rex.tag_attrs.exec(attrs) ) {
	name = m[1];
	if ( ! this.p.case_sensitive )
	    name = name.toUpperCase();

	val = m[2];
	if (( val.charAt(0) == "'" ) || ( val.charAt(0) == '"' ))
	    val = val.substr(1, val.length - 2);
	if ( res[name] == undefined )
	    res[name] = val;
	else
	    switch (typeof(res[name])) {
	    case "string":
		res[name] = [ res[name] ];
		res[name].push(val);
		break;
	    case "object":
		res[name].push(val);
		break;
	    default:
		throw("_parse_tag_attrs err: unknown value type: " +
		      typeof(res[name]));
	    }
    }

    return res;
}

// For use inside a this.funcs.*
htmltmpl.prototype.get_data = function(name)
{
    return this._get_data(name.split("."));
}

htmltmpl.prototype._get_data = function(name)
{
    var len, v;
    var j;


    if ( this.p.global_vars )
	len = this._s.data.length;
    else
	len = 1;

    for(j = 0; j < len; j++) {
	v = this.__get_data(this._s.data[j], name);
	if ( v != undefined )
	    return v;
    }

    return;
}

htmltmpl.prototype.__get_data = function(obj, name)
{
    var len = name.length - 1;
    var i;


    for(i = 0; i < len; i++) {
    	if ( obj[name[i]] == undefined )
    	    return;
    	obj = obj[name[i]];
    }

    return obj[name[len]];
}

htmltmpl.prototype.is_tag_match = function(tag, tags)
{
    var i;


    for(i = 0; i < tags.length; i++) {
	if ( tag.name == tags[i].name )
	    return true;
    }

    return false;
}

/**********************************************************************
 * TMPL_VAR HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_var_parse = function(def, tag_attrs)
{
    var attrs, vname;

    attrs = this._parse_tag_attrs(tag_attrs);
    vname = attrs.NAME.split(".");
    this._s.parse[0].push([def.name, [ vname, attrs ]]);
}

htmltmpl.prototype.hdlr_var_apply = function(def, tag)
{
    var attrs;
    var val;


    val = this._get_data(tag[0]);

    if ( val != undefined )
	this.out_str += val;
    else if ( tag[1]["DEFAULT"] != undefined )
	this.out_str += tag[1]["DEFAULT"];
    else if ( this.p.err_on_no_data )
	throw("Cann't find var '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_LOOP HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_loop_parse = function(def, tag_attrs)
{
    var attrs;


    attrs = this._parse_tag_attrs(tag_attrs);
    this._s.parse.unshift([]);
    this._s.priv.unshift([def, attrs ]);
}

htmltmpl.prototype.hdlr_loop_end_parse = function(def)
{
    var priv;
    var vname, loop;


    priv = this._s.priv[0];
    if ( ! this.is_tag_match(priv[0], def.start_tag) )
	throw("parse err: " + priv[0].name + " was opened, but " +
	      def.name + " is being closed");

    vname = priv[1].NAME.split(".");
    loop = this._s.parse.shift();
    this._s.parse[0].push([priv[0].name, [ vname, priv[1], loop ]]);
    this._s.priv.shift();
}

htmltmpl.prototype.hdlr_loop_apply = function(def, tag)
{
    var attrs;
    var val;
    var i;


    val = this._get_data(tag[0]);

    if (( val != undefined ) && ( Array.isArray(val) ))
	for(i = 0; i < val.length; i++) {
	    this._s.data.unshift(val[i]);
	    if ( this.p.loop_context_vars )
		this.set_loop_context_vars(i, val.length);
	    this._apply(tag[2]);
	    this._s.data.shift();
	}
    else if ( this.p.err_on_no_data )
	throw("Cann't find loop '" + tag[0] + "'.");
}

htmltmpl.prototype.set_loop_context_vars = function (loopidx, looplen)
{
    // Reset the vars
    this._s.data[0].__first__ = 0;
    this._s.data[0].__last__ = 0;
    this._s.data[0].__inner__ = 0;
    this._s.data[0].__outer__ = 0;

    // Set the vars
    if ( loopidx == 0 ) {
	this._s.data[0].__first__ = 1;
	this._s.data[0].__outer__ = 1;
    }
    if ( loopidx == (looplen - 1) ) {
	this._s.data[0].__last__ = 1;
	this._s.data[0].__outer__ = 1;
    }

    if ( ! this._s.data[0].__outer__ )
	this._s.data[0].__inner__ = 1;

    if ( (loopidx + 1) % 2 == 0 ) {
	this._s.data[0].__odd__ = 0;
	this._s.data[0].__even__ = 1;
    } else {
	this._s.data[0].__odd__ = 1;
	this._s.data[0].__even__ = 0;
    }

    this._s.data[0].__index__ = loopidx;
    this._s.data[0].__counter__ = loopidx + 1;
}

/**********************************************************************
 * TMPL_IF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_if_parse = function(def, tag_attrs)
{
    var attrs;


    attrs = this._parse_tag_attrs(tag_attrs);
    this._s.parse.unshift([]);
    this._s.priv.unshift([def, attrs ]);
}

htmltmpl.prototype.hdlr_else_parse = function(def)
{
    var priv;


    priv = this._s.priv[0];
    if ( ! this.is_tag_match(priv[0], def.start_tag) )
	throw("parse err: " + priv[0].name + " was opened, but " +
	      def.name + " is being closed");
    this._s.parse.unshift([]);
    this._s.priv.unshift([def]);
}

htmltmpl.prototype.hdlr_if_end_parse = function(def)
{
    var priv;
    var vname, if_, else_;


    priv = this._s.priv.shift();
    if ( ! this.is_tag_match(priv[0], def.start_tag) )
	throw("parse err: " + priv[0].name + " was opened, but " +
	      def.name + " is being closed");
    if ( priv[0].name == "TMPL_ELSE" ) {
	else_ = this._s.parse.shift();
	priv = this._s.priv.shift();
    }

    vname = priv[1].NAME.split(".");
    if_ = this._s.parse.shift();
    this._s.parse[0].push([priv[0].name, [ vname, priv[1], if_, else_ ]]);
}

htmltmpl.prototype.hdlr_if_apply = function(def, tag)
{
    var attrs;
    var val;
    var i;


    val = this._get_data(tag[0]);

    if ( val )
	this._apply(tag[2]);
    else if ( tag[3] != undefined )
	this._apply(tag[3]);
    else if ( this.p.err_on_no_data )
	throw("Cann't find var '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_UNLESS HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_unless_apply = function(def, tag)
{
    var attrs;
    var val;
    var i;


    val = this._get_data(tag[0]);

    if ( ! val )
	this._apply(tag[2]);
    else if ( tag[3] != undefined )
	this._apply(tag[3]);
    else if ( this.p.err_on_no_data )
	throw("Cann't find var '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_IFDEF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifdef_parse = function(def, tag_attrs)
{
    var attrs;


    attrs = this._parse_tag_attrs(tag_attrs);
    this._s.parse.unshift([]);
    this._s.priv.unshift([def, attrs ]);
}

htmltmpl.prototype.hdlr_ifdef_end_parse = function(def)
{
    var priv;
    var vname, if_, else_;


    priv = this._s.priv.shift();
    if ( ! this.is_tag_match(priv[0], def.start_tag) )
	throw("parse err: " + priv[0].name + " was opened, but " +
	      def.name + " is being closed");
    if ( priv[0].name == "TMPL_ELSE" ) {
	else_ = this._s.parse.shift();
	priv = this._s.priv.shift();
    }

    vname = priv[1].NAME.split(".");
    if_ = this._s.parse.shift();
    this._s.parse[0].push([priv[0].name, [ vname, priv[1], if_, else_ ]]);
}

htmltmpl.prototype.hdlr_ifdef_apply = function(def, tag)
{
    var attrs;
    var val;
    var i;


    val = this._get_data(tag[0]);

    if ( val != undefined )
	this._apply(tag[2]);
    else if ( tag[3] != undefined )
	this._apply(tag[3]);
    else if ( this.p.err_on_no_data )
	throw("Cann't find var '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_IFNDEF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifndef_apply = function(def, tag)
{
    var attrs;
    var val;
    var i;


    val = this._get_data(tag[0]);

    if ( val == undefined )
	this._apply(tag[2]);
    else if ( tag[3] != undefined )
	this._apply(tag[3]);
    else if ( this.p.err_on_no_data )
	throw("Cann't find var '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_FUNC HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_func_parse = function(def, tag_attrs)
{
    var attrs;

    attrs = this._parse_tag_attrs(tag_attrs);
    if (( attrs.ARG != undefined ) && ( typeof(attrs.ARG) === "string" ))
	attrs.ARG = [ attrs.ARG ];
    this._s.parse[0].push([def.name, [ attrs ]]);
}

htmltmpl.prototype.hdlr_func_apply = function(def, tag)
{
    var attrs;
    var val;


    if ( this.funcs[tag[0]["NAME"]] != undefined ) {
	val = this.funcs[tag[0]["NAME"]].apply(this, tag[0]["ARG"]);
	if ( val != undefined )
	    this.out_str += val;
    } else if ( this.p.err_on_no_data )
	throw("Cann't find func '" + tag[0]["NAME"] + "'.");
}

/**********************************************************************
 * APPLY STUFF
 **********************************************************************/
htmltmpl.prototype._apply = function(tmpl)
{
    var i, j;
    var found_d;


    for(i = 0; i < tmpl.length; i++) {
	if ( tmpl[i][0] == "TEXT" )
	    this.out_str += tmpl[i][1];
	else if ( this.tags[tmpl[i][0]] != undefined )
	    this.tags[tmpl[i][0]].afunc.call(this,
					     this.tags[tmpl[i][0]],
					     tmpl[i][1]);
	else
	    throw("_apply err: unknown tag: " + tmpl[i][0]);
    }

    return 1;
}

htmltmpl.prototype.apply = function(data)
{
    var el;


    this.out_str = new String();
    this._s.data = [data];

    this._apply(this.tmpl_parsed);

    if ( this.p.ret_dom ) {
	el = document.createElement(this._get_first_element_name());
	el.innerHTML = this.out_str;
	return el.childNodes;
    } else
	return this.out_str;
}

htmltmpl.prototype._get_first_element_name = function ()
{
    var el_name;


    el_name = this.out_str.toLowerCase().match(this.rex.first_out_el);
    if ( el_name != null )
	switch (el_name[1]) {
	case "tbody":
	    return "table";
	case "tr":
	    return "tbody";
	case "td":
	    return "tr";
	}

    return "div";
}

htmltmpl.prototype.rex = {
    tag: /^(\S+)(\s+.+)?$/,
    tag_attrs: /\s+([^\s=]+)\s*=\s*("[^"]+"|'[^']+'|\S+)/g,
    first_out_el: /^\s*<([^\s>]+)(?:\s|>)/ };

htmltmpl.prototype.tags = {};

htmltmpl.prototype.tags["TMPL_VAR"] = {
    pfunc: htmltmpl.prototype.hdlr_var_parse,
    afunc: htmltmpl.prototype.hdlr_var_apply,
    name: "TMPL_VAR" };
htmltmpl.prototype.tags["TMPL_LOOP"] = {
    pfunc: htmltmpl.prototype.hdlr_loop_parse,
    afunc: htmltmpl.prototype.hdlr_loop_apply,
    name: "TMPL_LOOP" };
htmltmpl.prototype.tags["/TMPL_LOOP"] = {
    pfunc: htmltmpl.prototype.hdlr_loop_end_parse,
    start_tag: [htmltmpl.prototype.tags["TMPL_LOOP"]],
    name: "/TMPL_LOOP" };
htmltmpl.prototype.tags["TMPL_IF"] = {
    pfunc: htmltmpl.prototype.hdlr_if_parse,
    afunc: htmltmpl.prototype.hdlr_if_apply,
    name: "TMPL_IF" };
htmltmpl.prototype.tags["TMPL_UNLESS"] = {
    pfunc: htmltmpl.prototype.hdlr_if_parse,
    afunc: htmltmpl.prototype.hdlr_unless_apply,
    name: "TMPL_UNLESS" };
htmltmpl.prototype.tags["TMPL_IFDEF"] = {
    pfunc: htmltmpl.prototype.hdlr_ifdef_parse,
    afunc: htmltmpl.prototype.hdlr_ifdef_apply,
    name: "TMPL_IFDEF" };
htmltmpl.prototype.tags["TMPL_IFNDEF"] = {
    pfunc: htmltmpl.prototype.hdlr_ifdef_parse,
    afunc: htmltmpl.prototype.hdlr_ifndef_apply,
    name: "TMPL_IFNDEF" };
htmltmpl.prototype.tags["TMPL_ELSE"] = {
    pfunc: htmltmpl.prototype.hdlr_else_parse,
    start_tag: [htmltmpl.prototype.tags["TMPL_IF"],
		htmltmpl.prototype.tags["TMPL_UNLESS"],
		htmltmpl.prototype.tags["TMPL_IFDEF"],
		htmltmpl.prototype.tags["TMPL_IFNDEF"]],
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
htmltmpl.prototype.tags["/TMPL_IFDEF"] = {
    pfunc: htmltmpl.prototype.hdlr_ifdef_end_parse,
    start_tag: [htmltmpl.prototype.tags["TMPL_IFDEF"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
    name: "/TMPL_IFDEF" };
htmltmpl.prototype.tags["/TMPL_IFNDEF"] = {
    pfunc: htmltmpl.prototype.hdlr_ifdef_end_parse,
    start_tag: [htmltmpl.prototype.tags["TMPL_IFNDEF"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
    name: "/TMPL_IFNDEF" };
htmltmpl.prototype.tags["TMPL_FUNC"] = {
    pfunc: htmltmpl.prototype.hdlr_func_parse,
    afunc: htmltmpl.prototype.hdlr_func_apply,
    name: "TMPL_FUNC" };

}