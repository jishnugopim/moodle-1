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
     * A Node which typically represents the body tag.
     *
     * @property _pageScrollNode
     * @type Node
     * @protected
     */
    _pageScrollNode: null,

    /**
     * The depth of this lockscroll instance.
     *
     * This is used to calculate when to lock and lock scroll management.
     *
     * @property _lockDepth
     * @type Number
     * @protected
     */
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

    /**
     * Whether scroll has actually been locked.
     * It is possible to enable lockScroll without activating it if another instance is already present.
     *
     * @property _scrollLocked
     * @type Booelan
     * @default false
     * @protected
     */
    _scrollLocked: false,

    initializer: function() {
        this._scrollNode = this._getScrollNode();
        this._pageScrollNode = Y.one(Y.config.doc.body);
    },

    destructor: function() {
        // Disable scroll lock before destroying the plugin instance
        // otherwise it will be orphaned and impossible to unlock.
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
            return this;
        }

        Y.log('Enabling LockScroll.', 'debug', 'moodle-core-lockscroll');

        // Save the current Top and Left.
        this._scrollTop  = this._scrollNode.scrollTop;
        this._scrollLeft = this._scrollNode.scrollLeft;

        // Add a listener to force the scroll position.
        this._events = [
            Y.one(Y.config.doc).on('scroll', this.forceScrollPosition, this)
        ];

        // Calculate the current number of applied locks.
        var currentDepth = this._pageScrollNode.getAttribute('data-lockscrollcount') || 0;
        this._lockDepth = parseInt(currentDepth, 10) + 1;
        this._pageScrollNode.setAttribute('data-lockscrollcount', this._lockDepth);

        if (this._pageScrollNode.get('docHeight') >= this._pageScrollNode.get('winHeight')) {
            this._pageScrollNode.setStyles({
                overflowY: 'scroll',
                width: '100%'
            });
        }

        if (this._pageScrollNode.get('docWidth') >= this._pageScrollNode.get('winWidth')) {
            this._pageScrollNode.setStyles({
                overflowX: 'scroll'
            });
        }

        this._lockBodyScroll();
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

            this._unlockBodyScroll();
        }

        this._enabled = false;

        return this;
    },

    /**
     * Lock the body scroll to the current position.
     *
     * @private
     * @method _lockBodyScroll
     * @chainable
     */
    _lockBodyScroll: function() {
        var lockDepth = parseInt(this._pageScrollNode.getAttribute('data-lockscrolldepth'), 10);

        // If the lock depth is not set, or the new lock depth is the lock depth of this instance of lockscroll, then actually set the
        // lockscroll.
        if (!lockDepth || lockDepth === this._lockDepth) {
            this._pageScrollNode
                    .setAttribute('data-lockscrolldepth', this._lockDepth)

                    // Less performant hardware and browsers (IE) can't handle scroll events quickly enough causing a jarring effect.
                    // We have to force the current position this way instead.
                    .setStyles({
                        top: 0 - this._scrollTop + 'px',
                        left: 0 - this._scrollLeft + 'px',
                        position: 'fixed'
                    });
            this._scrollLocked = true;
        }
        return this;
    },

    /**
     * Unlock the body scroll.
     *
     * @private
     * @method _unlockBodyScroll
     * @chainable
     */
    _unlockBodyScroll: function() {
        // Decrease the active count on the body.
        var lockScrollCount = parseInt(this._pageScrollNode.getAttribute('data-lockscrollcount'), 10);
        this._pageScrollNode.setAttribute('data-lockscrollcount', lockScrollCount - 1);

        if (this._scrollLocked) {
            // Reset the styles on the page node.
            this._pageScrollNode
                    .setAttribute('data-lockscrolldepth', 0)
                    .setStyles({
                        top: null,
                        left: null,
                        position: null,

                        // Reset the overflow
                        overflowX: null,
                        overflowY: null,
                        width: null
                    });

            // Reset the top and left scroll positions to the position we stored when we were enabled.
            this._scrollNode.scrollTop = this._scrollTop;
            this._scrollNode.scrollLeft = this._scrollLeft;

            // And reset the current state.
            this._scrollLocked = false;
            Y.log("Set the scrolltop to " + this._scrollTop);
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


}, '@VERSION@', {"requires": ["plugin", "base-build"]});
