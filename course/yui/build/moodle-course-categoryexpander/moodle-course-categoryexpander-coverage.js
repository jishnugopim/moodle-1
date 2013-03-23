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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","/**"," * Adds toggling of subcategory with automatic loading using AJAX."," *"," * This also includes application of an animation to improve user experience."," *"," * @module moodle-course-categoryexpander"," */","","/**"," * The course category expander."," *"," * @constructor"," * @class Y.Moodle.course.categoryexpander"," */","","var CSS = {","        CATEGORYCONTENT: 'content',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        HASCHILDREN: 'with_children'","    },","    SELECTORS = {","        CATEGORYCONTENT: '.content',","        CATEGORYLISTENLINK: '.category .info .name',","        CATEGORYSPINNERLOCATION: '.name',","        COURSEBOX: '.coursebox',","        COURSEBOXLISTENLINK: '.coursebox .moreinfo',","        COURSEBOXSPINNERLOCATION: '.name a',","        PARENTWITHCHILDREN: '.category'","    },","    NS = Y.namespace('Moodle.course.categoryexpander'),","    TYPE_CATEGORY = 0,","    TYPE_COURSE = 1,","    URL = M.cfg.wwwroot + '/course/category.ajax.php';","","/**"," * Set up the category expander."," *"," * No arguments are required."," *"," * @method init"," */","NS.init = function() {","    Y.one(Y.config.doc).delegate('click', this.toggle_category_expansion, SELECTORS.CATEGORYLISTENLINK, this);","    Y.one(Y.config.doc).delegate('click', this.toggle_coursebox_expansion, SELECTORS.COURSEBOXLISTENLINK, this);","};","","/**"," * Toggle the animation of the clicked category node."," *"," * @method toggle_category_expansion"," * @protected"," * @param EventFacade e"," */","NS.toggle_category_expansion = function(e) {","    // Load the actual dependencies now that we've been called.","    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {","        // Overload the toggle_category_expansion with the _toggle_category_expansion function to ensure that","        // this function isn't called in the future, and call it for the first time.","        NS.toggle_category_expansion = NS._toggle_category_expansion;","        NS.toggle_category_expansion(e);","    });","};","","/**"," * Toggle the animation of the clicked coursebox node."," *"," * @method toggle_coursebox_expansion"," * @protected"," * @param EventFacade e"," */","NS.toggle_coursebox_expansion = function(e) {","    // Load the actual dependencies now that we've been called.","    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {","        // Overload the toggle_coursebox_expansion with the _toggle_coursebox_expansion function to ensure that","        // this function isn't called in the future, and call it for the first time.","        NS.toggle_coursebox_expansion = NS._toggle_coursebox_expansion;","        NS.toggle_coursebox_expansion(e);","    });","","    // We can't gracefully fall back because the insertion of scripts happens too late.","    e.preventDefault();","};","","NS._toggle_coursebox_expansion = function(e) {","    var courseboxnode,","        courseid,","        spinner;","","    // Grab the parent category container - this is where the new content will be added.","    courseboxnode = e.target.ancestor(SELECTORS.COURSEBOX, true);","","    if (courseboxnode.hasClass(CSS.LOADED)) {","        // We've already loaded this content so we just need to toggle the view of it.","        this._run__expansion(courseboxnode);","        return;","    }","","    // We use Data attributes to store the course ID.","    courseid = courseboxnode.getData('courseid');","","    // We have a valid object to fetch. Add a spinner to give some feedback to the user.","    spinner = M.util.add_spinner(Y, courseboxnode.one(SELECTORS.COURSEBOXSPINNERLOCATION)).show();","","    // Fetch the data.","    Y.io(URL, {","        method: 'POST',","        context: this,","        on: {","            complete: this.process_results","        },","        data: {","            courseid: courseid,","            type: TYPE_COURSE","        },","        \"arguments\": {","            parentnode: courseboxnode,","            childnode: courseboxnode.one(SELECTORS.CATEGORYCONTENT),","            courseboxnode: courseboxnode,","            spinner: spinner","        }","    });","    e.preventDefault();","};","","NS._toggle_category_expansion = function(e) {","    var categorynode,","        categoryid,","        depth,","        spinner;","","    if (e.target.test('a') || e.target.test('img')) {","        // Return early if either an anchor or an image were clicked.","        return;","    }","","    // Grab the parent category container - this is where the new content will be added.","    categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","    if (!categorynode.hasClass(CSS.HASCHILDREN)) {","        // Nothing to do here - this category has no children.","        return;","    }","","    if (categorynode.hasClass(CSS.LOADED)) {","        // We've already loaded this content so we just need to toggle the view of it.","        this._run__expansion(categorynode);","        return;","    }","","    // We use Data attributes to store the category.","    categoryid = categorynode.getData('categoryid');","    depth = categorynode.getData('depth');","    if (typeof categoryid === \"undefined\" || typeof depth === \"undefined\") {","        return;","    }","","    // We have a valid object to fetch. Add a spinner to give some feedback to the user.","    spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.CATEGORYSPINNERLOCATION)).show();","","    // Fetch the data.","    Y.io(URL, {","        method: 'POST',","        context: this,","        on: {","            complete: this.process_results","        },","        data: {","            categoryid: categoryid,","            depth: depth,","            showcourses: categorynode.getData('showcourses'),","            type: TYPE_CATEGORY","        },","        \"arguments\": {","            parentnode: categorynode,","            childnode: categorynode.one(SELECTORS.CATEGORYCONTENT),","            spinner: spinner","        }","    });","};","","/**"," * Apply the animation on the supplied node."," *"," * @method _run__expansion"," * @private"," * @param Node categorynode The node to apply the animation to"," */","NS._run__expansion = function(categorynode) {","    var categorychildren = categorynode.one(SELECTORS.CATEGORYCONTENT);","","    // Add our animation to the categorychildren.","    this.add_animation(categorychildren);","","    // If we already have the class, remove it before showing otherwise we perform the","    // animation whilst the node is hidden.","    if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {","        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.","        categorychildren.setStyle('height', '0');","        categorynode.removeClass(CSS.SECTIONCOLLAPSED);","        categorychildren.fx.set('reverse', false);","    } else {","        categorychildren.fx.set('reverse', true);","        categorychildren.fx.once('end', function(e, categorynode) {","            categorynode.addClass(CSS.SECTIONCOLLAPSED);","        }, this, categorynode);","    }","","    categorychildren.fx.once('end', function(e, categorychildren) {","        // Remove the styles that the animation has set.","        categorychildren.setStyles({","            height: '',","            opacity: ''","        });","","        // To avoid memory gobbling, remove the animation. It will be added back if called again.","        this.destroy();","    }, categorychildren.fx, categorychildren);","","    // Now that everything has been set up, run the animation.","    categorychildren.fx.run();","};","","/**"," * Process the data returned by Y.io."," * This includes appending it to the relevant part of the DOM, and applying our animations."," *"," * @method process_results"," * @protected"," * @param String tid The Transaction ID"," * @param Object response The Reponse returned by Y.IO"," * @param Object ioargs The additional arguments provided by Y.IO"," */","NS.process_results = function(tid, response, args) {","    var newnode,","        data;","    try {","        data = Y.JSON.parse(response.responseText);","        if (data.error) {","            return new M.core.ajaxException(data);","        }","    } catch (e) {","        return new M.core.exception(e);","    }","","    // Insert the returned data into a new Node.","    newnode = Y.Node.create(data);","","    // Append to the existing child location.","    args.childnode.appendChild(newnode);","","    // Now that we have content, we can swap the classes on the toggled container.","    args.parentnode","        .addClass(CSS.LOADED)","        .removeClass(CSS.NOTLOADED);","","    // Toggle the open/close status of the node now that it's content has been loaded.","    this._run__expansion(args.parentnode);","","    // Remove the spinner now that we've started to show the content.","    if (args.spinner) {","        args.spinner.hide().destroy();","    }","};","","/**"," * Add our animation to the Node."," *"," * @method add_animation"," * @protected"," * @param Node childnode"," */","NS.add_animation = function(childnode) {","    if (typeof childnode.fx !== \"undefined\") {","        // The animation has already been plugged to this node.","        return childnode;","    }","","    childnode.plug(Y.Plugin.NodeFX, {","        from: {","            height: 0,","            opacity: 0","        },","        to: {","            // This sets a dynamic height in case the node content changes.","            height: function(node) {","                // Get expanded height (offsetHeight may be zero).","                return node.get('scrollHeight');","            },","            opacity: 1","        },","        duration: 0.2","    });","","    return childnode;","};","","","}, '@VERSION@', {\"requires\": [\"node\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"18":0,"46":0,"47":0,"48":0,"58":0,"60":0,"63":0,"64":0,"75":0,"77":0,"80":0,"81":0,"85":0,"88":0,"89":0,"94":0,"96":0,"98":0,"99":0,"103":0,"106":0,"109":0,"126":0,"129":0,"130":0,"135":0,"137":0,"141":0,"143":0,"145":0,"148":0,"150":0,"151":0,"155":0,"156":0,"157":0,"158":0,"162":0,"165":0,"192":0,"193":0,"196":0,"200":0,"202":0,"203":0,"204":0,"206":0,"207":0,"208":0,"212":0,"214":0,"220":0,"224":0,"237":0,"238":0,"240":0,"241":0,"242":0,"243":0,"246":0,"250":0,"253":0,"256":0,"261":0,"264":0,"265":0,"276":0,"277":0,"279":0,"282":0,"291":0,"298":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:46":0,"(anonymous 2):60":0,"toggle_category_expansion:58":0,"(anonymous 3):77":0,"toggle_coursebox_expansion:75":0,"_toggle_coursebox_expansion:88":0,"_toggle_category_expansion:129":0,"(anonymous 4):207":0,"(anonymous 5):212":0,"_run__expansion:192":0,"process_results:237":0,"height:289":0,"add_animation:276":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 73;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 14;
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
        CATEGORYCONTENT: '.content',
        CATEGORYLISTENLINK: '.category .info .name',
        CATEGORYSPINNERLOCATION: '.name',
        COURSEBOX: '.coursebox',
        COURSEBOXLISTENLINK: '.coursebox .moreinfo',
        COURSEBOXSPINNERLOCATION: '.name a',
        PARENTWITHCHILDREN: '.category'
    },
    NS = Y.namespace('Moodle.course.categoryexpander'),
    TYPE_CATEGORY = 0,
    TYPE_COURSE = 1,
    URL = M.cfg.wwwroot + '/course/category.ajax.php';

