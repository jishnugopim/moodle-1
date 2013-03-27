if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-form-shortforms/moodle-form-shortforms.js",
    code: []
};
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"].code=["YUI.add('moodle-form-shortforms', function (Y, NAME) {","","/**","  * Provides the form shortforms class.","  *","  * @module moodle-form-shortforms","  */","","/**","  * A class for a shortforms.","  *","  * @param {Object} config Object literal specifying shortforms configuration properties.","  * @class M.form.shortforms","  * @constructor","  * @extends Y.Base","  */","function SHORTFORMS(config) {","    SHORTFORMS.superclass.constructor.apply(this, [config]);","}","","var SELECTORS = {","        FIELDSETCOLLAPSIBLE : 'fieldset.collapsible',","        LEGENDFTOGGLER : 'legend.ftoggler'","    },","    CSS = {","        COLLAPSED : 'collapsed',","        FHEADER : 'fheader'","    },","    ATTRS = {};","","/**","  * Static property provides a string to identify the JavaScript class.","  *","  * @property NAME","  * @type String","  * @static","  */","SHORTFORMS.NAME = 'moodle-form-shortforms';","","/**","  * Static property used to define the default attribute configuration for the Shortform.","  *","  * @property ATTRS","  * @type String","  * @static","  */","SHORTFORMS.ATTRS = ATTRS;","","/**","  * The form ID attribute definition.","  *","  * @attribute formid","  * @type String","  * @default ''","  * @writeOnce","  */","ATTRS.formid = {","    value : null","};","","Y.extend(SHORTFORMS, Y.Base, {","    initializer : function() {","        var fieldlist = Y.Node.all('#'+this.get('formid')+' '+SELECTORS.FIELDSETCOLLAPSIBLE);","        // Look through collapsible fieldset divs.","        fieldlist.each(this.process_fieldset, this);","        // Subscribe collapsible fieldsets to click event.","        Y.one('#'+this.get('formid')).delegate('click', this.switch_state, SELECTORS.FIELDSETCOLLAPSIBLE+' .'+CSS.FHEADER);","    },","    process_fieldset : function(fieldset) {","        // Get legend element.","        var legendelement = fieldset.one(SELECTORS.LEGENDFTOGGLER),","            headerlink = Y.Node.create('<a href=\"#\"></a>');","","        // Turn headers to links for accessibility.","        headerlink.addClass(CSS.FHEADER);","        headerlink.appendChild(legendelement.get('firstChild'));","        legendelement.prepend(headerlink);","    },","    switch_state : function(e) {","        e.preventDefault();","        var fieldset = this.ancestor(SELECTORS.FIELDSETCOLLAPSIBLE);","        // Toggle collapsed class.","        fieldset.toggleClass(CSS.COLLAPSED);","        // Get corresponding hidden variable","        // - and invert it.","        var statuselement = Y.one('input[name=mform_isexpanded_'+fieldset.get('id')+']');","        if (!statuselement) {","            return;","        }","        statuselement.set('value', Math.abs(Number(statuselement.get('value'))-1));","    }","});","","M.form = M.form || {};","M.form.shortforms = M.form.shortforms || function(params) {","    return new SHORTFORMS(params);","};","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"selector-css3\"]});"];
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"].lines = {"1":0,"17":0,"18":0,"21":0,"38":0,"47":0,"57":0,"61":0,"63":0,"65":0,"67":0,"71":0,"75":0,"76":0,"77":0,"80":0,"81":0,"83":0,"86":0,"87":0,"88":0,"90":0,"94":0,"95":0,"96":0};
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"].functions = {"SHORTFORMS:17":0,"initializer:62":0,"process_fieldset:69":0,"switch_state:79":0,"(anonymous 2):95":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"].coveredLines = 25;
_yuitest_coverage["build/moodle-form-shortforms/moodle-form-shortforms.js"].coveredFunctions = 6;
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 1);
YUI.add('moodle-form-shortforms', function (Y, NAME) {

/**
  * Provides the form shortforms class.
  *
  * @module moodle-form-shortforms
  */

/**
  * A class for a shortforms.
  *
  * @param {Object} config Object literal specifying shortforms configuration properties.
  * @class M.form.shortforms
  * @constructor
  * @extends Y.Base
  */
_yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 17);
function SHORTFORMS(config) {
    _yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "SHORTFORMS", 17);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 18);
SHORTFORMS.superclass.constructor.apply(this, [config]);
}

_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 21);
var SELECTORS = {
        FIELDSETCOLLAPSIBLE : 'fieldset.collapsible',
        LEGENDFTOGGLER : 'legend.ftoggler'
    },
    CSS = {
        COLLAPSED : 'collapsed',
        FHEADER : 'fheader'
    },
    ATTRS = {};

/**
  * Static property provides a string to identify the JavaScript class.
  *
  * @property NAME
  * @type String
  * @static
  */
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 38);
SHORTFORMS.NAME = 'moodle-form-shortforms';

/**
  * Static property used to define the default attribute configuration for the Shortform.
  *
  * @property ATTRS
  * @type String
  * @static
  */
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 47);
SHORTFORMS.ATTRS = ATTRS;

/**
  * The form ID attribute definition.
  *
  * @attribute formid
  * @type String
  * @default ''
  * @writeOnce
  */
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 57);
ATTRS.formid = {
    value : null
};

_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 61);
Y.extend(SHORTFORMS, Y.Base, {
    initializer : function() {
        _yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "initializer", 62);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 63);
var fieldlist = Y.Node.all('#'+this.get('formid')+' '+SELECTORS.FIELDSETCOLLAPSIBLE);
        // Look through collapsible fieldset divs.
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 65);
fieldlist.each(this.process_fieldset, this);
        // Subscribe collapsible fieldsets to click event.
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 67);
Y.one('#'+this.get('formid')).delegate('click', this.switch_state, SELECTORS.FIELDSETCOLLAPSIBLE+' .'+CSS.FHEADER);
    },
    process_fieldset : function(fieldset) {
        // Get legend element.
        _yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "process_fieldset", 69);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 71);
var legendelement = fieldset.one(SELECTORS.LEGENDFTOGGLER),
            headerlink = Y.Node.create('<a href="#"></a>');

        // Turn headers to links for accessibility.
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 75);
headerlink.addClass(CSS.FHEADER);
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 76);
headerlink.appendChild(legendelement.get('firstChild'));
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 77);
legendelement.prepend(headerlink);
    },
    switch_state : function(e) {
        _yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "switch_state", 79);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 80);
e.preventDefault();
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 81);
var fieldset = this.ancestor(SELECTORS.FIELDSETCOLLAPSIBLE);
        // Toggle collapsed class.
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 83);
fieldset.toggleClass(CSS.COLLAPSED);
        // Get corresponding hidden variable
        // - and invert it.
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 86);
var statuselement = Y.one('input[name=mform_isexpanded_'+fieldset.get('id')+']');
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 87);
if (!statuselement) {
            _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 88);
return;
        }
        _yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 90);
statuselement.set('value', Math.abs(Number(statuselement.get('value'))-1));
    }
});

_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 94);
M.form = M.form || {};
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 95);
M.form.shortforms = M.form.shortforms || function(params) {
    _yuitest_coverfunc("build/moodle-form-shortforms/moodle-form-shortforms.js", "(anonymous 2)", 95);
_yuitest_coverline("build/moodle-form-shortforms/moodle-form-shortforms.js", 96);
return new SHORTFORMS(params);
};


}, '@VERSION@', {"requires": ["base", "node", "selector-css3"]});
