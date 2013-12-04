YUI.add('moodle-mod_quiz-autosave', function (Y, NAME) {

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

// Auto-save functionality for during quiz attempts.
//
// @package   mod_quiz
// @copyright 1999 onwards Martin Dougiamas  {@link http://moodle.com}
// @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later

/**
 * Auto-save functionality for during quiz attempts.
 *
 * @module moodle-mod_quiz-autosave
 */

/**
 * A class to help show and hide advanced form content.
 *
 * @class M.mod_quiz.autosave
 * @constructor
 */
M.mod_quiz = M.mod_quiz || {};
M.mod_quiz.autosave = {

    /**
     * The delay before starting TinyMCE detection.
     *
     * @property TINYMCE_DETECTION_DELAY
     * @type Number
     * @default 500
     */
    TINYMCE_DETECTION_DELAY:  500,

    /**
     * The number of attempts to make looking for TinyMCE before giving up.
     *
     * @property TINYMCE_DETECTION_REPEATS
     * @type Number
     * @default 20
     */
    TINYMCE_DETECTION_REPEATS: 20,

    /**
     * How frequently to check for changes on hidden fields.
     *
     * @property WATCH_HIDDEN_DELAY
     * @type Number
     * @default 1000
     * @readOnly
     */
    WATCH_HIDDEN_DELAY:      1000,

    /**
     * The number of failures before notifying the user.
     *
     * @property FAILURES_BEFORE_NOTIFY
     * @type Number
     * @default 1
     * @readOnly
     */
    FAILURES_BEFORE_NOTIFY:     1,

    /**
     * A constant for comparing the number of save failures.
     *
     * @property FIRST_SUCCESSFUL_SAVE
     * @type Number
     * @default -1
     * @readOnly
     */
    FIRST_SUCCESSFUL_SAVE:     -1,

    /**
     * CSS Selectors used throughout this module.
     *
     * @property SELECTORS
     * @type Object
     * @readOnly
     */
    SELECTORS: {
        QUIZ_FORM:             '#responseform',
        VALUE_CHANGE_ELEMENTS: 'input, textarea',
        CHANGE_ELEMENTS:       'input, select',
        HIDDEN_INPUTS:         'input[type=hidden]',
        CONNECTION_ERROR:      '#connection-error',
        CONNECTION_OK:         '#connection-ok'
    },

    /**
     * The path to the script that handles the auto-saves.
     *
     * @property AUTOSAVE_HANDLER
     * @type String
     * @readOnly
     */
    AUTOSAVE_HANDLER: M.cfg.wwwroot + '/mod/quiz/autosave.ajax.php',

    /**
     * The delay in milliseconds between a change being made, and it being auto-saved.
     *
     * @property delay
     * @type Number
     * @default 120000
     * @readOnly
     */
    delay: 120000,

    /**
     * The form we are monitoring.
     *
     * @property form
     * @type Node
     * @default null
     * @writeOnce
     */
    form: null,

    /**
     * Whether the form has been modified since the last save started.
     *
     * @property dirty
     * @type Booelean
     * @default false
     */
    dirty: false,

    /**
     * Timer object for the delay between form modifaction and the save starting.
     *
     * @property delayTimer
     * @type EventHandle
     * @default null
     */
    delayTimer: null,

    /**
     * Y.io transaction for the save ajax request.
     *
     * @property saveTransaction
     * @type Object
     * @default null
     */
    saveTransaction: null,

    /**
     * Failed saves count.
     *
     * @property saveFailures
     * @type Number
     * @default 0
     */
    saveFailures: 0,

    /**
     * Properly bound key change handler.
     *
     * @property editorChangeHandler
     * @type EventHandle
     * @default null
     */
    editorChangeHandler: null,

    /**
     * Record of the value of all the hidden fields, last time they were checked.
     *
     * @property hiddenFieldValues
     * @type Object
     */
    hiddenFieldValues: {},

    /**
     * Initialise the autosave code.
     *
     * @method init
     * @param {Number} delay the delay, in seconds, between a change being detected, and
     * a save happening.
     */
    init: function(delay) {
        this.form = Y.one(this.SELECTORS.QUIZ_FORM);
        if (!this.form) {
            return;
        }

        this.delay = delay * 1000;

        this.form.delegate('valuechange', this.valueChanged, this.SELECTORS.VALUE_CHANGE_ELEMENTS, this);
        this.form.delegate('change',      this.valueChanged, this.SELECTORS.CHANGE_ELEMENTS,       this);
        this.form.on('submit', this.stopAutoSaving, this);

        this.initTinyMCE(this.TINYMCE_DETECTION_REPEATS);

        this.saveHiddenFieldValues();
        this.watchHiddenFields();
    },

    /**
     * Save field values for hidden fields.
     *
     * @method saveHiddenFieldValues
     */
    saveHiddenFieldValues: function() {
        this.form.all(this.SELECTORS.HIDDEN_INPUTS).each(function(hidden) {
            var name  = hidden.get('name');
            if (!name) {
                return;
            }
            this.hiddenFieldValues[name] = hidden.get('value');
        }, this);
    },

    /**
     * Watch all hidden fields in the form for changes.
     *
     * @method watchHiddenFields
     */
    watchHiddenFields: function() {
        this.detectHiddenFieldChanges();
        Y.later(this.WATCH_HIDDEN_DELAY, this, this.watchHiddenFields);
    },

    /**
     * Detect changes to hidden fields.
     *
     * @method detectHiddenFieldChanges
     */
    detectHiddenFieldChanges: function() {
        this.form.all(this.SELECTORS.HIDDEN_INPUTS).each(function(hidden) {
            var name  = hidden.get('name'),
                value = hidden.get('value');
            if (!name) {
                return;
            }
            if (!(name in this.hiddenFieldValues) || value !== this.hiddenFieldValues[name]) {
                this.hiddenFieldValues[name] = value;
                this.valueChanged({target: hidden});
            }
        }, this);
    },

    /**
     * Initialise watchers on all TinyMCE instances.
     *
     * @method initTinyMCE
     * @param {Number} repeatcount Because TinyMCE might load slowly, after us, we need
     * to keep trying every 10 seconds or so, until we detect TinyMCE is there,
     * or enough time has passed.
     */
    initTinyMCE: function(repeatcount) {
        if (typeof tinyMCE === 'undefined') {
            if (repeatcount > 0) {
                Y.later(this.TINYMCE_DETECTION_DELAY, this, this.initTinyMCE, [repeatcount - 1]);
            } else {
            }
            return;
        }

        this.editorChangeHandler = Y.bind(this.editorChanged, this);
        tinyMCE.onAddEditor.add(Y.bind(this.initTinyMCEEditor, this));
    },

    /**
     * Initialise the TinyMCE editor watchers.
     *
     * @method initTinyMCEEditor
     * @param {EventFacade} notused
     * @param {Object} editor The TinyMCE editor instance
     */
    initTinyMCEEditor: function(notused, editor) {
        editor.onChange.add(this.editorChangeHandler);
        editor.onRedo.add(this.editorChangeHandler);
        editor.onUndo.add(this.editorChangeHandler);
        editor.onKeyDown.add(this.editorChangeHandler);
    },

    /**
     * Handle a value changed event.
     *
     * @method valueChanged
     * @param {EventFacade} e
     */
    valueChanged: function(e) {
        if (e.target.get('name') === 'thispage' || e.target.get('name') === 'scrollpos' ||
                e.target.get('name').match(/_:flagged$/)) {
            return; // Not interesting.
        }
        this.startSaveTimerIfNecessary();
    },

    /**
     * Handle an editor change.
     *
     * @method editorChanged
     * @param {Object} editor The instance of the TinyMCE editor
     */
    editorChanged: function(editor) {
        this.startSaveTimerIfNecessary();
    },

    /**
     * Start the save timer if necessary.
     *
     * @method startSaveTimerIfNecessary
     */
    startSaveTimerIfNecessary: function() {
        this.dirty = true;

        if (this.delayTimer || this.saveTransaction) {
            // Already counting down or daving.
            return;
        }

        this.startSaveTimer();
    },

    /**
     * Start the save timer.
     *
     * @method startSaveTimer
     */
    startSaveTimer: function() {
        this.cancelDelay();
        this.delayTimer = Y.later(this.delay, this, this.saveChanges);
    },

    /**
     * Cancel the delay timer.
     *
     * @method cancelDelay
     */
    cancelDelay: function() {
        if (this.delayTimer && this.delayTimer !== true) {
            this.delayTimer.cancel();
        }
        this.delayTimer = null;
    },

    /**
     * Save changes to the form.
     *
     * @method saveChanges
     */
    saveChanges: function() {
        this.cancelDelay();
        this.dirty = false;

        if (this.isTimeNearlyOver()) {
            this.stopAutoSaving();
            return;
        }

        if (typeof tinyMCE !== 'undefined') {
            tinyMCE.triggerSave();
        }
        this.saveTransaction = Y.io(this.AUTOSAVE_HANDLER, {
            method:  'POST',
            form:    {id: this.form},
            on:      {
                success: this.saveDone,
                failure: this.saveFailed
            },
            context: this
        });
    },

    /**
     * Mark the current save as being completed successfully.
     *
     * @method saveDone
     */
    saveDone: function() {
        this.saveTransaction = null;

        if (this.dirty) {
            this.startSaveTimer();
        }

        if (this.saveFailures > 0) {
            Y.one(this.SELECTORS.CONNECTION_ERROR).hide();
            Y.one(this.SELECTORS.CONNECTION_OK).show();
            this.saveFailures = this.FIRST_SUCCESSFUL_SAVE;
        } else if (this.saveFailures === this.FIRST_SUCCESSFUL_SAVE) {
            Y.one(this.SELECTORS.CONNECTION_OK).hide();
            this.saveFailures = 0;
        }
    },

    /**
     * The handler for save failures.
     *
     * @method saveFailed
     */
    saveFailed: function() {
        this.saveTransaction = null;

        // We want to retry soon.
        this.startSaveTimer();

        this.saveFailures = Math.max(1, this.saveFailures + 1);
        if (this.saveFailures === this.FAILURES_BEFORE_NOTIFY) {
            Y.one(this.SELECTORS.CONNECTION_ERROR).show();
            Y.one(this.SELECTORS.CONNECTION_OK).hide();
        }
    },

    /**
     * Determine whether the timer is nearly over.
     *
     * This is defined as being two times delay.
     *
     * @method isTimeNearlyOver
     * @return {Boolean} Whether the timer has nearly finished counting down.
     */
    isTimeNearlyOver: function() {
        return M.mod_quiz.timer && M.mod_quiz.timer.endtime &&
                (new Date().getTime() + 2 * this.delay) > M.mod_quiz.timer.endtime;
    },

    /**
     * Stop autosaving this form.
     *
     * @method stopAutoSaving
     */
    stopAutoSaving: function() {
        this.cancelDelay();
        this.delayTimer = true;
        if (this.saveTransaction) {
            this.saveTransaction.abort();
        }
    }
};


}, '@VERSION@', {"requires": ["base", "node", "event", "event-valuechange", "node-event-delegate", "io-form"]});
