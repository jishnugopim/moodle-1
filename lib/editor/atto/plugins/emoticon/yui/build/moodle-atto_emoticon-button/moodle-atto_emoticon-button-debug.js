YUI.add('moodle-atto_emoticon-button', function (Y, NAME) {

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
 * Atto text editor bold plugin.
 *
 * @module     moodle-atto_charmap-button
 * @package    editor-atto
 * @copyright  2014 Frédéric Massart
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var COMPONENTNAME = 'atto_emoticon',
    CSSEMOTE = 'atto_emoticon_emote',
    CSSMAP = 'atto_emoticon_map',
    SELECTORSEMOTE = '.atto_emoticon_emote',
    TEMPLATE = '' +
            '<div class="{{CSSMAP}}">' +
                '<ul>' +
                    '{{#each emoticons}}' +
                        '<li><div>' +
                            '<a href="#" class="{{../CSSEMOTE}}" data-text="{{text}}">' +
                                '<img {{imagename}} ' +
                                    'src="{{image_url imagename imagecomponent}}" ' +
                                    'alt="{{emotealt}}"' +
                                '/>' +
                            '</a>' +
                        '</div>' +
                        '<div>{{text}}</div>' +
                        '<div>{{get_string altidentifier altcomponent}}</div>' +
                        '</li>' +
                    '{{/each}}' +
                '</ul>' +
            '</div>';

/**
 * Atto text editor charmap plugin.
 *
 * @namespace M.atto_emoticon
 * @class button
 */

Y.namespace('M.atto_emoticon').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    initializer: function() {
        this.addButton({
            icon: 'e/emoticons',
            callback: this.chooseEmoticon
        });
    },

    chooseEmoticon: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('insertemoticon', COMPONENTNAME)
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent())
                .show();
    },

    /**
     * Insert the emoticon.
     *
     * @method insertEmote
     * @param {EventFacade} e
     */
    insertEmote: function(e) {
        var target = e.target.ancestor(SELECTORSEMOTE, true),
            host = this.get('host');

        e.preventDefault();

        // Hide the dialogue.
        this.getDialogue().hide();

        // Build the Emoticon text.
        var html = ' ' + target.getData('text') + ' ';

        // Focus on the previous selection.
        host.setSelection(this._currentSelection);

        // And add the character.
        host.insertContentAtFocusPoint(html);

        this.markUpdated();
    },

    /**
     * Generates the content of the dialogue.
     *
     * @method _getDialogueContent
     * @return {Node} Node containing the dialogue content
     * @private
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                emoticons: this.get('emoticons'),
                CSSMAP: CSSMAP,
                CSSEMOTE: CSSEMOTE
            }));
        content.delegate('click', this.insertEmote, SELECTORSEMOTE, this);
        content.delegate('key', this.insertEmote, '32', SELECTORSEMOTE, this);

        return content;
    }
}, {
    ATTRS: {
        emoticons: {
            value: {}
        }
    }
});


}, '@VERSION@', {"requires": ["node"]});
