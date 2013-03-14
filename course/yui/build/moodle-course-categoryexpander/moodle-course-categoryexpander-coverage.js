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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","var SELECTORS = {","        CATEGORYCHILDREN: 'div.category_children',","        CATEGORYLABEL: '.category_label',","        COURSES: '.courses',","        LISTENLINK: '.category_name',","        PARENTWITHCHILDREN: 'div.category',","        SUBCATEGORIES: '.subcategories'","    },","","    CSS = {","        CATEGORYCHILDREN: 'category_children',","        COURSES: 'courses',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        SUBCATEGORIES: 'subcategories',","        HASCHILDREN: 'with_children'","    },","    FRONTPAGECATEGORYCOMBO = 4;","","M.course = M.course || {};","M.course.categoryexpander = M.course.categoryexpander || {","    init: function() {","        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);","        this.init = function(){};","    },","    toggle_expansion: function(e) {","        var categorynode,","            categoryid,","            depth;","","        // Return early if an anchor or image were clicked.","        if (e.target.test('a') || e.target.test('img')) {","            return;","        }","","        // Grab the ancestor.","        categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","        if (!categorynode.hasClass(CSS.HASCHILDREN)) {","            return;","        }","","        if (categorynode.hasClass(CSS.NOTLOADED)) {","            categoryid = categorynode.getData('categoryid');","            depth = categorynode.getData('depth');","            if (typeof categoryid === \"undefined\" || typeof depth === \"undefined\") {","                return;","            }","            // Fetch the data.","            Y.io(M.cfg.wwwroot + '/course/category.ajax.php', {","                method: 'POST',","                context: this,","                on: {","                    complete: this.handle_category_results","                },","                data: {","                    type: FRONTPAGECATEGORYCOMBO,","                    categoryid: categoryid,","                    depth: depth,","                    showcourses: categorynode.getData('showcourses')","                },","                \"arguments\": {","                    categorynode: categorynode","                }","            });","        } else {","            this.apply_animation(categorynode);","        }","    },","    apply_animation: function(categorynode) {","        var categorychildren = categorynode.one(SELECTORS.CATEGORYCHILDREN);","        this.add_animator(categorychildren);","","        // If we already have the class, remove it before showing otherwise we perform the","        // animation whilst the node is hidden.","        if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {","            categorynode.removeClass(CSS.SECTIONCOLLAPSED);","            categorychildren.fx.set('reverse', false);","            categorychildren.fx.run();","        } else {","            categorychildren.fx.set('reverse', true);","            categorychildren.fx.once('end', function() {","                this.addClass(CSS.SECTIONCOLLAPSED);","            }, categorynode);","            categorychildren.fx.run();","        }","    },","    handle_category_results: function(tid, response, ioargs) {","        var newnode,","            childnode,","            data;","        try {","            data = Y.JSON.parse(response.responseText);","            if (data.error) {","                return new M.core.ajaxException(data);","            }","        } catch (e) {","            return new M.core.exception(e);","        }","","        // Insert it into a set of new child nodes to categorynode.","        newnode = Y.Node.create(data);","        ioargs.categorynode","            .addClass(CSS.LOADED)","            .removeClass(CSS.NOTLOADED);","","        // FIXME - would be nice to not have this served by the renderer.","        newnode.one(SELECTORS.CATEGORYLABEL).remove();","        childnode = ioargs.categorynode.one(SELECTORS.CATEGORYCHILDREN);","            childnode.appendChild(newnode);","        this.apply_animation(ioargs.categorynode);","    },","    add_animator: function(childnode) {","        if (typeof childnode.fx !== \"undefined\") {","            return;","        }","        childnode.plug(Y.Plugin.NodeFX, {","            from: {","                height: 0,","                opacity: 0","            },","            to: {","                height: function(node) { // dynamic in case of change","                    return node.get('scrollHeight'); // get expanded height (offsetHeight may be zero)","                },","                opacity: 1","            },","            easing: Y.Easing.easeOut,","            duration: 0.3","        });","        /*","        childnode.fx = new Y.Anim({","            easing: 'easeIn',","            node: childnode,","            duration: 0.3,","            from: {","                height: 0","            },","            to: {","                height: '100%'","            }","        });*/","","        return childnode;","    }","};","","","}, '@VERSION@', {\"requires\": [\"node\", \"io-base\", \"json-parse\", \"moodle-core-notification\", \"anim\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"3":0,"23":0,"24":0,"26":0,"27":0,"30":0,"35":0,"36":0,"40":0,"42":0,"43":0,"46":0,"47":0,"48":0,"49":0,"50":0,"53":0,"70":0,"74":0,"75":0,"79":0,"80":0,"81":0,"82":0,"84":0,"85":0,"86":0,"88":0,"92":0,"95":0,"96":0,"97":0,"98":0,"101":0,"105":0,"106":0,"111":0,"112":0,"113":0,"114":0,"117":0,"118":0,"120":0,"127":0,"147":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:25":0,"toggle_expansion:29":0,"(anonymous 2):85":0,"apply_animation:73":0,"handle_category_results:91":0,"height:126":0,"add_animator:116":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 46;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 8;
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 1);
YUI.add('moodle-course-categoryexpander', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 3);
var SELECTORS = {
        CATEGORYCHILDREN: 'div.category_children',
        CATEGORYLABEL: '.category_label',
        COURSES: '.courses',
        LISTENLINK: '.category_name',
        PARENTWITHCHILDREN: 'div.category',
        SUBCATEGORIES: '.subcategories'
    },

    CSS = {
        CATEGORYCHILDREN: 'category_children',
        COURSES: 'courses',
        LOADED: 'loaded',
        NOTLOADED: 'notloaded',
        SECTIONCOLLAPSED: 'collapsed',
        SUBCATEGORIES: 'subcategories',
        HASCHILDREN: 'with_children'
    },
    FRONTPAGECATEGORYCOMBO = 4;

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 23);
M.course = M.course || {};
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 24);
M.course.categoryexpander = M.course.categoryexpander || {
    init: function() {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "init", 25);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 26);
Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 27);
this.init = function(){};
    },
    toggle_expansion: function(e) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_expansion", 29);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 30);
