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
NS.init = function() {
    Y.one(Y.config.doc).delegate('click', this.toggle_category_expansion, SELECTORS.CATEGORYLISTENLINK, this);
    Y.one(Y.config.doc).delegate('click', this.toggle_coursebox_expansion, SELECTORS.COURSEBOXLISTENLINK, this);
};

/**
 * Toggle the animation of the clicked category node.
 *
 * @method toggle_category_expansion
 * @protected
 * @param EventFacade e
 */
NS.toggle_category_expansion = function(e) {
    // Load the actual dependencies now that we've been called.
    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {
        // Overload the toggle_category_expansion with the _toggle_category_expansion function to ensure that
        // this function isn't called in the future, and call it for the first time.
        NS.toggle_category_expansion = NS._toggle_category_expansion;
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
NS.toggle_coursebox_expansion = function(e) {
    // Load the actual dependencies now that we've been called.
    Y.use('io-base', 'json-parse', 'moodle-core-notification', 'anim', function() {
        // Overload the toggle_coursebox_expansion with the _toggle_coursebox_expansion function to ensure that
        // this function isn't called in the future, and call it for the first time.
        NS.toggle_coursebox_expansion = NS._toggle_coursebox_expansion;
        NS.toggle_coursebox_expansion(e);
    });

    // We can't gracefully fall back because the insertion of scripts happens too late.
    e.preventDefault();
};

NS._toggle_coursebox_expansion = function(e) {
    var courseboxnode,
        courseid,
        spinner;

    // Grab the parent category container - this is where the new content will be added.
    courseboxnode = e.target.ancestor(SELECTORS.COURSEBOX, true);

    if (courseboxnode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        this._run__expansion(courseboxnode);
        return;
    }

    // We use Data attributes to store the course ID.
    courseid = courseboxnode.getData('courseid');

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    spinner = M.util.add_spinner(Y, courseboxnode.one(SELECTORS.COURSEBOXSPINNERLOCATION)).show();

    // Fetch the data.
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
    e.preventDefault();
};

NS._toggle_category_expansion = function(e) {
    var categorynode,
        categoryid,
        depth,
        spinner;

    if (e.target.test('a') || e.target.test('img')) {
        // Return early if either an anchor or an image were clicked.
        return;
    }

    // Grab the parent category container - this is where the new content will be added.
    categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

    if (!categorynode.hasClass(CSS.HASCHILDREN)) {
        // Nothing to do here - this category has no children.
        return;
    }

    if (categorynode.hasClass(CSS.LOADED)) {
        // We've already loaded this content so we just need to toggle the view of it.
        this._run__expansion(categorynode);
        return;
    }

    // We use Data attributes to store the category.
    categoryid = categorynode.getData('categoryid');
    depth = categorynode.getData('depth');
    if (typeof categoryid === "undefined" || typeof depth === "undefined") {
        return;
    }

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.CATEGORYSPINNERLOCATION)).show();

    // Fetch the data.
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
NS._run__expansion = function(categorynode) {
    var categorychildren = categorynode.one(SELECTORS.CATEGORYCONTENT);

    // Add our animation to the categorychildren.
    this.add_animation(categorychildren);

    // If we already have the class, remove it before showing otherwise we perform the
    // animation whilst the node is hidden.
    if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
        // To avoid a jump effect, we need to set the height of the children to 0 here before removing the SECTIONCOLLAPSED class.
        categorychildren.setStyle('height', '0');
        categorynode.removeClass(CSS.SECTIONCOLLAPSED);
        categorychildren.fx.set('reverse', false);
    } else {
        categorychildren.fx.set('reverse', true);
        categorychildren.fx.once('end', function(e, categorynode) {
            categorynode.addClass(CSS.SECTIONCOLLAPSED);
        }, this, categorynode);
    }

    categorychildren.fx.once('end', function(e, categorychildren) {
        // Remove the styles that the animation has set.
        categorychildren.setStyles({
            height: '',
            opacity: ''
        });

        // To avoid memory gobbling, remove the animation. It will be added back if called again.
        this.destroy();
    }, categorychildren.fx, categorychildren);

    // Now that everything has been set up, run the animation.
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
NS.process_results = function(tid, response, args) {
    var newnode,
        data;
    try {
        data = Y.JSON.parse(response.responseText);
        if (data.error) {
            return new M.core.ajaxException(data);
        }
    } catch (e) {
        return new M.core.exception(e);
    }

    // Insert the returned data into a new Node.
    newnode = Y.Node.create(data);

    // Append to the existing child location.
    args.childnode.appendChild(newnode);

    // Now that we have content, we can swap the classes on the toggled container.
    args.parentnode
        .addClass(CSS.LOADED)
        .removeClass(CSS.NOTLOADED);

    // Toggle the open/close status of the node now that it's content has been loaded.
    this._run__expansion(args.parentnode);

    // Remove the spinner now that we've started to show the content.
    if (args.spinner) {
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
NS.add_animation = function(childnode) {
    if (typeof childnode.fx !== "undefined") {
        // The animation has already been plugged to this node.
        return childnode;
    }

    childnode.plug(Y.Plugin.NodeFX, {
        from: {
            height: 0,
            opacity: 0
        },
        to: {
            // This sets a dynamic height in case the node content changes.
            height: function(node) {
                // Get expanded height (offsetHeight may be zero).
                return node.get('scrollHeight');
            },
            opacity: 1
        },
        duration: 0.2
    });

    return childnode;
};


}, '@VERSION@', {"requires": ["node"]});
