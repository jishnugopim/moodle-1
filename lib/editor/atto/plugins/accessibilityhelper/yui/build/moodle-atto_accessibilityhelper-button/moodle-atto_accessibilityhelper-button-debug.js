YUI.add('moodle-atto_accessibilityhelper-button', function (Y, NAME) {

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
 * Atto text editor accessibilityhelper plugin.
 *
 * This plugin adds some functions to do things that screen readers do not do well.
 * Specifically, listing the active styles for the selected text,
 * listing the images in the page, listing the links in the page.
 *
 * @package    editor-atto
 * @copyright  2014 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var COMPONENT = 'atto_accessibilityhelper',
    TEMPLATE = '' +
        // The list of styles.
        '<div><p id="{{CSS.STYLESLABEL}}">' +
            '{{get_string "liststyles" component}}<br/>' +
            '<span id="{{CSS.LISTSTYLES}}" aria-labelledby="{{CSS.STYLESLABEL}}" />' +
        '</p></div>' +
        '<span class="listStyles"></span>' +

        '<p id="{{CSS.LINKSLABEL}}">' +
            '{{get_string "listlinks" component}}<br/>' +
            '<span id="{{CSS.LISTLINKS}}" aria-labelledby="{{CSS.LINKSLABEL}}"/>' +
        '</p>' +
        '<span class="listLinks"></span>' +

        '<p id="{{CSS.IMAGESLABEL}}">' +
            '{{get_string "listimages" component}}<br/>' +
            '<span id="{{CSS.LISTIMAGES}}" aria-labelledby="{{CSS.IMAGESLABEL}}"/>' +
        '</p>' +
        '<span class="listImages"></span>',

    CSS = {
        STYLESLABEL: 'atto_accessibilityhelper_styleslabel',
        LISTSTYLES: 'atto_accessibilityhelper_liststyles',
        LINKSLABEL: 'atto_accessibilityhelper_linkslabel',
        LISTLINKS: 'atto_accessibilityhelper_listlinks',
        IMAGESLABEL: 'atto_accessibilityhelper_imageslabel',
        LISTIMAGES: 'atto_accessibilityhelper_listimages'
    };

Y.namespace('M.atto_accessibilityhelper').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * The warnings which are displayed.
     *
     * @problem _displayedWarnings
     * @type Object
     * @private
     */
    _displayedWarnings: {},

    initializer: function() {
        this.addButton({
            icon: 'e/visual_aid',
            callback: this.displayDialogue
        });
    },

    displayDialogue: function() {
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('pluginname', COMPONENT),
            width: '800px',
            focusAfterHide: true
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent())
                .show();
    },

    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                CSS: CSS,
                component: COMPONENT
            }));

        // Add the data.
        content.one('.listStyles')
                .empty()
                .appendChild(this.listStyles());
        content.one('.listLinks')
                .empty()
                .appendChild(this.listLinks());
        content.one('.listImages')
                .empty()
                .appendChild(this.listImages());

        // Add ability to select problem areas in the editor.
        content.delegate('click', function(e) {
            e.preventDefault();

            var host = this.get('host'),
                index = e.target.getAttribute("data-index"),
                node = this._displayedWarnings[index],
                dialogue = this.getDialogue();


            if (node) {
                // Clear the dialogue's focusAfterHide to ensure we focus
                // on the selection.
                dialogue.set('focusAfterHide', null);
                host.setSelection(host.getSelectionFromNode(node));
            }

            // Hide the dialogue.
            dialogue.hide();

        }, this);

        return content;
    },

    listStyles: function() {
        // Clear the status node.
        var list = [],
            host = this.get('host'),
            current = host.getSelectionParentNode(),
            tagname;

        if (current) {
            current = Y.one(current);
        }

        while (current && (current !== this.editor)) {
            tagname = current.get('tagName');
            if (typeof tagname !== 'undefined') {
                list.push(Y.Escape.html(tagname));
            }
            current = current.ancestor();
        }
        if (list.length === 0) {
            list.push(M.util.get_string('nostyles', 'atto_accessibilityhelper'));
        }

        list.reverse();

        // Append the list of current styles.
        return list.join(', ');
    },

    /**
     * List the links for the current editor
     *
     * @method listLinks
     * @return {string}
     */
    listLinks: function() {
        var list = Y.Node.create('<ol />'),
            listitem,
            selectlink;

        this.editor.all('a').each(function(link) {
            selectlink = Y.Node.create('<a href="#" title="' +
                    M.util.get_string('selectlink', 'atto_accessibilityhelper') + '">' +
                    Y.Escape.html(link.get('text')) +
                    '</a>');

            selectlink.setData('sourcelink', link);
            selectlink.on('click', this._linkSelected, this);

            listitem = Y.Node.create('<li></li>');
            listitem.appendChild(selectlink);

            list.appendChild(listitem);
        }, this);

        if (!list.hasChildNodes()) {
            list.append('<li>' + M.util.get_string('nolinks', 'atto_accessibilityhelper') + '</li>');
        }

        // Append the list of current styles.
        return list;
    },

    /**
     * List the images used in the editor.
     *
     * @method listImages
     * @return {string}
     */
    listImages: function() {
        var list = Y.Node.create('<ol/>'),
            listitem,
            selectimage;

        this.editor.all('img').each(function(image) {
            // Get the alt or title or img url of the image.
            var imgalt = image.getAttribute('alt');
            if (imgalt === '') {
                imgalt = image.getAttribute('title');
                if (imgalt === '') {
                    imgalt = image.getAttribute('src');
                }
            }

            selectimage = Y.Node.create('<a href="#" title="' +
                    M.util.get_string('selectimage', 'atto_accessibilityhelper') + '">' +
                    Y.Escape.html(imgalt) +
                    '</a>');

            selectimage.setData('sourceimage', image);
            selectimage.on('click', this._imageSelected, this);

            listitem = Y.Node.create('<li></li>');
            listitem.append(selectimage);
            list.append(listitem);
        }, this);
        if (!list.hasChildNodes()) {
            list.append('<li>' + M.util.get_string('noimages', 'atto_accessibilityhelper') + '</li>');
        }

        // Append the list of current styles.
        return list;
    },

    /**
     * Event handler for selecting an image.
     *
     * @method _imageSelected
     * @param {EventFacade} e
     * @private
     */
    _imageSelected : function(e) {
        e.preventDefault();

        this.getDialogue({
            focusAfterNode: null
        }).hide();

        var host = this.get('host'),
            target = e.target.getData('sourceimage');

        this.editor.focus();
        host.setSelection(host.getSelectionFromNode(target));
    },

    /**
     * Event handler for selecting a link.
     *
     * @method _linkSelected
     * @param {EventFacade} e
     * @private
     */
    _linkSelected : function(e) {
        e.preventDefault();

        this.getDialogue({
            focusAfterNode: null
        }).hide();

        var host = this.get('host'),
            target = e.target.getData('sourcelink');

        this.editor.focus();
        host.setSelection(host.getSelectionFromNode(target));
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
