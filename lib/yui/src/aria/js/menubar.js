/**
 * Add ARIA menubar support as documented in http://www.w3.org/TR/wai-aria-practices/#menu.
 *
 * @class moodle-core-aria-menubar
 */

var MODNAME = 'moodle-core-aria-menubar',
    SELECTOR = {
        MENUBAR: '[role="menubar"]',
        MENUITEM: '[role="menuitem"]',
        MENU: '[role="menu"]',

        MENUBARITEMS: [
            '[role="menubar"] > [role="menuitem"]',
            '[role="menubar"] > [role="presentation"] > [role="menuitem"]',

            // Add a selector to get anything which is not a child of another menu
            '[role="menubar"] *:not([role="menu"]) [role="menuitem"]'
        ],
        MENUBARITEMWITHCHILD: [
            '[role="menubar"][aria-haspopup="true"]'
        ],

        MENUITEMS: [
            '[role="menuitem"]'
        ]
    },
    KEYCODES = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,

        ENTER: 13,
        SPACE: 32,

        TAB: 9
    };

/**
 * Add ARIA menubar support as documented in http://www.w3.org/TR/wai-aria-practices/#menu.
 *
 * @module moodle-core-aria-menubar
 * @class Moodle.core.aria.MenuBar
 * @constructor
 */
