/*
  Version 0.2.0

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
    this.tmpl = [];
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
		      { phrase: "<%TMPL_LOOP NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "&lt;%TMPL_LOOP NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "&LT;%TMPL_LOOP NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2 },
		      { phrase: "<!--%TMPL_LOOP NAME=",
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
		      { phrase: "<%TMPL_IF NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "&lt;%TMPL_IF NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "&LT;%TMPL_IF NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "<!--%TMPL_IF NAME=",
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
		      { phrase: "<%TMPL_UNLESS NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "&lt;%TMPL_UNLESS NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "&LT;%TMPL_UNLESS NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_unless_1_2 },
		      { phrase: "<!--%TMPL_UNLESS NAME=",
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
	this.tmpl[0] = { str: "" };
    } else if ( typeof(tmpl) === "string" ) {
	this.tmpl[0] = { str: tmpl };
    } else if ( typeof(tmpl) === "object" ) {
	this.tmpl[0] = { str: tmpl.innerHTML };
    }

    this.tmpl[0].pos = [{ cur: 0,
			  start: 0 }];
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
	    this.tmpl[0].str = "<" + prms.wrap_in + ">" + this.tmpl[0].str +
	    + "</" + prms.wrap_in + ">";
    }
    // Set default handlers. It is an optional step. If a handler is ommited,
    // then a default handler is used instead.
    this.hdlrs = [{ hdlr_0_1: this.def_hdlr_0_1,
		    hdlr_1_0: this.def_hdlr_1_0,
		    hdlr_1_2: this.def_hdlr_1_2 }];

    this._match_reset();
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

htmltmpl.prototype.apply = function(data)
{
    var str;
    var out_el;


    this.out_str = new String();
    this.data.unshift(data);

    for (;
	 this.tmpl[0].pos[0].cur < this.tmpl[0].str.length;
	 this.tmpl[0].pos[0].cur++ ) {
	switch (this.match.state) {
	case 0:
	    res = this.phrases_match(this.tmpl[0].str.charAt(this.tmpl[0].pos[0].cur));
	    this.set_state(res);
	    break;
	case 1:
	    res = this.phrases_match(this.tmpl[0].str.charAt(this.tmpl[0].pos[0].cur));
	    this.set_state(res);
	    break;
	case 2:
	    break;
	case -1:
	    return;
	}
    }

    // Append last characters if we still in state 0
    this.out_str += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
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
//    alert("0_0: ");
    this._match_reset();
}

htmltmpl.prototype.def_hdlr_0_1 = function ()
{
//    alert("0_1: " + this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur));
    this.out_str += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
}

htmltmpl.prototype.def_hdlr_1_0 = function ()
{
//    alert("1_0: " + this.match.str);

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur;

    this.out_str += this.match.str;
    this._match_reset();
}

htmltmpl.prototype.def_hdlr_1_2 = function ()
{
//    alert("1_2: ");
    if ( typeof(this.phrases[0][this.match.phrase_idx].hdlr_1_2) === "function" )
	this.phrases[0][this.match.phrase_idx].hdlr_1_2.call(this);
}

htmltmpl.prototype.def_hdlr_0_2 = function ()
{
//    alert("0_2: ");
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
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_enclosing_comment_end = function ()
{
//    alert("enclosing_comment_end");

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}


/**********************************************************************
 * TMPL_VAR HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_var_1_2 = function ()
{
//    alert("tmp_var_1_2");
    this.phrases.unshift([ { phrase: "NAME=",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_var_1_2_get },
			   { phrase: "DEFAULT=",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_var_1_2_get } ]);

    this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_var_0_1,
			 hdlr_1_0: this.hdlr_tmpl_var_1_0 });
    this.priv.unshift({ attrs: {},
			attr_name: "",
			tag: "var",
			tokens: new String() });
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_var_1_2_get = function ()
{
//    alert("tmp_var_1_2_get");

    this.phrases.shift();
    if ( this.priv[0].attr_name != "" )
	this.phrases.unshift([ { phrase: "NAME=",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_get },
			       { phrase: "DEFAULT=",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_get } ]);
    else
	this.phrases.unshift([ { phrase: " ",
				 is_match: 1,
				 oref: this,
				 hdlr_0_2: function () {
				     this.hdlr_tmpl_var_0_2(this.hdlr_tmpl_var_1_2_get);
				 } },
			       { phrase: "%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_tail },
			       { phrase: "%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_tail },
			       { phrase: "%&GT;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_tail },
			       { phrase: "%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_var_1_2_tail } ]);

    if ( this.priv[0].attr_name == "" )
	this.priv[0].attr_name = this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur).toLowerCase();
    else {
	// Save last tokens
	this.priv[0].attrs[this.priv[0].attr_name] = this.priv[0].tokens;
	this.priv[0].attr_name = "";
    }

    this.priv[0].tokens = new String();
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_var_0_1 = function ()
{
    this.priv[0].tokens += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
//    alert("tmpl_var_0_1: " + this.priv[0].tokens);
}

htmltmpl.prototype.hdlr_tmpl_var_0_2 = function (func)
{
    this.priv[0].tokens += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
//    alert("tmpl_var_0_2: " + this.priv[0].tokens);

    func.call(this);
}

htmltmpl.prototype.hdlr_tmpl_var_1_0 = function ()
{
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur;
    this.priv[0].tokens += this.match.str;
//    alert("tmpl_var_1_0: " + this.priv[0].tokens);
}

htmltmpl.prototype.hdlr_tmpl_var_1_2_tail = function ()
{
//    alert("tmpl_var_1_2_tail: " + this.priv[0].tokens);
    var i;
    var len;
    var name_is_found = 0;


    // Save last tokens
    this.priv[0].attrs[this.priv[0].attr_name] = this.priv[0].tokens;

    if ( this.p.global_vars )
	len = this.data.length;
    else
	len = 1;

    for(i = 0; i < len; i++) {
	if ( this.data[i][this.priv[0].attrs.name] != undefined ) {
	    this.out_str += this.data[i][this.priv[0].attrs.name];
	    name_is_found = 1;
	    break;
	}
    }
    if (( ! name_is_found ) && ( this.priv[0].attrs.default != undefined )) {
	this.out_str += this.priv[0].attrs.default;
	name_is_found = 1;
    }
    if (( this.p.err_on_no_data ) && ( ! name_is_found )) {
	this.err_msg = "Cann't find var '" + this.priv[0].attrs.name + "'.";
	this.set_state(-1);
	return;
    }

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this.priv.shift();
    this.phrases.shift();
    this.hdlrs.shift();

    this._match_reset();
}

/**********************************************************************
 * TMPL_LOOP HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_loop_1_2 = function ()
{
    this.phrases.unshift([ { phrase: "%>",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_loop_1_2_tail },
			   { phrase: "%&gt;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_loop_1_2_tail },
			   { phrase: "%&GT;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_loop_1_2_tail },
			   { phrase: "%-->",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_loop_1_2_tail } ]);

    this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_loop_0_1,
			 hdlr_1_0: this.hdlr_tmpl_loop_1_0 });
    this.priv.unshift({ loopname: new String() });
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_loop_0_1 = function ()
{
    this.priv[0].loopname += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
//    alert("tmpl_loop_0_1: " + this.priv[0].loopname);
}

htmltmpl.prototype.hdlr_tmpl_loop_1_0 = function ()
{
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur;
    this.priv[0].loopname += this.match.str;
//    alert("tmpl_loop_1_0: " + this.priv[0].loopname);
}

htmltmpl.prototype.set_loop_context_vars = function ()
{
    if ( this.priv[0].loop == undefined ) {
	alert("set_loop_context_vars() is called outside a loop.");
	return;
    }

    // Reset the vars
    this.data[0].__first__ = 0;
    this.data[0].__last__ = 0;
    this.data[0].__inner__ = 0;
    this.data[0].__outer__ = 0;

    // Set the vars
    if ( this.priv[0].loopidx == 0 ) {
	this.data[0].__first__ = 1;
	this.data[0].__outer__ = 1;
    }
    if ( this.priv[0].loopidx == (this.priv[0].loop.length - 1) ) {
	this.data[0].__last__ = 1;
	this.data[0].__outer__ = 1;
    }

    if ( ! this.data[0].__outer__ )
	this.data[0].__inner__ = 1;

    if ( (this.priv[0].loopidx + 1) % 2 == 0 ) {
	this.data[0].__odd__ = 0;
	this.data[0].__even__ = 1;
    } else {
	this.data[0].__odd__ = 1;
	this.data[0].__even__ = 0;
    }

    this.data[0].__index__ = this.priv[0].loopidx;
    this.data[0].__counter__ = this.priv[0].loopidx + 1;
}

htmltmpl.prototype.hdlr_tmpl_loop_1_2_tail = function ()
{
    var loop;
    var name_is_found = 0;


//    alert("tmpl_loop_1_2_tail: " + this.priv[0].loopname);
    this.phrases.shift();
    this.hdlrs.shift();

    // Search a loop in data
    if ( this.p.global_vars )
	len = this.data.length;
    else
	len = 1;

    for(i = 0; i < len; i++) {
	if ( this.data[i][this.priv[0].loopname] != undefined ) {
	    if (( typeof(this.data[i][this.priv[0].loopname]) === "object" ) &&
		( this.data[i][this.priv[0].loopname] instanceof Array )) {
		name_is_found = 1;
		loop = this.data[i][this.priv[0].loopname];
	    }
	    break;
	}
    }
    if (( this.p.err_on_no_data ) && ( ! name_is_found )) {
	this.err_msg = "Cann't find loop '" + this.priv[0].loopname + "'.";
	this.set_state(-1);
	return;
    }

    if (( loop == undefined ) || ( loop.length == 0 )) {
	this.priv.shift();
	this.phrases.unshift([ { phrase: "<%/TMPL_LOOP%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "&lt;%/TMPL_LOOP%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "&LT;%/TMPL_LOOP%&GT;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "<!--%/TMPL_LOOP%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat } ]);
	this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_loop_eat,
			     hdlr_1_0: this.hdlr_tmpl_loop_eat });
	this._match_reset();
	return;
    }
    this.priv.shift();

    this.priv.unshift({ loop: loop,
			loopidx: 0 });
    this.data.unshift(loop[0]);

    if ( this.p.loop_context_vars )
	this.set_loop_context_vars();

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;
    this.tmpl[0].pos.unshift({ cur: this.tmpl[0].pos[0].cur,
			       start: this.tmpl[0].pos[0].start });

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_loop_eat = function ()
{
    return;
}

htmltmpl.prototype.hdlr_tmpl_loop_1_2_eat = function ()
{
//    alert("tmpl_loop_1_2_eat: ");
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this.phrases.shift();
    this.hdlrs.shift();

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_loop_1_2_end = function ()
{
    var pcur, pstart;


//    alert("tmpl_loop_1_2_end: " + this.priv[0].loopidx + "(" + this.priv[0].loop.length + ")");

    this.priv[0].loopidx++;
    // If we reach the end of a loop...
    if ( this.priv[0].loopidx == this.priv[0].loop.length ) {
	pcur = this.tmpl[0].pos[0].cur;
	pstart = pcur + 1;
	this.tmpl[0].pos.shift();
	this.tmpl[0].pos[0].cur = pcur;
	this.tmpl[0].pos[0].start = pstart;
	this.data.shift();
	this.priv.shift();
	this._match_reset();
	return;
    }

    // If not, prepare to the next iteration of a loop
    this.data.shift();
    this.data.unshift(this.priv[0].loop[this.priv[0].loopidx]);

    if ( this.p.loop_context_vars )
	this.set_loop_context_vars();

    this.tmpl[0].pos[0].cur = this.tmpl[0].pos[1].cur;
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[1].start;

    this._match_reset();
}

/**********************************************************************
 * TMPL_IF AND TMPL_UNLESS HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_if_1_2 = function ()
{
//    alert("tmpl_if_1_2");
    this.phrases.unshift([ { phrase: "%>",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%&gt;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%&GT;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%-->",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail } ]);

    this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_if_0_1,
			 hdlr_1_0: this.hdlr_tmpl_if_1_0 });
    this.priv.unshift({ phrase: "if",
			varname: new String() });
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_unless_1_2 = function ()
{
//    alert("tmpl_unless_1_2");
    this.phrases.unshift([ { phrase: "%>",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%&gt;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%&GT;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%-->",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail } ]);

    this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_if_0_1,
			 hdlr_1_0: this.hdlr_tmpl_if_1_0 });
    this.priv.unshift({ phrase: "unless",
			varname: new String() });
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_0_1 = function ()
{
    this.priv[0].varname += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
//    alert("tmpl_if_0_1: " + this.priv[0].varname);
}

htmltmpl.prototype.hdlr_tmpl_if_1_0 = function ()
{
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur;
    this.priv[0].varname += this.match.str;
//    alert("tmpl_if_1_0: " + this.priv[0].varname);
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_tail = function ()
{
    var varname;
    var i;
    var len;
    var phrase;
    var name_is_found = 0;


//    alert("tmpl_if_1_2_tail(" + this.priv[0].phrase + "): " + this.priv[0].varname + "("+this.data[0][this.priv[0].varname] +")");
    this.phrases.shift();
    this.hdlrs.shift();

    if ( this.p.global_vars )
	len = this.data.length;
    else
	len = 1;

    this.priv[0].var_is_true = 0;
    for(i = 0; i < len; i++) {
	if ( this.data[i][this.priv[0].varname] != undefined ) {
	    name_is_found = 1;
	    if ( this.data[i][this.priv[0].varname] )
		this.priv[0].var_is_true = 1;
	    break;
	}
    }
    if (( this.p.err_on_no_data ) && ( ! name_is_found )) {
	this.err_msg = "Cann't find bool var '" + this.priv[0].varname + "'.";
	this.set_state(-1);
	return;
    }

    if ((( this.priv[0].phrase == "if" ) && ( ! this.priv[0].var_is_true )) ||
	(( this.priv[0].phrase == "unless" ) && ( this.priv[0].var_is_true ))) {
	if ( this.priv[0].phrase == "if" )
	    phrase = "TMPL_IF";
	else
	    phrase = "TMPL_UNLESS";
	this.phrases.unshift([ { phrase: "<%/" + phrase + "%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;%/" + phrase + "%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&LT;%/" + phrase + "%&GT;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "<!--%/" + phrase + "%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
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
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_else } ]);
	this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_if_eat,
			     hdlr_1_0: this.hdlr_tmpl_if_eat });
	this._match_reset();
	return;
    }

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_eat = function ()
{
    return;
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_eat = function ()
{
//    alert("tmpl_if_1_2_eat(" + this.priv[0].phrase + "): ");
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this.priv.shift();
    this.phrases.shift();
    this.hdlrs.shift();

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_else = function ()
{
    var phrase;


//    alert("tmpl_if_1_2_else(" + this.priv[0].phrase + "): " + this.priv[0].varname + "("+this.data[0][this.priv[0].varname] +")");

    if ((( this.priv[0].phrase == "if" ) && ( this.priv[0].var_is_true )) ||
	(( this.priv[0].phrase == "unless" ) && ( ! this.priv[0].var_is_true ))) {
	if ( this.priv[0].phrase == "if" )
	    phrase = "TMPL_IF";
	else
	    phrase = "TMPL_UNLESS";
	this.phrases.unshift([ { phrase: "<%/" + phrase + "%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;%/" + phrase + "%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&LT;%/" + phrase + "%&GT;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "<!--%/" + phrase + "%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat } ]);
	this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_if_eat,
			     hdlr_1_0: this.hdlr_tmpl_if_eat });
	this._match_reset();
	return;
    }
    this.phrases.shift();
    this.hdlrs.shift();

    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_end = function ()
{
//    alert("tmpl_if_1_2_end(" + this.priv[0].phrase + "): " + this.priv[0].phrase + "(" + this.priv[0].varname + ")");

    if (( this.priv[0].phrase == "if" ) ||
	( this.priv[0].phrase == "unless" )) {
	this.priv.shift();
	this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;
	this._match_reset();
	return;
    }
}

}