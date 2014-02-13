YUI.add('moodle-atto_media-button', function (Y, NAME) {

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
 * Atto text editor media plugin.
 *
 * @package editor-atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
M.atto_media = M.atto_media || {
    dialogue : null,
    selection : null,
    _button: null,
    init : function(params) {

        if (!M.editor_atto.can_show_filepicker(params.elementid, 'media')) {
            // Do not show this button if we can't browse repositories.
            return;
        }

        var iconurl = M.util.image_url('e/insert_edit_video', 'core');
        M.atto_media._button = M.editor_atto.add_toolbar_button(params.elementid, 'media', iconurl, params.group, M.atto_media.displayDialogue, this);
    },

    /**
     * Display the media picker dialogue.
     *
     * @method displayDialogue
     * @param {EventFacade} e
     * @param {string} elementid The editor's elementid
     */
    displayDialogue: function(e, elementid) {
        e.preventDefault();
        if (!M.editor_atto.is_active(elementid)) {
            M.editor_atto.focus(elementid);
        }
        M.atto_media.selection = M.editor_atto.get_selection();
        var dialogue = M.atto_media.dialogue;
        if (M.atto_media.selection !== false) {
            if (!dialogue) {
                M.atto_media.dialogue = dialogue = new M.core.dialogue({
                    headerContent: M.util.get_string('createmedia', 'atto_media'),
                    visible: false,
                    render: true,
                    modal: true,
                    close: true,
                    center: true,
                    draggable: true
                });
            }

            dialogue.render();
            dialogue.setAttrs({
                    bodyContent: M.atto_media.get_form_content(elementid),
                    focusAfterHide: M.atto_media._button
                })
                .show();
        }
    },
    open_browser : function(e) {
        var elementid = this.getAttribute('data-editor');
        e.preventDefault();

        M.editor_atto.show_filepicker(elementid, 'media', M.atto_media.filepicker_callback);
    },
    filepicker_callback : function(params) {
        if (params.url !== '') {
            var input = Y.one('#atto_media_urlentry');
            input.set('value', params.url);
            input = Y.one('#atto_media_nameentry');
            input.set('value', params.file);
        }
    },
    set_media : function(e, elementid) {
        e.preventDefault();
        M.atto_media.dialogue.set('focusAfterHide', M.editor_atto.get_editable_node(elementid))
                .hide();

        var input = e.currentTarget.ancestor('.atto_form').one('#atto_media_urlentry');
        var url = input.get('value');
        input = e.currentTarget.ancestor('.atto_form').one('#atto_media_nameentry');
        var name = input.get('value');

        if (url !== '' && name !== '') {
            M.editor_atto.set_selection(M.atto_media.selection);
            var mediahtml = '<a href="' + Y.Escape.html(url) + '">' + name + '</a>';

            if (document.selection && document.selection.createRange().pasteHTML) {
                document.selection.createRange().pasteHTML(mediahtml);
            } else {
                document.execCommand('insertHTML', false, mediahtml);
            }
            // Clean the YUI ids from the HTML.
            M.editor_atto.text_updated(elementid);
        }
    },
    get_form_content : function(elementid) {
        var content = Y.Node.create('<form class="atto_form">' +
                             '<label for="atto_media_urlentry">' + M.util.get_string('enterurl', 'atto_media') +
                             '</label>' +
                             '<input class="fullwidth" type="url" value="" id="atto_media_urlentry" size="32"/><br/>' +
                             '<button id="openmediabrowser" data-editor="' + Y.Escape.html(elementid) + '" type="button">' +
                             M.util.get_string('browserepositories', 'atto_media') +
                             '</button>' +
                             '<label for="atto_media_nameentry">' + M.util.get_string('entername', 'atto_media') +
                             '</label>' +
                             '<input class="fullwidth" type="text" value="" id="atto_media_nameentry" size="32" required="true"/>' +
                             '<div class="mdl-align">' +
                             '<br/>' +
                             '<button id="atto_media_urlentrysubmit" type="submit">' +
                             M.util.get_string('createmedia', 'atto_media') +
                             '</button>' +
                             '</div>' +
                             '</form>' +
                             '<hr/>' + M.util.get_string('accessibilityhint', 'atto_media'));

        content.one('#atto_media_urlentrysubmit').on('click', M.atto_media.set_media, this, elementid);
        content.one('#openmediabrowser').on('click', M.atto_media.open_browser);
        return content;
    }
};


}, '@VERSION@', {"requires": ["node", "escape"]});
