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
NS.init = function() {
    Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
};

/**
 * Toggle the animation of the clicked node.
 *
 * @method toggle_expansion
 * @protected
 * @param EventFacade e
 */
NS.toggle_expansion = function(e) {
    var categorynode,
        categoryid,
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
        this._toggle_expansion(categorynode);
        return;
    }

    // We use Data attributes to store the category.
    categoryid = categorynode.getData('categoryid');
    if (typeof categoryid === "undefined") {
        return;
    }

    // We have a valid object to fetch. Add a spinner to give some feedback to the user.
    spinner = M.util.add_spinner(Y, categorynode.one(SELECTORS.LISTENLINK)).show();

    // Fetch the data.
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
NS._toggle_expansion = function(categorynode) {
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
 * @method process_category_results
 * @protected
 * @param String tid The Transaction ID
 * @param Object response The Reponse returned by Y.IO
 * @param Object ioargs The additional arguments provided by Y.IO
 */
NS.process_category_results = function(tid, response, args) {
    var newnode,
        childnode,
        data;
    try {
        data = Y.JSON.parse(response.responseText);
        if (data.error) {
            return new M.core.ajaxException(data);
        }
    } catch (e) {
        return new M.core.exception(e);
    }

    // Insert it into a set of new child nodes to categorynode.
    // We only want the tree part of this.
    newnode = Y.Node.create(data)
        .one(SELECTORS.CATEGORYTREE);

    // Now that we have content, we can swap the classes on the toggled container.
    args.categorynode
        .addClass(CSS.LOADED)
        .removeClass(CSS.NOTLOADED);

    // Append to the existing child location.
    childnode = args.categorynode.one(SELECTORS.CATEGORYCONTENT);
    childnode.appendChild(newnode);

    // Toggle the open/close status of the node now that it's content has been loaded.
    this._toggle_expansion(args.categorynode);

    // Remove the spinner now that we've started to show the content.
    args.spinner.hide().destroy();
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
        duration: 0.3
    });

    return childnode;
};


}, '@VERSION@', {"requires": ["node", "io-base", "json-parse", "moodle-core-notification", "anim"]});
