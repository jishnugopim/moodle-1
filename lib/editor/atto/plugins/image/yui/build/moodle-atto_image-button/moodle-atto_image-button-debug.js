YUI.add('moodle-atto_image-button', function (Y, NAME) {

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

var CSS = {
        INPUTALIGNMENT: 'atto_image_alignment',
        INPUTALT: 'atto_image_altentry',
        INPUTHEIGHT: 'atto_image_heightentry',
        INPUTSUBMIT: 'atto_image_urlentrysubmit',
        INPUTURL: 'atto_image_urlentry',
        INPUTWIDTH: 'atto_image_widthentry',
        IMAGEALTWARNING: 'atto_image_altwarning',
        IMAGEBROWSER: 'openimagebrowser',
        IMAGEPRESENTATION: 'atto_image_presentation',
        IMAGEPREVIEW: 'atto_image_preview'
    },
    ALIGNMENTS = [
        // Vertical alignment.
        {
            name: 'baseline',
            str: 'alignment_baseline',
            value: 'vertical-align'
        }, {
            name: 'sub',
            str: 'alignment_sub',
            value: 'vertical-align'
        }, {
            name: 'super',
            str: 'alignment_super',
            value: 'vertical-align'
        }, {
            name: 'top',
            str: 'alignment_top',
            value: 'vertical-align'
        }, {
            name: 'text-top',
            str: 'alignment_texttop',
            value: 'vertical-align'
        }, {
            name: 'middle',
            str: 'alignment_middle',
            value: 'vertical-align'
        }, {
            name: 'bottom',
            str: 'alignment_bottom',
            value: 'vertical-align'
        }, {
            name: 'text-bottom',
            str: 'alignment_textbottom',
            value: 'vertical-align'
        },

        // Floats.
        {
            name: 'left',
            str: 'alignment_left',
            value: 'float'
        }, {
            name: 'right',
            str: 'alignment_right',
            value: 'float'
        }
    ];

var COMPONENTNAME = 'atto_image',

    TEMPLATE = '' +
            '<form class="atto_form">' +
                '<label for="{{CSS.INPUTURL}}">{{get_string "enterurl" component}}</label>' +
                '<input class="fullwidth" type="url" id="{{CSS.INPUTURL}}" size="32"/>' +
                '<br/>' +

                // Add the repository browser button.
                '{{#if showFilepicker}}' +
                    '<button id="{{CSS.IMAGEBROWSER}}" type="button">{{get_string "browserepositories" component}}</button>' +
                '{{/if}}' +

                // Add the Alt box.
                '<div style="display:none" role="alert" id="{{CSS.IMAGEALTWARNING}}" class="warning">' +
                    '{{get_string presentationoraltrequired component}}' +
                '</div>' +
                '<label for="{{CSS.INPUTALT}}">{{get_string "enteralt" component}}</label>' +
                '<input class="fullwidth" type="text" value="" id="{{CSS.INPUTALT}}" size="32"/>' +
                '<br/>' +

                // Add the presentation select box.
                '<input type="checkbox" id="{{CSS.IMAGEPRESENTATION}}"/>' +
                '<label class="sameline" for="{{CSS.IMAGEPRESENTATION}}">{{get_string "presentation" component}}</label>' +
                '<br/>' +

                // Add the width entry box.
                '<label class="sameline" for="{{CSS.INPUTWIDTH}}">{{get_string "width" component}}</label>' +
                '<input type="text" id="{{CSS.INPUTWIDTH}}" size="10"/>' +
                '<br/>' +

                // Add the height entry box.
                '<label class="sameline" for="{{CSS.INPUTHEIGHT}}">{{get_string "height" component}}</label>' +
                '<input type="text" id="{{CSS.INPUTHEIGHT}}" size="10"/>' +
                '<br/>' +

                // Add the alignment selector.
                '<label class="sameline" for="{{CSS.INPUTALIGNMENT}}">{{get_string "alignment" component}}</label>' +
                '<select id="{{CSS.INPUTALIGNMENT}}">' +
                    '{{#each alignments}}' +
                        '<option value="{{value}}">{{get_string str ../component}}</option>' +
                    '{{/each}}' +
                '</select>' +
                '<br/>' +

                // Add the image preview.
                '<label for="{{CSS.IMAGEPREVIEW}}">{{get_string "preview" component}}</label>' +
                '<div class="mdl-align">' +
                '<img src="#" width="200" id="{{CSS.IMAGEPREVIEW}}" alt="" style="display: none;"/>' +
                '<br/>' +

                // Add the submit button and close the form.
                '<button id="{{CSS.INPUTSUBMIT}}" type="submit">{{get_string "createimage" component}}</button>' +
                '</div>' +
            '</form>',

        IMAGETEMPLATE = '' +
            '<img src="{{url}}" alt="{{alt}}" ' +
                '{{#if width}}width="{{width}}" {{/if}}' +
                '{{#if height}}height="{{height}}" {{/if}}' +
                '{{#if presentation}}role="presentation" {{/if}}' +
                '{{#if alignment}}style="{{alignment}}" {{/if}}' +
                '/>';

Y.namespace('M.atto_image').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

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
            icon: 'e/insert_edit_image',
            callback: this.chooseImage,
            tags: 'img'
        });
    },

    chooseImage: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('createimage', COMPONENTNAME),
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
                component: COMPONENTNAME,
                showFilepicker: this.get('host').canShowFilepicker('image'),
                alignments: ALIGNMENTS
            }));

        // Configure the view of the current image.
        this._applyImageProperties(content);

        content.one('#' + CSS.INPUTURL).on('blur', this.urlChanged, this);
        content.one('#' + CSS.INPUTSUBMIT).on('click', this.setImage, this);
        content.one('#' + CSS.IMAGEBROWSER).on('click', function() {
                this.get('host').showFilepicker('image', this._filepickerCallback, this);
        }, this);

        return content;
    },

    /**
     * @method _filepickerCallback
     * @private
     */
    _filepickerCallback: function(params) {
        if (params.url !== '') {
            var input = Y.one('#' + CSS.INPUTURL),
                self = this;
            input.set('value', params.url);

            // Auto set the width and height.
            var image = new Image();
            image.onload = function() {
                Y.one('#' + CSS.INPUTWIDTH).set('value', this.width);
                Y.one('#' + CSS.INPUTHEIGHT).set('value', this.height);
                Y.one('#' + CSS.IMAGEPREVIEW).set('src', this.src);
                Y.one('#' + CSS.IMAGEPREVIEW).setStyle('display', 'inline');

                // Centre the dialogue once the preview image has loaded.
                self.getDialogue().centerDialogue();
            };
            image.src = params.url;
        }
    },

    /**
     * Applies properties of an existing image to the image dialogue for editing.
     *
     * @method _applyImageProperties
     * @param {Node} form
     * @private
     */
    _applyImageProperties: function(form) {
        var properties = this._getSelectedImageProperties(),
            img = form.one('#' + CSS.IMAGEPREVIEW);

        if (properties === false) {
            img.setStyle('display', 'none');
            return;
        }

        if (properties.align) {
            properties.align.apply(img);
        }
        if (properties.display) {
            img.setStyle('display', properties.display);
        }
        if (properties.width) {
            form.one('#' + CSS.INPUTWIDTH).set('value', properties.width);
        }
        if (properties.height) {
            form.one('#' + CSS.INPUTHEIGHT).set('value', properties.height);
        }
        if (properties.alt) {
            form.one('#' + CSS.INPUTALT).set('value', properties.alt);
        }
        if (properties.src) {
            form.one('#' + CSS.INPUTURL).set('value', properties.src);
            img.setAttribute('src', properties.src);
        }
        if (properties.presentation) {
            form.one('#' + CSS.IMAGEPRESENTATION).set('checked', 'checked');
        }
    },

    /**
     * Gets the properties of the currently selected image.
     *
     * The first image only if multiple images are selected.
     *
     * @method _getSelectedImageProperties
     * @return {object}
     * @private
     */
    _getSelectedImageProperties: function() {
        var properties = {
                src: null,
                alt :null,
                width: null,
                height: null,
                align: null,
                display: 'inline',
                presentation: false
            },

            // Get the current selection.
            images = this.get('host').getSelectedNodes(),
            i, width, height, style;

        if (images) {
            images = images.filter('img');
        }

        if (images && images.size()) {
            image = images.item(0);
            this.lastselectedimage = image;

            style = image.getAttribute('style');
            width = parseInt(image.getAttribute('width'), 10);
            height = parseInt(image.getAttribute('height'), 10);

            if (width > 0) {
                properties.width = width;
            }
            if (height > 0) {
                properties.height = height;
            }
            for (i in ALIGNMENTS) {
                if (ALIGNMENTS[i].name === style) {
                    properties.align = ALIGNMENTS[i];
                    break;
                }
            }
            properties.src = image.getAttribute('src');
            properties.alt = image.getAttribute('alt') || '';
            properties.presentation = (image.get('role') === 'presentation');
            return properties;
        }
        return false;
    },

    urlChanged: function() {
        var input = Y.one('#' + CSS.INPUTURL);

        if (input.get('value') !== '') {
            // Auto set the width and height.
            var image = new Image();
            image.onload = function() {
                var input;

                input = Y.one('#' + CSS.INPUTWIDTH);
                if (input.get('value') === '') {
                    input.set('value', this.width);
                }
                input = Y.one('#' + CSS.INPUTHEIGHT);
                if (input.get('value') === '') {
                    input.set('value', this.height);
                }
                input = Y.one('#' + CSS.IMAGEPREVIEW);
                input.set('src', this.src);
                input.setStyle('display', 'inline');
            };
            image.src = input.get('value');
        }
    },

    setImage: function(e) {
        var form = e.currentTarget.ancestor('.atto_form'),
            url = form.one('#' + CSS.INPUTURL).get('value'),
            alt = form.one('#' + CSS.INPUTALT).get('value'),
            width = form.one('#' + CSS.INPUTWIDTH).get('value'),
            height = form.one('#' + CSS.INPUTHEIGHT).get('value'),
            alignment = form.one('#' + CSS.INPUTALIGNMENT).get('value'),
            presentation = form.one('#' + CSS.IMAGEPRESENTATION).get('checked'),
            imagehtml,
            host = this.get('host');

        e.preventDefault();

        if (alt === '' && !presentation) {
            form.one('#' + CSS.IMAGEALTWARNING).setStyle('display', 'block');
            form.one('#' + CSS.INPUTALT).setAttribute('aria-invalid', true);
            form.one('#' + CSS.IMAGEPRESENTATION).setAttribute('aria-invalid', true);
            return;
        } else {
            form.one('#' + CSS.IMAGEALTWARNING).setStyle('display', 'none');
            form.one('#' + CSS.INPUTALT).setAttribute('aria-invalid', false);
            form.one('#' + CSS.IMAGEPRESENTATION).setAttribute('aria-invalid', false);
        }

        this.getDialogue({
            focusAfterHide: null
        }).hide();

        // Focus on the editor in preparation for inserting the image.
        // TODO - add back once selections are working properly.
        //host.focus();
        if (url !== '') {
            if (this.lastselectedimage) {
                host.setSelection(host.getSelectionFromNode(this.lastselectedimage));
            } else {
                host.setSelection(this._currentSelection);
            }
            template = Y.Handlebars.compile(IMAGETEMPLATE);
            imagehtml = template({
                url: url,
                alt: alt,
                width: width,
                height: height,
                presentation: presentation,
                alignment: alignment
            });

            this.get('host').insertContentAtFocusPoint(imagehtml);

            this.markUpdated();
        }
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
