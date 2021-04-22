/* htmltmpl.ifin | htmltmpl 3.0.0 | License - GNU LGPL 3 */
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

htmltmpl.prototype._parse_tag_attr_VALUES = function(val)
{
	if (!Array.isArray(val))
		this._throw("attribute VALUES must be an array ");
	return val;
}

/**********************************************************************
 * TMPL_IFIN HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifin_parse = function(def, attrs)
{
	if (attrs.VALUES == null)
		this._throw("VALUES is a mandatory attribute");
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {
	    attrs: attrs}});
	this._s.parse.unshift([]);
}

htmltmpl.prototype.hdlr_ifin_end_parse = function(def)
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

htmltmpl.prototype.hdlr_ifin_apply = function(def, data)
{
	var val, vals;
	var i;

	val = this._get_data(data.attrs.NAME);
	vals = data.attrs.VALUES;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);

	for(i = 0; i < vals.length; i++)
		if (val == vals[i]) {
			this._apply(data.ifbody);
			return;
		}

	if (data.elsebody != undefined)
		this._apply(data.elsebody);
}


htmltmpl.prototype.tags["TMPL_IFIN"] = {
	pfunc: htmltmpl.prototype.hdlr_ifin_parse,
	afunc: htmltmpl.prototype.hdlr_ifin_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  VALUES: htmltmpl.prototype._parse_tag_attr_VALUES},
	name: "TMPL_IFIN" };
htmltmpl.prototype.tags["/TMPL_IFIN"] = {
	pfunc: htmltmpl.prototype.hdlr_ifin_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFIN"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFIN" };

htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFIN"]);
}
