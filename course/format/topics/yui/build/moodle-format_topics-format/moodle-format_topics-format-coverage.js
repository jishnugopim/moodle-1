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
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-format_topics-format/moodle-format_topics-format.js",
    code: []
};
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"].code=["YUI.add('moodle-format_topics-format', function (Y, NAME) {","","// Javascript functions for Topics course format","","M.course = M.course || {};","","M.course.format = M.course.format || {};","","/**"," * Get sections config for this format"," *"," * The section structure is:"," * <ul class=\"topics\">"," *  <li class=\"section\">...</li>"," *  <li class=\"section\">...</li>"," *   ..."," * </ul>"," *"," * @return {object} section list configuration"," */","M.course.format.get_config = function() {","    return {","        container_node : 'ul',","        container_class : 'topics',","        section_node : 'li',","        section_class : 'section'","    };","}","","/**"," * Swap section"," *"," * @param {YUI} Y YUI3 instance"," * @param {string} node1 node to swap to"," * @param {string} node2 node to swap with"," * @return {NodeList} section list"," */","M.course.format.swap_sections = function(Y, node1, node2) {","    var CSS = {","        COURSECONTENT : 'course-content',","        SECTIONADDMENUS : 'section_add_menus'","    };","","    var sectionlist = Y.Node.all('.'+CSS.COURSECONTENT+' '+M.course.format.get_section_selector(Y));","    // Swap menus.","    sectionlist.item(node1).one('.'+CSS.SECTIONADDMENUS).swap(sectionlist.item(node2).one('.'+CSS.SECTIONADDMENUS));","}","","/**"," * Process sections after ajax response"," *"," * @param {YUI} Y YUI3 instance"," * @param {array} response ajax response"," * @param {string} sectionfrom first affected section"," * @param {string} sectionto last affected section"," * @return void"," */","M.course.format.process_sections = function(Y, sectionlist, response, sectionfrom, sectionto) {","    var CSS = {","        SECTIONNAME : 'sectionname'","    };","","    if (response.action == 'move') {","        // If moving up swap around 'sectionfrom' and 'sectionto' so the that loop operates.","        if (sectionfrom > sectionto) {","            var temp = sectionto;","            sectionto = sectionfrom;","            sectionfrom = temp;","        }","        // Update titles in all affected sections.","        for (var i = sectionfrom; i <= sectionto; i++) {","            sectionlist.item(i).one('.'+CSS.SECTIONNAME).setContent(response.sectiontitles[i]);","        }","    }","}","","","}, '@VERSION@', {\"requires\": [\"node\", \"moodle-course-coursebase\"]});"];
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"].lines = {"1":0,"5":0,"7":0,"21":0,"22":0,"38":0,"39":0,"44":0,"46":0,"58":0,"59":0,"63":0,"65":0,"66":0,"67":0,"68":0,"71":0,"72":0};
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"].functions = {"get_config:21":0,"swap_sections:38":0,"process_sections:58":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"].coveredLines = 18;
_yuitest_coverage["build/moodle-format_topics-format/moodle-format_topics-format.js"].coveredFunctions = 4;
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 1);
YUI.add('moodle-format_topics-format', function (Y, NAME) {

// Javascript functions for Topics course format

_yuitest_coverfunc("build/moodle-format_topics-format/moodle-format_topics-format.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 5);
M.course = M.course || {};

_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 7);
M.course.format = M.course.format || {};

/**
 * Get sections config for this format
 *
 * The section structure is:
 * <ul class="topics">
 *  <li class="section">...</li>
 *  <li class="section">...</li>
 *   ...
 * </ul>
 *
 * @return {object} section list configuration
 */
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 21);
M.course.format.get_config = function() {
    _yuitest_coverfunc("build/moodle-format_topics-format/moodle-format_topics-format.js", "get_config", 21);
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 22);
return {
        container_node : 'ul',
        container_class : 'topics',
        section_node : 'li',
        section_class : 'section'
    };
}

/**
 * Swap section
 *
 * @param {YUI} Y YUI3 instance
 * @param {string} node1 node to swap to
 * @param {string} node2 node to swap with
 * @return {NodeList} section list
 */
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 38);
M.course.format.swap_sections = function(Y, node1, node2) {
    _yuitest_coverfunc("build/moodle-format_topics-format/moodle-format_topics-format.js", "swap_sections", 38);
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 39);
var CSS = {
        COURSECONTENT : 'course-content',
        SECTIONADDMENUS : 'section_add_menus'
    };

    _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 44);
var sectionlist = Y.Node.all('.'+CSS.COURSECONTENT+' '+M.course.format.get_section_selector(Y));
    // Swap menus.
    _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 46);
sectionlist.item(node1).one('.'+CSS.SECTIONADDMENUS).swap(sectionlist.item(node2).one('.'+CSS.SECTIONADDMENUS));
}

/**
 * Process sections after ajax response
 *
 * @param {YUI} Y YUI3 instance
 * @param {array} response ajax response
 * @param {string} sectionfrom first affected section
 * @param {string} sectionto last affected section
 * @return void
 */
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 58);
M.course.format.process_sections = function(Y, sectionlist, response, sectionfrom, sectionto) {
    _yuitest_coverfunc("build/moodle-format_topics-format/moodle-format_topics-format.js", "process_sections", 58);
_yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 59);
var CSS = {
        SECTIONNAME : 'sectionname'
    };

    _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 63);
if (response.action == 'move') {
        // If moving up swap around 'sectionfrom' and 'sectionto' so the that loop operates.
        _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 65);
if (sectionfrom > sectionto) {
            _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 66);
var temp = sectionto;
            _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 67);
sectionto = sectionfrom;
            _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 68);
sectionfrom = temp;
        }
        // Update titles in all affected sections.
        _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 71);
for (var i = sectionfrom; i <= sectionto; i++) {
            _yuitest_coverline("build/moodle-format_topics-format/moodle-format_topics-format.js", 72);
sectionlist.item(i).one('.'+CSS.SECTIONNAME).setContent(response.sectiontitles[i]);
        }
    }
}


}, '@VERSION@', {"requires": ["node", "moodle-course-coursebase"]});
