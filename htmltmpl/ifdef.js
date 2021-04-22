/* htmltmpl.ifdef | htmltmpl 2.0.0 | License - GNU LGPL 3 */
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
 * TMPL_IFDEF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifdef_parse = function(def, attrs)
{
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	this._s.parse.unshift([]);
	this._s.priv.unshift({def: def, attrs: attrs});
}

htmltmpl.prototype.hdlr_ifdef_end_parse = function(def)
{
	var priv;
	var if_, else_;

	priv = this._s.priv.shift();
	if (!this.is_tag_match(priv.def, def.start_tag))
		this._throw("%s was opened, but %s is being closed",
		  priv.def.name, def.name);
	if (priv.def.name == "TMPL_ELSE") {
		else_ = this._s.parse.shift();
		priv = this._s.priv.shift();
	}

	if_ = this._s.parse.shift();
	this._s.parse[0].push({
	  name: priv.def.name,
	  data: {
	    attrs: priv.attrs,
	    ifbody: if_,
	    elsebody: else_}});
}

htmltmpl.prototype.hdlr_ifdef_apply = function(def, data)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(data.attrs.NAME);

	if (val != undefined)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFNDEF HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifndef_apply = function(def, data)
{
	var attrs;
	var val;
	var i;

	val = this._get_data(data.attrs.NAME);

	if (val == undefined)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

htmltmpl.prototype.tags["TMPL_IFDEF"] = {
	pfunc: htmltmpl.prototype.hdlr_ifdef_parse,
	afunc: htmltmpl.prototype.hdlr_ifdef_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFDEF" };
htmltmpl.prototype.tags["TMPL_IFNDEF"] = {
	pfunc: htmltmpl.prototype.hdlr_ifdef_parse,
	afunc: htmltmpl.prototype.hdlr_ifndef_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFNDEF" };
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

htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFDEF"]);
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFNDEF"]);
}
