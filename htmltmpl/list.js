/* htmltmpl.list | htmltmpl 3.0.0 | License - GNU LGPL 3 */
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

/**********************************************************************
 * TMPL_LIST HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_list_parse = function(def, attrs)
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

htmltmpl.prototype.hdlr_list_end_parse = function(def)
{
	var pi;
	var body;

	body = this._s.parse.shift();
	pi = this._s.parse[0][this._s.parse[0].length - 1];
	if (!this.is_tag_match(pi.name, def.start_tag))
		this._throw("%s was opened, but %s is being closed",
		  pi.name, def.name);

	pi.data.body = body;
}

htmltmpl.prototype.hdlr_list_apply = function(def, data)
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
			this._apply(data.body);
		}
		this._s.data.shift();
		this._s.data.shift();
	} else if (this.p.err_on_no_data) {
		this._throw("Cann't find list '%s'.", data.attrs.NAME);
	}
	this._s.v.shift();
}

/**********************************************************************
 * TMPL_LISTITEM HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_listitem_parse = function(def, attrs)
{
	var vname;

	if ((this._s.parse.length < 2) ||
	    (this._s.parse[1][this._s.parse[1].length - 1].name != "TMPL_LIST"))
		this._throw("%s can be used only inside a TMPL_LIST", def.name);
	/* Optional attribute, but must be set for an apply fun. Thus,
	   set it with default value in any case. */
	if (attrs.ESCAPE == null)
		attrs.ESCAPE = def.pafuncs.ESCAPE.call(this, this.p.escape_defval);
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {attrs: attrs}});
}

htmltmpl.prototype.hdlr_listitem_apply = function(def, data)
{
	var attrs;
	var val;

	val = this._get_data();
	if (val == null)
		val = data.attrs.DEFAULT;

	if (val == null)
		if (this.p.err_on_no_data)
			this._throw("List item is null.");
		else
			return;

	val = this._escape_tag_attr_val(data.attrs.ESCAPE, val);
	this.out_str += val;
}


htmltmpl.prototype.tags["TMPL_LIST"] = {
	pfunc: htmltmpl.prototype.hdlr_list_parse,
	afunc: htmltmpl.prototype.hdlr_list_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_LIST" };
htmltmpl.prototype.tags["/TMPL_LIST"] = {
	pfunc: htmltmpl.prototype.hdlr_list_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_LIST"]],
	name: "/TMPL_LIST" };
htmltmpl.prototype.tags["TMPL_LISTITEM"] = {
	pfunc: htmltmpl.prototype.hdlr_listitem_parse,
	afunc: htmltmpl.prototype.hdlr_listitem_apply,
	pafuncs: {ESCAPE: htmltmpl.prototype._parse_tag_attr_ESCAPE},
	name: "TMPL_LISTITEM" };
}
