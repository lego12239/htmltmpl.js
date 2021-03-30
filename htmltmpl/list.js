/* htmltmpl.list | htmltmpl 1.4.0 | License - GNU LGPL 3 */
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
htmltmpl.prototype.hdlr_list_parse = function(def, tag_attrs)
{
	var attrs;

	attrs = this._parse_tag_attrs(tag_attrs);
	this._s.parse.unshift([]);
	this._s.priv.unshift([def, attrs ]);
}

htmltmpl.prototype.hdlr_list_end_parse = function(def)
{
	var priv;
	var vname, list;

	priv = this._s.priv.shift();
	if (!this.is_tag_match(priv[0], def.start_tag))
		throw("parse err: " + priv[0].name + " was opened, but " +
		  def.name + " is being closed");

	vname = priv[1].NAME.split(".");
	list = this._s.parse.shift();
	this._s.parse[0].push([priv[0].name, [ vname, priv[1], list ]]);
}

htmltmpl.prototype.hdlr_list_apply = function(def, tag)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(tag[0]);

	if ((val != undefined) && (Array.isArray(val)))
		for(i = 0; i < val.length; i++) {
			this._s.data.unshift(val[i]);
			if (this.p.loop_context_vars)
				this.set_loop_context_vars(i, val.length);
			this._apply(tag[2]);
			this._s.data.shift();
		}
	else if (this.p.err_on_no_data)
		throw("Cann't find list '" + tag[0] + "'.");
}

/**********************************************************************
 * TMPL_LISTITEM HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_listitem_parse = function(def, tag_attrs)
{
	var attrs, vname;

	attrs = this._parse_tag_attrs(tag_attrs);
	this._s.parse[0].push([def.name, [ attrs ]]);
}

htmltmpl.prototype.hdlr_listitem_apply = function(def, tag)
{
	var attrs;
	var val;

	val = this._get_data();

	if (val != undefined)
		this.out_str += val;
	else if (tag[1]["DEFAULT"] != undefined)
		this.out_str += tag[0]["DEFAULT"];
	else if (this.p.err_on_no_data)
		throw("List item is null.");
}


htmltmpl.prototype.tags["TMPL_LIST"] = {
	pfunc: htmltmpl.prototype.hdlr_list_parse,
	afunc: htmltmpl.prototype.hdlr_list_apply,
	name: "TMPL_LIST" };
htmltmpl.prototype.tags["/TMPL_LIST"] = {
	pfunc: htmltmpl.prototype.hdlr_list_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_LIST"]],
	name: "/TMPL_LIST" };
htmltmpl.prototype.tags["TMPL_LISTITEM"] = {
	pfunc: htmltmpl.prototype.hdlr_listitem_parse,
	afunc: htmltmpl.prototype.hdlr_listitem_apply,
	name: "TMPL_LISTITEM" };
}
