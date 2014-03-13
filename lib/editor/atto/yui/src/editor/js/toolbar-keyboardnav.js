function EditorToolbarNav() {}

EditorToolbarNav.ATTRS= {
};

EditorToolbarNav.prototype = {

    /**
     * The current focal point for tabbing.
     *
     * @property _tabFocus
     * @type Node
     * @default null
     * @private
     */
    _tabFocus: null,

    setupToolbarNavigation: function() {
        // Listen for Arrow left and Arrow right keys.
        this._wrapper.delegate('key',
                this.toolbarKeyboardNavigation,
                'down:37,39',
                '.' + CSS.TOOLBAR,
                this);

        return this;
    },

    /**
     * Implement arrow key navigation for the buttons in the toolbar.
     *
     * @method toolbarKeyboardNavigation
     * @param {EventFacade} e - the keyboard event.
     */
    toolbarKeyboardNavigation: function(e) {
        // Prevent the default browser behaviour.
        e.preventDefault();

        var buttons = this.toolbar.all('button');

        // On cursor moves we loops through the buttons.
        var found = false,
            index = 0,
            direction = 1,
            checkCount = 0,
            group,
            current = e.target.ancestor('button', true);

        // Determine which button is currently selected.
        while (!found && index < buttons.size()) {
            if (buttons.item(index) === current) {
                found = true;
            } else {
                index++;
            }
        }

        if (!found) {
            Y.log("Unable to find this button in the list of buttons", 'debug', LOGNAME);
            return;
        }

        if (e.keyCode === 37) {
            // Moving left so reverse the direction.
            direction = -1;
        }

        // Try to find the next
        do {
            index += direction;
            if (index < 0) {
                index = buttons.size() - 1;
            } else if (index >= buttons.size()) {
                // Handle wrapping.
                index = 0;
            }
            next = buttons.item(index);
            group = next.ancestor('.atto_group');

            // Add a counter to ensure we don't get stuck in a loop if there's only one visible menu item.
            checkCount++;
            // Loop while:
            // * we are not in a loop and have not already checked every button; and
            // * we are on a different button; and
            // * both the next button and the group it is in are not hidden.
        } while (checkCount < buttons.size() && next !== current && (next.hasAttribute('hidden') || group.hasAttribute('hidden')));

        if (next) {
            next.focus();
            this._setTabFocus(next);
        }
    },

    /**
     * Sets tab focus for the toolbar to the specified Node.
     *
     * @method _setTabFocus
     * @param {Node} button The node that focus should now be set to
     * @chainable
     * @private
     */
    _setTabFocus: function(button) {
        Y.log("Changing tab focus");
        if (this._tabFocus) {
            Y.log("Unsetting old focal point");
            // Unset the previous entry.
            this._tabFocus.setAttribute('tabindex', '-1');
        }
        Y.log("Setting up new one");

        // Set up the new entry.
        this._tabFocus = button;
        this._tabFocus.setAttribute('tabindex', 0);

        // And update the activedescendant to point at the currently selected button.
        this.toolbar.setAttribute('aria-activedescendant', this._tabFocus.generateID());

        return this;
    }
};

Y.Base.mix(Y.M.editor_atto.Editor, [EditorToolbarNav]);
