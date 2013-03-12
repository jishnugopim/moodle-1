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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","/**"," * Adds toggling of subcategory with automatic loading using AJAX."," *"," * This also includes application of an animation to improve user experience."," *"," * @module moodle-course-categoryexpander"," */","","/**"," * The course category expander."," *"," * @constructor"," * @class Y.Moodle.course.categoryexpander"," */","","var CSS = {","        CATEGORYCONTENT: 'content',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        HASCHILDREN: 'with_children'","    },","    SELECTORS = {","        CATEGORYCONTENT: 'div.content',","        CATEGORYTREE: 'div.course_category_tree',","        LISTENLINK: 'div.info .name',","        PARENTWITHCHILDREN: 'div.category'","    },","    NS = Y.namespace('Moodle.course.categoryexpander'),","    URL = M.cfg.wwwroot + '/course/category.ajax.php';","","/**"," * Set up the category expander."," *"," * No arguments are required."," *"," * @method init"," */","NS.init = function() {","    Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);","};","","/**"," * Toggle the animation of the clicked node."," *"," * @method toggle_expansion"," * @protected"," * @param EventFacade e"," */","NS.toggle_expansion = function(e) {","    var categorynode,","        categoryid,","        spinner;","","    if (e.target.test('a') || e.target.test('img')) {","        // Return early if either an anchor or an image were clicked.","        return;","    }","","    // Grab the parent category container - this is where the new content will be added.","    categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","    if (!categorynode.hasClass(CSS.HASCHILDREN)) {","        // Nothing to do here - this category has no children.","        return;","    }","","    if (categorynode.hasClass(CSS.LOADED)) {","        // We've already loaded this content so we just need to toggle the view of it.","        this._toggle_expansion(categorynode);","        return;","    }","","    // We use Data attributes to store the category.","    categoryid = categorynode.getData('categoryid');","    if (typeof categoryid === \"undefined\") {","        return;","    }","","    // We have a valid object to fetch. Add a spinner to give some feedback to the user.","    spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.LISTENLINK)).show();","","    // Fetch the data.","    Y.io(URL, {","        method: 'POST',","        context: this,","        on: {","            complete: this.process_category_results","        },","        data: {","            categoryid: categoryid,","            showcourses: categorynode.getData('showcourses')","        },","        \"arguments\": {","            categorynode: categorynode,","            spinner: spinner","        }","    });","};","","/**"," * Apply the animation on the supplied node."," *"," * @method _toggle_expansion"," * @private"," * @param Node categorynode The node to apply the animation to"," */","NS._toggle_expansion = function(categorynode) {","    var categorychildren = categorynode.one(SELECTORS.CATEGORYCONTENT);","","    // Add our animation to the categorychildren.","    this.add_animation(categorychildren);","","    // If we already have the class, remove it before showing otherwise we perform the","    // animation whilst the node is hidden.","    if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {","        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.","        categorychildren.setStyle('height', '0');","        categorynode.removeClass(CSS.SECTIONCOLLAPSED);","        categorychildren.fx.set('reverse', false);","    } else {","        categorychildren.fx.set('reverse', true);","        categorychildren.fx.once('end', function(e, categorynode) {","            categorynode.addClass(CSS.SECTIONCOLLAPSED);","        }, this, categorynode);","    }","","    categorychildren.fx.once('end', function(e, categorychildren) {","        // Remove the styles that the animation has set.","        categorychildren.setStyles({","            height: '',","            opacity: ''","        });","","        // To avoid memory gobbling, remove the animation. It will be added back if called again.","        this.destroy();","    }, categorychildren.fx, categorychildren);","","    // Now that everything has been set up, run the animation.","    categorychildren.fx.run();","};","","/**"," * Process the data returned by Y.io."," * This includes appending it to the relevant part of the DOM, and applying our animations."," *"," * @method process_category_results"," * @protected"," * @param String tid The Transaction ID"," * @param Object response The Reponse returned by Y.IO"," * @param Object ioargs The additional arguments provided by Y.IO"," */","NS.process_category_results = function(tid, response, args) {","    var newnode,","        childnode,","        data;","    try {","        data = Y.JSON.parse(response.responseText);","        if (data.error) {","            return new M.core.ajaxException(data);","        }","    } catch (e) {","        return new M.core.exception(e);","    }","","    // Insert it into a set of new child nodes to categorynode.","    // We only want the tree part of this.","    newnode = Y.Node.create(data)","        .one(SELECTORS.CATEGORYTREE);","","    // Now that we have content, we can swap the classes on the toggled container.","    args.categorynode","        .addClass(CSS.LOADED)","        .removeClass(CSS.NOTLOADED);","","    // Append to the existing child location.","    childnode = args.categorynode.one(SELECTORS.CATEGORYCONTENT);","    childnode.appendChild(newnode);","","    // Toggle the open/close status of the node now that it's content has been loaded.","    this._toggle_expansion(args.categorynode);","","    // Remove the spinner now that we've started to show the content.","    args.spinner.hide().destroy();","};","","/**"," * Add our animation to the Node."," *"," * @method add_animation"," * @protected"," * @param Node childnode"," */","NS.add_animation = function(childnode) {","    if (typeof childnode.fx !== \"undefined\") {","        // The animation has already been plugged to this node.","        return childnode;","    }","","    childnode.plug(Y.Plugin.NodeFX, {","        from: {","            height: 0,","            opacity: 0","        },","        to: {","            // This sets a dynamic height in case the node content changes.","            height: function(node) {","                // Get expanded height (offsetHeight may be zero).","                return node.get('scrollHeight');","            },","            opacity: 1","        },","        duration: 0.3","    });","","    return childnode;","};","","","}, '@VERSION@', {\"requires\": [\"node\", \"io-base\", \"json-parse\", \"moodle-core-notification\", \"anim\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"18":0,"41":0,"42":0,"52":0,"53":0,"57":0,"59":0,"63":0,"65":0,"67":0,"70":0,"72":0,"73":0,"77":0,"78":0,"79":0,"83":0,"86":0,"110":0,"111":0,"114":0,"118":0,"120":0,"121":0,"122":0,"124":0,"125":0,"126":0,"130":0,"132":0,"138":0,"142":0,"155":0,"156":0,"159":0,"160":0,"161":0,"162":0,"165":0,"170":0,"174":0,"179":0,"180":0,"183":0,"186":0,"196":0,"197":0,"199":0,"202":0,"211":0,"218":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:41":0,"toggle_expansion:52":0,"(anonymous 2):125":0,"(anonymous 3):130":0,"_toggle_expansion:110":0,"process_category_results:155":0,"height:209":0,"add_animation:196":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 52;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 9;
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 1);
YUI.add('moodle-course-categoryexpander', function (Y, NAME) {

/**
 * Adds toggling of subcategory with automatic loading using AJAX.
 *
 * This also includes application of an animation to improve user experience.
 *
 * @module moodle-course-categoryexpander
 */

/**
 * The course category expander.
 *
 * @constructor
 * @class Y.Moodle.course.categoryexpander
 */

_yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 18);
var CSS = {
        CATEGORYCONTENT: 'content',
        LOADED: 'loaded',
        NOTLOADED: 'notloaded',
        SECTIONCOLLAPSED: 'collapsed',
        HASCHILDREN: 'with_children'
    },
    SELECTORS = {
        CATEGORYCONTENT: 'div.content',
        CATEGORYTREE: 'div.course_category_tree',
        LISTENLINK: 'div.info .name',
        PARENTWITHCHILDREN: 'div.category'
    },
    NS = Y.namespace('Moodle.course.categoryexpander'),
    URL = M.cfg.wwwroot + '/course/category.ajax.php';

/**
 * Set up the category expander.
 *
 * No arguments are required.
 *
 * @method init
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 41);
NS.init = function() {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "init", 41);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 42);
Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
};

/**
 * Toggle the animation of the clicked node.
 *
 * @method toggle_expansion
 * @protected
 * @param EventFacade e
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 52);
NS.toggle_expansion = function(e) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_expansion", 52);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 53);
var categorynode,
        categoryid,
        spinner;

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 57);
if (e.target.test('a') || e.target.test('img')) {
        // Return early if either an anchor or an image were clicked.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 59);
return;
    }

    // Grab the parent category container - this is where the new content will be added.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 63);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 65);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
        // Nothing to do here - this category has no children.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 67);
return;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 70);
if (categorynode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 72);
this._toggle_expansion(categorynode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 73);
return;
    }

    // We use Data attributes to store the category.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 77);
categoryid = categorynode.getData('categoryid');
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 78);
if (typeof categoryid === "undefined") {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 79);
return;
    }

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 83);
spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.LISTENLINK)).show();

    // Fetch the data.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 86);
Y.io(URL, {
        method: 'POST',
        context: this,
        on: {
            complete: this.process_category_results
        },
        data: {
            categoryid: categoryid,
            showcourses: categorynode.getData('showcourses')
        },
        "arguments": {
            categorynode: categorynode,
            spinner: spinner
        }
    });
};

/**
 * Apply the animation on the supplied node.
 *
 * @method _toggle_expansion
 * @private
 * @param Node categorynode The node to apply the animation to
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 110);
NS._toggle_expansion = function(categorynode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_expansion", 110);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 111);
var categorychildren = categorynode.one(SELECTORS.CATEGORYCONTENT);

    // Add our animation to the categorychildren.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 114);
this.add_animation(categorychildren);

    // If we already have the class, remove it before showing otherwise we perform the
    // animation whilst the node is hidden.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 118);
if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 120);
categorychildren.setStyle('height', '0');
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 121);
categorynode.removeClass(CSS.SECTIONCOLLAPSED);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 122);
categorychildren.fx.set('reverse', false);
    } else {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 124);
categorychildren.fx.set('reverse', true);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 125);
categorychildren.fx.once('end', function(e, categorynode) {
            _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 2)", 125);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 126);
categorynode.addClass(CSS.SECTIONCOLLAPSED);
        }, this, categorynode);
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 130);
categorychildren.fx.once('end', function(e, categorychildren) {
        // Remove the styles that the animation has set.
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 3)", 130);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 132);
categorychildren.setStyles({
            height: '',
            opacity: ''
        });

        // To avoid memory gobbling, remove the animation. It will be added back if called again.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 138);
this.destroy();
    }, categorychildren.fx, categorychildren);

    // Now that everything has been set up, run the animation.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 142);
categorychildren.fx.run();
};

/**
 * Process the data returned by Y.io.
 * This includes appending it to the relevant part of the DOM, and applying our animations.
 *
 * @method process_category_results
 * @protected
 * @param String tid The Transaction ID
 * @param Object response The Reponse returned by Y.IO
 * @param Object ioargs The additional arguments provided by Y.IO
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 155);
NS.process_category_results = function(tid, response, args) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "process_category_results", 155);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 156);
var newnode,
        childnode,
        data;
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 159);
try {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 160);
data = Y.JSON.parse(response.responseText);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 161);
if (data.error) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 162);
return new M.core.ajaxException(data);
        }
    } catch (e) {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 165);
return new M.core.exception(e);
    }

    // Insert it into a set of new child nodes to categorynode.
    // We only want the tree part of this.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 170);
newnode = Y.Node.create(data)
        .one(SELECTORS.CATEGORYTREE);

    // Now that we have content, we can swap the classes on the toggled container.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 174);
args.categorynode
        .addClass(CSS.LOADED)
        .removeClass(CSS.NOTLOADED);

    // Append to the existing child location.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 179);
childnode = args.categorynode.one(SELECTORS.CATEGORYCONTENT);
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 180);
childnode.appendChild(newnode);

    // Toggle the open/close status of the node now that it's content has been loaded.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 183);
this._toggle_expansion(args.categorynode);

    // Remove the spinner now that we've started to show the content.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 186);
args.spinner.hide().destroy();
};

/**
 * Add our animation to the Node.
 *
 * @method add_animation
 * @protected
 * @param Node childnode
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 196);
NS.add_animation = function(childnode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "add_animation", 196);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 197);
if (typeof childnode.fx !== "undefined") {
        // The animation has already been plugged to this node.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 199);
return childnode;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 202);
childnode.plug(Y.Plugin.NodeFX, {
        from: {
            height: 0,
            opacity: 0
        },
        to: {
            // This sets a dynamic height in case the node content changes.
            height: function(node) {
                // Get expanded height (offsetHeight may be zero).
                _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "height", 209);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 211);
return node.get('scrollHeight');
            },
            opacity: 1
        },
        duration: 0.3
    });

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 218);
return childnode;
};


}, '@VERSION@', {"requires": ["node", "io-base", "json-parse", "moodle-core-notification", "anim"]});
