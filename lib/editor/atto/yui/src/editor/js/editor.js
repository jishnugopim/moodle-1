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
     * List of attached handlers.
     */
    textupdatedhandlers : {},

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
    }
};

// The editor_atto is publishing custom events that can be subscribed to.
Y.augment(M.editor_atto, Y.EventTarget);
