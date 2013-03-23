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
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].code=["YUI.add('moodle-course-categoryexpander', function (Y, NAME) {","","/**"," * Adds toggling of subcategory with automatic loading using AJAX."," *"," * This also includes application of an animation to improve user experience."," *"," * @module moodle-course-categoryexpander"," */","","/**"," * The course category expander."," *"," * @constructor"," * @class Y.Moodle.course.categoryexpander"," */","","var CSS = {","        CONTENTNODE: 'content',","        LOADED: 'loaded',","        NOTLOADED: 'notloaded',","        SECTIONCOLLAPSED: 'collapsed',","        HASCHILDREN: 'with_children'","    },","    SELECTORS = {","        CONTENTNODE: '.content',","        CATEGORYLISTENLINK: '.category .info .name',","        CATEGORYSPINNERLOCATION: '.name',","        COURSEBOX: '.coursebox',","        COURSEBOXLISTENLINK: '.coursebox .moreinfo',","        COURSEBOXSPINNERLOCATION: '.name a',","        PARENTWITHCHILDREN: '.category'","    },","    NS = Y.namespace('Moodle.course.categoryexpander'),","    TYPE_CATEGORY = 0,","    TYPE_COURSE = 1,","    URL = M.cfg.wwwroot + '/course/category.ajax.php';","","/**"," * Set up the category expander."," *"," * No arguments are required."," *"," * @method init"," */","NS.init = function() {","    Y.one(Y.config.doc).delegate('click', this.toggle_category_expansion, SELECTORS.CATEGORYLISTENLINK, this);","    Y.one(Y.config.doc).delegate('click', this.toggle_coursebox_expansion, SELECTORS.COURSEBOXLISTENLINK, this);","};","","/**"," * Toggle the animation of the clicked category node."," *"," * @method toggle_category_expansion"," * @protected"," * @param EventFacade e"," */","NS.toggle_category_expansion = function(e) {","    // Load the actual dependencies now that we've been called.","    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {","        // Overload the toggle_category_expansion with the _toggle_category_expansion function to ensure that","        // this function isn't called in the future, and call it for the first time.","        NS.toggle_category_expansion = NS._toggle_category_expansion;","        NS.toggle_category_expansion(e);","    });","};","","/**"," * Toggle the animation of the clicked coursebox node."," *"," * @method toggle_coursebox_expansion"," * @protected"," * @param EventFacade e"," */","NS.toggle_coursebox_expansion = function(e) {","    // Load the actual dependencies now that we've been called.","    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {","        // Overload the toggle_coursebox_expansion with the _toggle_coursebox_expansion function to ensure that","        // this function isn't called in the future, and call it for the first time.","        NS.toggle_coursebox_expansion = NS._toggle_coursebox_expansion;","        NS.toggle_coursebox_expansion(e);","    });","","    e.preventDefault();","};","","NS._toggle_coursebox_expansion = function(e) {","    var courseboxnode;","","    // Grab the parent category container - this is where the new content will be added.","    courseboxnode = e.target.ancestor(SELECTORS.COURSEBOX, true);","    e.preventDefault();","","    if (courseboxnode.hasClass(CSS.LOADED)) {","        // We've already loaded this content so we just need to toggle the view of it.","        this._run_expansion(courseboxnode);","        return;","    }","","    this._toggle_generic_expansion({","        parentnode: courseboxnode,","        childnode: courseboxnode.one(SELECTORS.CONTENTNODE),","        spinnerhandle: SELECTORS.COURSEBOXSPINNERLOCATION,","        data: {","            courseid: courseboxnode.getData('courseid'),","            type: TYPE_COURSE","        }","    });","};","","NS._toggle_category_expansion = function(e) {","    var categorynode,","        categoryid,","        depth;","","    if (e.target.test('a') || e.target.test('img')) {","        // Return early if either an anchor or an image were clicked.","        return;","    }","","    // Grab the parent category container - this is where the new content will be added.","    categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);","","    if (!categorynode.hasClass(CSS.HASCHILDREN)) {","        // Nothing to do here - this category has no children.","        return;","    }","","    if (categorynode.hasClass(CSS.LOADED)) {","        // We've already loaded this content so we just need to toggle the view of it.","        this._run_expansion(categorynode);","        return;","    }","","    // We use Data attributes to store the category.","    categoryid = categorynode.getData('categoryid');","    depth = categorynode.getData('depth');","    if (typeof categoryid === \"undefined\" || typeof depth === \"undefined\") {","        return;","    }","","    this._toggle_generic_expansion({","        parentnode: categorynode,","        childnode: categorynode.one(SELECTORS.CONTENTNODE),","        spinnerhandle: SELECTORS.CATEGORYSPINNERLOCATION,","        data: {","            categoryid: categoryid,","            depth: depth,","            showcourses: categorynode.getData('showcourses'),","            type: TYPE_CATEGORY","        }","    });","};","","/**"," * Wrapper function to handle toggling of generic types."," *"," * @method _toggle_generic_expansion"," * @private"," * @param Object config"," */","NS._toggle_generic_expansion = function(config) {","    if (config.spinnerhandle) {","      // Add a spinner to give some feedback to the user.","      spinner = M.util.add_spinner(Y, config.parentnode.one(config.spinnerhandle)).show();","    }","","    // Fetch the data.","    Y.io(URL, {","        method: 'POST',","        context: this,","        on: {","            complete: this.process_results","        },","        data: config.data,","        \"arguments\": {","            parentnode: config.parentnode,","            childnode: config.childnode,","            spinner: spinner","        }","    });","};","","/**"," * Apply the animation on the supplied node."," *"," * @method _run_expansion"," * @private"," * @param Node categorynode The node to apply the animation to"," */","NS._run_expansion = function(categorynode) {","    var categorychildren = categorynode.one(SELECTORS.CONTENTNODE);","","    // Add our animation to the categorychildren.","    this.add_animation(categorychildren);","","    // If we already have the class, remove it before showing otherwise we perform the","    // animation whilst the node is hidden.","    if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {","        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.","        categorychildren.setStyle('height', '0');","        categorynode.removeClass(CSS.SECTIONCOLLAPSED);","        categorychildren.fx.set('reverse', false);","    } else {","        categorychildren.fx.set('reverse', true);","        categorychildren.fx.once('end', function(e, categorynode) {","            categorynode.addClass(CSS.SECTIONCOLLAPSED);","        }, this, categorynode);","    }","","    categorychildren.fx.once('end', function(e, categorychildren) {","        // Remove the styles that the animation has set.","        categorychildren.setStyles({","            height: '',","            opacity: ''","        });","","        // To avoid memory gobbling, remove the animation. It will be added back if called again.","        this.destroy();","    }, categorychildren.fx, categorychildren);","","    // Now that everything has been set up, run the animation.","    categorychildren.fx.run();","};","","/**"," * Process the data returned by Y.io."," * This includes appending it to the relevant part of the DOM, and applying our animations."," *"," * @method process_results"," * @protected"," * @param String tid The Transaction ID"," * @param Object response The Reponse returned by Y.IO"," * @param Object ioargs The additional arguments provided by Y.IO"," */","NS.process_results = function(tid, response, args) {","    var newnode,","        data;","    try {","        data = Y.JSON.parse(response.responseText);","        if (data.error) {","            return new M.core.ajaxException(data);","        }","    } catch (e) {","        return new M.core.exception(e);","    }","","    // Insert the returned data into a new Node.","    newnode = Y.Node.create(data);","","    // Append to the existing child location.","    args.childnode.appendChild(newnode);","","    // Now that we have content, we can swap the classes on the toggled container.","    args.parentnode","        .addClass(CSS.LOADED)","        .removeClass(CSS.NOTLOADED);","","    // Toggle the open/close status of the node now that it's content has been loaded.","    this._run_expansion(args.parentnode);","","    // Remove the spinner now that we've started to show the content.","    if (args.spinner) {","        args.spinner.hide().destroy();","    }","};","","/**"," * Add our animation to the Node."," *"," * @method add_animation"," * @protected"," * @param Node childnode"," */","NS.add_animation = function(childnode) {","    if (typeof childnode.fx !== \"undefined\") {","        // The animation has already been plugged to this node.","        return childnode;","    }","","    childnode.plug(Y.Plugin.NodeFX, {","        from: {","            height: 0,","            opacity: 0","        },","        to: {","            // This sets a dynamic height in case the node content changes.","            height: function(node) {","                // Get expanded height (offsetHeight may be zero).","                return node.get('scrollHeight');","            },","            opacity: 1","        },","        duration: 0.2","    });","","    return childnode;","};","","","}, '@VERSION@', {\"requires\": [\"node\"]});"];
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].lines = {"1":0,"18":0,"46":0,"47":0,"48":0,"58":0,"60":0,"63":0,"64":0,"75":0,"77":0,"80":0,"81":0,"84":0,"87":0,"88":0,"91":0,"92":0,"94":0,"96":0,"97":0,"100":0,"111":0,"112":0,"116":0,"118":0,"122":0,"124":0,"126":0,"129":0,"131":0,"132":0,"136":0,"137":0,"138":0,"139":0,"142":0,"162":0,"163":0,"165":0,"169":0,"191":0,"192":0,"195":0,"199":0,"201":0,"202":0,"203":0,"205":0,"206":0,"207":0,"211":0,"213":0,"219":0,"223":0,"236":0,"237":0,"239":0,"240":0,"241":0,"242":0,"245":0,"249":0,"252":0,"255":0,"260":0,"263":0,"264":0,"275":0,"276":0,"278":0,"281":0,"290":0,"297":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].functions = {"init:46":0,"(anonymous 2):60":0,"toggle_category_expansion:58":0,"(anonymous 3):77":0,"toggle_coursebox_expansion:75":0,"_toggle_coursebox_expansion:87":0,"_toggle_category_expansion:111":0,"_toggle_generic_expansion:162":0,"(anonymous 4):206":0,"(anonymous 5):211":0,"_run_expansion:191":0,"process_results:236":0,"height:288":0,"add_animation:275":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredLines = 74;
_yuitest_coverage["build/moodle-course-categoryexpander/moodle-course-categoryexpander.js"].coveredFunctions = 15;
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
        CONTENTNODE: 'content',
        LOADED: 'loaded',
        NOTLOADED: 'notloaded',
        SECTIONCOLLAPSED: 'collapsed',
        HASCHILDREN: 'with_children'
    },
    SELECTORS = {
        CONTENTNODE: '.content',
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

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 84);
e.preventDefault();
};

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 87);
NS._toggle_coursebox_expansion = function(e) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_coursebox_expansion", 87);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 88);
var courseboxnode;

    // Grab the parent category container - this is where the new content will be added.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 91);