Y.namespace('Moodle.core.aria').MenuBar = Y.Base.create('MenuBar', Y.Base, [], {

    /**
     * The node representing the Scope to work within.
     *
     * @property scopeNode
     * @type Node
     * @protected
     */
    _scopeNode: null,

    /**
     * The list of events which have been set up as part of this implementation.
     *
     * @property _events
     * @type Array
     * @protected
     */
    _events: [],

    /**
     * The initializer for the class instance.
     *
     * This finds the Node for the current Scope, and if found, sets up appropriate Listeners.
     * If the scope Node is not found, a warning is logged.
     *
     * @method initializer
     * @chainable
     */
    initializer: function() {
        this._scopeNode = Y.one(this.get('scope'));

        if (this._scopeNode) {
            this._setupListeners();
        } else {
            Y.log("No Node for the scope '" + this.get('scope') + "' was found'",
                'warn', MODNAME);
        }
        return this;
    },

    /**
     * The destructor for the class instance.
     *
     * @method destructor
     * @chainable
     */
    destructor: function() {
        // Detach all events that we had subscribed to.
        Y.EventHandle(this._events).detach();

        return this;
    },

    /**
     * Setup listeners for the MenuBar.
     * 
     * @method _setupListeners
     * @protected
     * @chainable
     */
    _setupListeners: function() {
        // If a menu bar item has focus and the menu is not open, then:
        // * Enter, Space, and the up down arrow keys opens the menu and places focus on the first menu item in the opened menu or
        //   child menu bar.
        this._events.push(
            this._scopeNode.delegate('key', this._handleOpenMenuWithChild,
                    'down:' + [KEYCODES.ENTER, KEYCODES.SPACE, KEYCODES.UP, KEYCODES.DOWN].join(', '),
                    SELECTOR.MENUBARITEMWITHCHILD.join(', '), this)
        );

        // If a menu bar item has focus and the menu is not open, then:
        // * Menu items within a menubar should respond to left/right keys.
        this._events.push(
            this._scopeNode.delegate('key', this._handleMenuBarItemLeftRight,
                    'down:' + [KEYCODES.LEFT, KEYCODES.RIGHT].join(', '),
                    SELECTOR.MENUBARITEMS.join(', '), this)
        );

        // When a menu is open and focus is on a menu item in that open menu, then:
        // * Enter or Space invokes that menu action (which may be to open a submenu).
        this._events.push(
            this._scopeNode.delegate('key', this._handleMenuItemSelection,
                    'down:' + [KEYCODES.ENTER, KEYCODES.SPACE].join(', '),
                    SELECTOR.MENUITEMS.join(', '), this)
        );

        // When a menu is open and focus is on a menu item in that open menu, then:
        // * Up Arrow or Down Arrow keys cycle focus through the items in that menu.
        this._events.push(
            this._scopeNode.delegate('key', this._handleMenuItemMovement,
                    'down:' + [KEYCODES.UP, KEYCODES.DOWN].join(', '),
                    SELECTOR.MENUITEMS.join(', '), this)
        );

        // When a menu is open and focus is on a menu item in that open menu, then:
        // * Escape closes the open menu or submenu and returns focus to the parent menu item.
        // TODO fire event to be listened to
        
        // Typing a letter (printable character) key moves focus to the next instance of a visible node whose title begins with that
        // printable letter.
        
        // First item in menu bar should be in the tab order (tabindex=0).
        
        // Tabbing out of the menu component closes any open menus.
        
        // With focus on a menu item and a sub menu opened via mouse behavior, pressing down arrow moves focus to the first item in the
        // sub menu.
        
        // With focus on a menu item and a sub menu opened via mouse behavior, pressing up arrow moves focus to the last item in the
        // sub menu.
        
        // With focus on a submenu item, the user must use arrows or the Escape key to progressively close submenus and move up to the
        // parent menu item(s).
        
        // At the top level, Escape key closes any sub menus and keeps focus at the top level menu.

        return this;
    },

    /**
     * Handle movement between different menuitems in the menubar.
     *
     * @method _handleMenuBarItemLeftRight
     * @protected
     * @param {EventFacade} e The event triggering this action
     * @chainable
     */
    _handleMenuBarItemLeftRight: function(e) {
        if (!e.currentTarget.ancestor(SELECTOR.MENUITEM, true)) {
            Y.log("Attempt to handle arrow navigation on an element which was not a menuitem",
                'warn', MODNAME);
            return this;
        }

        if (e.currentTarget.ancestor(SELECTOR.MENU)) {
            // Only respond to menuitems in a menubar, not menuitems in a menu.
            return this;
        }

        var menubar = e.currentTarget.ancestor(SELECTOR.MENUBAR),
            next;

        if (e.keyCode === KEYCODES.LEFT) {
            next = this._getMenuItem(menubar, e.currentTarget, true);
            Y.log("Selecting the previous " + SELECTOR.MENUITEM);
        } else if (e.keyCode === KEYCODES.RIGHT) {
            next = this._getMenuItem(menubar, e.currentTarget);
            Y.log("Selecting the next " + SELECTOR.MENUITEM);
        }

        if (next) {
            this._selectNode(next, e.currentTarget);
            e.preventDefault();
        }

        return this;
    },

    // TODO Finish
    // Need to work out how to do this. Perhaps use an event?
    _handleOpenMenuWithChild: function(e) {
        var menuitem = e.currentTarget.ancestor(SELECTOR.MENUITEM, true);

        if (!menuitem) {
            Y.log("Attempt to open on an element which was not a menuitem",
                'warn', MODNAME);
            return this;
        }

        if (!menuitem.hasAttribute('aria-owns')) {
            Y.log("Attempt to open on an element which does not have a menu",
                'warn', MODNAME);
            return this;
        }
    },

    /**
     * Handle selection of a menu item.
     *
     * @method _handleMenuItemSelection
     * @param {EventFacade} e
     * @chainable
     */
    _handleMenuItemSelection: function(e) {
        // The space bar was pressed. Trigger a click.
        e.preventDefault();
        e.currentTarget.simulate('click');

        return this;
    },

    /**
     * Handle movement through a menu.
     *
     * @method _handleMenuItemMovement
     * @param {EventFacade} e
     * @chainable
     */
    _handleMenuItemMovement: function(e) {
        if (!e.currentTarget.ancestor(SELECTOR.MENUITEM, true)) {
            Y.log("Attempt to handle arrow navigation on an element which was not a menuitem",
                'warn', MODNAME);
            return this;
        }

        var menu = e.currentTarget.ancestor(SELECTOR.MENU, true),
            next;

        if (!menu) {
            // Do not handle up/down movement if this item is not in a menu.
            return this;
        }

        if (e.keyCode === KEYCODES.UP) {
            next = this._getMenuItem(menu, e.currentTarget, true, true);
            Y.log("Selecting the previous " + SELECTOR.MENUITEM);
        } else if (e.keyCode === KEYCODES.DOWN) {
            next = this._getMenuItem(menu, e.currentTarget, false, true);
            Y.log("Selecting the next " + SELECTOR.MENUITEM);
        }

        if (next) {
            this._selectNode(next, e.currentTarget);
            e.preventDefault();
        }

        return this;
    },

    /**
     * Get the next (or previous) menuitem in the specified menu or menubar.
     *
     * @method _getMenuItem
     * @protected
     * @param {Node} menu The containing menu or menubar
     * @param {Node} menuitem The currently selected menuitem
     * @param {Boolean} [previous=false] If specified, retrieve the previous menuitem rather than the next
     * @param {Boolean} [loopList=false] If specified, the list is looped around when the end is reached
     * @return Node The next (or previous) menuitem
     */
    _getMenuItem: function(menu, menuitem, previous, loopList) {
        var menuChildren = menu.all(SELECTOR.MENUITEM),
            childCount = menuChildren.size(),
            next;

        // Set defaults for optional parameters.
        previous = previous || false;
        loopList = loopList || false;

        if (childCount === 1) {
            // Nothing else to move to.
            return null;
        } else if (childCount === 2) {
            // Only two children - return the relevant item without looping first.
            if (menuChildren.item(0) === menuitem && !previous) {
                next = menuChildren.item(1);

            } else if (menuChildren.item(1) === menuitem && previous) {
                next = menuChildren.item(0);

            }

            if (next && next.hasAttribute('hidden')) {
                next = null;
            }

            return next;
        } else if (childCount > 2) {
            var index = 0,
                direction = 1,
                checkCount = 0;

            // Work out the index of the currently selected item.
            for (index = 0; index < childCount; index++) {
                if (menuChildren.item(index) === menuitem) {
                    break;
                }
            }

            // Check that the menu item was found - otherwise return null.
            if (menuChildren.item(index) !== menuitem) {
                return null;
            }

            // Reverse the direction if we're after the previous
            if (previous) {
                direction = -1;
            }

            do {
                // Update the index in the direction of travel.
                index += direction;

                if (loopList) {
                    // Handle wrapping at either end.
                    if (index < 0) {
                        index = childCount - 1;
                    } else if (index >= childCount) {
                        index = 0;
                    }
                }

                next = menuChildren.item(index);

                // Check that we don't loop multiple times.
                checkCount++;
            } while (next && checkCount < childCount && next !== menuitem && next.hasClass('hidden'));
        }

        // Return the item if it was found.
        return next;
    },

    /**
     * Mark the specified Node as being selected.
     *
     * @param {Node} targetFocus
     * @param {Node} [currentFocus]
     * @chainable
     *
     * TODO move this out into moodle-core-aria-base
     */
    _selectNode: function(targetFocus) {
        targetFocus.focus();

        return this;
    }
}, {
    ATTRS: {
        /**
         * The scope within which to apply the aria-menubar
         * @attribute scope
         * @writeOnce
         */
        scope: {
            value: null,
            writeOnce: true
        }
    }
});

arntemp = function() {
    return new Y.Moodle.core.aria.MenuBar({
        scope: '#page'
    });
};
