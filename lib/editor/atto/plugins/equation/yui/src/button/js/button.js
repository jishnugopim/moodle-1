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
 * Atto text editor equation plugin.
 *
 * @package    editor-atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @class      button
 */
var COMPONENTNAME = 'atto_equation',
    CSS = {
        EQUATION_TEXT : 'atto_equation_equation',
        EQUATION_PREVIEW : 'atto_equation_preview',
        SUBMIT : 'atto_equation_preview',
        LIBRARY : 'atto_equation_library',
        LIBRARY_GROUP_PREFIX : 'atto_equation_library'
    },
    SELECTORS = {
        EQUATION_TEXT : '#' + CSS.EQUATION_TEXT,
        EQUATION_PREVIEW : '#' + CSS.EQUATION_PREVIEW,
        SUBMIT : '#' + CSS.SUBMIT,
        LIBRARY_BUTTON : '#' + CSS.LIBRARY + ' button'
    },
    TEMPLATES = {
        FORM : '' +
            '<form class="atto_form">' +
            '{{library}}' +
            '<label for="{{CSS.EQUATION_TEXT}}">{{get_string "editequation" component}}</label>' +
            '<textarea class="fullwidth" id="{{CSS.EQUATION_TEXT}}" rows="8"></textarea><br/>' +
            '<p>{{get_string "editequation_desc" component}}</p>' +
            '<label for="{{CSS.EQUATION_PREVIEW}}">{{get_string "preview" component}}</label>' +
            '<div class="fullwidth" id="{{CSS.EQUATION_PREVIEW}}"></div>' +
            '<div class="mdl-align">' +
            '<br/>' +
            '<button id="{{CSS.SUBMIT}}">' +
            M.util.get_string('saveequation', 'atto_equation') +
            '</button>' +
            '</div>' +
            '</form>',
        LIBRARY : '' +
            '<div id="{{CSS.LIBRARY}}">' +
            '<ul>' +
            '{{#each library}}' +
            '<li><a href="#{{CSS.LIBRARY_GROUP_PREFIX}}{{@key}}">{{get_string @key component}}</a></li>' +
            '{{/each}}' +
            '</ul>' +
            '<div>' +
            '{{#each library}}' +
            '<div id="{{CSS.LIBRARY_GROUP_PREFIX}}{{@key}}">' +
            '{{#each equations}}' +
            '<button data-tex="{{this}}" title="{{this}}">$${{this}}$$</button>' +
            '{{/each}}' +
            '</div>' +
            '{{/each}}' +
            '</div>'
    };

