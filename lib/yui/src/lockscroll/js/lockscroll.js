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
     * A Node which typically represents the body tag.
     *
     * @property _pageScrollNode
     * @type Node
     * @protected
     */
    _pageScrollNode: null,

    _lockDepth: 0,

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
        this._pageScrollNode = Y.one(Y.config.doc.body);
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
        this._events = [
            Y.one(Y.config.doc).on('scroll', this.forceScrollPosition, this)
        ];

        // Calculate the current number of applied locks.
        var currentDepth = this._pageScrollNode.getAttribute('data-lockscrollcount') || 0;
        this._lockDepth = parseInt(currentDepth, 10) + 1;
        this._pageScrollNode.setAttribute('data-lockscrollcount', this._lockDepth);


        this.lockBodyScroll();
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
     * Force the specified scroll position on the scrollNode set up
     * earlier.
     *
     * @method forceScrollPosition
     * @chainable
     */
    forceScrollPosition: function() {
        this._scrollNode.scrollTop = this._scrollTop;
        this._scrollNode.scrollLeft = this._scrollLeft;

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

            this.unlockBodyScroll();

            // And reset the top and left scroll positions to the position we
            // stored when we were enabled.
            this._scrollNode.scrollTop = this._scrollTop;
            this._scrollNode.scrollLeft = this._scrollLeft;
        }

        this._enabled = false;

        return this;
    },

    lockBodyScroll: function() {
        var lockDepth = parseInt(this._pageScrollNode.getAttribute('data-lockscrolldepth'), 10);
        Y.log(lockDepth);

        if (!lockDepth || lockDepth === this._lockDepth) {
            Y.log("DEBUG: Locking...");
            this._pageScrollNode
                    .setAttribute('data-lockscrolldepth', this._lockDepth)
                    .setStyles({
                        top: 0 - this._scrollTop + 'px',
                        left: 0 - this._scrollLeft + 'px',
                        position: 'fixed'
                    });
        }
    },

    unlockBodyScroll: function() {
        var lockDepth = parseInt(this._pageScrollNode.getAttribute('data-lockscrolldepth'), 10);

        var lockScrollCount = parseInt(this._pageScrollNode.getAttribute('data-lockscrollcount'), 10);
        this._pageScrollNode.setAttribute('data-lockscrollcount', lockScrollCount - 1);

        if (lockDepth === lockScrollCount) {
            this._pageScrollNode
                    .setAttribute('data-lockscrolldepth', 0)
                    .setStyles({
                        top: null,
                        left: null,
                        position: null
                    });
        }
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
