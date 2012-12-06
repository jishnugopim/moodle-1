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
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-coursebase/moodle-course-coursebase.js",
    code: []
};
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"].code=["YUI.add('moodle-course-coursebase', function (Y, NAME) {","","    /**","     * The coursebase class","     */","    var COURSEBASENAME = 'course-coursebase';","","    var COURSEBASE = function() {","        COURSEBASE.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(COURSEBASE, Y.Base, {","        // Registered Modules","        registermodules : [],","","        /**","         * Initialize the coursebase module","         */","        initializer : function(config) {","            // We don't actually perform any work here","        },","","        /**","         * Register a new Javascript Module","         *","         * @param object The instantiated module to call functions on","         */","        register_module : function(object) {","            this.registermodules.push(object);","        },","","        /**","         * Invoke the specified function in all registered modules with the given arguments","         *","         * @param functionname The name of the function to call","         * @param args The argument supplied to the function","         */","        invoke_function : function(functionname, args) {","            for (module in this.registermodules) {","                if (functionname in this.registermodules[module]) {","                    this.registermodules[module][functionname](args);","                }","            }","        }","    },","    {","        NAME : COURSEBASENAME,","        ATTRS : {}","    }","    );","","    // Ensure that M.course exists and that coursebase is initialised correctly","    M.course = M.course || {};","    M.course.coursebase = M.course.coursebase || new COURSEBASE();","","    // Abstract functions that needs to be defined per format (course/format/somename/format.js)","    M.course.format = M.course.format || {}","","   /**","    * Swap section (should be defined in format.js if requred)","    *","    * @param {YUI} Y YUI3 instance","    * @param {string} node1 node to swap to","    * @param {string} node2 node to swap with","    * @return {NodeList} section list","    */","    M.course.format.swap_sections = M.course.format.swap_sections || function(Y, node1, node2) {","        return null;","    }","","   /**","    * Process sections after ajax response (should be defined in format.js)","    * If some response is expected, we pass it over to format, as it knows better","    * hot to process it.","    *","    * @param {YUI} Y YUI3 instance","    * @param {NodeList} list of sections","    * @param {array} response ajax response","    * @param {string} sectionfrom first affected section","    * @param {string} sectionto last affected section","    * @return void","    */","    M.course.format.process_sections = M.course.format.process_sections || function(Y, sectionlist, response, sectionfrom, sectionto) {","        return null;","    }","","   /**","    * Get sections config for this format, for examples see function definition","    * in the formats.","    *","    * @return {object} section list configuration","    */","    M.course.format.get_config = M.course.format.get_config || function() {","        return {","            container_node : null, // compulsory","            container_class : null, // compulsory","            section_wrapper_node : null, // optional","            section_wrapper_class : null, // optional","            section_node : null,  // compulsory","            section_class : null  // compulsory","        }","    }","","   /**","    * Get section list for this format (usually items inside container_node.container_class selector)","    *","    * @param {YUI} Y YUI3 instance","    * @return {string} section selector","    */","    M.course.format.get_section_selector = M.course.format.get_section_selector || function(Y) {","        var config = M.course.format.get_config();","        if (config.section_node && config.section_class) {","            return config.section_node + '.' + config.section_class;","        }","        console.log('section_node and section_class are not defined in M.course.format.get_config');","        return null;","    }","","   /**","    * Get section wraper for this format (only used in case when each","    * container_node.container_class node is wrapped in some other element).","    *","    * @param {YUI} Y YUI3 instance","    * @return {string} section wrapper selector or M.course.format.get_section_selector","    * if section_wrapper_node and section_wrapper_class are not defined in the format config.","    */","    M.course.format.get_section_wrapper = M.course.format.get_section_wrapper || function(Y) {","        var config = M.course.format.get_config();","        if (config.section_wrapper_node && config.section_wrapper_class) {","            return config.section_wrapper_node + '.' + config.section_wrapper_class;","        }","        return M.course.format.get_section_selector(Y);","    }","","   /**","    * Get the tag of container node","    *","    * @return {string} tag of container node.","    */","    M.course.format.get_containernode = M.course.format.get_containernode || function() {","        var config = M.course.format.get_config();","        if (config.container_node) {","            return config.container_node;","        } else {","            console.log('container_node is not defined in M.course.format.get_config');","        }","    }","","   /**","    * Get the class of container node","    *","    * @return {string} class of the container node.","    */","    M.course.format.get_containerclass = M.course.format.get_containerclass || function() {","        var config = M.course.format.get_config();","        if (config.container_class) {","            return config.container_class;","        } else {","            console.log('container_class is not defined in M.course.format.get_config');","        }","    }","","   /**","    * Get the tag of draggable node (section wrapper if exists, otherwise section)","    *","    * @return {string} tag of the draggable node.","    */","    M.course.format.get_sectionwrappernode = M.course.format.get_sectionwrappernode || function() {","        var config = M.course.format.get_config();","        if (config.section_wrapper_node) {","            return config.section_wrapper_node;","        } else {","            return config.section_node;","        }","    }","","   /**","    * Get the class of draggable node (section wrapper if exists, otherwise section)","    *","    * @return {string} class of the draggable node.","    */","    M.course.format.get_sectionwrapperclass = M.course.format.get_sectionwrapperclass || function() {","        var config = M.course.format.get_config();","        if (config.section_wrapper_class) {","            return config.section_wrapper_class;","        } else {","            return config.section_class;","        }","    }","","   /**","    * Get the tag of section node","    *","    * @return {string} tag of section node.","    */","    M.course.format.get_sectionnode = M.course.format.get_sectionnode || function() {","        var config = M.course.format.get_config();","        if (config.section_node) {","            return config.section_node;","        } else {","            console.log('section_node is not defined in M.course.format.get_config');","        }","    }","","   /**","    * Get the class of section node","    *","    * @return {string} class of the section node.","    */","    M.course.format.get_sectionclass = M.course.format.get_sectionclass || function() {","        var config = M.course.format.get_config();","        if (config.section_class) {","            return config.section_class;","        } else {","            console.log('section_class is not defined in M.course.format.get_config');","        }","","    }","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\"]});"];
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"].lines = {"1":0,"6":0,"8":0,"9":0,"12":0,"29":0,"39":0,"40":0,"41":0,"53":0,"54":0,"57":0,"67":0,"68":0,"83":0,"84":0,"93":0,"94":0,"110":0,"111":0,"112":0,"113":0,"115":0,"116":0,"127":0,"128":0,"129":0,"130":0,"132":0,"140":0,"141":0,"142":0,"143":0,"145":0,"154":0,"155":0,"156":0,"157":0,"159":0,"168":0,"169":0,"170":0,"171":0,"173":0,"182":0,"183":0,"184":0,"185":0,"187":0,"196":0,"197":0,"198":0,"199":0,"201":0,"210":0,"211":0,"212":0,"213":0,"215":0};
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"].functions = {"COURSEBASE:8":0,"register_module:28":0,"invoke_function:38":0,"(anonymous 2):67":0,"(anonymous 3):83":0,"(anonymous 4):93":0,"(anonymous 5):110":0,"(anonymous 6):127":0,"(anonymous 7):140":0,"(anonymous 8):154":0,"(anonymous 9):168":0,"(anonymous 10):182":0,"(anonymous 11):196":0,"(anonymous 12):210":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"].coveredLines = 59;
_yuitest_coverage["build/moodle-course-coursebase/moodle-course-coursebase.js"].coveredFunctions = 15;
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 1);
YUI.add('moodle-course-coursebase', function (Y, NAME) {

    /**
     * The coursebase class
     */
    _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 6);
var COURSEBASENAME = 'course-coursebase';

    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 8);
var COURSEBASE = function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "COURSEBASE", 8);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 9);
COURSEBASE.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 12);
Y.extend(COURSEBASE, Y.Base, {
        // Registered Modules
        registermodules : [],

        /**
         * Initialize the coursebase module
         */
        initializer : function(config) {
            // We don't actually perform any work here
        },

        /**
         * Register a new Javascript Module
         *
         * @param object The instantiated module to call functions on
         */
        register_module : function(object) {
            _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "register_module", 28);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 29);
this.registermodules.push(object);
        },

        /**
         * Invoke the specified function in all registered modules with the given arguments
         *
         * @param functionname The name of the function to call
         * @param args The argument supplied to the function
         */
        invoke_function : function(functionname, args) {
            _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "invoke_function", 38);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 39);