courseboxnode = e.target.ancestor(SELECTORS.COURSEBOX, true);
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 92);
e.preventDefault();

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 94);
if (courseboxnode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 96);
this._run_expansion(courseboxnode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 97);
return;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 100);
this._toggle_generic_expansion({
        parentnode: courseboxnode,
        childnode: courseboxnode.one(SELECTORS.CONTENTNODE),
        spinnerhandle: SELECTORS.COURSEBOXSPINNERLOCATION,
        data: {
            courseid: courseboxnode.getData('courseid'),
            type: TYPE_COURSE
        }
    });
};

_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 111);
NS._toggle_category_expansion = function(e) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_category_expansion", 111);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 112);
var categorynode,
        categoryid,
        depth;

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 116);
if (e.target.test('a') || e.target.test('img')) {
        // Return early if either an anchor or an image were clicked.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 118);
return;
    }

    // Grab the parent category container - this is where the new content will be added.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 122);
categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 124);
if (!categorynode.hasClass(CSS.HASCHILDREN)) {
        // Nothing to do here - this category has no children.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 126);
return;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 129);
if (categorynode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 131);
this._run_expansion(categorynode);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 132);
return;
    }

    // We use Data attributes to store the category.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 136);
categoryid = categorynode.getData('categoryid');
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 137);
depth = categorynode.getData('depth');
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 138);
if (typeof categoryid === "undefined" || typeof depth === "undefined") {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 139);
return;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 142);
this._toggle_generic_expansion({
        parentnode: categorynode,
        childnode: categorynode.one(SELECTORS.CONTENTNODE),
        spinnerhandle: SELECTORS.CATEGORYSPINNERLOCATION,
        data: {
            categoryid: categoryid,
            depth: depth,
            showcourses: categorynode.getData('showcourses'),
            type: TYPE_CATEGORY
        }
    });
};