/**
 * Set up the category expander.
 *
 * No arguments are required.
 *
 * @method init
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 46);
NS.init = function() {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "init", 46);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 47);
Y.one(Y.config.doc).delegate('click', this.toggle_category_expansion, SELECTORS.CATEGORYLISTENLINK, this);
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 48);
Y.one(Y.config.doc).delegate('click', this.toggle_coursebox_expansion, SELECTORS.COURSEBOXLISTENLINK, this);
};

/**
 * Toggle the animation of the clicked category node.
 *
 * @method toggle_category_expansion
 * @protected
 * @param EventFacade e
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 58);
NS.toggle_category_expansion = function(e) {
    // Load the actual dependencies now that we've been called.
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_category_expansion", 58);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 60);
Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {
        // Overload the toggle_category_expansion with the _toggle_category_expansion function to ensure that
        // this function isn't called in the future, and call it for the first time.
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 2)", 60);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 63);
NS.toggle_category_expansion = NS._toggle_category_expansion;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 64);
NS.toggle_category_expansion(e);
    });
};

/**
 * Toggle the animation of the clicked coursebox node.
 *
 * @method toggle_coursebox_expansion
 * @protected
 * @param EventFacade e
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 75);
NS.toggle_coursebox_expansion = function(e) {
    // Load the actual dependencies now that we've been called.
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "toggle_coursebox_expansion", 75);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 77);
Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {
        // Overload the toggle_coursebox_expansion with the _toggle_coursebox_expansion function to ensure that
        // this function isn't called in the future, and call it for the first time.
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 3)", 77);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 80);
NS.toggle_coursebox_expansion = NS._toggle_coursebox_expansion;
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 81);
NS.toggle_coursebox_expansion(e);
    });

    // We can't gracefully fall back because the insertion of scripts happens too late.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 85);
e.preventDefault();
};

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 88);
NS._toggle_coursebox_expansion = function(e) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_coursebox_expansion", 88);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 89);
var courseboxnode,
        courseid,
        spinner;

    // Grab the parent category container - this is where the new content will be added.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 94);
courseboxnode = e.target.ancestor(SELECTORS.COURSEBOX, true);

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 96);
if (courseboxnode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 98);
this._run__expansion(courseboxnode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 99);
return;
    }

    // We use Data attributes to store the course ID.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 103);
courseid = courseboxnode.getData('courseid');

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 106);
spinner = M.util.add_spinner(Y, courseboxnode.one(SELECTORS.COURSEBOXSPINNERLOCATION)).show();

    // Fetch the data.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 109);
Y.io(URL, {
        method: 'POST',
        context: this,
        on: {
            complete: this.process_results
        },
        data: {
            courseid: courseid,
            type: TYPE_COURSE
        },
        "arguments": {
            parentnode: courseboxnode,
            childnode: courseboxnode.one(SELECTORS.CATEGORYCONTENT),
            courseboxnode: courseboxnode,
            spinner: spinner
        }
    });
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 126);
e.preventDefault();
};

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 129);
NS._toggle_category_expansion = function(e) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_category_expansion", 129);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 130);
var categorynode,
        categoryid,
        depth,
        spinner;

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 135);
if (e.target.test('a') || e.target.test('img')) {
        // Return early if either an anchor or an image were clicked.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 137);
return;
    }

    // Grab the parent category container - this is where the new content will be added.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 141);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 143);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
        // Nothing to do here - this category has no children.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 145);
return;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 148);
if (categorynode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 150);
this._run__expansion(categorynode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 151);
return;
    }

    // We use Data attributes to store the category.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 155);
categoryid = categorynode.getData('categoryid');
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 156);
depth = categorynode.getData('depth');
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 157);
if (typeof categoryid === "undefined" || typeof depth === "undefined") {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 158);
return;
    }

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 162);
spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.CATEGORYSPINNERLOCATION)).show();

    // Fetch the data.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 165);
Y.io(URL, {
        method: 'POST',
        context: this,
        on: {
            complete: this.process_results
        },
        data: {
            categoryid: categoryid,
            depth: depth,
            showcourses: categorynode.getData('showcourses'),
            type: TYPE_CATEGORY
        },
        "arguments": {
            parentnode: categorynode,
            childnode: categorynode.one(SELECTORS.CATEGORYCONTENT),
            spinner: spinner
        }
    });
};

/**
 * Apply the animation on the supplied node.
 *
 * @method _run__expansion
 * @private
 * @param Node categorynode The node to apply the animation to
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 192);
NS._run__expansion = function(categorynode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_run__expansion", 192);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 193);
var categorychildren = categorynode.one(SELECTORS.CATEGORYCONTENT);

    // Add our animation to the categorychildren.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 196);
this.add_animation(categorychildren);

    // If we already have the class, remove it before showing otherwise we perform the
    // animation whilst the node is hidden.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 200);
if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 202);
categorychildren.setStyle('height', '0');
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 203);
categorynode.removeClass(CSS.SECTIONCOLLAPSED);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 204);
categorychildren.fx.set('reverse', false);
    } else {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 206);
categorychildren.fx.set('reverse', true);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 207);
categorychildren.fx.once('end', function(e, categorynode) {
            _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 4)", 207);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 208);
categorynode.addClass(CSS.SECTIONCOLLAPSED);
        }, this, categorynode);
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 212);
categorychildren.fx.once('end', function(e, categorychildren) {
        // Remove the styles that the animation has set.
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 5)", 212);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 214);
categorychildren.setStyles({
            height: '',
            opacity: ''
        });

        // To avoid memory gobbling, remove the animation. It will be added back if called again.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 220);
this.destroy();
    }, categorychildren.fx, categorychildren);

    // Now that everything has been set up, run the animation.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 224);
categorychildren.fx.run();
};

/**
 * Process the data returned by Y.io.
 * This includes appending it to the relevant part of the DOM, and applying our animations.
 *
 * @method process_results
 * @protected
 * @param String tid The Transaction ID
 * @param Object response The Reponse returned by Y.IO
 * @param Object ioargs The additional arguments provided by Y.IO
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 237);
NS.process_results = function(tid, response, args) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "process_results", 237);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 238);
var newnode,
        data;
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 240);
try {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 241);
data = Y.JSON.parse(response.responseText);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 242);
if (data.error) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 243);
return new M.core.ajaxException(data);
        }
    } catch (e) {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 246);
return new M.core.exception(e);
    }

    // Insert the returned data into a new Node.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 250);
newnode = Y.Node.create(data);

    // Append to the existing child location.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 253);
args.childnode.appendChild(newnode);

    // Now that we have content, we can swap the classes on the toggled container.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 256);
args.parentnode
        .addClass(CSS.LOADED)
        .removeClass(CSS.NOTLOADED);

    // Toggle the open/close status of the node now that it's content has been loaded.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 261);
this._run__expansion(args.parentnode);

    // Remove the spinner now that we've started to show the content.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 264);
if (args.spinner) {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 265);
args.spinner.hide().destroy();
    }
};

/**
 * Add our animation to the Node.
 *
 * @method add_animation
 * @protected
 * @param Node childnode
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 276);
NS.add_animation = function(childnode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "add_animation", 276);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 277);
if (typeof childnode.fx !== "undefined") {
        // The animation has already been plugged to this node.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 279);
return childnode;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 282);
childnode.plug(Y.Plugin.NodeFX, {
        from: {
            height: 0,
            opacity: 0
        },
        to: {
            // This sets a dynamic height in case the node content changes.
            height: function(node) {
                // Get expanded height (offsetHeight may be zero).
                _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "height", 289);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 291);
return node.get('scrollHeight');
            },
            opacity: 1
        },
        duration: 0.2
    });

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 298);
return childnode;
};


}, '@VERSION@', {"requires": ["node"]});
