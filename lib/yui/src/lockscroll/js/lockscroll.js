/**
 * Provides the ability to lock the ability to alter the scroll for a page,
 * storing the current location in the plugin.
 *
 * @module moodle-core-lockscroll
 */

/**
 * Provides the ability to lock the ability to alter the scroll for a page,
 * storing the current location in the plugin.
 *
 * @class Moodle.core.LockScroll
 * @extends Plugin.Base
 */
Y.namespace('Moodle.core').LockScroll = Y.Base.create('lockScroll', Y.Plugin.Base, [], {

    /**
     * The Node of the page element on which page scrolling occurs.
     *
     * @property _scrollNode
     * @type Node
     * @protected
     */
    _scrollNode: null,

    /**
     * The scrollTop set on the page when enabling the plugin.
     *
     * @property _scrollTop
     * @type Number
     * @protected
     */
    _scrollTop: 0,

    /**
     * The scrollLeft set on the page when enabling the plugin.
     *
     * @property _scrollLeft
     * @type Number
     * @protected
     */
    _scrollLeft: 0,

    /**
     * Whether the LockScroll has been activated.
     *
     * @property _enabled
     * @type Boolean
     * @protected
     */
    _enabled: false,

    initializer: function() {
        this._scrollNode = this._getScrollNode();
    },

    destructor: function() {
        this.disableScrollLock();
    },

    /**
     * Start locking the page scroll.
     *
     * @method enableScrollLock
     * @chainable
     */
    enableScrollLock: function() {
        if (this.isActive()) {
            Y.log('LockScroll already active. Ignoring enable request', 'warn', 'moodle-core-lockscroll');
            return;
        }

        Y.log('Enabling LockScroll.', 'debug', 'moodle-core-lockscroll');

        // Save the current Top and Left.
        this._scrollTop  = this._scrollNode.scrollTop;
        this._scrollLeft = this._scrollNode.scrollLeft;

        Y.one(Y.config.doc.body)
                .setStyles({
                    top: 0 - this._scrollTop + 'px',
                    left: 0 - this._scrollLeft + 'px',
                    position: 'fixed'
                });

        this._enabled = true;

        return this;
    },

    /**
     * Return whether scroll locking is active.
     *
     * @method isActive
     * @return Boolean
     */
    isActive: function() {
        return this._enabled;
    },

    /**
     * Stop locking the page scroll.
     *
     * @method disableScrollLock
     * @chainable
     */
    disableScrollLock: function() {
        if (this.isActive()) {
            Y.log('Disabling LockScroll.', 'debug', 'moodle-core-lockscroll');

            Y.one(Y.config.doc.body).setStyles({
                top: null,
                left: null,
                position: null
            });

            // And reset the top and left scroll positions to the position we
            // stored when we were enabled.
            this._scrollNode.scrollTop = this._scrollTop;
            this._scrollNode.scrollLeft = this._scrollLeft;
        }

        this._enabled = false;

        return this;
    },

    /**
     * Returns the Node relatin to the DOM Node which is responsible for
     * scroll data.
     *
     * While most browsers use the body element to store scroll
     * co-ordinates, some use the documentElement instead.
     * @method _getScrollNode
     * @return {Node} The Y.Node relating to the scroll position setter.
     * @protected
     **/
    _getScrollNode: function () {
        var SCROLL_NODE = 'body';

        if (Y.UA.ie) {
            if (Y.config.doc.compatMode !== 'BackCompat') {
                SCROLL_NODE ='documentElement';
            }
        }

        return Y.config.doc[SCROLL_NODE];
    }

}, {
    NS: 'lockScroll',
    ATTRS: {
    }
});