var categorynode,
            categoryid,
            depth;

        // Return early if an anchor or image were clicked.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 35);
if (e.target.test('a') || e.target.test('img')) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 36);
return;
        }

        // Grab the ancestor.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 40);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 42);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 43);
return;
        }

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 46);
if (categorynode.hasClass(CSS.NOTLOADED)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 47);
categoryid = categorynode.getData('categoryid');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 48);
depth = categorynode.getData('depth');
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 49);
if (typeof categoryid === "undefined" || typeof depth === "undefined") {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 50);
return;
            }
            // Fetch the data.
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 53);
Y.io(M.cfg.wwwroot + '/course/category.ajax.php', {
                method: 'POST',
                context: this,
                on: {
                    complete: this.handle_category_results
                },
                data: {
                    type: FRONTPAGECATEGORYCOMBO,
                    categoryid: categoryid,
                    depth: depth,
                    showcourses: categorynode.getData('showcourses')
                },
                "arguments": {
                    categorynode: categorynode
                }
            });
        } else {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 70);
this.apply_animation(categorynode);
        }
    },
    apply_animation: function(categorynode) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "apply_animation", 73);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 74);
var categorychildren = categorynode.one(SELECTORS.CATEGORYCHILDREN);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 75);
this.add_animator(categorychildren);

        // If we already have the class, remove it before showing otherwise we perform the
        // animation whilst the node is hidden.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 79);
if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 80);
categorynode.removeClass(CSS.SECTIONCOLLAPSED);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 81);
categorychildren.fx.set('reverse', false);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 82);
categorychildren.fx.run();
        } else {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 84);
categorychildren.fx.set('reverse', true);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 85);
categorychildren.fx.once('end', function() {
                _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 2)", 85);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 86);
this.addClass(CSS.SECTIONCOLLAPSED);
            }, categorynode);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 88);
categorychildren.fx.run();
        }
    },
    handle_category_results: function(tid, response, ioargs) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "handle_category_results", 91);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 92);
var newnode,
            childnode,
            data;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 95);
try {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 96);
data = Y.JSON.parse(response.responseText);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 97);
if (data.error) {
                _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 98);
return new M.core.ajaxException(data);
            }
        } catch (e) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 101);
return new M.core.exception(e);
        }

        // Insert it into a set of new child nodes to categorynode.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 105);
newnode = Y.Node.create(data);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 106);
ioargs.categorynode
            .addClass(CSS.LOADED)
            .removeClass(CSS.NOTLOADED);

        // FIXME - would be nice to not have this served by the renderer.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 111);
newnode.one(SELECTORS.CATEGORYLABEL).remove();
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 112);
childnode = ioargs.categorynode.one(SELECTORS.CATEGORYCHILDREN);
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 113);
childnode.appendChild(newnode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 114);
this.apply_animation(ioargs.categorynode);
    },
    add_animator: function(childnode) {
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "add_animator", 116);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 117);
if (typeof childnode.fx !== "undefined") {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 118);
return;
        }
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 120);
childnode.plug(Y.Plugin.NodeFX, {
            from: {
                height: 0,
                opacity: 0
            },
            to: {
                height: function(node) { // dynamic in case of change
                    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "height", 126);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 127);
return node.get('scrollHeight'); // get expanded height (offsetHeight may be zero)
                },
                opacity: 1
            },
            easing: Y.Easing.easeOut,
            duration: 0.3
        });
        /*
        childnode.fx = new Y.Anim({
            easing: 'easeIn',
            node: childnode,
            duration: 0.3,
            from: {
                height: 0
            },
            to: {
                height: '100%'
            }
        });*/

        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 147);
return childnode;
    }
};


}, '@VERSION@', {"requires": ["node", "io-base", "json-parse", "moodle-core-notification", "anim"]});
