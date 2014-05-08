    suite.add(new Y.Test.Case({
        name: 'Basic tests',

        tearDown: function() {
            var testBody = Y.one(Y.config.doc.body),
                testarea = testBody.one('#testarea');
            if (testarea) {
                testarea.remove(true);
            }

            // Put the original M.mod_quiz.autosave back in place.
            M.mod_quiz.autosave = this._originalAutosave;
        },

        setUp: function() {
            var testBody = Y.one(Y.config.doc.body),
                testarea = Y.Node.create('<div id="testarea">'),
                testform = Y.Node.create('<form id="responseform" action="action">');

            testarea.appendChild(testform);
            testBody.appendChild(testarea);

            // Create a copy of M.mod_quiz.autosave - we must do a deep
            // copy because we do not create instances.
            this._originalAutosave = M.mod_quiz.autosave;
            M.mod_quiz.autosave = Y.clone(this._originalAutosave, true);
        },

        'Should instantiate correctly': function() {
            M.mod_quiz.autosave.WATCH_HIDDEN_DELAY = 1;
            M.mod_quiz.autosave.init(10);
            Y.Assert.isObject(M.mod_quiz.autosave.form);
            Y.Assert.areEqual(Y.one('form#responseform'), M.mod_quiz.autosave.form);
        },

        'Should not die if the form could not be found': function() {
            // Remove the test form region now - before we initialise.
            var testBody = Y.one(Y.config.doc.body),
                testarea = testBody.one('#testarea');
            if (testarea) {
                testarea.remove(true);
            }

            // Now start the tests.
            var returnValue = M.mod_quiz.autosave.init(10);
            Y.Assert.isUndefined(returnValue);
            Y.Assert.isNull(M.mod_quiz.autosave.form);
        }
    }));

    runner.add(suite);