/**
 * Wrapper function to handle toggling of generic types.
 *
 * @method _toggle_generic_expansion
 * @private
 * @param Object config
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 162);
NS._toggle_generic_expansion = function(config) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_toggle_generic_expansion", 162);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 163);
if (config.spinnerhandle) {
      // Add a spinner to give some feedback to the user.
      _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 165);
spinner = M.util.add_spinner(Y, config.parentnode.one(config.spinnerhandle)).show();
    }

    // Fetch the data.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 169);
Y.io(URL, {
        method: 'POST',
        context: this,
        on: {
            complete: this.process_results
        },
        data: config.data,
        "arguments": {
            parentnode: config.parentnode,
            childnode: config.childnode,
            spinner: spinner
        }
    });
};

/**
 * Apply the animation on the supplied node.
 *
 * @method _run_expansion
 * @private
 * @param Node categorynode The node to apply the animation to
 */
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 191);
NS._run_expansion = function(categorynode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "_run_expansion", 191);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 192);
var categorychildren = categorynode.one(SELECTORS.CONTENTNODE);

    // Add our animation to the categorychildren.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 195);
this.add_animation(categorychildren);

    // If we already have the class, remove it before showing otherwise we perform the
    // animation whilst the node is hidden.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 199);
if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 201);
categorychildren.setStyle('height', '0');
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 202);
categorynode.removeClass(CSS.SECTIONCOLLAPSED);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 203);
categorychildren.fx.set('reverse', false);
    } else {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 205);
