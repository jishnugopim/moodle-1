/**
 * Menu
 * This is a drop down list of buttons triggered (and aligned to) a button.
 *
 * @namespace M.editor_atto
 * @class Menu
 * @constructor
 * @extends M.core.dialogue
 */
Menu = function() {
    Menu.superclass.constructor.apply(this, arguments);
};

Y.extend(Menu, M.core.dialogue, {

    /**
     * Initialise the menu.
     *
     * @method initializer
     * @return void
     */
    initializer: function(config) {
        var body, headertext, bb;
        Menu.superclass.initializer.call(this, config);

        bb = this.get('boundingBox');
        bb.addClass('editor_atto_controlmenu');

        // Close the menu when clicked outside (excluding the button that opened the menu).
        body = this.bodyNode;

        headertext = Y.Node.create('<h3/>')
                .addClass('accesshide')
                .setHTML(this.get('headerText'));
        body.prepend(headertext);

        this.get('hideOn');
    }

}, {
    NAME: "menu",
    ATTRS: {
        /**
         * The header for the drop down (only accessible to screen readers).
         *
         * @attribute headerText
         * @type String
         * @default ''
         */
        headerText: {
            value: ''
        }

    }
});

Y.Base.modifyAttrs(Menu, {
    width: {
        value: 'auto'
    },
    footerContent: {
        value: ''
    },
    hideOn: {
        value: [
            {
                eventName: 'clickoutside'
            }
        ]
    }
});

Y.namespace('M.editor_atto').Menu = Menu;
