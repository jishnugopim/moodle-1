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

M.course = M.course || {};
M.course.categoryexpander = M.course.categoryexpander || {
    init: function() {
        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
        this.init = function(){};
    },
    toggle_expansion: function(e) {
        var categorynode,
            categoryid,
            depth,
            animator;
        e.preventDefault();

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
                    depth: depth
                },
                "arguments": {
                    categorynode: categorynode
                }
            });
        } else {
            animator = categorynode.one(SELECTORS.ANIMATOR);
            if (!animator) {
                this.add_animator(categorynode);
            }
            categorynode.toggleClass(CSS.SECTIONCOLLAPSED);
        }
    },
    handle_category_results: function(tid, response, ioargs) {
        var subcategories,
            courses,
            newnode,
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
        // TODO add some nice transitions here
        newnode = Y.Node.create(data);
        ioargs.categorynode
            .addClass(CSS.LOADED)
            .removeClass(CSS.NOTLOADED);

        subcategories = newnode.one(SELECTORS.SUBCATEGORIES);
        courses = newnode.one(SELECTORS.COURSES);

        childnode = this.add_animator([subcategories, courses]);
        ioargs.categorynode.appendChild(childnode);
    },
    add_animator: function(parentnode) {
        var childnode = Y.Node.create('<div>')
                .addClass(CSS.ANIMATOR);

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

        parentnode.get('children').each(function(node) {
            childnode.appendChild(node);
        });
        parentnode.appendChild(childnode);
        return parentnode;
    }
};
