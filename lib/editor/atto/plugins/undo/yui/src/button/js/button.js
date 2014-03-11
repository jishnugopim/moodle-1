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
 * Atto text editor undo plugin.
 *
 * @component  atto_undo
 * @copyright  2014 Jerome Mouneyrac
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @class      button
 */
Y.namespace('M.atto_undo').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * The maximum saved number of undo steps.
     *
     * @property _maxUndos
     * @type {Integer} The maximum number of saved undos.
     * @default 40
     */
    _maxUndos : 40,

    /**
     * History of edits.
     *
     * @property _undoStack
     * @type {Array} The elements of the array are the html strings that make a snapshot
     * @default []
     */
    _undoStack : [],

    /**
     * History of edits.
     *
     * @property _redoStack
     * @type {Array} The elements of the array are the html strings that make a snapshot
     * @default []
     */
    _redoStack : [],

    /**
     * Handle a click on undo
     *
     * @method undoHandler
     */
    undoHandler : function() {
        var html = this.editor.getHTML();

        this._redoStack.push(html);
        var last = this._undoStack.pop();
        if (last === html) {
            last = this._undoStack.pop();
        }
        if (last) {
            this.editor.setHTML(last);
            // Put it back in the undo stack so a new event wont clear the redo stack.
            this._undoStack.push(last);
            this.highlightButton('redo');
        }
    },

    /**
     * Handle a click on redo
     *
     * @method redoHandler
     * @param {Y.Event} The click event
     * @param {String} The id for the editor
     */
    redoHandler : function(e) {
        e.preventDefault();
        var html = this.editor.getHTML();

        this._undoStack.push(html);
        var last = this._redoStack.pop();
        this.editor.setHTML(last);
        this._undoStack.push(last);
    },

    /**
     * If we are significantly different from the last saved version, save a new version.
     *
     * @method changeListener
     * @param {Y.Event} The click event
     */
    changeListener : function(e) {

        if (e.event.type.indexOf('key') !== -1) {
            // These are the 4 arrow keys.
            if ((e.event.keyCode !== 39) &&
                (e.event.keyCode !== 37) &&
                (e.event.keyCode !== 40) &&
                (e.event.keyCode !== 38)) {
                // Skip this event type. We only want focus/mouse/arrow events.
                return;
            }
        }

        if (typeof this._undoStack === 'undefined') {
            this._undoStack = [];
        }

        var last = this._undoStack[this._undoStack.length-1];
        var html = this.editor.getHTML();
        if (last !== html) {
            this._undoStack.push(editable.getHTML());
            this._redoStack = [];
            this.unHighlightButton('redo');
        }

        while (this._undoStack.length > this._maxUndos) {
            this._undoStack.shift();
        }

        // Show in the buttons if undo/redo is possible.
        if (this._undoStack.length) {
           this.highlightButton('undo');
        } else {
           this.unHighlightButton('undo');
        }
    },

    /**
     * Add the buttons to the toolbar
     *
     * @method initializer
     */
    initializer : function() {

        this.addButton({
            icon: 'e/undo',
            callback: this.undoHandler,
            buttonName: 'undo',
            keys: 90
        });

        this.addButton({
            icon: 'e/redo',
            callback: this.redoHandler,
            buttonName: 'redo',
            keys: 89
        });

        this.get('host').on('atto:selectionchanged', this.changeListener);
    }

});