categorychildren.fx.set('reverse', true);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 206);
categorychildren.fx.once('end', function(e, categorynode) {
            _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 4)", 206);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 207);
categorynode.addClass(CSS.SECTIONCOLLAPSED);
        }, this, categorynode);
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 211);
categorychildren.fx.once('end', function(e, categorychildren) {
        // Remove the styles that the animation has set.
        _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "(anonymous 5)", 211);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 213);
categorychildren.setStyles({
            height: '',
            opacity: ''
        });

        // To avoid memory gobbling, remove the animation. It will be added back if called again.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 219);
this.destroy();
    }, categorychildren.fx, categorychildren);

    // Now that everything has been set up, run the animation.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 223);
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
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 236);
NS.process_results = function(tid, response, args) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "process_results", 236);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 237);
var newnode,
        data;
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 239);
try {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 240);
data = Y.JSON.parse(response.responseText);
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 241);
if (data.error) {
            _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 242);
return new M.core.ajaxException(data);
        }
    } catch (e) {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 245);
return new M.core.exception(e);
    }

    // Insert the returned data into a new Node.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 249);
newnode = Y.Node.create(data);

    // Append to the existing child location.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 252);
args.childnode.appendChild(newnode);

    // Now that we have content, we can swap the classes on the toggled container.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 255);
args.parentnode
        .addClass(CSS.LOADED)
        .removeClass(CSS.NOTLOADED);

    // Toggle the open/close status of the node now that it's content has been loaded.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 260);
this._run_expansion(args.parentnode);

    // Remove the spinner now that we've started to show the content.
    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 263);
if (args.spinner) {
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 264);
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
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 275);
NS.add_animation = function(childnode) {
    _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "add_animation", 275);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 276);
if (typeof childnode.fx !== "undefined") {
        // The animation has already been plugged to this node.
        _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 278);
return childnode;
    }

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 281);
childnode.plug(Y.Plugin.NodeFX, {
        from: {
            height: 0,
            opacity: 0
        },
        to: {
            // This sets a dynamic height in case the node content changes.
            height: function(node) {
                // Get expanded height (offsetHeight may be zero).
                _yuitest_coverfunc("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", "height", 288);
_yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 290);
return node.get('scrollHeight');
            },
            opacity: 1
        },
        duration: 0.2
    });

    _yuitest_coverline("build/moodle-course-categoryexpander/moodle-course-categoryexpander.js", 297);
return childnode;
};


}, '@VERSION@', {"requires": ["node"]});