Y.namespace('M.atto_equation').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * The selection object returned by the browser.
     *
     * @property _currentSelection
     * @type Range
     * @default null
     * @private
     */
    _currentSelection: null,

    /**
     * The cursor position in the equation textarea.
     *
     * @property _lastCursorPos
     * @type Integer
     * @default 0
     * @private
     */
    _lastCursorPos: 0,

    /**
     * Add this button to the form, but only if the filter is enabled.
     *
     * @method initializer
     */
    initializer: function() {
        if (this.get('texfilteractive')) {
            // Add the button to the toolbar.
            this.addButton({
                icon: 'e/insert_edit_image',
                callback: this.chooseEquation
            });

            // We need custom highlight logic for this button.
            this.get('host').on('atto:selectionchanged', function() {
                if (this._resolveEquation()) {
                    this.highlightButton();
                } else {
                    this.unHighlightButton();
                }
            }, this);
        }
    },

    /**
     * Callback function for when the equation button is clicked.
     *
     * @method chooseEquation
     */
    chooseEquation : function() {
        this._currentSelection = this.get('host').getSelection();

        if (this._currentSelection === false) {
            return;
        }

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('pluginname', COMPONENTNAME),
            focusAfterHide: true
        });

        dialogue.set('bodyContent', this._getDialogueContent());

        var tabview = new Y.TabView({
            srcNode: '#atto_equation_library'
        });

        tabview.render();
        dialogue.show();

        var equation = this._resolveEquation();
        if (equation) {
            Y.one('#atto_equation_equation').set('text', equation);
        }
        this._updatePreview(false);
    },

    /**
     * If there is selected text and it is part of an equation,
     * extract the equation (and set it in the form).
     *
     * @method _resolveEquation
     * @private
     * @return {String|Boolean} The equation or false.
     */
    _resolveEquation : function() {

        // Find the equation in the surrounding text.
        var selectedNode = this.get('host').getSelectionParentNode(),
            text,
            equation;

        // Note this is a document fragment and YUI doesn't like them.
        if (!selectedNode) {
            return false;
        }

        text = Y.one(selectedNode).get('text');
        // We use space or not space because . does not match new lines.
        pattern = /\$\$[\S\s]*\$\$/;
        equation = pattern.exec(text);
        if (equation && equation.length) {
            equation = equation.pop();
            // Replace the equation.
            equation = equation.substring(2, equation.length - 2);
            return equation;
        }
        return false;
    },

    /**
     * The OK button has been pressed - make the changes to the source.
     *
     * @method setEquation
     * @param {Y.Event} e
     */
    setEquation : function(e) {
        var input,
            selectedNode,
            text,
            pattern,
            equation,
            value;

        var host = this.get('host');

        e.preventDefault();
        his.getDialogue({
            focusAfterHide: null
        }).hide();

        input = e.currentTarget.ancestor('.atto_form').one('textarea');

        value = input.get('value');
        if (value !== '') {
            host.setSelection(this._currentselection);

            value = '$$ ' + value.trim() + ' $$';
            selectedNode = Y.one(host.getSelectionParentNode()),
            text = selectedNode.get('text');
            pattern = /\$\$[\S\s]*\$\$/;
            equation = pattern.exec(text);
            if (equation && equation.length) {
                // Replace the equation.
                equation = equation.pop();
                text = text.replace(equation, '$$' + value + '$$');
                selectedNode.set('text', text);
            } else {
                // Insert the new equation.
                host.insertContentAtFocusPoint(value);
            }

            // Clean the YUI ids from the HTML.
            this.markUpdated();
        }
    },

    /**
     * Update the preview div to match the current equation.
     *
     * @param Event e - unused
     * @method update_preview
     */
    _updatePreview : function(e) {
        var textarea = Y.one('#atto_equation_equation'),
            equation = textarea.get('value'),
            url,
            preview,
            currentPos = textarea.get('selectionStart'),
            prefix = '',
            cursorLatex = '\\square ',
            isChar;


        if (e) {
            e.preventDefault();
        }

        if (!currentPos) {
            currentPos = 0;
        }
        // Move the cursor so it does not break expressions.
        //
        while (equation.charAt(currentPos) === '\\' && currentPos > 0) {
            currentPos -= 1;
        }
        isChar = /[\w\{\}]/;
        while (isChar.test(equation.charAt(currentPos)) && currentPos < equation.length) {
            currentPos += 1;
        }
        // Save the cursor position - for insertion from the library.
        this._lastCursorPos = currentPos;
        equation = prefix + equation.substring(0, currentPos) + cursorLatex + equation.substring(currentPos);
        url = M.cfg.wwwroot + '/lib/editor/atto/plugins/equation/ajax.php';
        params = {
            sesskey: M.cfg.sesskey,
            contextid: this.get('contextid'),
            action : 'filtertext',
            text : '$$ ' + equation + ' $$'
        };

        preview = Y.io(url, { sync: true,
                              data: params });
        if (preview.status === 200) {
            Y.one('#atto_equation_preview').setHTML(preview.responseText);
        }
    },

    /**
     * Return the HTML of the form to show in the dialogue.
     *
     * @method _getDialogueContent
     * @return string
     */
    _getDialogueContent : function() {
        var library = this._getLibraryContent(),
            template = Y.Handlebars.compile(TEMPLATES.FORM),
            content = Y.Node.create(template({
                library: library,
                CSS: CSS
            }));

        content.one(SELECTORS.SUBMIT).on('click', M.atto_equation.setEquation, this);
        content.one(SELECTORS.EQUATION_TEXT).on('valuechange, keyup, mouseup', this._updatePreview, this);
        content.delegate('click', M.atto_equation._selectLibraryItem, SELECTORS.LIBRARY_BUTTON, this);

        return content;
    },

    /**
     * Reponse to button presses in the tex library panels.
     *
     * @method _selectLibraryItem
     * @param Event event
     * @return string
     */
    _selectLibraryItem : function(event) {
        var tex = event.currentTarget.getAttribute('data-tex');

        event.preventDefault();

        input = event.currentTarget.ancestor('.atto_form').one('textarea');

        value = input.get('value');

        value = value.substring(0, this._lastCursorPos) + tex + value.substring(this._lastCursorPos, value.length);

        input.set('value', value);
        input.focus();

        var focusPoint = this._lastCursorPos + tex.length,
            realInput = input.getDOMNode();
        if (typeof realInput.selectionStart === "number") {
            // Modern browsers have selectionStart and selectionEnd to control the cursor position.
            realInput.selectionStart = realInput.selectionEnd = focusPoint;
        } else if (typeof realInput.createTextRange !== "undefined") {
            // Legacy browsers (IE<=9) use createTextRange().
            var range = realInput.createTextRange();
            range.moveToPoint(focusPoint);
            range.select();
        }
        // Focus must be set before updating the preview for the cursor box to be in the correct location.
        this.updatePreview(false);
    },

    /**
     * Return the HTML for rendering the library of predefined buttons.
     *
     * @method getLibraryContent
     * @private
     * @return string
     */
    _getLibraryContent : function() {
        var group;
            template = Y.Handlebars.compile(TEMPLATES.LIBRARY),
            library = this.get('library'),
            content = '';

        // Split the equation params to an array.
        for (group in library) {
            library[group] = library[group].split("\n");
        }

        content = Y.Node.create(template({
            library: library,
            CSS: CSS
        }));

        var url = M.cfg.wwwroot + '/lib/editor/atto/plugins/equation/ajax.php';
        var params = {
            sesskey: M.cfg.sesskey,
            contextid: this.get('contextid'),
            action : 'filtertext',
            text : content
        };

        preview = Y.io(url, { sync: true, data: params, method: 'POST'});

        if (preview.status === 200) {
            content = preview.responseText;
        }
        return content;
    }

}, {
    ATTRS: {
        texfilteractive: {
            value: {}
        },
        contextid: {
            value: {}
        },
        library: {
            value: {}
        }
    }
});
