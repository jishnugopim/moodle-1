// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Atto editor.
 *
 * @package    editor_atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Classes constants.
 */
CSS = {
    CONTENT: 'editor_atto_content',
    CONTENTWRAPPER: 'editor_atto_content_wrap',
    TOOLBAR: 'editor_atto_toolbar',
    WRAPPER: 'editor_atto',
    HIGHLIGHT: 'highlight'
};

/**
 * Atto editor main class.
 * Common functions required by editor plugins.
 *
 * @package    editor_atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
M.editor_atto = M.editor_atto || {

    /**
     * List of known block level tags.
     * Taken from "https://developer.mozilla.org/en-US/docs/HTML/Block-level_elements".
     *
     * @type {Array}
     */
    BLOCK_TAGS : [
        'address',
        'article',
        'aside',
        'audio',
        'blockquote',
        'canvas',
        'dd',
        'div',
        'dl',
        'fieldset',
        'figcaption',
        'figure',
        'footer',
        'form',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'header',
        'hgroup',
        'hr',
        'noscript',
        'ol',
        'output',
        'p',
        'pre',
        'section',
        'table',
        'tfoot',
        'ul',
        'video'],

    PLACEHOLDER_FONTNAME: 'yui-tmp',
    ALL_NODES_SELECTOR: '[style],font[face]',
    FONT_FAMILY: 'fontFamily',

    /**
     * List of attached button handlers to prevent duplicates.
     */
    buttonhandlers : {},

    /**
     * List of attached handlers.
     */
    textupdatedhandlers : {},

    /**
     * List of YUI overlays for custom menus.
     */
    menus : {},

    /**
     * List of attached menu handlers to prevent duplicates.
     */
    menuhandlers : {},

    /**
     * List of file picker options for specific editor instances.
     */
    filepickeroptions : {},

    /**
     * List of buttons and menus that have been added to the toolbar.
     */
    widgets : {},

    /**
     * List of saved selections per editor instance.
     */
    selections : {},

    focusfromclick : false,

    /**
     * Set to true after events have been published for M.editor_atto.
     * @param eventspublished
     * @type boolean
     */
    eventspublished : false,

    /**
     * Set to true after the first editor has been initialised.
     *
     * "The first transport is away. The first transport is away."
     *     ―Lieutenant Romas Navander, during the Battle of Hoth
     *
     * @param firstinit
     * @type boolean
     */
    firstinit : true,

    /**
     * Toggle a menu.
     * @param event e
     */
    showhide_menu_handler : function(e) {
        e.preventDefault();
        var disabled = this.getAttribute('disabled');
        var overlayid = this.getAttribute('data-menu');
        var overlay = M.editor_atto.menus[overlayid];
        var menu = overlay.get('bodyContent');
        if (overlay.get('visible') || disabled) {
            overlay.hide();
            menu.detach('clickoutside');
        } else {
            menu.on('clickoutside', function(ev) {
                if ((ev.target.ancestor() !== this) && (ev.target !== this)) {
                    if (overlay.get('visible')) {
                        menu.detach('clickoutside');
                        overlay.hide();
                    }
                }
            }, this);

            overlay.align(Y.one(Y.config.doc.body), [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
            overlay.show();
            var icon = e.target.ancestor('button', true).one('img');
            overlay.align(icon, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
            overlay.get('boundingBox').one('a').focus();
        }
    },

    /**
     * Handle clicks on editor buttons.
     * @param event e
     */
    buttonclicked_handler : function(e) {
        var elementid = this.getAttribute('data-editor');
        var plugin = this.getAttribute('data-plugin');
        var button = this.getAttribute('data-button');
        var handler = this.getAttribute('data-handler');
        var overlay = M.editor_atto.menus[plugin + '_' + elementid];
        var toolbar = M.editor_atto.get_toolbar_node(elementid);
        var currentid = toolbar.getAttribute('aria-activedescendant');

        // Right now, currentid is the id of the previously selected button.
        if (currentid) {
            current = Y.one('#' + currentid);
            // We only ever want one button with a tabindex of 0 at any one time.
            current.setAttribute('tabindex', '-1');
        }
        this.setAttribute('tabindex', 0);
        // And update the activedescendant to point at the currently selected button.
        toolbar.setAttribute('aria-activedescendant', this.generateID());

        if (overlay) {
            overlay.hide();
        }

        if (M.editor_atto.is_enabled(elementid, plugin, button)) {
            // Pass it on.
            handler = M.editor_atto.buttonhandlers[handler];
            return handler(e, elementid);
        }
    },

    /**
     * Disable all buttons and menus in the toolbar.
     * @param string elementid, the element id of this editor.
     */
    disable_all_widgets : function(elementid) {
        var plugin, element, toolbar = M.editor_atto.get_toolbar_node(elementid);
        for (plugin in M.editor_atto.widgets) {
            element = toolbar.one('.atto_' + plugin + '_button');

            if (element) {
                element.setAttribute('disabled', 'true');
            }
        }
    },

    /**
     * Get the node of the original textarea element that this editor replaced.
     *
     * @param string elementid, the element id of this editor.
     * @return Y.Node
     */
    get_textarea_node : function(elementid) {
        // Note - it is not safe to use a CSS selector like '#' + elementid
        // because the id may have colons in it - e.g. quiz.
        return Y.one(document.getElementById(elementid));
    },

    /**
     * Get the node of the toolbar container for this editor.
     *
     * @param string elementid, the element id of this editor.
     * @return Y.Node
     */
    get_toolbar_node : function(elementid) {
        // Note - it is not safe to use a CSS selector like '#' + elementid
        // because the id may have colons in it - e.g. quiz.
        return Y.one(document.getElementById(elementid + '_toolbar'));
    },

    /**
     * Get the node of the contenteditable container for this editor.
     *
     * @param string elementid, the element id of this editor.
     * @return Y.Node
     */
    get_editable_node : function(elementid) {
        // Note - it is not safe to use a CSS selector like '#' + elementid
        // because the id may have colons in it - e.g. quiz.
        return Y.one(document.getElementById(elementid + 'editable'));
    },

    /**
     * Determine if the specified toolbar button/menu is enabled.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the plugin that created the button/menu.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    is_enabled : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        return !element.hasAttribute('disabled');
    },

    /**
     * Determine if the specified toolbar button/menu is highlighted.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the plugin that created the button/menu.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    is_highlighted : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        return !element.hasClass(CSS.HIGHLIGHT);
    },

    /**
     * Enable a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    enable_widget : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.removeAttribute('disabled');
        }
    },

    /**
     * Highlight a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    add_widget_highlight : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.addClass(CSS.HIGHLIGHT);
        }
    },

    /**
     * Unhighlight a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    remove_widget_highlight : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.removeClass(CSS.HIGHLIGHT);
        }
    },

    /**
     * Enable all buttons and menus in the toolbar.
     * @param string elementid, the element id of this editor.
     */
    enable_all_widgets : function(elementid) {
        var path, element;
        for (path in M.editor_atto.widgets) {
            element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + path + '_button');

            if (element) {
                element.removeAttribute('disabled');
            }
        }
    },

    /**
     * Add a content update handler to be called whenever the content is updated.
     *
     * @param string elementid - the id of the textarea we created this editor from.
     * @handler function callback - The function to do the cleaning.
     * @param object context - the context to set for the callback.
     * @handler function handler - A function to call when the button is clicked.
     */
    add_text_updated_handler : function(elementid, callback) {
        if (!(elementid in M.editor_atto.textupdatedhandlers)) {
            M.editor_atto.textupdatedhandlers[elementid] = [];
        }
        M.editor_atto.textupdatedhandlers[elementid].push(callback);
    },

    /**
     * Add a button to the toolbar belonging to the editor for element with id "elementid".
     * @param string elementid - the id of the textarea we created this editor from.
     * @param string plugin - the plugin defining the button
     * @param string icon - the html used for the content of the button
     * @param string groupname - the group the button should be appended to.
     * @param array entries - List of menu entries with the string (entry.text) and the handlers (entry.handler).
     * @param string buttonname - (optional) a name for the button. Required if a plugin creates more than one button.
     * @param string buttontitle - (optional) a title for the button. Required if a plugin creates more than one button.
     * @param int overlaywidth - the overlay width size in 'ems'.
     * @param string menucolor - menu icon background color
     */
    add_toolbar_menu : function(elementid, plugin, iconurl, groupname, entries, buttonname, buttontitle, overlaywidth, menucolor) {
        var toolbar = M.editor_atto.get_toolbar_node(elementid),
            group = toolbar.one('.atto_group.' + groupname + '_group'),
            currentfocus,
            button,
            buttonpath,
            expimgurl;

        if (buttonname) {
            buttonpath = plugin + '_' + buttonname;
        } else {
            buttonname = '';
            buttonpath = plugin;
        }

        if (!buttontitle) {
            buttontitle = M.util.get_string('pluginname', 'atto_' + plugin);
        }

        if ((typeof overlaywidth) === 'undefined') {
            overlaywidth = '14';
        }
        if ((typeof menucolor) === 'undefined') {
            menucolor = 'transparent';
        }

        if (!group) {
            group = Y.Node.create('<div class="atto_group ' + groupname + '_group"></div>');
            toolbar.append(group);
        }
        expimgurl = M.util.image_url('t/expanded', 'moodle');
        button = Y.Node.create('<button class="atto_' + buttonpath + '_button atto_hasmenu" ' +
                                    'data-editor="' + Y.Escape.html(elementid) + '" ' +
                                    'tabindex="-1" ' +
                                    'type="button" ' +
                                    'data-menu="' + buttonpath + '_' + elementid + '" ' +
                                    'title="' + Y.Escape.html(buttontitle) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" '+
                                    'style="background-color:' + menucolor + ';" src="' + iconurl + '"/>' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + expimgurl + '"/>' +
                                    '</button>');

        group.append(button);

        currentfocus = toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // Save the name of the plugin.
        M.editor_atto.widgets[buttonpath] = buttonpath;

        var menu = Y.Node.create('<div class="atto_' + buttonpath + '_menu' +
                                 ' atto_menu" data-editor="' + Y.Escape.html(elementid) + '"' +
                                 ' style="min-width:' + (overlaywidth-2) + 'em"' +
                                 '"></div>');
        var i = 0, entry = {};

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            var insidemenu = Y.Node.create('<div tabindex="-1" class="atto_menuentry">' +
                '<a href="#" class="atto_' + buttonpath + '_action_' + i + '" ' +
                'data-editor="' + Y.Escape.html(elementid) + '" ' +
                'data-plugin="' + Y.Escape.html(plugin) + '" ' +
                'data-button="' + Y.Escape.html(buttonname) + '" ' +
                'data-handler="' + Y.Escape.html(buttonpath + '_action_' + i) + '">' +
                entry.text +
                '</a>' +
                '</div>');
            insidemenu.on("keydown", M.editor_atto.menu_item_arrow_key_handler, null, button);
            menu.append(insidemenu);
            if (!M.editor_atto.buttonhandlers[plugin + '_action_' + i]) {
                Y.one('body').delegate('click', M.editor_atto.buttonclicked_handler, '.atto_' + buttonpath + '_action_' + i);
                // Activate the link on space or enter.
                Y.one('body').delegate('key', M.editor_atto.buttonclicked_handler, '32,enter', '.atto_' + buttonpath + '_action_' + i);
                M.editor_atto.buttonhandlers[buttonpath + '_action_' + i] = entry.handler;
            }
        }

        if (!M.editor_atto.buttonhandlers[buttonpath]) {
            Y.one('body').delegate('click', M.editor_atto.showhide_menu_handler, '.atto_' + buttonpath + '_button');
            M.editor_atto.buttonhandlers[buttonpath] = true;
        }

        var overlay = new M.core.dialogue({
            bodyContent : menu,
            visible : false,
            width: overlaywidth + 'em',
            closeButton: false,
            center : false,
            render: true
        });

        M.editor_atto.menus[buttonpath + '_' + elementid] = overlay;
        overlay.align(button, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
        overlay.headerNode.hide();
    },

    /**
     * Handle arrow key on the menu items.
     *
     * @param event e the key event.
     * @param Y.Node the button calling the menu..
     */
    menu_item_arrow_key_handler : function(e, button) {
        var siblings;

        // Intercept the down and left keys.
        if (e.keyCode === 40 || e.keyCode === 37) {
            e.preventDefault();
            var nextsibling = e.currentTarget.get('nextSibling');

            // If no next sibling the we are the last sibling, go to the first one.
            if(nextsibling === null) {
                siblings = e.currentTarget.siblings();
                nextsibling = siblings.item(0);
            }

            nextsibling.get('firstChild').focus();
        } else if (e.keyCode === 38 || e.keyCode === 39) {
            // Intercept the up and right keys.
            e.preventDefault();
            var previoussibling = e.currentTarget.get('previousSibling');

            // If no preious sibling the we are the first sibling, go to the last one.
            if(previoussibling === null) {
                siblings = e.currentTarget.siblings();
                previoussibling = siblings.item(siblings.size() - 1);
            }

            previoussibling.get('firstChild').focus();
        } else if (e.keyCode === 9 || e.keyCode === 27) {
            // On the tab or esc key we close the menu.
            e.preventDefault();
            var overlay = M.editor_atto.menus[button.getAttribute('data-menu')];
            var menu = overlay.get('bodyContent');
            overlay.hide();
            menu.detach('clickoutside');
            // Put back the focus on the button.
            button.focus();

        }
    },

    /**
     * Add a button to the toolbar belonging to the editor for element with id "elementid".
     * @param string elementid - the id of the textarea we created this editor from.
     * @param string plugin - the plugin defining the button.
     * @param string icon - the url to the image for the icon
     * @param string groupname - the group the button should be appended to.
     * @handler function handler- A function to call when the button is clicked.
     * @param string buttonname - (optional) a name for the button. Required if a plugin creates more than one button.
     * @param string buttontitle - (optional) a title for the button. Required if a plugin creates more than one button.
     */
    add_toolbar_button : function(elementid, plugin, iconurl, groupname, handler, buttonname, buttontitle) {
        var toolbar = M.editor_atto.get_toolbar_node(elementid),
            group = toolbar.one('.atto_group.' + groupname + '_group'),
            button,
            buttonpath,
            currentfocus;

        if (buttonname) {
            buttonpath = plugin + '_' + buttonname;
        } else {
            buttonname = '';
            buttonpath = plugin;
        }

        if (!buttontitle) {
            buttontitle = M.util.get_string('pluginname', 'atto_' + plugin);
        }

        if (!group) {
            group = Y.Node.create('<div class="atto_group ' + groupname +'_group"></div>');
            toolbar.append(group);
        }
        button = Y.Node.create('<button class="atto_' + buttonpath + '_button" ' +
                               'data-editor="' + Y.Escape.html(elementid) + '" ' +
                               'data-plugin="' + Y.Escape.html(plugin) + '" ' +
                               'data-button="' + Y.Escape.html(buttonname) + '" ' +
                               'tabindex="-1" ' +
                               'data-handler="' + Y.Escape.html(buttonpath) + '" ' +
                               'title="' + Y.Escape.html(buttontitle) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + iconurl + '"/>' +
                               '</button>');

        group.append(button);

        currentfocus = toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // We only need to attach this once.
        if (!M.editor_atto.buttonhandlers[buttonpath]) {
            Y.one('body').delegate('click', M.editor_atto.buttonclicked_handler, '.atto_' + buttonpath + '_button');
            M.editor_atto.buttonhandlers[buttonpath] = handler;
        }

        // Save the name of the plugin.
        M.editor_atto.widgets[buttonpath] = buttonpath;

    },

    /**
     * Focus on the editable area for this editor.
     * @param string elementid of this editor
     */
    focus : function(elementid) {
        M.editor_atto.get_editable_node(elementid).focus();
    },

    /**
     * Copy and clean the text from the textarea into the contenteditable div.
     * If the text is empty, provide a default paragraph tag to hold the content.
     *
     * @param string elementid of this editor
     */
    update_from_textarea : function(elementid) {
        var editable = M.editor_atto.get_editable_node(elementid);
        var textarea = M.editor_atto.get_textarea_node(elementid);

        // Clear it first.
        editable.setHTML('');

        // Copy text to editable div.
        editable.append(textarea.get('value'));

        // Clean it.
        editable.cleanHTML();

        // Insert a paragraph in the empty contenteditable div.
        if (editable.getHTML() === '') {
            if (Y.UA.ie && Y.UA.ie < 10) {
                editable.setHTML('<p></p>');
            } else {
                editable.setHTML('<p><br></p>');
            }
        }
    },

    /**
     * Initialise the editor
     * @param object params for this editor instance.
     */
    init : function(params) {
        // Some things we only want to do on the first init.
        var firstinit = this.firstinit;
        this.firstinit = false;
        var wrapper = Y.Node.create('<div class="' + CSS.WRAPPER + '" />');
        var atto = Y.Node.create('<div id="' + params.elementid + 'editable" ' +
                                            'contenteditable="true" ' +
                                            'role="textbox" ' +
                                            'spellcheck="true" ' +
                                            'aria-live="off" ' +
                                            'class="' + CSS.CONTENT + '" '+
                                            'data-editor="' + params.elementid + '" />');

        var toolbar = Y.Node.create('<div class="' + CSS.TOOLBAR + '" id="' + params.elementid + '_toolbar" role="toolbar" aria-live="off"/>');

        // Editable content wrapper.
        var content = Y.Node.create('<div class="' + CSS.CONTENTWRAPPER + '" />');
        var textarea = M.editor_atto.get_textarea_node(params.elementid);
        var label = Y.one('[for="' + params.elementid + '"]');

        // Add a labelled-by attribute to the contenteditable.
        if (label) {
            label.generateID();
            atto.setAttribute('aria-labelledby', label.get("id"));
            toolbar.setAttribute('aria-labelledby', label.get("id"));
        }

        content.appendChild(atto);

        // Add everything to the wrapper.
        wrapper.appendChild(toolbar);
        wrapper.appendChild(content);

        // Style the editor.
        atto.setStyle('minHeight', (1.2 * (textarea.getAttribute('rows'))) + 'em');


        // Add the toolbar and editable zone to the page.
        textarea.get('parentNode').insert(wrapper, textarea);

        // Disable odd inline CSS styles.
        M.editor_atto.disable_css_styling();

        // Hide the old textarea.
        textarea.hide();

        // Copy the text to the contenteditable div.
        this.update_from_textarea(params.elementid);

        this.publish_events();
        atto.on('atto:selectionchanged', this.save_selection, this, params.elementid);
        if (firstinit) {
            // Aha this is the first initialisation.
            // Publish our custom events.
            this.publish_events();
            // Start tracking selections.
            this.on('atto:selectionchanged', this.save_selection, this);
        }

        atto.on('focus', this.restore_selection, this, params.elementid);
        // Do not restore selection when focus is from a click event.
        atto.on('mousedown', function() { this.focusfromclick = true; }, this);

        // Copy the current value back to the textarea when focus leaves us and save the current selection.
        atto.on('blur', function() {
            this.focusfromclick = false;
            this.text_updated(params.elementid);
        }, this);

        // Use paragraphs not divs.
        if (document.queryCommandSupported('DefaultParagraphSeparator')) {
            document.execCommand('DefaultParagraphSeparator', false, 'p');
        }
        // Listen for Arrow left and Arrow right keys.
        Y.one(Y.config.doc.body).delegate('key',
                                          this.keyboard_navigation,
                                          'down:37,39',
                                          '#' + params.elementid + '_toolbar',
                                          this,
                                          params.elementid);

        // Save the file picker options for later.
        M.editor_atto.filepickeroptions[params.elementid] = params.filepickeroptions;

        // Init each of the plugins
        var i, j, group, plugin;
        for (i = 0; i < params.plugins.length; i++) {
            group = params.plugins[i].group;
            for (j = 0; j < params.plugins[i].plugins.length; j++) {
                plugin = params.plugins[i].plugins[j];
                plugin.params.elementid = params.elementid;
                plugin.params.group = group;

                M['atto_' + plugin.name].init(plugin.params);
            }
        }

        // Let the plugins run some init code once all plugins are in the page.
        for (i = 0; i < params.plugins.length; i++) {
            group = params.plugins[i].group;
            for (j = 0; j < params.plugins[i].plugins.length; j++) {
                plugin = params.plugins[i].plugins[j];
                plugin.params.elementid = params.elementid;
                plugin.params.group = group;

                if (typeof M['atto_' + plugin.name].after_init !== 'undefined') {
                    M['atto_' + plugin.name].after_init(plugin.params);
                }
            }
        }

    },

    /**
     * Add code to trigger the a set of custom events on either the toolbar, or the contenteditable node
     * that can be listened to by plugins (or even this class).
     * @param string elementid - the id of the textarea we created this editor from.
     */
    publish_events : function() {
        if (!this.eventspublished) {
            Y.publish('atto:selectionchanged', {prefix: 'atto'});
            Y.delegate(['mouseup', 'keyup', 'focus'], this._has_selection_changed, document.body, '.' + CSS.CONTENT, this);
            this.eventspublished = true;
        }
    },

    /**
     * The text in the contenteditable region has been updated,
     * clean and copy the buffer to the text area.
     * @param string elementid - the id of the textarea we created this editor from.
     */
    text_updated : function(elementid) {
        var textarea = M.editor_atto.get_textarea_node(elementid),
            cleancontent = this.get_clean_html(elementid);
        textarea.set('value', cleancontent);
        // Trigger the onchange callback on the textarea, essentially to notify moodle-core-formchangechecker.
        textarea.simulate('change');
        // Trigger handlers for this action.
        var i = 0;
        if (elementid in M.editor_atto.textupdatedhandlers) {
            for (i = 0; i < M.editor_atto.textupdatedhandlers[elementid].length; i++) {
                var callback = M.editor_atto.textupdatedhandlers[elementid][i];
                callback(elementid);
            }
        }
    },

    /**
     * Remove all YUI ids from the generated HTML.
     * @param string elementid - the id of the textarea we created this editor from.
     * @return string HTML stripped of YUI ids
     */
    get_clean_html : function(elementid) {
        var atto = M.editor_atto.get_editable_node(elementid).cloneNode(true);

        Y.each(atto.all('[id]'), function(node) {
            var id = node.get('id');
            if (id.indexOf('yui') === 0) {
                node.removeAttribute('id');
            }
        });

        // Remove any and all nasties from source.
        atto.cleanHTML();

        // Revert untouched editor contents to an empty string.
        if (atto.getHTML() === '<p></p>' || atto.getHTML() === '<p><br></p>') {
            atto.setHTML('');
        }

        return atto.getHTML();
    },

    /**
     * Implement arrow key navigation for the buttons in the toolbar.
     * @param Event e - the keyboard event.
     * @param string elementid - the id of the textarea we created this editor from.
     */
    keyboard_navigation : function(e, elementid) {
        var buttons,
            current,
            currentid,
            currentindex,
            toolbar = M.editor_atto.get_toolbar_node(elementid);

        e.preventDefault();

        // This workaround is because we cannot do ".atto_group:not([hidden]) button" in ie8 (even with selector-css3).
        // Create an empty NodeList.
        buttons = toolbar.all('empty');
        toolbar.all('.atto_group').each(function(group) {
            if (!group.hasAttribute('hidden')) {
                // Append the visible buttons to the buttons list.
                buttons = buttons.concat(group.all('button'));
            }
        });
        // The currentid is the id of the previously selected button.
        currentid = toolbar.getAttribute('aria-activedescendant');
        if (!currentid) {
            return;
        }
        // We only ever want one button with a tabindex of 0.
        current = Y.one('#' + currentid);
        current.setAttribute('tabindex', '-1');

        currentindex = buttons.indexOf(current);

        if (e.keyCode === 37) {
            // Left
            currentindex--;
            if (currentindex < 0) {
                currentindex = buttons.size()-1;
            }
        } else {
            // Right
            currentindex++;
            if (currentindex >= buttons.size()) {
                currentindex = 0;
            }
        }
        // Currentindex has been updated to point to the new button.
        current = buttons.item(currentindex);
        current.setAttribute('tabindex', '0');
        current.focus();
        toolbar.setAttribute('aria-activedescendant', current.generateID());
    },

    /**
     * Should we show the filepicker for this filetype?
     *
     * @param string elementid for this editor instance.
     * @param string type The media type for the file picker
     * @return boolean
     */
    can_show_filepicker : function(elementid, type) {
        var options = M.editor_atto.filepickeroptions[elementid];
        return ((typeof options[type]) !== "undefined");
    },

    /**
     * Show the filepicker.
     * @param string elementid for this editor instance.
     * @param string type The media type for the file picker
     * @param function callback
     */
    show_filepicker : function(elementid, type, callback) {
        Y.use('core_filepicker', function (Y) {
            var options = M.editor_atto.filepickeroptions[elementid][type];

            options.formcallback = callback;

            M.core_filepicker.show(Y, options);
        });
    },

    /**
     * Disable CSS styling.
     *
     * @return {Void}
     */
    disable_css_styling: function() {
        try {
            document.execCommand("styleWithCSS", 0, false);
        } catch (e1) {
            try {
                document.execCommand("useCSS", 0, true);
            } catch (e2) {
                try {
                    document.execCommand('styleWithCSS', false, false);
                } catch (e3) {
                    // We did our best.
                }
            }
        }
    },

    /**
     * Enable CSS styling.
     *
     * @return {Void}
     */
    enable_css_styling: function() {
        try {
            document.execCommand("styleWithCSS", 0, true);
        } catch (e1) {
            try {
                document.execCommand("useCSS", 0, false);
            } catch (e2) {
                try {
                    document.execCommand('styleWithCSS', false, true);
                } catch (e3) {
                    // We did our best.
                }
            }
        }
    },

    /**
     * Change the formatting for the current selection.
     * Wraps the selection in spans and adds the provides classes.
     *
     * If the selection covers multiple block elements, multiple spans will be inserted to preserve the original structure.
     *
     * @method toggle_inline_selection_class
     * @param {String} elementid - The editor elementid.
     * @param {Array} toggleclasses - Class names to be toggled on or off.
     */
    toggle_inline_selection_class: function(elementid, toggleclasses) {
        var selectionparentnode = M.editor_atto.get_selection_parent_node(),
            root = Y.one('body'),
            nodes,
            items = [],
            parentspan,
            currentnode,
            newnode,
            i = 0;

        if (!selectionparentnode) {
            // No selection, nothing to format.
            return;
        }

        // Add a bogus fontname as the browsers handle inserting fonts into multiple blocks correctly.
        document.execCommand('fontname', false, M.editor_atto.PLACEHOLDER_FONTNAME);
        nodes = root.all(M.editor_atto.ALL_NODES_SELECTOR);

        // Create a list of all nodes that have our bogus fontname.
        nodes.each(function(node, index) {
            if (node.getStyle(M.editor_atto.FONT_FAMILY) === M.editor_atto.PLACEHOLDER_FONTNAME) {
                node.setStyle(M.editor_atto.FONT_FAMILY, '');
                if (!node.compareTo(root)) {
                    items.push(Y.Node.getDOMNode(nodes.item(index)));
                }
            }
        });

        // Replace the fontname tags with spans
        for (i = 0; i < items.length; i++) {
            currentnode = Y.one(items[i]);

            // Check for an existing span to add the nolink class to.
            parentspan = currentnode.ancestor('.editor_atto_content span');
            if (!parentspan) {
                newnode = Y.Node.create('<span></span>');
                newnode.append(items[i].innerHTML);
                currentnode.replace(newnode);

                currentnode = newnode;
            } else {
                currentnode = parentspan;
            }

            // Toggle the classes on the spans.
            for (var j = 0; j < toggleclasses.length; j++) {
                currentnode.toggleClass(toggleclasses[j]);
            }
        }
    }
};

// The editor_atto is publishing custom events that can be subscribed to.
Y.augment(M.editor_atto, Y.EventTarget);
