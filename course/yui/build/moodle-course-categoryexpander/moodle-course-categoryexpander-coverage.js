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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","var SELECTORS = {","        ANIMATOR: 'div.animator',","        COURSES: '.courses',","        LISTENLINK: '.category_name',","        PARENTWITHCHILDREN: 'div.category',","        SUBCATEGORIES: '.subcategories'","    },","","    CSS = {","        ANIMATOR: 'animator',","        COURSES: 'courses',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        SUBCATEGORIES: 'subcategories',","        HASCHILDREN: 'with_children'","    },","    FRONTPAGECATEGORYCOMBO = 4;","","M.course = M.course || {};","M.course.categoryexpander = M.course.categoryexpander || {","    init: function() {","        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);","        this.init = function(){};","    },","    toggle_expansion: function(e) {","        var categorynode,","            categoryid,","            depth,","            animator;","        e.preventDefault();","","        // Grab the ancestor.","        categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","        if (!categorynode.hasClass(CSS.HASCHILDREN)) {","            return;","        }","","        if (categorynode.hasClass(CSS.NOTLOADED)) {","            categoryid = categorynode.getData('categoryid');","            depth = categorynode.getData('depth');","            if (typeof categoryid === \"undefined\" || typeof depth === \"undefined\") {","                return;","            }","            // Fetch the data.","            Y.io(M.cfg.wwwroot + '/course/category.ajax.php', {","                method: 'POST',","                context: this,","                on: {","                    complete: this.handle_category_results","                },","                data: {","                    type: FRONTPAGECATEGORYCOMBO,","                    categoryid: categoryid,","                    depth: depth","                },","                \"arguments\": {","                    categorynode: categorynode","                }","            });","        } else {","            animator = categorynode.one(SELECTORS.ANIMATOR);","            if (!animator) {","                this.add_animator(categorynode);","            }","            categorynode.toggleClass(CSS.SECTIONCOLLAPSED);","        }","    },","    handle_category_results: function(tid, response, ioargs) {","        var subcategories,","            courses,","            newnode,","            childnode,","            data;","        try {","            data = Y.JSON.parse(response.responseText);","            if (data.error) {","                return new M.core.ajaxException(data);","            }","        } catch (e) {","            return new M.core.exception(e);","        }","","        // Insert it into a set of new child nodes to categorynode.","        // TODO add some nice transitions here","        newnode = Y.Node.create(data);","        ioargs.categorynode","            .addClass(CSS.LOADED)","            .removeClass(CSS.NOTLOADED);","","        subcategories = newnode.one(SELECTORS.SUBCATEGORIES);","        courses = newnode.one(SELECTORS.COURSES);","","        childnode = this.add_animator([subcategories, courses]);","        ioargs.categorynode.appendChild(childnode);","    },","    add_animator: function(parentnode) {","        var childnode = Y.Node.create('<div>')","                .addClass(CSS.ANIMATOR);","","        childnode.fx = new Y.Anim({","            node: childnode,","            from: {","                height: 0,","                opacity: 0","            },","            to: {","                height: '100%',","                opacity: 1","            }","        });","","        parentnode.get('children').each(function(node) {","            childnode.appendChild(node);","        });","        parentnode.appendChild(childnode);","        return parentnode;","    }","};","","","}, '@VERSION@', {\"requires\": [\"node\", \"io-base\", \"json-parse\", \"moodle-core-notification\", \"anim\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"3":0,"22":0,"23":0,"25":0,"26":0,"29":0,"33":0,"36":0,"38":0,"39":0,"42":0,"43":0,"44":0,"45":0,"46":0,"49":0,"65":0,"66":0,"67":0,"69":0,"73":0,"78":0,"79":0,"80":0,"81":0,"84":0,"89":0,"90":0,"94":0,"95":0,"97":0,"98":0,"101":0,"104":0,"116":0,"117":0,"119":0,"120":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:24":0,"toggle_expansion:28":0,"handle_category_results:72":0,"(anonymous 2):116":0,"add_animator:100":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 39;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 6;
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 1);
YUI.add('moodle-course-categoryexpander', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 3);
var SELECTORS = {
        ANIMATOR: 'div.animator',
        COURSES: '.courses',
        LISTENLINK: '.category_name',
        PARENTWITHCHILDREN: 'div.category',
        SUBCATEGORIES: '.subcategories'
    },

    CSS = {
        ANIMATOR: 'animator',
        COURSES: 'courses',
        LOADED: 'loaded',
        NOTLOADED: 'notloaded',
        SECTIONCOLLAPSED: 'collapsed',
        SUBCATEGORIES: 'subcategories',
        HASCHILDREN: 'with_children'
    },
    FRONTPAGECATEGORYCOMBO = 4;

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 22);
M.course = M.course || {};
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 23);
M.course.categoryexpander = M.course.categoryexpander || {
    init: function() {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "init", 24);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 25);
Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 26);
this.init = function(){};
    },
    toggle_expansion: function(e) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_expansion", 28);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 29);
var categorynode,
            categoryid,
            depth,
            animator;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 33);
e.preventDefault();

        // Grab the ancestor.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 36);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 38);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 39);
return;
        }

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 42);
if (categorynode.hasClass(CSS.NOTLOADED)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 43);
categoryid = categorynode.getData('categoryid');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 44);
depth = categorynode.getData('depth');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 45);
if (typeof categoryid === "undefined" || typeof depth === "undefined") {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 46);
return;
            }
            // Fetch the data.
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 49);
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
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 65);
animator = categorynode.one(SELECTORS.ANIMATOR);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 66);
if (!animator) {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 67);
this.add_animator(categorynode);
            }
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 69);
categorynode.toggleClass(CSS.SECTIONCOLLAPSED);
        }
    },
    handle_category_results: function(tid, response, ioargs) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "handle_category_results", 72);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 73);
var subcategories,
            courses,
            newnode,
            childnode,
            data;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 78);
try {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 79);
data = Y.JSON.parse(response.responseText);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 80);
if (data.error) {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 81);
return new M.core.ajaxException(data);
            }
        } catch (e) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 84);
return new M.core.exception(e);
        }

        // Insert it into a set of new child nodes to categorynode.
        // TODO add some nice transitions here
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 89);
newnode = Y.Node.create(data);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 90);
ioargs.categorynode
            .addClass(CSS.LOADED)
            .removeClass(CSS.NOTLOADED);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 94);
subcategories = newnode.one(SELECTORS.SUBCATEGORIES);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 95);
courses = newnode.one(SELECTORS.COURSES);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 97);
childnode = this.add_animator([subcategories, courses]);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 98);
ioargs.categorynode.appendChild(childnode);
    },
    add_animator: function(parentnode) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "add_animator", 100);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 101);
var childnode = Y.Node.create('<div>')
                .addClass(CSS.ANIMATOR);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 104);
childnode.fx = new Y.Anim({
            node: childnode,
            from: {
                height: 0,
                opacity: 0
            },
            to: {
                height: '100%',
                opacity: 1
            }
        });

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 116);
parentnode.get('children').each(function(node) {
            _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 2)", 116);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 117);
childnode.appendChild(node);
        });
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 119);
parentnode.appendChild(childnode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 120);
return parentnode;
    }
};


}, '@VERSION@', {"requires": ["node", "io-base", "json-parse", "moodle-core-notification", "anim"]});
