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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-categoryexpander/moodle-course-categoryexpander.js",
    code: []
};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","var SELECTORS = {","        COURSES: '.courses',","        LISTENLINK: '.category_name',","        PARENTWITHCHILDREN: 'div.category',","        SUBCATEGORIES: '.subcategories'","    },","","    CSS = {","        COURSES: 'courses',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        SUBCATEGORIES: 'subcategories',","        HASCHILDREN: 'with_children'","    },","    FRONTPAGECATEGORYNAMES = 2,","    FRONTPAGECATEGORYCOMBO = 4;","","M.course = M.course || {};","M.course.categoryexpander = M.course.categoryexpander || {","    init: function() {","        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);","        this.init = function(){};","    },","    toggle_expansion: function(e) {","        var categorynode,","            categoryid,","            depth;","        e.preventDefault();","","        // Grab the ancestor.","        categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","        if (!categorynode.hasClass(CSS.HASCHILDREN)) {","            return;","        }","","        if (categorynode.hasClass(CSS.NOTLOADED)) {","            categoryid = categorynode.getData('categoryid');","            depth = categorynode.getData('depth');","            if (typeof categoryid === \"undefined\" || typeof depth === \"undefined\") {","                return;","            }","            // Fetch the data.","            Y.io(M.cfg.wwwroot + '/course/category.ajax.php', {","                method: 'POST',","                context: this,","                on: {","                    complete: this.handle_category_results","                },","                data: {","                    type: FRONTPAGECATEGORYCOMBO,","                    categoryid: categoryid,","                    depth: depth","                },","                \"arguments\": {","                    categorynode: categorynode","                }","            });","        } else {","            categorynode.toggleClass(CSS.SECTIONCOLLAPSED);","        }","    },","    handle_category_results: function(tid, response, ioargs) {","        var subcategories,","            courses,","            newnode,","            data;","        try {","            data = Y.JSON.parse(response.responseText);","            if (data.error) {","                return new M.core.ajaxException(data);","            }","        } catch (e) {","            return new M.core.exception(e);","        }","","        // Insert it into a set of new child nodes to categorynode.","        // TODO add some nice transitions here","        newnode = Y.Node.create(data);","        ioargs.categorynode","            .addClass(CSS.LOADED)","            .removeClass(CSS.NOTLOADED);","","        subcategories = newnode.one(SELECTORS.SUBCATEGORIES);","        if (subcategories) {","            subcategories.hide();","            ioargs.categorynode.appendChild(subcategories);","            subcategories.show();","        }","","        courses = newnode.one(SELECTORS.COURSES);","        if (courses) {","            courses.hide();","            ioargs.categorynode.appendChild(courses);","            courses.transition({","                duration: 5,","                easing: 'ease-out',","                opacity: {","                    delay: 1.5,","                    duration: 1.25,","                    value: 1","                }","            });","            courses.show();","        }","    }","};","","","}, '@VERSION@', {\"requires\": [\"node\", \"io-base\", \"json-parse\", \"moodle-core-notification\", \"transition\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"3":0,"21":0,"22":0,"24":0,"25":0,"28":0,"31":0,"34":0,"36":0,"37":0,"40":0,"41":0,"42":0,"43":0,"44":0,"47":0,"63":0,"67":0,"71":0,"72":0,"73":0,"74":0,"77":0,"82":0,"83":0,"87":0,"88":0,"89":0,"90":0,"91":0,"94":0,"95":0,"96":0,"97":0,"98":0,"107":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:23":0,"toggle_expansion:27":0,"handle_category_results:66":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 37;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 4;
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 1);
YUI.add('moodle-course-categoryexpander', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 3);
var SELECTORS = {
        COURSES: '.courses',
        LISTENLINK: '.category_name',
        PARENTWITHCHILDREN: 'div.category',
        SUBCATEGORIES: '.subcategories'
    },

    CSS = {
        COURSES: 'courses',
        LOADED: 'loaded',
        NOTLOADED: 'notloaded',
        SECTIONCOLLAPSED: 'collapsed',
        SUBCATEGORIES: 'subcategories',
        HASCHILDREN: 'with_children'
    },
    FRONTPAGECATEGORYNAMES = 2,
    FRONTPAGECATEGORYCOMBO = 4;

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 21);
M.course = M.course || {};
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 22);
M.course.categoryexpander = M.course.categoryexpander || {
    init: function() {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "init", 23);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 24);
Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 25);
this.init = function(){};
    },
    toggle_expansion: function(e) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_expansion", 27);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 28);
var categorynode,
            categoryid,
            depth;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 31);
e.preventDefault();

        // Grab the ancestor.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 34);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 36);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 37);
return;
        }

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 40);
if (categorynode.hasClass(CSS.NOTLOADED)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 41);
categoryid = categorynode.getData('categoryid');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 42);
depth = categorynode.getData('depth');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 43);
if (typeof categoryid === "undefined" || typeof depth === "undefined") {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 44);
return;
            }
            // Fetch the data.
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 47);
Y.io(M.cfg.wwwroot + '/course/category.ajax.php', {
                method: 'POST',
                context: this,
                on: {
                    complete: this.handle_category_results
                },
                data: {
                    type: FRONTPAGECATEGORYCOMBO,
                    categoryid: categoryid,
                    depth: depth
                },
                "arguments": {
                    categorynode: categorynode
                }
            });
        } else {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 63);
categorynode.toggleClass(CSS.SECTIONCOLLAPSED);
        }
    },
    handle_category_results: function(tid, response, ioargs) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "handle_category_results", 66);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 67);
var subcategories,
            courses,
            newnode,
            data;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 71);
try {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 72);
data = Y.JSON.parse(response.responseText);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 73);
if (data.error) {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 74);
return new M.core.ajaxException(data);
            }
        } catch (e) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 77);
return new M.core.exception(e);
        }

        // Insert it into a set of new child nodes to categorynode.
        // TODO add some nice transitions here
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 82);
newnode = Y.Node.create(data);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 83);
ioargs.categorynode
            .addClass(CSS.LOADED)
            .removeClass(CSS.NOTLOADED);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 87);
subcategories = newnode.one(SELECTORS.SUBCATEGORIES);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 88);
if (subcategories) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 89);
subcategories.hide();
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 90);
ioargs.categorynode.appendChild(subcategories);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 91);
subcategories.show();
        }

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 94);
courses = newnode.one(SELECTORS.COURSES);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 95);
if (courses) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 96);
courses.hide();
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 97);
ioargs.categorynode.appendChild(courses);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 98);
courses.transition({
                duration: 5,
                easing: 'ease-out',
                opacity: {
                    delay: 1.5,
                    duration: 1.25,
                    value: 1
                }
            });
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 107);
courses.show();
        }
    }
};


}, '@VERSION@', {"requires": ["node", "io-base", "json-parse", "moodle-core-notification", "transition"]});