for (module in this.registermodules) {
                _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 40);
if (functionname in this.registermodules[module]) {
                    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 41);
this.registermodules[module][functionname](args);
                }
            }
        }
    },
    {
        NAME : COURSEBASENAME,
        ATTRS : {}
    }
    );

    // Ensure that M.course exists and that coursebase is initialised correctly
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 53);
M.course = M.course || {};
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 54);
M.course.coursebase = M.course.coursebase || new COURSEBASE();

    // Abstract functions that needs to be defined per format (course/format/somename/format.js)
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 57);
M.course.format = M.course.format || {}

   /**
    * Swap section (should be defined in format.js if requred)
    *
    * @param {YUI} Y YUI3 instance
    * @param {string} node1 node to swap to
    * @param {string} node2 node to swap with
    * @return {NodeList} section list
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 67);
M.course.format.swap_sections = M.course.format.swap_sections || function(Y, node1, node2) {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 2)", 67);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 68);
return null;
    }

   /**
    * Process sections after ajax response (should be defined in format.js)
    * If some response is expected, we pass it over to format, as it knows better
    * hot to process it.
    *
    * @param {YUI} Y YUI3 instance
    * @param {NodeList} list of sections
    * @param {array} response ajax response
    * @param {string} sectionfrom first affected section
    * @param {string} sectionto last affected section
    * @return void
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 83);
M.course.format.process_sections = M.course.format.process_sections || function(Y, sectionlist, response, sectionfrom, sectionto) {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 3)", 83);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 84);
return null;
    }

   /**
    * Get sections config for this format, for examples see function definition
    * in the formats.
    *
    * @return {object} section list configuration
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 93);
M.course.format.get_config = M.course.format.get_config || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 4)", 93);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 94);
return {
            container_node : null, // compulsory
            container_class : null, // compulsory
            section_wrapper_node : null, // optional
            section_wrapper_class : null, // optional
            section_node : null,  // compulsory
            section_class : null  // compulsory
        }
    }

   /**
    * Get section list for this format (usually items inside container_node.container_class selector)
    *
    * @param {YUI} Y YUI3 instance
    * @return {string} section selector
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 110);
M.course.format.get_section_selector = M.course.format.get_section_selector || function(Y) {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 5)", 110);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 111);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 112);
if (config.section_node && config.section_class) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 113);
return config.section_node + '.' + config.section_class;
        }
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 115);
console.log('section_node and section_class are not defined in M.course.format.get_config');
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 116);
return null;
    }

   /**
    * Get section wraper for this format (only used in case when each
    * container_node.container_class node is wrapped in some other element).
    *
    * @param {YUI} Y YUI3 instance
    * @return {string} section wrapper selector or M.course.format.get_section_selector
    * if section_wrapper_node and section_wrapper_class are not defined in the format config.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 127);
M.course.format.get_section_wrapper = M.course.format.get_section_wrapper || function(Y) {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 6)", 127);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 128);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 129);
if (config.section_wrapper_node && config.section_wrapper_class) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 130);
return config.section_wrapper_node + '.' + config.section_wrapper_class;
        }
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 132);
return M.course.format.get_section_selector(Y);
    }

   /**
    * Get the tag of container node
    *
    * @return {string} tag of container node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 140);
M.course.format.get_containernode = M.course.format.get_containernode || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 7)", 140);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 141);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 142);
if (config.container_node) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 143);
return config.container_node;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 145);
console.log('container_node is not defined in M.course.format.get_config');
        }
    }

   /**
    * Get the class of container node
    *
    * @return {string} class of the container node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 154);
M.course.format.get_containerclass = M.course.format.get_containerclass || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 8)", 154);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 155);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 156);
if (config.container_class) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 157);
return config.container_class;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 159);
console.log('container_class is not defined in M.course.format.get_config');
        }
    }

   /**
    * Get the tag of draggable node (section wrapper if exists, otherwise section)
    *
    * @return {string} tag of the draggable node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 168);
M.course.format.get_sectionwrappernode = M.course.format.get_sectionwrappernode || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 9)", 168);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 169);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 170);
if (config.section_wrapper_node) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 171);
return config.section_wrapper_node;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 173);
return config.section_node;
        }
    }

   /**
    * Get the class of draggable node (section wrapper if exists, otherwise section)
    *
    * @return {string} class of the draggable node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 182);
M.course.format.get_sectionwrapperclass = M.course.format.get_sectionwrapperclass || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 10)", 182);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 183);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 184);
if (config.section_wrapper_class) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 185);
return config.section_wrapper_class;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 187);
return config.section_class;
        }
    }

   /**
    * Get the tag of section node
    *
    * @return {string} tag of section node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 196);
M.course.format.get_sectionnode = M.course.format.get_sectionnode || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 11)", 196);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 197);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 198);
if (config.section_node) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 199);
return config.section_node;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 201);
console.log('section_node is not defined in M.course.format.get_config');
        }
    }

   /**
    * Get the class of section node
    *
    * @return {string} class of the section node.
    */
    _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 210);
M.course.format.get_sectionclass = M.course.format.get_sectionclass || function() {
        _yuitest_coverfunc("build/moodle-course-coursebase/moodle-course-coursebase.js", "(anonymous 12)", 210);
_yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 211);
var config = M.course.format.get_config();
        _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 212);
if (config.section_class) {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 213);
return config.section_class;
        } else {
            _yuitest_coverline("build/moodle-course-coursebase/moodle-course-coursebase.js", 215);
console.log('section_class is not defined in M.course.format.get_config');
        }

    }


}, '@VERSION@', {"requires": ["base", "node"]});
