YUI.add('moodle-core-lockscroll', function (Y, NAME) {

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
     * The list of events relating to this instantiation of the LockScroll
     * plugin.
     *
     * @property _events
     * @type Array An array of Event Handles
     * @protected
     */
    _events: null,

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
        if (this._events && this._events.length > 1) {
            Y.log('LockScroll already active. Ignoring enable request', 'warn', 'moodle-core-lockscroll');
            return;
        }
        Y.log('Enabling LockScroll.', 'debug', 'moodle-core-lockscroll');
        // Save the current Top and Left.
        this._scrollTop  = this._scrollNode.get('scrollTop');
        this._scrollLeft = this._scrollNode.get('scrollLeft');
        this._events = [
            Y.one(this._scrollNode).on('scroll', function() {
                this.forceScrollPosition();
            }, this)
        ];
        this.forceScrollPosition();

        return this;
    },

    /**
     * Return whether scroll locking is active.
     *
     * @method isActive
     * @return Boolean
     */
    isActive: function() {
        return (this._events && this._events.length > 0);
    },

    /**
     * Force the specified scroll position on the scrollNode set up
     * earlier.
     *
     * @method forceScrollPosition
     * @chainable
     */
    forceScrollPosition: function() {
        this._scrollNode
                .set('scrollTop', this._scrollTop)
                .set('scrollLeft', this._scrollLeft);

        return this;
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

            // Clear all of the event listeners.
            new Y.EventHandle(this._events).detach();
            this._events = null;

            // And reset the top and left scroll positions to the position we
            // stored when we were enabled.
            this._scrollNode.set('scrollTop', this._scrollTop);
            this._scrollNode.set('scrollLeft', this._scrollLeft);
        }

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
        var SCROLL_NODE;

        if (Y.UA.ie) {
            if (Y.config.doc[COMPAT_MODE] === 'BackCompat') {
                SCROLL_NODE ='documentElement';
            } else {
                SCROLL_NODE = 'body';
            }
        }

        if (SCROLL_NODE) {
            return Y.one(Y.config.doc[SCROLL_NODE]);
        } else {
            return Y.one(Y.config.doc);
        }
    }

}, {
    NS: 'lockScroll',
    ATTRS: {
    }
});


}, '@VERSION@', {"requires": ["plugin", "base-build"]});
