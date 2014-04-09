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

/*
 * @package    atto_media
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_media-button
 */

/**
 * Atto media selection tool.
 *
 * @namespace M.atto_media
 * @class Button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_media',
    CSS = {
        URLINPUT: 'atto_media_urlentry',
        NAMEINPUT: 'atto_media_nameentry'
    },
    SELECTORS = {
        URLINPUT: '.' + CSS.URLINPUT,
        NAMEINPUT: '.' + CSS.NAMEINPUT
    },
    TEMPLATE = '' +
        '<form class="atto_form">' +
            '<label for="{{elementid}}_atto_media_urlentry">{{get_string "enterurl" component}}</label>' +
            '<input class="fullwidth {{CSS.URLINPUT}}" type="url" id="{{elementid}}_atto_media_urlentry" size="32"/><br/>' +
            '<button class="openmediabrowser" type="button">{{get_string "browserepositories" component}}</button>' +
            '<label for="{{elementid}}_atto_media_nameentry">{{get_string "entername" component}}</label>' +
            '<input class="fullwidth {{CSS.NAMEINPUT}}" type="text" id="{{elementid}}_atto_media_nameentry" size="32" required="true"/>' +
            '<br/>' +
            '<div class="mdl-align">' +
                // Add the preview.
                '<div class="atto_media_preview"></div>' +
                '<button class="submit" type="submit">{{get_string "createmedia" component}}</button>' +
            '</div>' +
        '</form>';

Y.namespace('M.atto_media').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    /**
     * A reference to the dialogue content.
     *
     * @property _content
     * @type Node
     * @private
     */
    _content: null,

    initializer: function() {
        if (this.get('host').canShowFilepicker('media')) {
            this.addButton({
                icon: 'e/insert_edit_video',
                callback: this._displayDialogue
            });
        }
    },

    /**
     * Display the media editing tool.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('createmedia', COMPONENTNAME),
            focusAfterHide: true,
            focusOnShowSelector: SELECTORS.URLINPUT
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent())
                .show();
    },

    /**
     * Return the dialogue content for the tool, attaching any required
     * events.
     *
     * @method _getDialogueContent
     * @return {Node} The content to place in the dialogue.
     * @private
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE);

        this._content = Y.Node.create(template({
            component: COMPONENTNAME,
            elementid: this.get('host').get('elementid'),
            CSS: CSS
        }));

        this._content.one('.submit').on('click', this._setMedia, this);
        this._content.one('.openmediabrowser').on('click', function(e) {
            e.preventDefault();
            this.get('host').showFilepicker('media', this._filepickerCallback, this);
        }, this);

        this._content.one('.urlentry').on('blur', function() {
            // Attempt to load the preview.
            var url = this._content.one('.urlentry').get('value'),
                name = this._content.one('.nameentry').get('value');
            this._loadPreview(url, name);
        }, this);

        return this._content;
    },

    /**
     * Update the dialogue after an media was selected in the File Picker.
     *
     * @method _filepickerCallback
     * @param {object} params The parameters provided by the filepicker
     * containing information about the image.
     * @private
     */
    _filepickerCallback: function(params) {
        if (params.url !== '') {
            this._content.one(SELECTORS.URLINPUT)
                    .set('value', params.url);
            this._content.one(SELECTORS.NAMEINPUT)
                    .set('value', params.file);

            // Attempt to load the preview.
            this._loadPreview(params.url, params.file);
        }
    },

    /**
     * Update the media in the contenteditable.
     *
     * @method setMedia
     * @param {EventFacade} e
     * @private
     */
    _setMedia: function(e) {
        e.preventDefault();
        this.getDialogue({
            focusAfterHide: null
        }).hide();

        var form = e.currentTarget.ancestor('.atto_form'),
            url = form.one(SELECTORS.URLINPUT).get('value'),
            name = form.one(SELECTORS.NAMEINPUT).get('value'),
            host = this.get('host');

        if (url !== '' && name !== '') {
            host.setSelection(this._currentSelection);

            host.insertContentAtFocusPoint(this._getMediaContent(url, name));
            this.markUpdated();
        }
    },

    /**
     * Build the content link that will be inserted into the document.
     *
     * @method _getMediaContent
     * @param {String} url The URL that will be inserted.
     * @param {String] name The name of the resource to be inserted.
     * @return {String} The created content to insert.
     * @private
     */
    _getMediaContent: function(url, name) {
        return '<a href="' + Y.Escape.html(url) + '">' + name + '</a>';
    },

    /**
     * Returns a preview for the media being inserted.
     *
     * @method _loadPreview
     * @param {String} url The URL for the resource.
     * @param {String} name The name of the resource.
     * @private
     */
    _loadPreview: function(url, name) {
        if (url.trim().length === 0) {
            // Check that there is some content first.
            this._content.one('.atto_media_preview').set('innerHTML', null);

            // Centre the dialogue once the preview.
            this.getDialogue().centerDialogue();
            return;
        }

        // Force a max-width of 300.
        // Note: The media plugin will specifically use the final occurrence of ?d={width}x{height} in a URL even if
        // there's already been a ? in the URL, or an existing width/height.
        var previewContent = this._getMediaContent(url + '?d=300x200', name);

        // Make an ajax request to apply the filter options.
        Y.io(M.cfg.wwwroot + '/lib/editor/atto/plugins/' + this.name + '/ajax.php', {
            method: 'post',
            data: {
                sesskey: M.cfg.sesskey,
                contextid: this.get('contextid'),
                action: 'filtertext',
                text: previewContent
            },
            on: {
                success: function(tid, response) {
                    if (response && response.responseText) {
                        if (previewContent === response.responseText) {
                            // If the filtered content was the same as the original, then clear any preview.
                            this._content.one('.atto_media_preview').set('innerHTML', null);
                        } else {
                            // We hopefully have some kind of valid content so update the preview.
                            this._content.one('.atto_media_preview').set('innerHTML', response.responseText);
                        }

                        // Centre the dialogue once the preview has loaded.
                        this.getDialogue().centerDialogue();
                    }
                }
            },
            context: this
        });
    }

}, {
    ATTRS: {
        /**
         * The contextid to use when generating the preview.
         *
         * @attribute contextid
         * @type String
         */
        contextid: {
            value: null
        }
    }
});
