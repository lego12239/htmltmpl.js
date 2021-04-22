/* htmltmpl.ifeq | htmltmpl 3.0.0 | License - GNU LGPL 3 */
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
 * TMPL_IFEQ HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifeq_parse = function(def, attrs)
{
	if (attrs.NAME == null)
		this._throw("NAME is a mandatory attribute");
	if ((attrs.VALUE == null) && (attrs.WITH == null))
		this._throw("one of VALUE or WITH attribute must be specified");
	this._s.parse[0].push({
	  name: def.name,
	  lineno: this.ctx.lineno,
	  data: {
	    attrs: attrs}});
	this._s.parse.unshift([]);
}

htmltmpl.prototype.hdlr_ifeq_end_parse = function(def)
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

htmltmpl.prototype.hdlr_ifeq_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val == val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFNEQ HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifneq_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val != val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFGT HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifgt_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val > val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFGE HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifge_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val >= val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFLT HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_iflt_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val < val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

/**********************************************************************
 * TMPL_IFLE HANDLERS
 **********************************************************************/
htmltmpl.prototype.hdlr_ifle_apply = function(def, data)
{
	var attrs;
	var val, val2;
	var i;

	val = this._get_data(data.attrs.NAME);
	if (data.attrs.WITH != null)
		val2 = this._get_data(data.attrs.WITH);
	else
		val2 = data.attrs.VALUE;

	if ((this.p.err_on_no_data) && (val == null))
		this._throw("Cann't find var '%s'.", data.attrs.NAME);
	if ((this.p.err_on_no_data) && (val2 == null))
		this._throw("Cann't find var '%s'.", data.attrs.WITH);

	if (val <= val2)
		this._apply(data.ifbody);
	else if (data.elsebody != undefined)
		this._apply(data.elsebody);
}

htmltmpl.prototype.tags["TMPL_IFEQ"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_ifeq_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFEQ" };
htmltmpl.prototype.tags["TMPL_IFNEQ"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_ifneq_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFNEQ" };
htmltmpl.prototype.tags["TMPL_IFGT"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_ifgt_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFGT" };
htmltmpl.prototype.tags["TMPL_IFGE"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_ifge_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFGE" };
htmltmpl.prototype.tags["TMPL_IFLT"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_iflt_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFLT" };
htmltmpl.prototype.tags["TMPL_IFLE"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_parse,
	afunc: htmltmpl.prototype.hdlr_ifle_apply,
	pafuncs: {NAME: htmltmpl.prototype._parse_tag_attr_NAME,
	  WITH: htmltmpl.prototype._parse_tag_attr_NAME},
	name: "TMPL_IFLE" };
htmltmpl.prototype.tags["/TMPL_IFEQ"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFEQ"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFEQ" };
htmltmpl.prototype.tags["/TMPL_IFNEQ"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFNEQ"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFNEQ" };
htmltmpl.prototype.tags["/TMPL_IFGT"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFGT"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFGT" };
htmltmpl.prototype.tags["/TMPL_IFGE"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFGE"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFGE" };
htmltmpl.prototype.tags["/TMPL_IFLT"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFLT"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFLT" };
htmltmpl.prototype.tags["/TMPL_IFLE"] = {
	pfunc: htmltmpl.prototype.hdlr_ifeq_end_parse,
	start_tag: [htmltmpl.prototype.tags["TMPL_IFLE"],
		htmltmpl.prototype.tags["TMPL_ELSE"]],
	name: "/TMPL_IFLE" };

htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFEQ"]);
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFNEQ"]);
}
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFGT"]);
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFGE"]);
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFLT"]);
htmltmpl.prototype.tags["TMPL_ELSE"].start_tag.push(htmltmpl.prototype.tags["TMPL_IFLE"]);
