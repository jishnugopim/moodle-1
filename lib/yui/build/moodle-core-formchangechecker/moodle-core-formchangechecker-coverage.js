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
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-core-formchangechecker/moodle-core-formchangechecker.js",
    code: []
};
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"].code=["YUI.add('moodle-core-formchangechecker', function (Y, NAME) {","","var FORMCHANGECHECKERNAME = 'core-formchangechecker',","","    FORMCHANGECHECKER = function() {","        FORMCHANGECHECKER.superclass.constructor.apply(this, arguments);","    };","","Y.extend(FORMCHANGECHECKER, Y.Base, {","","        // The delegated listeners we need to detach after the initial value has been stored once","        initialvaluelisteners : [],","","        /**","          * Initialize the module","          */","        initializer : function() {","            var formid = 'form#' + this.get('formid'),","                currentform = Y.one(formid);","","            // Add change events to the form elements","            currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'input', this);","            currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'textarea', this);","            currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'select', this);","","            // Add a focus event to check for changes which are made without triggering a change event","            this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'input', this));","            this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'textarea', this));","            this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'select', this));","","            // We need any submit buttons on the form to set the submitted flag","            Y.one(formid).on('submit', M.core_formchangechecker.set_form_submitted, this);","","            // YUI doesn't support onbeforeunload properly so we must use the DOM to set the onbeforeunload. As","            // a result, the has_changed must stay in the DOM too","            window.onbeforeunload = M.core_formchangechecker.report_form_dirty_state;","        },","","        /**","          * Store the initial value of the currently focussed element","          *","          * If an element has been focussed and changed but not yet blurred, the on change","          * event won't be fired. We need to store it's initial value to compare it in the","          * get_form_dirty_state function later.","          */","        store_initial_value : function(e) {","            var thisevent;","            if (e.target.hasClass('ignoredirty')) {","                // Don't warn on elements with the ignoredirty class","                return;","            }","            if (M.core_formchangechecker.get_form_dirty_state()) {","                // Detach all listen events to prevent duplicate initial value setting","                while (this.initialvaluelisteners.length) {","                    thisevent = this.initialvaluelisteners.shift();","                    thisevent.detach();","                }","","                return;","            }","","            // Make a note of the current element so that it can be interrogated and","            // compared in the get_form_dirty_state function","            M.core_formchangechecker.stateinformation.focused_element = {","                element : e.target,","                initial_value : e.target.get('value')","            };","        }","    },","    {","        NAME : FORMCHANGECHECKERNAME,","        ATTRS : {","            formid : {","                'value' : ''","            }","        }","    }",");","","M.core_formchangechecker = M.core_formchangechecker || {};","","// We might have multiple instances of the form change protector","M.core_formchangechecker.instances = M.core_formchangechecker.instances || [];","M.core_formchangechecker.init = function(config) {","    var formchangechecker = new FORMCHANGECHECKER(config);","    M.core_formchangechecker.instances.push(formchangechecker);","    return formchangechecker;","};","","// Store state information","M.core_formchangechecker.stateinformation = [];","","/**","  * Set the form changed state to true","  */","M.core_formchangechecker.set_form_changed = function(e) {","    if (e && e.target && e.target.hasClass('ignoredirty')) {","        // Don't warn on elements with the ignoredirty class","        return;","    }","    M.core_formchangechecker.stateinformation.formchanged = 1;","","    // Once the form has been marked as dirty, we no longer need to keep track of form elements","    // which haven't yet blurred","    delete M.core_formchangechecker.stateinformation.focused_element;","};","","/**","  * Set the form submitted state to true","  */","M.core_formchangechecker.set_form_submitted = function() {","    M.core_formchangechecker.stateinformation.formsubmitted = 1;","};","","/**","  * Attempt to determine whether the form has been modified in any way and","  * is thus 'dirty'","  *","  * @return Integer 1 is the form is dirty; 0 if not","  */","M.core_formchangechecker.get_form_dirty_state = function() {","    var state = M.core_formchangechecker.stateinformation,","        editor;","","    // If the form was submitted, then return a non-dirty state","    if (state.formsubmitted) {","        return 0;","    }","","    // If any fields have been marked dirty, return a dirty state","    if (state.formchanged) {","        return 1;","    }","","    // If a field has been focused and changed, but still has focus then the browser won't fire the","    // onChange event. We check for this eventuality here","    if (state.focused_element) {","        if (state.focused_element.element.get('value') !== state.focused_element.initial_value) {","            return 1;","        }","    }","","    // Handle TinyMCE editor instances","    // We can't add a listener in the initializer as the editors may not have been created by that point","    // so we do so here instead","    if (typeof tinyMCE !== 'undefined') {","        for (editor in tinyMCE.editors) {","            if (tinyMCE.editors[editor].isDirty()) {","                return 1;","            }","        }","    }","","    // If we reached here, then the form hasn't met any of the dirty conditions","    return 0;","};","","/**","  * Return a suitable message if changes have been made to a form","  */","M.core_formchangechecker.report_form_dirty_state = function(e) {","    if (!M.core_formchangechecker.get_form_dirty_state()) {","        // the form is not dirty, so don't display any message","        return;","    }","","    // This is the error message that we'll show to browsers which support it","    var warningmessage = M.util.get_string('changesmadereallygoaway', 'moodle');","","    // Most browsers are happy with the returnValue being set on the event","    // But some browsers do not consistently pass the event","    if (e) {","        e.returnValue = warningmessage;","    }","","    // But some require it to be returned instead","    return warningmessage;","};","","","}, '@VERSION@', {\"requires\": [\"base\", \"event-focus\"]});"];
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"].lines = {"1":0,"3":0,"6":0,"9":0,"18":0,"22":0,"23":0,"24":0,"27":0,"28":0,"29":0,"32":0,"36":0,"47":0,"48":0,"50":0,"52":0,"54":0,"55":0,"56":0,"59":0,"64":0,"80":0,"83":0,"84":0,"85":0,"86":0,"87":0,"91":0,"96":0,"97":0,"99":0,"101":0,"105":0,"111":0,"112":0,"121":0,"122":0,"126":0,"127":0,"131":0,"132":0,"137":0,"138":0,"139":0,"146":0,"147":0,"148":0,"149":0,"155":0,"161":0,"162":0,"164":0,"168":0,"172":0,"173":0,"177":0};
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"].functions = {"FORMCHANGECHECKER:5":0,"initializer:17":0,"store_initial_value:46":0,"init:84":0,"set_form_changed:96":0,"set_form_submitted:111":0,"get_form_dirty_state:121":0,"report_form_dirty_state:161":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"].coveredLines = 57;
_yuitest_coverage["build/moodle-core-formchangechecker/moodle-core-formchangechecker.js"].coveredFunctions = 9;
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 1);
YUI.add('moodle-core-formchangechecker', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 3);
var FORMCHANGECHECKERNAME = 'core-formchangechecker',

    FORMCHANGECHECKER = function() {
        _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "FORMCHANGECHECKER", 5);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 6);
FORMCHANGECHECKER.superclass.constructor.apply(this, arguments);
    };

