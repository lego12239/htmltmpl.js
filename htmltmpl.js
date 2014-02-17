/*
  Version 0.4.0

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
  prms = { ph_case_sensitive: 0/1,
           global_vars: 0/1,
	   loop_context_vars: 0/1,
	   tmpl_is_commented: 0/1,
	   err_on_no_data: 0/1,
	   wrap_in: "div" }

  Process the tmpl as string or as html element.
  ph_case_sensitive
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
	0 by default.
  err_on_no_data
        If we found a template tag and have no such property in a supplied
	data, return undefined and set this.err_msg to error message.
	0 by default.
  wrap_in
        Wrap a template into a specified html element.
	"" by default.  
*/
function htmltmpl(tmpl, prms)
{
    this.p = {};
    this.err_msg = "";
    this.data = [];
    this.match = {};
    this.tmpl = { data: [],
		  data_cur: undefined,
		  str: undefined,
		  pos: { cur: 0,
			 start: 0 } };
    this.priv = [];
    // Initial phrases
    this.phrases = [[ { phrase: "<%TMPL_VAR ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_var_1_2 },
		      { phrase: "&lt;%TMPL_VAR ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_var_1_2 },
		      { phrase: "&LT;%TMPL_VAR ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_var_1_2 },
		      { phrase: "<!--%TMPL_VAR ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_var_1_2 },
		      { phrase: "<%TMPL_LOOP ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "&lt;%TMPL_LOOP ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "&LT;%TMPL_LOOP ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "<!--%TMPL_LOOP ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "<%/TMPL_LOOP%>",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2_end },
		      { phrase: "&lt;%/TMPL_LOOP%&gt;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2_end },
		      { phrase: "&LT;%/TMPL_LOOP%&GT;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2_end },
		      { phrase: "<!--%/TMPL_LOOP%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2_end },
		      { phrase: "<%TMPL_IF ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "&lt;%TMPL_IF ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "&LT;%TMPL_IF ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "<!--%TMPL_IF ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "<%/TMPL_IF%>",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "&lt;%/TMPL_IF%&gt;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "&LT;%/TMPL_IF%&GT;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "<!--%/TMPL_IF%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "<%TMPL_UNLESS ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "&lt;%TMPL_UNLESS ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "&LT;%TMPL_UNLESS ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "<!--%TMPL_UNLESS ",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "<%/TMPL_UNLESS%>",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "&lt;%/TMPL_UNLESS%&gt;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "&LT;%/TMPL_UNLESS%&GT;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "<!--%/TMPL_UNLESS%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "<%TMPL_ELSE%>",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_else },
		      { phrase: "&lt;%TMPL_ELSE%&gt;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_else },
		      { phrase: "&LT;%TMPL_ELSE%&GT;",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_else },
		      { phrase: "<!--%TMPL_ELSE%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_else } ]];
    if ( typeof(tmpl) === "undefined" ) {
	this.tmpl.str = "";
    } else if ( typeof(tmpl) === "string" ) {
	this.tmpl.str = tmpl;
    } else if ( typeof(tmpl) === "object" ) {
	this.tmpl.str = tmpl.innerHTML;
    }
    this.tmpl.data_cur = [ this.tmpl.data ];

    this.p.ph_case_sensitive = 1;
    this.p.global_vars = 0;
    this.p.loop_context_vars = 0;
    this.p.tmpl_is_commented = 0;
    this.p.err_on_no_data = 0;
    if ( prms != undefined ) {
	if ( prms.ph_case_sensitive != undefined )
	    this.p.ph_case_sensitive = prms.ph_case_sensitive;
	if ( prms.global_vars != undefined )
	    this.p.global_vars = prms.global_vars;
	if ( prms.loop_context_vars != undefined )
	    this.p.loop_context_vars = prms.loop_context_vars;
	if ( prms.tmpl_is_commented != undefined ) {
	    this.p.tmpl_is_commented = prms.tmpl_is_commented;
	    // MUST think about a better place for this code
	    this.phrases.unshift([ { phrase: "<!--",
				     is_match: 1,
				     oref: this,
				     hdlr_1_2: this.hdlr_enclosing_comment_start } ]);
	}
	if ( prms.err_on_no_data != undefined )
	    this.p.err_on_no_data = prms.err_on_no_data;
	if ( prms.wrap_in != undefined )
	    this.tmpl.str = "<" + prms.wrap_in + ">" + this.tmpl.str +
	    "</" + prms.wrap_in + ">";
    }
    // Set default handlers. It is an optional step. If a handler is ommited,
    // then a default handler is used instead.
    this.hdlrs = [{ hdlr_0_1: this.def_hdlr_0_1,
		    hdlr_1_0: this.def_hdlr_1_0,
		    hdlr_1_2: this.def_hdlr_1_2 }];

    this._match_reset();

    this.tmpl_prepare();
}

htmltmpl.prototype._match_reset = function ()
{
    var i;


    // Is this line needed (from the perspective of set_state())?
    this.match.state = 0;  /* 0 - no phrases are match
			      1 - some phrases start to match
			      2 - find the exact match of one phrase
			   */
    this.match.ph_chr_idx = 0;
    this.match.phrase_idx = -1;
    this.match.str = new String();
    this.match.phrases_cnt = this.phrases[0].length;
    for(i = 0; i < this.phrases[0].length; i++)
	this.phrases[0][i].is_match = 1;
}

htmltmpl.prototype.set_state = function (newstate)
{
    var oldstate = this.match.state;


    this.match.state = newstate;
    switch (oldstate) {
    case 0:
	switch (this.match.state) {
	case 0:
	    if ( typeof(this.hdlrs[0].hdlr_0_0) === "function" )
		this.hdlrs[0].hdlr_0_0.call(this);
	    else
		this.def_hdlr_0_0();
	    break;
	case 1:
	    if ( typeof(this.hdlrs[0].hdlr_0_1) === "function" )
		this.hdlrs[0].hdlr_0_1.call(this);
	    else
		this.def_hdlr_0_1();
	    break;
	case 2:
	    if ( typeof(this.hdlrs[0].hdlr_0_2) === "function" )
		this.hdlrs[0].hdlr_0_2.call(this);
	    else
		this.def_hdlr_0_2();
	    return;
	}
	break;
    case 1:
	switch (this.match.state) {
	case 0:
	    if ( typeof(this.hdlrs[0].hdlr_1_0) === "function" )
		this.hdlrs[0].hdlr_1_0.call(this);
	    else
		this.def_hdlr_1_0();
	    break;
	case 2:
	    if ( typeof(this.hdlrs[0].hdlr_1_2) === "function" )
		this.hdlrs[0].hdlr_1_2.call(this);
	    else
		this.def_hdlr_1_2();
	    break;
	}
	break;
    case 2:
    }
}

htmltmpl.prototype.phrases_match = function (char)
{
    var i;
    var chr;


    if ( this.p.ph_case_sensitive )
	chr = char;
    else
	chr = char.toUpperCase();

    // Match against all phrases
    for(i = 0; i < this.phrases[0].length; i++) {
	if ( ! this.phrases[0][i].is_match )
	    continue;
	if ( this.phrases[0][i].phrase.charAt(this.match.ph_chr_idx) != chr ) {
	    this.phrases[0][i].is_match = 0;
	    this.match.phrases_cnt--;
	} else {
	    if ( this.phrases[0][i].phrase.length == (this.match.ph_chr_idx + 1) ) {
		this.match.phrase_idx = i;
		this.match.str += char;
		return 2;
	    }
	}
    }
    if ( this.match.phrases_cnt ) {
	this.match.ph_chr_idx++;
	this.match.str += char;
	return 1;
    } else {
	return 0;
    }
}

htmltmpl.prototype.tmpl_prepare = function()
{
    var str;
    var out_el;


    this.out_str = new String();

    for (;
	 this.tmpl.pos.cur < this.tmpl.str.length;
	 this.tmpl.pos.cur++ ) {
	switch (this.match.state) {
	case 0:
	    res = this.phrases_match(this.tmpl.str.charAt(this.tmpl.pos.cur));
	    this.set_state(res);
	    break;
	case 1:
	    res = this.phrases_match(this.tmpl.str.charAt(this.tmpl.pos.cur));
	    this.set_state(res);
	    break;
	case 2:
	    break;
	case -1:
	    return;
	}
    }

    // Append last characters if we still in state 0
    this.out_str += this.tmpl.str.substring(this.tmpl.pos.start, this.tmpl.pos.cur);
    this.tmpl.data_cur[0].push({ type: "text",
				 data: this.out_str });
}

htmltmpl.prototype._find_data_by_name = function(name, data)
{
    var len;
    var j;


    if (( data == undefined ) ||
	( typeof(data) !== "object" ) ||
	( ! (data instanceof Array) ))
	return;

    if ( this.p.global_vars )
	len = data.length;
    else
	len = 1;

    for(j = 0; j < len; j++) {
	if ( data[j][name] != undefined )
	    return data[j][name];
    }

    return;
}

htmltmpl.prototype.set_loop_context_vars = function (data, loopidx, looplen)
{
    // Reset the vars
    data[0].__first__ = 0;
    data[0].__last__ = 0;
    data[0].__inner__ = 0;
    data[0].__outer__ = 0;

    // Set the vars
    if ( loopidx == 0 ) {
	data[0].__first__ = 1;
	data[0].__outer__ = 1;
    }
    if ( loopidx == (looplen - 1) ) {
	data[0].__last__ = 1;
	data[0].__outer__ = 1;
    }

    if ( ! data[0].__outer__ )
	data[0].__inner__ = 1;

    if ( (loopidx + 1) % 2 == 0 ) {
	data[0].__odd__ = 0;
	data[0].__even__ = 1;
    } else {
	data[0].__odd__ = 1;
	data[0].__even__ = 0;
    }

    data[0].__index__ = loopidx;
    data[0].__counter__ = loopidx + 1;
}

htmltmpl.prototype._apply = function(tmpl, data)
{
    var i, j;
    var found_d;


    for(i = 0; i < tmpl.length; i++) {
	switch (tmpl[i].type) {
	case "text":
	    this.out_str += tmpl[i].data;
	    break;
	case "var":
	    found_d = this._find_data_by_name(tmpl[i].name, data);

	    if ( found_d != undefined )
		this.out_str += found_d;
	    else if ( tmpl[i].default != undefined )
		this.out_str += tmpl[i].default;
	    else if ( this.p.err_on_no_data ) {
		this.err_msg = "Cann't find var '" + tmpl[i].name + "'.";
		return 0;
	    }
	    break;
	case "loop":
	    found_d = this._find_data_by_name(tmpl[i].name, data);

	    if (( found_d != undefined ) &&
		( typeof(found_d) === "object" ) &&
		( found_d instanceof Array )) {
		for(j = 0; j < found_d.length; j++) {
		    data.unshift(found_d[j]);
		    if ( this.p.loop_context_vars )
			this.set_loop_context_vars(data, j, found_d.length);
		    if ( ! this._apply(tmpl[i].data, data) )
			return 0;
		    data.shift();
		}
	    } else if ( this.p.err_on_no_data ) {
		this.err_msg = "Cann't find loop '" + tmpl[i].name + "'.";
		return 0;
	    }		
	    break;
	case "if":
	    found_d = this._find_data_by_name(tmpl[i].name, data);

	    if (( found_d == undefined ) && ( this.p.err_on_no_data )) {
		this.err_msg = "Cann't find bool var '" + tmpl[i].name + "'.";
		return 0;
	    }

	    if ( found_d ) {
		if ( ! this._apply(tmpl[i].data, data) )
		    return 0;
	    } else {
		if ( ! this._apply(tmpl[i].else_data, data) )
		    return 0;
	    }
	    break;
	case "unless":
	    found_d = this._find_data_by_name(tmpl[i].name, data);

	    if (( found_d == undefined ) && ( this.p.err_on_no_data )) {
		this.err_msg = "Cann't find bool var '" + tmpl[i].name + "'.";
		return 0;
	    }

	    if ( ! found_d ) {
		if ( ! this._apply(tmpl[i].data, data) )
		    return 0;
	    } else {
		if ( ! this._apply(tmpl[i].else_data, data) )
		    return 0;
	    }
	    break;
	}
    }

    return 1;
}

htmltmpl.prototype.apply = function(data)
{
    var str;
    var out_el;
    var i;


    this.out_str = new String();

    if ( ! this._apply(this.tmpl.data, [ data ]) )
	return;

    out_el = $.parseHTML(this.out_str);

    if ( out_el.length == 1 )
	return out_el[0];
    else
	return out_el;
}

/**********************************************************************
 * DEFAULT HANDLERS
 **********************************************************************/
htmltmpl.prototype.def_hdlr_0_0 = function ()
{
//    console.log("0_0: ");
    this._match_reset();
}

htmltmpl.prototype.def_hdlr_0_1 = function ()
{
//    console.log("0_1: " + this.tmpl.str.substring(this.tmpl.pos.start, this.tmpl.pos.cur));
    this.out_str += this.tmpl.str.substring(this.tmpl.pos.start, this.tmpl.pos.cur);
}

htmltmpl.prototype.def_hdlr_1_0 = function ()
{
//    console.log("1_0: " + this.match.str);

    this.tmpl.pos.start = this.tmpl.pos.cur;

    this.out_str += this.match.str;
    this._match_reset();
}

htmltmpl.prototype.def_hdlr_1_2 = function ()
{
    if ( this.out_str != "" ) {
	this.tmpl.data_cur[0].push({ type: "text",
				     data: this.out_str });
	this.out_str = new String();
    }

//    console.log("1_2: " + JSON.stringify(this.tmpl.data));

    if ( typeof(this.phrases[0][this.match.phrase_idx].hdlr_1_2) === "function" )
	this.phrases[0][this.match.phrase_idx].hdlr_1_2.call(this);
}

htmltmpl.prototype.def_hdlr_0_2 = function ()
{
    if ( this.out_str != "" ) {
	this.tmpl.data_cur[0].push({ type: "text",
				     data: this.out_str });
	this.out_str = new String();
    }

//    console.log("0_2: " + JSON.stringify(this.tmpl.data));

    if ( typeof(this.phrases[0][this.match.phrase_idx].hdlr_0_2) === "function" )
	this.phrases[0][this.match.phrase_idx].hdlr_0_2.call(this);
}


/**********************************************************************
 * ENCLOSING COMMENT HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_enclosing_comment_start = function ()
{
//    alert("enclosing_comment_start");
    this.phrases.shift();
    this.phrases[0].unshift({ phrase: "-->",
			      is_match: 1,
			      oref: this,
			      hdlr_1_2: this.hdlr_enclosing_comment_end });
    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_enclosing_comment_end = function ()
{
//    alert("enclosing_comment_end");

    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}


/**********************************************************************
 * TAG HANDLERS
 **********************************************************************/
/*
 * tag - a tag name
 * attrs - an array with searched attribute names
 * cb - a callback function to call on the end of a tag processing
 */
htmltmpl.prototype.hdlr_tag = function (tag, attrs, cb)
{
    var phrases = [];
    var i;


//    alert("hdlr_tag");
    for(i = 0; i < attrs.length; i++) {
	phrases.push({ phrase: attrs[i] + "=",
		       is_match: 1,
		       oref: this,
		       hdlr_1_2: this._hdlr_tag });
    }
    this.priv.unshift({ attrs: {},
			ph_attrs: phrases,
			ph_tag_stops: [ { phrase: "%>",
					  is_match: 1,
					  oref: this,
					  hdlr_1_2: this._hdlr_tag_end },
					{ phrase: "%&gt;",
					  is_match: 1,
					  oref: this,
					  hdlr_1_2: this._hdlr_tag_end },
					{ phrase: "%&GT;",
					  is_match: 1,
					  oref: this,
					  hdlr_1_2: this._hdlr_tag_end },
					{ phrase: "%-->",
					  is_match: 1,
					  oref: this,
					  hdlr_1_2: this._hdlr_tag_end } ],
			cb: cb,
			attr_name: "",
			is_quoted: 0,
			tag: tag,
			tokens: new String() });

    this.phrases.unshift(phrases);

    this.hdlrs.unshift({ hdlr_0_0: this._hdlr_tag_0_0,
			 hdlr_0_1: this._hdlr_tag_0_1,
			 hdlr_1_0: this._hdlr_tag_1_0 });

    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}

htmltmpl.prototype._hdlr_tag = function ()
{
    var ph_sp_q = [ { phrase: " ",
		      is_match: 1,
		      oref: this,
		      hdlr_0_2: function () {
			  this._hdlr_tag_0_2(this._hdlr_tag);
		      } },
		    { phrase: "\"",
		      is_match: 1,
		      oref: this,
		      hdlr_0_2: this._hdlr_tag_quote },
		    { phrase: "'",
		      is_match: 1,
		      oref: this,
		      hdlr_0_2: this._hdlr_tag_quote } ];


//    alert("_hdlr_tag");

    this.hdlrs.shift();
    this.phrases.shift();

    if ( this.priv[0].is_quoted ) {
	this.phrases.unshift(this.priv[0].ph_attrs.concat(this.priv[0].ph_tag_stops));

	this.hdlrs.unshift({ hdlr_0_0: this._hdlr_tag_0_0,
			     hdlr_0_1: this._hdlr_tag_0_1,
			     hdlr_1_0: this._hdlr_tag_1_0 });
	this.priv[0].is_quoted = 0;
    } else if ( this.priv[0].attr_name != "" ) {
	this.phrases.unshift(this.priv[0].ph_attrs);

	this.hdlrs.unshift({ hdlr_0_0: this._hdlr_tag_0_0,
			     hdlr_0_1: this._hdlr_tag_0_1,
			     hdlr_1_0: this._hdlr_tag_1_0 });
    } else {
	this.phrases.unshift(this.priv[0].ph_tag_stops.concat(ph_sp_q));

	this.hdlrs.unshift({ hdlr_0_1: this._hdlr_tag_0_1,
			     hdlr_1_0: this._hdlr_tag_1_0 });
    }


    if ( this.priv[0].attr_name == "" ) {
	this.priv[0].attr_name = this.tmpl.str.substring(this.tmpl.pos.start,
							 this.tmpl.pos.cur).toLowerCase();
	// For a work little speedup
	this.priv[0].ph_attrs.splice(this.match.phrase_idx, 1);
    } else {
	// Save last tokens
	this.priv[0].attrs[this.priv[0].attr_name] = this.priv[0].tokens;
	this.priv[0].attr_name = "";
    }

    this.priv[0].tokens = new String();
    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}

htmltmpl.prototype._hdlr_tag_0_0 = function ()
{
//    console.log("tag_0_0: ");

    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}

htmltmpl.prototype._hdlr_tag_0_1 = function ()
{
    this.priv[0].tokens += this.tmpl.str.substring(this.tmpl.pos.start, this.tmpl.pos.cur);
//    console.log("tag_0_1: " + this.priv[0].tokens);
}

htmltmpl.prototype._hdlr_tag_0_2 = function (func)
{
    this.priv[0].tokens += this.tmpl.str.substring(this.tmpl.pos.start, this.tmpl.pos.cur);

//    console.log("tag_0_2: " + this.priv[0].tokens);

    func.call(this);
}

htmltmpl.prototype._hdlr_tag_1_0 = function ()
{
    this.tmpl.pos.start = this.tmpl.pos.cur;
    this.priv[0].tokens += this.match.str;
//    alert("tag_1_0: " + this.priv[0].tokens);
}

htmltmpl.prototype._hdlr_tag_quote = function ()
{
    var ph;


//    console.log("_hdlr_tag_quote");

    // If a quote is the first character, then wait the closing quote
    if ( this.match.ph_chr_idx == 0 ) {
	this.priv[0].is_quoted = 1;

	ph = this.phrases[0][this.match.phrase_idx].phrase;
	this.phrases.shift();
	this.phrases.unshift([ { phrase: ph,
				 is_match: 1,
				 oref: this,
				 hdlr_0_2: function () {
				     this._hdlr_tag_0_2(this._hdlr_tag);
				 } } ]);

	this.tmpl.pos.start = this.tmpl.pos.cur + 1;
	this._match_reset();
    } else {
	this.phrases[0].splice(this.match.phrase_idx, 1);
    }
}

htmltmpl.prototype._hdlr_tag_end = function ()
{
//    console.log("_hdlr_tag_end: ");

    // Save last tokens
    this.priv[0].attrs[this.priv[0].attr_name] = this.priv[0].tokens;

    this.priv[0].cb.call(this);

    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this.priv.shift();
    this.phrases.shift();
    this.hdlrs.shift();

    this._match_reset();
}


/**********************************************************************
 * TMPL_VAR HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_var_1_2 = function ()
{
//    alert("tmp_var_1_2");
    this.hdlr_tag("var", ["NAME", "DEFAULT"], this.hdlr_tmpl_var_1_2_tail);
}

htmltmpl.prototype.hdlr_tmpl_var_1_2_tail = function ()
{
//    alert("tmpl_var_1_2_tail: " + this.priv[0].tokens);
    var i;
    var len;
    var name_is_found = 0;


    this.tmpl.data_cur[0].push({ type: "var",
				 name: this.priv[0].attrs.name,
			         default: this.priv[0].attrs.default });
}

/**********************************************************************
 * TMPL_LOOP HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_loop_1_2 = function ()
{
//    console.log("tmp_loop_1_2");
    this.hdlr_tag("loop", ["NAME"], this.hdlr_tmpl_loop_1_2_tail);
}

htmltmpl.prototype.hdlr_tmpl_loop_1_2_tail = function ()
{
    var loop;


//    console.log("tmpl_loop_1_2_tail: " + this.priv[0].tokens);

    loop = { type: "loop",
	     name: this.priv[0].attrs.name,
	     data: [] };

    this.tmpl.data_cur[0].push(loop);
    this.tmpl.data_cur.unshift(loop.data);

    // because of _hdlr_tag_end() do this.priv.shift()
    this.priv.unshift(this.priv[0]);
}

htmltmpl.prototype.hdlr_tmpl_loop_1_2_end = function ()
{
    var pcur, pstart;


//    alert("tmpl_loop_1_2_end: " + this.priv[0].loopidx + "(" + this.priv[0].loop.length + ")");

    this.tmpl.data_cur.shift();
    this.priv.shift();

    this.tmpl.pos.start = this.tmpl.pos.cur + 1;
    this._match_reset();
}

/**********************************************************************
 * TMPL_IF AND TMPL_UNLESS HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_if_1_2 = function ()
{
//    console.log("tmp_if_1_2");
    this.hdlr_tag("if", ["NAME"], this.hdlr_tmpl_if_1_2_tail);
}

htmltmpl.prototype.hdlr_tmpl_unless_1_2 = function ()
{
//    console.log("tmp_unless_1_2");
    this.hdlr_tag("unless", ["NAME"], this.hdlr_tmpl_if_1_2_tail);
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_tail = function ()
{
    var if_;
    var varname;
    var i;
    var len;
    var phrase;
    var name_is_found = 0;


//    console.log("tmpl_if_1_2_tail(" + this.priv[0].tag + "): " + this.priv[0].attrs.name);

    if_ = { type: this.priv[0].tag,
	    name: this.priv[0].attrs.name,
	    data: [],
	    else_data: [] };

    this.tmpl.data_cur[0].push(if_);
    this.tmpl.data_cur.unshift(if_.data);

    // because of _hdlr_tag_end() do this.priv.shift()
    this.priv.unshift(this.priv[0]);
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_else = function ()
{
    var phrase;
    var len;


//    console.log("tmpl_if_1_2_else(" + this.priv[0].tag + "): " + this.priv[0].attrs.name);

    this.tmpl.data_cur.shift();
    len = this.tmpl.data_cur[0].length;
    this.tmpl.data_cur.unshift(this.tmpl.data_cur[0][len - 1].else_data);
    this.tmpl.pos.start = this.tmpl.pos.cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_end = function ()
{
//    alert("tmpl_if_1_2_end(" + this.priv[0].phrase + "): " + this.priv[0].phrase + "(" + this.priv[0].varname + ")");

    this.tmpl.data_cur.shift();
    this.priv.shift();
    this.tmpl.pos.start = this.tmpl.pos.cur + 1;
    this._match_reset();
}

}
