/* htmltmpl.func | htmltmpl 1.5.0 | License - GNU LGPL 3 */
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

htmltmpl.prototype.cb.init.push(function () {
	this.funcs = {};
});

// For use inside a this.funcs.*
htmltmpl.prototype.get_data = function(name)
{
	return this._get_data(name.split("."));
}

htmltmpl.prototype._parse_tag_attr_FUNCARGS = function(val)
{
	if (!Array.isArray(val))
		throw("parse_tag_attr err: attribute ARGS must be an array ");
	return val;
}

/**********************************************************************
 * TMPL_FUNC HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_func_parse = function(def, tag_attrs)
{
	var attrs;

	attrs = this._parse_tag_attrs(def, tag_attrs);
	/* Optional attribute, but must be set for an apply fun. Thus,
	   set it with default value in any case. */
	if (attrs.ESCAPE == null)
		attrs.ESCAPE = def.pafuncs.ESCAPE.call(this, this.p.escape_defval);
	this._s.parse[0].push([def.name, [ attrs ]]);
}

htmltmpl.prototype.hdlr_func_apply = function(def, tag)
{
	var attrs;
	var val;

	if (this.funcs[tag[0]["NAME"]] != undefined) {
		val = this.funcs[tag[0]["NAME"]].apply(this, tag[0]["ARGS"]);
		if (val == null)
			return;
		val = this._escape_tag_attr_val(tag[0].ESCAPE, val);
		this.out_str += val;
	} else if (this.p.err_on_no_data) {
		throw("Cann't find func '" + tag[0]["NAME"] + "'.");
	}
}

htmltmpl.prototype.tags["TMPL_FUNC"] = {
	pfunc: htmltmpl.prototype.hdlr_func_parse,
	afunc: htmltmpl.prototype.hdlr_func_apply,
	pafuncs: {ARGS: htmltmpl.prototype._parse_tag_attr_FUNCARGS,
	  ESCAPE: htmltmpl.prototype._parse_tag_attr_ESCAPE},
	name: "TMPL_FUNC" };
}