_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 9);
Y.extend(FORMCHANGECHECKER, Y.Base, {

        // The delegated listeners we need to detach after the initial value has been stored once
        initialvaluelisteners : [],

        /**
          * Initialize the module
          */
        initializer : function() {
            _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "initializer", 17);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 18);
var formid = 'form#' + this.get('formid'),
                currentform = Y.one(formid);

            // Add change events to the form elements
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 22);
currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'input', this);
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 23);
currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'textarea', this);
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 24);
currentform.delegate('change', M.core_formchangechecker.set_form_changed, 'select', this);

            // Add a focus event to check for changes which are made without triggering a change event
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 27);
this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'input', this));
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 28);
this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'textarea', this));
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 29);
this.initialvaluelisteners.push(currentform.delegate('focus', this.store_initial_value, 'select', this));

            // We need any submit buttons on the form to set the submitted flag
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 32);
Y.one(formid).on('submit', M.core_formchangechecker.set_form_submitted, this);

            // YUI doesn't support onbeforeunload properly so we must use the DOM to set the onbeforeunload. As
            // a result, the has_changed must stay in the DOM too
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 36);
window.onbeforeunload = M.core_formchangechecker.report_form_dirty_state;
        },

        /**
          * Store the initial value of the currently focussed element
          *
          * If an element has been focussed and changed but not yet blurred, the on change
          * event won't be fired. We need to store it's initial value to compare it in the
          * get_form_dirty_state function later.
          */
        store_initial_value : function(e) {
            _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "store_initial_value", 46);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 47);
var thisevent;
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 48);
if (e.target.hasClass('ignoredirty')) {
                // Don't warn on elements with the ignoredirty class
                _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 50);
