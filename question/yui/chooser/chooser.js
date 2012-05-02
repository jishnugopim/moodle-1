YUI.add('moodle-question-chooser', function(Y) {
    var CSS = {
        CREATENEWQUESTION : 'div.createnewquestion',
        CREATENEWQUESTIONFORM : 'div.createnewquestion form',
        CHOOSERDIALOGUE : 'div.chooserdialogue',
        CHOOSERHEADER : 'div.choosertitle',
        QBANKCATEGORY : '#qbankcategory'
    };

    var CHOOSERNAME = 'question-chooser';

    var CHOOSER = function() {
        CHOOSER.superclass.constructor.apply(this, arguments);
    }

    Y.extend(CHOOSER, M.core.chooserdialogue, {
        initializer : function(config) {
            var dialogue = Y.one(CSS.CREATENEWQUESTION + ' ' + CSS.CHOOSERDIALOGUE);
            var header = Y.one(CSS.CREATENEWQUESTION + ' ' + CSS.CHOOSERHEADER);
            var params = {
            };
            this.setup_chooser_dialogue(dialogue, header, params);

            var chooserform = Y.one(CSS.CREATENEWQUESTIONFORM);

            // Set the category ID in the form
            this.container.one(CSS.QBANKCATEGORY).set('value', chooserform.get('category').get('value'));

            // Actually display the submit button
            chooserform.on('submit', this.display_chooser, this);
        },
    },
    {
        NAME : CHOOSERNAME,
        ATTRS : {
        }
    });
    M.question = M.question || {};
    M.question.init_chooser = function(config) {
        return new CHOOSER(config);
    }
},
'@VERSION@', {
    requires:['base', 'overlay', 'moodle-core-chooserdialogue']
}
);
