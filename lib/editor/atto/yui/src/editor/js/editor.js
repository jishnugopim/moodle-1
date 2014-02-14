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
 * The Atto Editor for Moodle.
 *
 * @module moodle-editor_atto-editor
 * @package    editor_atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var CSS = {
        CONTENT: 'editor_atto_content',
        CONTENTWRAPPER: 'editor_atto_content_wrap',
        TOOLBAR: 'editor_atto_toolbar',
        WRAPPER: 'editor_atto'
    },
    BLOCKTAGS = [
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
        'video'
    ];



/**
 * The Atto Editor for Moodle
 *
 * @namespace M.editor_atto
 * @class Editor
 * @constructor
 */
function Editor() {
    Editor.superclass.constructor.apply(this, arguments);
}

Y.extend(Editor, Y.Base, {
    /**
     * References to each of the initialised plugins.
     *
     * @property _plugins
     * @private
     * @type object
     */
    _plugins: {},

    /**
     * A reference to the editor event Handlers.
     *
     * @property editorEvents
     * @protected
     * @type array
     */
    editorEvents: [],

    /**
     * Whether to focus from click??
     * TODO check with Damyon
     *
     * @property focusfromclick
     * @default false
     * @type boolean
     */
    focusfromclick: false,

    /**
     * Initializer to set up the instance.
     *
     * TODO rewrite some more
     *
     * @metod initializer
     */
    initializer: function() {
        var textarea = this.get('textarea'),
            areaid = textarea.get('id');

        var wrapper = Y.Node.create('<div class="' + CSS.WRAPPER + '" />');
        var atto = Y.Node.create('<div id="' + areaid + 'editable" ' +
                                            'contenteditable="true" ' +
                                            'role="textbox" ' +
                                            'spellcheck="true" ' +
                                            'aria-live="off" ' +
                                            'class="' + CSS.CONTENT + '" />');

        var toolbar = Y.Node.create('<div class="' + CSS.TOOLBAR + '" role="toolbar" aria-live="off"/>');

        // Editable content wrapper.
        var content = Y.Node.create('<div class="' + CSS.CONTENTWRAPPER + '" />');
        var label = Y.one('[for="' + areaid + '"]');

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

        // Copy text to editable div.
        atto.append(textarea.get('value'));

        this.setAttrs({
            editor: atto,
            toolbar: toolbar
        });

        // Clean te editor content.
        this.cleanEditorHTML();

        // Add the toolbar and editable zone to the page.
        textarea.get('parentNode').insert(wrapper, textarea);

        // Hide the old textarea.
        textarea.hide();


        // Disable odd inline CSS styles.
        try {
            document.execCommand("styleWithCSS", 0, false);
        } catch (e1) {
            try {
                document.execCommand("useCSS", 0, true);
            } catch (e2) {
                try {
                    document.execCommand('styleWithCSS', false, false);
                }
                catch (e3) {
                    // We did our best.
                }
            }
        }

        // Set up the handlers.
        this.setupChangeHandlers();
        //
        // Publish events for this editor.
        this.publishEvents();

        // Set up the editor plugins.
        this.setupPlugins();
    },

    // TODO
    setupChangeHandlers: function() {
        var editor = this.get('editor'),
            toolbar = this.get('toolbar');

        this.editorEvents.push(
            editor.on('keydown, mouseup', this.saveSelection, this),
            editor.on('focus', this.restoreSelection, this),

            // Do not restore selection when focus is from a click event.
            editor.on('mousedown', function() { this.focusfromclick = true; }, this),

            // Copy the current value back to the textarea when focus leaves us and save the current selection.
            editor.on('blur', function() {
                this.focusfromclick = false;
                this.updateOriginal();
            }, this),

            // Listen for Arrow left and Arrow right keys.
            toolbar.on('key',
                    this.toolbarNavigation,
                    'down:37,39',
                    this)
        );

    },

    /**
     * Publish events for this editor instance.
     *
     * @method publishEvents
     * @private
     * @chainable
     */
    publishEvents: function() {
        this.publish('change', {
            broadcast: true,
            preventable: true
        });

        this.publish('pluginsloaded', {
            fireOnce: true
        });

        return this;
    },

    /**
     * Set up the plugins for this editor instance.
     *
     * @method setupPlugins
     * @private
     * @chainable
     */
    setupPlugins: function() {
        var plugins = this.get('plugins');

        // The plugins structure is:
        // [
        //     {
        //         "group": "groupName",
        //         "plugins": [
        //             "pluginName": {
        //                 "plugin": "config"
        //             },
        //             "pluginName": {
        //                 "plugin": "config"
        //             }
        //         ]
        //     },
        //     {
        //         "group": "groupName",
        //         "plugins": [
        //             "pluginName": {
        //                 "plugin": "config"
        //             }
        //         ]
        //     }
        // ]

        var groupIndex,
            group,
            pluginIndex,
            plugin,
            pluginConfig;

        // Some instance variables which every plugin will get given:
        var editor = this.get('editor'),
            toolbar = this.get('toolbar');

        for (groupIndex in plugins) {
            group = plugins[groupIndex];
            if (!group.plugins) {
                // No plugins in this group - skip it.
                continue;
            }
            for (pluginIndex in group.plugins) {
                plugin = group.plugins[pluginIndex];

                pluginConfig = Y.mix({
                    name: plugin.name,
                    group: group.group,
                    editor: editor,
                    toolbar: toolbar,
                    host: this
                }, plugin);

                // Add a reference to the current editor.
                if (typeof Y.M['atto_' + plugin.name] === "undefined") {
                    Y.log("Plugin '" + plugin.name + "' could not be found - skipping initialisation", "warn", "moodle-editor_atto-editor");
                    continue;
                }
                this._plugins[plugin.name] = new Y.M['atto_' + plugin.name].Button(pluginConfig);
            }
        }

        // Some plugins need to perform actions once all plugins have loaded.
        this.fire('pluginsloaded');

        return this;
    },


    /**
     * @TODO Replace with property?
     * this.toolbar
     *
     * Get the node of the toolbar container for this editor.
     *
     * @method get_toolbar_node
     * @deprecated
     * @return Node
     */
    get_toolbar_node : function() {
        Y.log("Deprecated get_toolbar_node");
        return this.get('toolbar');
    },

    /**
     * Focus on the editable area for this editor.
     *
     * @method focus
     * @param string elementid of this editor
     * @chainable
     */
    focus: function() {
        this.get('editor').focus();
        return this;
    },

    /**
     * Work out if the cursor is in the editable area for this editor instance.
     *
     * @method isActive
     * @param string elementid of this editor
     * @return bool
     */
    isActive: function() {
        var selection = this.getSelection();

        if (selection.length) {
            selection = selection.pop();
        }

        var node = null;
        if (selection.parentElement) {
            node = Y.one(selection.parentElement());
        } else {
            node = Y.one(selection.startContainer);
        }

        return node && this.get('editor').contains(node);
    },


    //
    // Filepicker handling.
    //

    /**
     * Should we show the filepicker for this filetype?
     *
     * @param string elementid for this editor instance.
     * @param string type The media type for the file picker
     * @return boolean
     */
    can_show_filepicker : function(elementid, type) {
        var options = this.get('filepickeroptions')[elementid];
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
            var options = this.get('filepickeroptions')[elementid][type];

            options.formcallback = callback;

            M.core_filepicker.show(Y, options);
        });
    },

    /**
     * Copy the text from the contenteditable to the textarea which it replaced.
     *
     * @method updateOriginal
     * @private
     * @chainable
     */
    updateOriginal : function() {
        var textarea = this.get('textarea');

        // Insert the cleaned content.
        textarea.set('value', this.getCleanHTML());

        // Trigger the onchange callback on the textarea, essentially to notify moodle-core-formchangechecker.
        // TODO check whether there's a better way of doing this :\
        textarea.simulate('change');

        // Trigger handlers for this action.
        this.fire('change');
    },

    /**
     * Clean the generated HTML content without modifying the editor content.
     *
     * This includes removes all YUI ids from the generated content.
     *
     * @return string The claned HTML content
     */
    getCleanHTML: function() {
        // Clone the editor so that we don't actually modify the real content.
        var editorClone = this.get('editor').cloneNode(true);

        // Remove all YUI IDs.
        Y.each(editorClone.all('[id^="yui"]'), function(node) {
            node.removeAttribute('id');
        });

        editorClone.all('.atto_control').remove(true);

        // Remove any and all nasties from source.
       return this._cleanHTML(editorClone.get('innerHTML'));
    },

    /**
     * Clean the HTML content of the editor.
     *
     * @method cleanEditorHTML
     * @chainable
     */
    cleanEditorHTML: function() {
        var startValue = this.get('editor').get('innerHTML');
        this.get('editor').set('innerHTML', this._cleanHTML(startValue));

        return this;
    },

    /**
     * Clean the HTML content and remove any content which could cause
     * issues.
     *
     * @method _cleanHTML
     * @private
     * @param {String} content The content to clean
     * @return String The cleaned HTML
     */
    _cleanHTML: function(content) {
        // What are we doing ?
        // We are cleaning random HTML from all over the shop into a set of useful html suitable for content.
        // We are allowing styles etc, but not e.g. font tags, class="MsoNormal" etc.

        var rules = [
            // Source: "http://stackoverflow.com/questions/2875027/clean-microsoft-word-pasted-text-using-javascript"
            // Source: "http://stackoverflow.com/questions/1068280/javascript-regex-multiline-flag-doesnt-work"

            // Remove all HTML comments.
            {regex: /<!--[\s\S]*?-->/gi, replace: ""},
            // Source: "http://www.1stclassmedia.co.uk/developers/clean-ms-word-formatting.php"
            // Remove <?xml>, <\?xml>.
            {regex: /<\\?\?xml[^>]*>/gi, replace: ""},
            // Remove <o:blah>, <\o:blah>.
            {regex: /<\/?\w+:[^>]*>/gi, replace: ""}, // e.g. <o:p...
            // Remove MSO-blah, MSO:blah (e.g. in style attributes)
            {regex: /\s*MSO[-:][^;"']*;?/gi, replace: ""},
            // Remove empty spans
            {regex: /<span[^>]*>(&nbsp;|\s)*<\/span>/gi, replace: ""},
            // Remove class="Msoblah"
            {regex: /class="Mso[^"]*"/gi, replace: ""},

            // Source: "http://www.codinghorror.com/blog/2006/01/cleaning-words-nasty-html.html"
            // Remove forbidden tags for content, title, meta, style, st0-9, head, font, html, body.
            {regex: /<(\/?title|\/?meta|\/?style|\/?st\d|\/?head|\/?font|\/?html|\/?body|!\[)[^>]*?>/gi, replace: ""},

            // Source: "http://www.tim-jarrett.com/labs_javascript_scrub_word.php"
            // Replace extended chars with simple text.
            {regex: new RegExp(String.fromCharCode(8220), 'gi'), replace: '"'},
            {regex: new RegExp(String.fromCharCode(8216), 'gi'), replace: "'"},
            {regex: new RegExp(String.fromCharCode(8217), 'gi'), replace: "'"},
            {regex: new RegExp(String.fromCharCode(8211), 'gi'), replace: '-'},
            {regex: new RegExp(String.fromCharCode(8212), 'gi'), replace: '--'},
            {regex: new RegExp(String.fromCharCode(189), 'gi'), replace: '1/2'},
            {regex: new RegExp(String.fromCharCode(188), 'gi'), replace: '1/4'},
            {regex: new RegExp(String.fromCharCode(190), 'gi'), replace: '3/4'},
            {regex: new RegExp(String.fromCharCode(169), 'gi'), replace: '(c)'},
            {regex: new RegExp(String.fromCharCode(174), 'gi'), replace: '(r)'},
            {regex: new RegExp(String.fromCharCode(8230), 'gi'), replace: '...'}
        ];

        var i = 0;
        for (i = 0; i < rules.length; i++) {
            content = content.replace(rules[i].regex, rules[i].replace);
        }

        return content;
    },

    /**
     * Implement arrow key navigation for the buttons in the toolbar.
     *
     * @method toolbarNavigation
     * @param {EventFacade} e
     */
    toolbarNavigation : function(e) {
        var buttons,
            current,
            currentid,
            currentindex,
            toolbar = this.get('toolbar');

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


    //
    // Selection handling.
    //

    /**
     * Get the selection object that can be passed back to setSelection.
     *
     * @method getSelection
     * @return Range (browser dependent)
     */
    getSelection: function() {
        if (window.getSelection) {
            var sel = window.getSelection();
            var ranges = [], i = 0;
            for (i = 0; i < sel.rangeCount; i++) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        } else if (document.selection) {
            // IE < 9
            if (document.selection.createRange) {
                return document.selection.createRange();
            }
        }

        return false;
    },

    /**
     * Get the list of child nodes of the selection.
     *
     * @method getSelectionText
     * @return DOMNode[]
     */
    getSelectionText : function() {
        var selection = this.getSelection();
        if (selection.length > 0 && selection[0].cloneContents) {
            return selection[0].cloneContents();
        }
    },

    /**
     * Set the current selection. Used to restore a selection.
     *
     * @method setSelection
     * @param {Array} selection TODO Document this.
     */
    setSelection: function(selection) {
        var sel,
            i;

        if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            for (i = 0; i < selection.length; i++) {
                sel.addRange(selection[i]);
            }

        } else if (document.selection) {
            // IE < 9
            if (selection.select) {
                selection.select();
            }
        }
    },

    /**
     * Check that a YUI node it at least partly contained by the content
     * currently selected in the browser.
     *
     * @method selectionContainsNode
     * @param Node The Node to test a selection against.
     * @return boolean
     */
    selectionContainsNode : function(node) {
        var range, sel;
        if (window.getSelection) {
            sel = window.getSelection();

            if (sel.containsNode) {
                return sel.containsNode(node.getDOMNode(), true);
            }
        }
        sel = document.selection.createRange();
        range = sel.duplicate();
        range.moveToElementText(node.getDOMNode());
        return sel.inRange(range);
    },

    /**
     * Get the dom node representing the common anscestor of the selection nodes.
     * @return DOMNode or false
     */
    getSelectionParentNode: function() {
        var selection = this.getSelection();
        if (selection.length) {
            selection = selection.pop();
        }

        if (selection.commonAncestorContainer) {
            return selection.commonAncestorContainer;
        } else if (selection.parentElement) {
            return selection.parentElement();
        }
        // No selection
        return false;
    },


    /**
     * Create a cross browser selection object that represents a yui node.
     *
     * @method getSelection_from_node
     * @param Node yui node for the selection
     * @return range (browser dependent)
     */
    getSelection_from_node: function(node) {
        var range;

        if (window.getSelection) {
            range = document.createRange();

            range.setStartBefore(node.getDOMNode());
            range.setEndAfter(node.getDOMNode());
            return [range];
        } else if (document.selection) {
            range = document.body.createTextRange();
            range.moveToElementText(node.getDOMNode());
            return range;
        }
        return false;
    },



    /**
     * Get the list of child nodes of the selection.
     * @return DOMNode[]
     */
    getSelectedNodes: function() {
        var selection = this.getSelection();

        if (selection.length > 0 && selection[0].cloneContents) {
            return selection[0].cloneContents();
        }
    },

    /**
     * Save the current selection on blur, allows more reliable keyboard navigation.
     *
     * @method saveSelection
     * @chainable
     */
    saveSelection : function() {
        if (this.isActive()) {
            var sel = this.getSelection();
            if (sel.length > 0) {
                this.selection = sel;
            }
        }
        return this;
    },

    /**
     * Restore any current selection when the editor gets focus again.
     *
     * @method restoreSelection
     * @param {EventFacade} e
     * @chainable
     */
    restoreSelection : function(e) {
        e.preventDefault();

        if (!this.focusfromclick) {
            if (typeof this.selection !== "undefined") {
                this.setSelection(this.selection);
            }
        }
        this.focusfromclick = false;

        return this;
    },

    //
    // Content editable manipulation follows.
    //

    /**
     * Change the formatting for the current selection.
     *
     * Also changes the selection to the newly formatted block (allows applying multiple styles to a block).
     *
     * @method formatSelectionBlock
     * @param {String} blocktag - Change the block level tag to this. Empty string, means do not change the tag.
     * @param {Object} attributes - The keys and values for attributes to be added/changed in the block tag.
     * @return Node|null The node if there was a selection.
     */
    formatSelectionBlock: function(blocktag, attributes) {
        // First find the nearest ancestor of the selection that is a block level element.
        var selectionparentnode = this.getSelectionParentNode(),
            boundary,
            cell,
            nearestblock,
            newcontent,
            match,
            replacement;

        if (!selectionparentnode) {
            // No selection, nothing to format.
            return;
        }

        boundary = this.getEditor(elementid);

        selectionparentnode = Y.one(selectionparentnode);

        // If there is a table cell in between the selectionparentnode and the boundary,
        // move the boundary to the table cell.
        // This is because we might have a table in a div, and we select some text in a cell,
        // want to limit the change in style to the table cell, not the entire table (via the outer div).
        cell = selectionparentnode.ancestor(function (node) {
            var tagname = node.get('tagName');
            if (tagname) {
                tagname = tagname.toLowerCase();
            }
            return (node === boundary) ||
                   (tagname === 'td') ||
                   (tagname === 'th');
        }, true);

        if (cell) {
            // Limit the scope to the table cell.
            boundary = cell;
        }

        nearestblock = selectionparentnode.ancestor(BLOCKTAGS.join(', '), true);
        if (nearestblock) {
            // Check that the block is contained by the boundary.
            match = nearestblock.ancestor(function (node) {
                return node === boundary;
            }, false);

            if (!match) {
                nearestblock = false;
            }
        }

        // No valid block element - make one.
        if (!nearestblock) {
            // There is no block node in the content, wrap the content in a p and use that.
            newcontent = Y.Node.create('<p></p>');
            boundary.get('childNodes').each(function (child) {
                newcontent.append(child.remove());
            });
            boundary.append(newcontent);
            nearestblock = newcontent;
        }

        // Guaranteed to have a valid block level element contained in the contenteditable region.
        // Change the tag to the new block level tag.
        if (blocktag && blocktag !== '') {
            // Change the block level node for a new one.
            replacement = Y.Node.create('<' + blocktag + '></' + blocktag + '>');
            // Copy all attributes.
            replacement.setAttrs(nearestblock.getAttrs());
            // Copy all children.
            nearestblock.get('childNodes').each(function (child) {
                child.remove();
                replacement.append(child);
            });

            nearestblock.replace(replacement);
            nearestblock = replacement;
        }

        // Set the attributes on the block level tag.
        if (attributes) {
            nearestblock.setAttrs(attributes);
        }

        // Change the selection to the modified block. This makes sense when we might apply multiple styles
        // to the block.
        var selection = this.getSelection_from_node(nearestblock);
        this.setSelection(selection);

        return nearestblock;
    },

// TODO
//
//

    /**
     * List of YUI overlays for custom menus.
     */
    menus : {},

    /**
     * List of buttons and menus that have been added to the toolbar.
     */
    widgets : {},

    /**
     * Disable all buttons and menus in the toolbar.
     *
     * @method disableAllPluginButtons
     * @chainable
     */
    disableAllPluginButtons: function() {
        Y.Array.each(this._plugins, function() {
            this.disableButtons();
        });

        return this;
    },

    /**
     * Enable all buttons and menus in the toolbar.
     *
     * @method enableAllPluginButtons
     * @chainable
     */
    enableAllPluginButtons : function() {
        Y.Array.each(this._plugins, function() {
            this.enableButtons();
        });

        return this;
    },

    /**
     * Change the formatting for the current selection.
     * Also changes the selection to the newly formatted block (allows applying multiple styles to a block).
     *
     * @param {String} elementid - The editor elementid.
     * @param {String} blocktag - Change the block level tag to this. Empty string, means do not change the tag.
     * @param {Object} attributes - The keys and values for attributes to be added/changed in the block tag.
     * @return Y.Node - if there was a selection.
     */
    format_selection_block : function(elementid, blocktag, attributes) {
        // First find the nearest ancestor of the selection that is a block level element.
        var selectionparentnode = this.getSelectionParentNode(),
            boundary,
            cell,
            nearestblock,
            newcontent,
            match,
            replacement;

        if (!selectionparentnode) {
            // No selection, nothing to format.
            return;
        }

        boundary = this.getEditor(elementid);

        selectionparentnode = Y.one(selectionparentnode);

        // If there is a table cell in between the selectionparentnode and the boundary,
        // move the boundary to the table cell.
        // This is because we might have a table in a div, and we select some text in a cell,
        // want to limit the change in style to the table cell, not the entire table (via the outer div).
        cell = selectionparentnode.ancestor(function (node) {
            var tagname = node.get('tagName');
            if (tagname) {
                tagname = tagname.toLowerCase();
            }
            return (node === boundary) ||
                   (tagname === 'td') ||
                   (tagname === 'th');
        }, true);

        if (cell) {
            // Limit the scope to the table cell.
            boundary = cell;
        }

        nearestblock = selectionparentnode.ancestor(BLOCKTAGS.join(', '), true);
        if (nearestblock) {
            // Check that the block is contained by the boundary.
            match = nearestblock.ancestor(function (node) {
                return node === boundary;
            }, false);

            if (!match) {
                nearestblock = false;
            }
        }

        // No valid block element - make one.
        if (!nearestblock) {
            // There is no block node in the content, wrap the content in a p and use that.
            newcontent = Y.Node.create('<p></p>');
            boundary.get('childNodes').each(function (child) {
                newcontent.append(child.remove());
            });
            boundary.append(newcontent);
            nearestblock = newcontent;
        }

        // Guaranteed to have a valid block level element contained in the contenteditable region.
        // Change the tag to the new block level tag.
        if (blocktag && blocktag !== '') {
            // Change the block level node for a new one.
            replacement = Y.Node.create('<' + blocktag + '></' + blocktag + '>');
            // Copy all attributes.
            replacement.setAttrs(nearestblock.getAttrs());
            // Copy all children.
            nearestblock.get('childNodes').each(function (child) {
                child.remove();
                replacement.append(child);
            });

            nearestblock.replace(replacement);
            nearestblock = replacement;
        }

        // Set the attributes on the block level tag.
        if (attributes) {
            nearestblock.setAttrs(attributes);
        }

        // Change the selection to the modified block. This makes sense when we might apply multiple styles
        // to the block.
        var selection = this.getSelection_from_node(nearestblock);
        this.setSelection(selection);

        return nearestblock;
    }

}, {
    NAME: 'editor',
    ATTRS: {
        /**
         * The ID of the textarea that we're replacing.
         *
         * @attribute elementid
         * @default []
         * @type string
         * @deprecated
         */
        elementid: {
            value: null,
            setter: function(value) {
                this.set('textarea', value);
                return value;
            }
        },

        /**
         * The reference to this editor.
         *
         * @attribute editor
         * @writeOnce
         * @default null
         */
        editor: {
            writeOnce: true
        },

        /**
         * The reference to this editor's toolbar.
         *
         * @attribute toolbar
         * @writeOnce
         * @default null
         */
        toolbar: {
            writeOnce: true
        },

        /**
         * The original text area that we're replacing.
         *
         * The ID of the element should be specified when setting the element.
         *
         * @attribute textarea
         * @type Node
         * @default null
         * @writeOnce
         */
        textarea: {
            value: null,
            writeOnce: true,
            setter: function(elementid) {
                var node = Y.one(document.getElementById(elementid));
                if (node) {
                    return node;
                } else {
                    // We couldn't find an element with this ID.
                    return Y.Attribute.INVALID_VALUE;
                }
            }
        },

        /**
         * The options required for the filepicker.
         *
         * @attribute filepickeroptions
         * @default {}
         * @type object
         */
        filepickeroptions: {
            value: {}
        },

        /**
         * The list of plugins with any configuration that they may have.
         *
         * @attribute plugins
         * @default {}
         * @type object
         */
        plugins: {
            value: {}
        }
    }
});

Y.namespace('M.editor_atto.editor').init = function(config) {
    return new Editor(config);
};