return;
            }
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 52);
if (M.core_formchangechecker.get_form_dirty_state()) {
                // Detach all listen events to prevent duplicate initial value setting
                _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 54);
while (this.initialvaluelisteners.length) {
                    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 55);
thisevent = this.initialvaluelisteners.shift();
                    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 56);
thisevent.detach();
                }

                _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 59);
return;
            }

            // Make a note of the current element so that it can be interrogated and
            // compared in the get_form_dirty_state function
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 64);
M.core_formchangechecker.stateinformation.focused_element = {
                element : e.target,
                initial_value : e.target.get('value')
            };
        }
    },
    {
        NAME : FORMCHANGECHECKERNAME,
        ATTRS : {
            formid : {
                'value' : ''
            }
        }
    }
);

_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 80);
M.core_formchangechecker = M.core_formchangechecker || {};

// We might have multiple instances of the form change protector
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 83);
M.core_formchangechecker.instances = M.core_formchangechecker.instances || [];
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 84);
M.core_formchangechecker.init = function(config) {
    _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "init", 84);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 85);
var formchangechecker = new FORMCHANGECHECKER(config);
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 86);
M.core_formchangechecker.instances.push(formchangechecker);
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 87);
return formchangechecker;
};

// Store state information
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 91);
M.core_formchangechecker.stateinformation = [];

/**
  * Set the form changed state to true
  */
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 96);
M.core_formchangechecker.set_form_changed = function(e) {
    _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "set_form_changed", 96);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 97);
if (e && e.target && e.target.hasClass('ignoredirty')) {
        // Don't warn on elements with the ignoredirty class
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 99);
return;
    }
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 101);
M.core_formchangechecker.stateinformation.formchanged = 1;

    // Once the form has been marked as dirty, we no longer need to keep track of form elements
    // which haven't yet blurred
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 105);
delete M.core_formchangechecker.stateinformation.focused_element;
};

/**
  * Set the form submitted state to true
  */
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 111);
M.core_formchangechecker.set_form_submitted = function() {
    _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "set_form_submitted", 111);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 112);
M.core_formchangechecker.stateinformation.formsubmitted = 1;
};

/**
  * Attempt to determine whether the form has been modified in any way and
  * is thus 'dirty'
  *
  * @return Integer 1 is the form is dirty; 0 if not
  */
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 121);
M.core_formchangechecker.get_form_dirty_state = function() {
    _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "get_form_dirty_state", 121);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 122);
var state = M.core_formchangechecker.stateinformation,
        editor;

    // If the form was submitted, then return a non-dirty state
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 126);
if (state.formsubmitted) {
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 127);
return 0;
    }

    // If any fields have been marked dirty, return a dirty state
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 131);
if (state.formchanged) {
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 132);
return 1;
    }

    // If a field has been focused and changed, but still has focus then the browser won't fire the
    // onChange event. We check for this eventuality here
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 137);
if (state.focused_element) {
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 138);
if (state.focused_element.element.get('value') !== state.focused_element.initial_value) {
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 139);
return 1;
        }
    }

    // Handle TinyMCE editor instances
    // We can't add a listener in the initializer as the editors may not have been created by that point
    // so we do so here instead
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 146);
if (typeof tinyMCE !== 'undefined') {
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 147);
for (editor in tinyMCE.editors) {
            _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 148);
if (tinyMCE.editors[editor].isDirty()) {
                _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 149);
return 1;
            }
        }
    }

    // If we reached here, then the form hasn't met any of the dirty conditions
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 155);
return 0;
};

/**
  * Return a suitable message if changes have been made to a form
  */
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 161);
M.core_formchangechecker.report_form_dirty_state = function(e) {
    _yuitest_coverfunc("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", "report_form_dirty_state", 161);
_yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 162);
if (!M.core_formchangechecker.get_form_dirty_state()) {
        // the form is not dirty, so don't display any message
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 164);
return;
    }

    // This is the error message that we'll show to browsers which support it
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 168);
var warningmessage = M.util.get_string('changesmadereallygoaway', 'moodle');

    // Most browsers are happy with the returnValue being set on the event
    // But some browsers do not consistently pass the event
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 172);
if (e) {
        _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 173);
e.returnValue = warningmessage;
    }

    // But some require it to be returned instead
    _yuitest_coverline("build/moodle-core-formchangechecker/moodle-core-formchangechecker.js", 177);
return warningmessage;
};


}, '@VERSION@', {"requires": ["base", "event-focus"]});
