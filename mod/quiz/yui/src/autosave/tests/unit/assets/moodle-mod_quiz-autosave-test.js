YUI.add('moodle-mod_quiz-autosave-test', function (Y) {

    var testBody = Y.one(Y.config.doc.body);

    var tearDown = function() {
        testBody.one('#testarea').remove(true);
    };

    var createTestForm = function() {
        var testarea = Y.Node.create('<div id="testarea">');
        var testform = Y.Node.create('<form id="responseform" action="action">');
        testarea.appendChild(testform);

        testBody.appendChild(testarea);
    };

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Basic tests',

        tearDown: tearDown,

        'Should instantiate correctly': function() {
            Y.use('moodle-mod_quiz-autosave', function() {
                createTestForm();
                M.mod_quiz.autosave.WATCH_HIDDEN_DELAY = 1;
                M.mod_quiz.autosave.init(10);
                Y.Assert.isObject(M.mod_quiz.autosave.form);
                Y.Assert.areEqual(Y.one('form#responseform'), M.mod_quiz.autosave.form);
            });
        },
        'Should not die if the form could not be found': function() {
            Y.use('moodle-mod_quiz-autosave', function() {
                var returnValue = M.mod_quiz.autosave.init(10);
                Y.Assert.isUndefined(returnValue);
                Y.Assert.isNull(M.mod_quiz.autosave.form);
            });
        }
    }));

}, '@VERSION@' ,{requires:[
    'moodle-mod_quiz-autosave',
    'test'
]});
