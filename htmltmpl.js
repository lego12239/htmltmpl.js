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
*/
{
    "use strict";
/*
  prms = { case_insensitive: 0/1 }

  Process the tmpl as string or as html element.
  case_insensitive - process template constructs in case-insensitive mode.
*/
function htmltmpl(tmpl, prms)
{
    this.p = {};
    this.data = [];
    this.match = {};
    this.tmpl = [];
    this.priv = [];
    // Initial phrases
    this.phrases = [[ { phrase: "<%TMPL_VAR NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_var_1_2 },
		      { phrase: "&lt;%TMPL_VAR NAME=",
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
		      { phrase: "<!--%/TMPL_LOOP%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_loop_1_2_end },
		      { phrase: "&lt;--%/TMPL_LOOP%--&gt;",
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
		      { phrase: "<!--%TMPL_IF NAME=",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2 },
		      { phrase: "&lt;--%TMPL_IF NAME=",
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
		      { phrase: "<!--%/TMPL_IF%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_end },
		      { phrase: "&lt;--%/TMPL_IF%--&gt;",
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
		      { phrase: "<!--%TMPL_ELSE%-->",
			is_match: 1,
			oref: this,
			hdlr_1_2: this.hdlr_tmpl_if_1_2_else },
		      { phrase: "&lt;--%TMPL_ELSE%--&gt;",
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
    this.p.case_insensitive = 0;
    if ( prms != undefined ) {
	if ( prms.case_insensitive != undefined )
	    this.p.case_insensitive = prms.case_insensitive;
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
		alert("Error: cann't handle a state change from 0 to 2");
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


    if ( this.p.case_insensitive )
	chr = char.toUpperCase();
    else
	chr = char;

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
	}
    }

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

/**********************************************************************
 * TMPL_VAR HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_tmpl_var_1_2 = function ()
{
//    alert("tmp_var_1_2");
    this.phrases.unshift([ { phrase: "%>",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_var_1_2_tail },
			   { phrase: "%&gt;",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_var_1_2_tail } ]);

    this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_var_0_1,
			 hdlr_1_0: this.hdlr_tmpl_var_1_0 });
    this.priv.unshift({ varname: new String() });
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_var_0_1 = function ()
{
    this.priv[0].varname += this.tmpl[0].str.substring(this.tmpl[0].pos[0].start, this.tmpl[0].pos[0].cur);
//    alert("tmpl_var_0_1: " + this.priv[0].varname);
}

htmltmpl.prototype.hdlr_tmpl_var_1_0 = function ()
{
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur;
    this.priv[0].varname += this.match.str;
//    alert("tmpl_var_1_0: " + this.priv[0].varname);
}

htmltmpl.prototype.hdlr_tmpl_var_1_2_tail = function ()
{
//    alert("tmpl_var_1_2_tail: " + this.priv[0].varname);
    var i;


    for(i = 0; i < this.data.length; i++) {
	if ( this.data[i][this.priv[0].varname] != undefined ) {
	    this.out_str += this.data[i][this.priv[0].varname];
	    break;
	}
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
			   { phrase: "%-->",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_loop_1_2_tail },
			   { phrase: "%--&gt;",
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

htmltmpl.prototype.hdlr_tmpl_loop_1_2_tail = function ()
{
    var lname;


//    alert("tmpl_loop_1_2_tail: " + this._t);
    this.phrases.shift();
    this.hdlrs.shift();

    if (( this.data[0][this.priv[0].loopname] == undefined ) ||
	( ! Array.isArray(this.data[0][this.priv[0].loopname]) )) {
	this.priv.shift();
	this.phrases.unshift([ { phrase: "<%/TMPL_LOOP%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "&lt;%/TMPL_LOOP%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "<!--%/TMPL_LOOP%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat },
			       { phrase: "&lt;--%/TMPL_LOOP%--&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_loop_1_2_eat } ]);
	this.hdlrs.unshift({ hdlr_0_1: this.hdlr_tmpl_loop_eat,
			     hdlr_1_0: this.hdlr_tmpl_loop_eat });
	return;
	this._match_reset();
    }
    lname = this.priv[0].loopname;
    this.priv.shift();

    this.priv.unshift({ loop: this.data[0][lname],
			loopidx: 0 });
    this.data.unshift(this.data[0][lname][0]);

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

    this.tmpl[0].pos[0].cur = this.tmpl[0].pos[1].cur;
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[1].start;

    this._match_reset();
}

/**********************************************************************
 * TMPL_IF HANDLERS
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
			   { phrase: "%-->",
			     is_match: 1,
			     oref: this,
			     hdlr_1_2: this.hdlr_tmpl_if_1_2_tail },
			   { phrase: "%--&gt;",
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


//    alert("tmpl_if_1_2_tail: " + this.priv[0].varname + "("+this.data[0][this.priv[0].varname] +")");
    this.phrases.shift();
    this.hdlrs.shift();

    this.priv[0].var_is_true = 0;
    for(i = 0; i < this.data.length; i++) {
	if ( this.data[i][this.priv[0].varname] ) {
	    this.priv[0].var_is_true = 1;
	    break;
	}
    }

    if ( ! this.priv[0].var_is_true ) {
	this.phrases.unshift([ { phrase: "<%/TMPL_IF%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;%/TMPL_IF%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "<!--%/TMPL_IF%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;--%/TMPL_IF%--&gt;",
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
			       { phrase: "<!--%TMPL_ELSE%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_else },
			       { phrase: "&lt;--%TMPL_ELSE%--&gt;",
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
//    alert("tmpl_if_1_2_eat: ");
    this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;

    this.priv.shift();
    this.phrases.shift();
    this.hdlrs.shift();

    this._match_reset();
}

htmltmpl.prototype.hdlr_tmpl_if_1_2_else = function ()
{
//    alert("tmpl_if_1_2_else: " + this.priv[0].varname + "("+this.data[0][this.priv[0].varname] +")");

    if ( this.priv[0].var_is_true ) {
	this.phrases.unshift([ { phrase: "<%/TMPL_IF%>",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;%/TMPL_IF%&gt;",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "<!--%/TMPL_IF%-->",
				 is_match: 1,
				 oref: this,
				 hdlr_1_2: this.hdlr_tmpl_if_1_2_eat },
			       { phrase: "&lt;--%/TMPL_IF%--&gt;",
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
//    alert("tmpl_if_1_2_end: " + this.priv[0].phrase + "(" + this.priv[0].varname + ")");

    if ( this.priv[0].phrase == "if" ) {
	this.priv.shift();
	this.tmpl[0].pos[0].start = this.tmpl[0].pos[0].cur + 1;
	this._match_reset();
	return;
    }
}

}