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

M.course = M.course || {};
M.course.categoryexpander = M.course.categoryexpander || {
    init: function() {
        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
        this.init = function(){};
    },
    toggle_expansion: function(e) {
        var categorynode,
            categoryid,
            depth;

        // Grab the ancestor.
        categorynode = e.target.ancestor(SELECTORS.PARENTWITHCHILDREN, true);

        if (!categorynode.hasClass(CSS.HASCHILDREN)) {
            return;
        }

        if (categorynode.hasClass(CSS.NOTLOADED)) {
            categoryid = categorynode.getData('categoryid');
            depth = categorynode.getData('depth');
            if (typeof categoryid === "undefined" || typeof depth === "undefined") {
                return;
            }
            // Fetch the data.
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
            this.apply_animation(categorynode);
        }
        e.preventDefault();
    },
    apply_animation: function(categorynode) {
        var categorychildren = categorynode.one(SELECTORS.CATEGORYCHILDREN);
        this.add_animator(categorychildren);

        // If we already have the class, remove it before showing otherwise we perform the
        // animation whilst the node is hidden.
        if (categorynode.hasClass(CSS.SECTIONCOLLAPSED)) {
            categorynode.removeClass(CSS.SECTIONCOLLAPSED);
            categorychildren.fx.set('reverse', false);
            categorychildren.fx.run();
        } else {
            categorychildren.fx.set('reverse', true);
            categorychildren.fx.once('end', function() {
                this.addClass(CSS.SECTIONCOLLAPSED);
            }, categorynode);
            categorychildren.fx.run();
        }
    },
    handle_category_results: function(tid, response, ioargs) {
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
        newnode = Y.Node.create(data);
        ioargs.categorynode
            .addClass(CSS.LOADED)
            .removeClass(CSS.NOTLOADED);

        // FIXME - would be nice to not have this served by the renderer.
        newnode.one(SELECTORS.CATEGORYLABEL).remove();
        childnode = ioargs.categorynode.one(SELECTORS.CATEGORYCHILDREN);
            childnode.appendChild(newnode);
        this.apply_animation(ioargs.categorynode);
    },
    add_animator: function(childnode) {
        if (typeof childnode.fx !== "undefined") {
            return;
        }
        childnode.plug(Y.Plugin.NodeFX, {
            from: {
                height: 0,
                opacity: 0
            },
            to: {
                height: function(node) { // dynamic in case of change
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

        return childnode;
    }
};
