YUI.add('moodle-comment-comment', function (Y, NAME) {

/**
 * Comment handling.
 *
 * @module moodle-comment-comment
 */
var SELECTORS = {
    COMMENT: '.comment',
    COMMENTREGION: '.comment-container',
    COMMENTAREA: '.comment-area',
    COMMENTLIST: '.comment-list',
    COMMENTTEXT: '.comment-area textarea',
    PAGINATOR: '.comment-paging',
    PAGINATORS: '.comment-container .pageno',
    REMOVEBUTTON: '.comment-container .comment-delete',
    SAVEBUTTON: '.comment-container .comment-save',
    TOGGLEVISIBLITY: '.comment-toggle'
};

var CLASSES = {
    LOADED: 'comments-loaded',
    COLLAPSED: 'collapsed'
};

/**
 * Comment handling.
 *
 * @class Y.M.comment.comment
 * @extends Base
 * @constructor
 */
var Comment = function() {
    Comment.superclass.constructor.apply(this, arguments);
};

Y.extend(Comment, Y.Base, {
    /**
     * The initializer which sets up the various listeners.
     *
     * @method initializer
     */
    initializer: function() {
        // Watch for the save comment action.
        Y.delegate('click', this.addComment, 'body', SELECTORS.SAVEBUTTON, this);
        Y.delegate('key', this.addComment, 'body', 'down:13,32',  SELECTORS.SAVEBUTTON, this);

        // Watch for comment removals.
        Y.delegate('click', this.deleteComment, 'body', SELECTORS.REMOVEBUTTON, this);
        Y.delegate('key', this.deleteComment, 'body', 'down:13,32',  SELECTORS.REMOVEBUTTON, this);

        // Watch for pagination actions.
        Y.delegate('click', this.changePage, 'body', SELECTORS.PAGINATORS, this);
        Y.delegate('key', this.changePage, 'body', 'down:13,32',  SELECTORS.PAGINATORS, this);

        // Watch for expansion of comments.
        Y.delegate('click', this.toggleCommentVisibility, 'body', SELECTORS.TOGGLEVISIBLITY, this);
    },

    /**
     * Change to the page identified by the page number that was selected
     * by the user.
     *
     * @method changePage
     * @param {EventFacade} e
     */
    changePage: function(e) {
        e.preventDefault();

        // Determine the comment region.
        var commentRegion = this._getCommentRegion(e.target);

        // Determine the page number.
        var page = e.target.ancestor(SELECTORS.PAGINATORS, true);

        if (!page || !page.getData('pageno')) {
            return;
        }

        this.loadComments(commentRegion, {
            page: page.getData('pageno')
        });

    },

    /**
     * Load a set of comments for the specified commentRegion based on the
     * details in options.
     *
     * @method loadComments
     * @param {Node} commentRegion The region which the comments are being loaded for.
     * @param {Object} options
     * @param {Number} options.page
     * @chainable
     */
    loadComments: function(commentRegion, options) {
        // Build the request for Y.io.
        var localConfig = {
            action: 'get'
        };

        // Handle any options provided.
        if (options && options.page) {
            localConfig.page = options.page;
        }

        var config = this._getIOConfig(commentRegion, localConfig);

        // Perform the request.
        Y.io(this.get('api'), config);
    },

    /**
     * Toggle the visibility of comments.
     *
     * @method toggleCommentVisibility
     * @param {EventFacade} e
     */
    toggleCommentVisibility: function(e) {
        e.preventDefault();

        // Determine the comment region.
        var commentRegion = this._getCommentRegion(e.target);

        // Ensure the comments are loaded.
        var commentArea = commentRegion.one(SELECTORS.COMMENTLIST);
        if (!commentArea.hasClass(CLASSES.LOADED)) {
            this.loadComments(commentRegion, {
                page: 0
            });
            commentArea.addClass(CLASSES.LOADED);
        }

        // And display the comments after we've started the loading.
        commentRegion.toggleClass(CLASSES.COLLAPSED);
    },

    /**
     * Add a new comment.
     *
     * This function should only be triggered by an EventHandle which is
     * attached to a Node present in a comment as the event's intended
     * target is used to identify the comment region to add to.
     *
     * The content of the comment is derived from the text area present in
     * the content region.
     *
     * @method addComment
     * @param {EventFacade} e
     */
    addComment: function(e) {
        e.preventDefault();

        // Determine the comment region.
        var commentRegion = this._getCommentRegion(e.target);

        // And get the content of the save text area.
        var commentContent = commentRegion.one(SELECTORS.COMMENTTEXT);

        if (!commentContent) {
            return;
        }

        // Build the request for Y.io.
        var config = this._getIOConfig(commentRegion, {
            action: 'add',
            content: commentContent.get('value')
        });

        // Perform the request.
        Y.io(this.get('api'), config);
    },

    /**
     * Handle deletion of a comment.
     *
     * This function should only be triggered by an EventHandle which is
     * attached to a Node present in a comment as the event's intended
     * target is used to identify the comment to remove.
     *
     * @method deleteComment
     * @param {EventFacade} e
     */
    deleteComment: function(e) {
        e.preventDefault();

        // Determine the comment region.
        var commentRegion = this._getCommentRegion(e.target);

        // And the comment being removed.
        var comment = e.target.ancestor(SELECTORS.COMMENT, true);

        // We can't pass the current context to Y.use, so use scope.
        var scope = this;
        Y.use('moodle-core-notification-confirm', function() {
            var confirmation = new M.core.confirm({
                question: M.util.get_string('deletecommentcheck', 'moodle'),
                modal: true
            });

            confirmation.on('complete-yes', function() {
                // Build the request for Y.io.
                var config = this._getIOConfig(commentRegion, {
                    action: 'delete',
                    commentid: comment.getData('commentid')
                });

                // Perform the request.
                Y.io(this.get('api'), config);
            }, scope);

            confirmation.show();
        });
    },

    /**
     * Display the specific comment in the UI.
     *
     * @method _displayComments
     * @protected
     * @param {Object} payload The response payload from an AJAX request
     * @param {Array} payload.comments The new list of comments
     * @param {Number} payload.total The number of comments
     * @param {Object} payload.page Information about paging
     * @param {Number} payload.page.total The total number of pages
     * @param {Number} payload.page.current The current page number
     * @param {Boolean} payload.appendOnly Whether to append new records rather than
     * replace the list of comments rather than replace the existing list.
     */
    _displayComments: function(commentRegion, payload) {
        var commentArea = commentRegion.one(SELECTORS.COMMENTLIST);

        // If this update is not an appendOnly, then wipe out the current
        // content first.
        if (!payload.appendOnly) {
            commentArea.empty();
        }

        // Fill the template and add it in.
        var commentContent = Y.Node.create(payload.comments);
        commentArea.appendChild(commentContent);

        // Add the paginator.
        var paginator = commentRegion.one(SELECTORS.PAGINATOR);
        if (payload.pagination && paginator) {
            paginator
                    .empty()
                    .appendChild(payload.pagination);
        }
    },

    /**
     * Remove a specific comment from the comment region.
     *
     * @method _removeComment
     * @protected
     * @param {Node} commentRegion The region from which this comment is being removed.
     * @param {Object} payload The response payload from an AJAX request
     * @param {Number} payload.commentid The ID of the comment to be removed
     */
    _removeComment: function(commentRegion, payload) {
        if (!payload.commentid) {
            return;
        }

        var commentToRemove = commentRegion.one('[data-commentid="' + payload.commentid + '"]');

        if (!commentToRemove) {
            return;
        }

        // Remove the comment from the DOM.
        commentToRemove.remove(true);
    },

    /**
     * Build the IO configuration.
     *
     * @method _getIOConfig
     * @protected
     * @param {Node} commentRegion The region which this request is being loaded for.
     * @param {Object} params The additional params to add to the IO configuration.
     */
    _getIOConfig: function(commentRegion, params) {
        var instanceConfig = {
            context: this,
            on: {
                complete: this._parseResults
            },
            data: {
                sesskey:    M.cfg.sesskey,
                courseid:   commentRegion.getData('courseid'),
                contextid:  commentRegion.getData('contextid'),
                component:  commentRegion.getData('component'),
                itemid:     commentRegion.getData('itemid'),
                area:       commentRegion.getData('commentarea'),
                client_id:  commentRegion.getData('clientid')
            }
        };

        // Add the commentRegion reference so that it's available in the
        // results handler.
        instanceConfig['arguments'] = {
            commentRegion: commentRegion
        };

        // Add in the supplied params
        instanceConfig.data = Y.merge(instanceConfig.data, params);
        return instanceConfig;
    },

    /**
     * Parse the results from the IO request and handle the result
     * accordingly.
     *
     * This will take the resultant data payload and determine the correct
     * action(s) for it.
     *
     * @method _parseResults
     * @protected
     * @param {Object} tid The transaction ID
     * @param {Object} response The response text supplied by the XHR.
     * @param {Object} args The additional arguments supplied to Y.io when making the request.
     */
    _parseResults: function(tid, response, args) {
        var payload;
        try {
            payload = Y.JSON.parse(response.responseText);
            if (payload.error) {
                Y.use('moodle-core-notification-ajaxException', function () {
                    return new M.core.ajaxException(payload);
                });
                return false;
            }
        } catch (error) {
            if (outcome && outcome.status && outcome.status > 0) {
                Y.use('moodle-core-notification-exception', function () {
                    return new M.core.exception(error).show();
                });
                return false;
            }
        }

        if ((payload.action === 'update' || payload.action === 'add') && payload.comments) {
            if (payload.action === 'add') {
                // Clear the textarea for any future comments.
                args.commentRegion.one(SELECTORS.COMMENTTEXT).set('value', '');
            }

            // Update the comments, removing those already present.
            this._displayComments(args.commentRegion, payload);
        } else if (payload.action === 'remove' && payload.commentid) {
            this._removeComment(args.commentRegion, payload);
        }

        if (typeof payload.count !== "undefined") {
            var commentToggle = args.commentRegion.one(SELECTORS.TOGGLEVISIBLITY);
            if (commentToggle) {
                commentToggle.set('text', M.util.get_string('commentscount', 'moodle', {
                    linktext: args.commentRegion.getData('linktext'),
                    count: payload.count
                }));
            }
        }
    },

    /**
     * A helper function to return the comment region relating to the
     * current node.
     *
     * @method _getCommentRegion
     * @private
     * @param {Node} target The child node of the comment region
     * @return {Node} The comment region node.
     */
    _getCommentRegion: function(target) {
        return target.ancestor(SELECTORS.COMMENTREGION, true);
    }
}, {
    ATTRS: {
        /**
         * The API URL to use when making requests.
         *
         * @attribute api
         * @type String
         * @default M.cfg.wwwroot + '/comment/comment_ajax.php'
         */
        api: {
            value: M.cfg.wwwroot + '/comment/comment_ajax.php'
        }
    }
});

Y.namespace('M.comment').comment = function() {
    return new Comment(arguments);
};


}, '@VERSION@', {"requires": ["base", "io", "event-key"]});
