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

var COMPONENTNAME = 'atto_media',
    TEMPLATE = '' +
        '<form class="atto_form">' +
            '<label for="atto_media_urlentry">{{get_string "enterurl" component}}</label>' +
            '<input class="fullwidth" type="url" id="atto_media_urlentry" size="32"/><br/>' +
            '<button id="openmediabrowser" type="button">{{get_string "browserepositories" component}}</button>' +
            '<label for="atto_media_nameentry">{{get_string "entername" component}}</label>' +
            '<input class="fullwidth" type="text" id="atto_media_nameentry" size="32" required="true"/>' +
            '<div class="mdl-align">' +
                '<br/>' +
                '<button id="atto_media_urlentrysubmit" type="submit">{{get_string "createmedia" component}}</button>' +
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

    initializer: function() {
        this.addButton({
            icon: 'e/insert_edit_video',
            callback: this.chooseMedia
        });
    },

    chooseMedia: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('createmedia', COMPONENTNAME)
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent())
                .show();
    },

    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                component: COMPONENTNAME
            }));

        content.one('#atto_media_urlentrysubmit').on('click', this.setMedia, this);
        content.one('#openmediabrowser').on('click', function(e) {
            e.preventDefault();
            this.get('host').showFilepicker('media', this._filepickerCallback, this);
        }, this);

        return content;
    },

    /**
     * @method _filepickerCallback
     * @private
     */
    _filepickerCallback: function(params) {
        if (params.url !== '') {
            Y.one('#atto_media_urlentry')
                    .set('value', params.url);
            Y.one('#atto_media_nameentry')
                    .set('value', params.file);
        }
    },

    setMedia: function(e) {
        e.preventDefault();
        this.getDialogue().hide();

        var form = e.currentTarget.ancestor('.atto_form'),
            url = form.one('#atto_media_urlentry').get('value'),
            name = form.one('#atto_media_nameentry').get('value'),
            host = this.get('host');

        if (url !== '' && name !== '') {
            host.setSelection(this._currentSelection);
            var mediahtml = '<a href="' + Y.Escape.html(url) + '">' + name + '</a>';

            host.insertContentAtFocusPoint(mediahtml);
            this.markUpdated();
        }
    }
});
