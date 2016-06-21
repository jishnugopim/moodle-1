require('../../../testing/js/bootstrap');

describe("lib/form/form.js", function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    describe('dependency check:', function() {
        var formProvider = function () {
            return [
                {
                    description: 'Any value',
                    elements: [
                            '<input type="checkbox" name="checkbox1" value="1">',
                            '<span id="textbox1_fitem" class="fitem"><input type="text" name="textbox1"></span>',
                            '<span id="textbox2_fitem" class="fitem"><input type="text" name="textbox2"></span>',
                            '<span id="textbox3_fitem" class="fitem"><input type="text" name="textbox3"></span>',
                        ],
                    dependencies: {
                        checkbox1: {
                            hide: {
                                1: [
                                    'textbox1',
                                    'textbox3'
                                ]
                            }
                        }
                    },
                    expectations: [
                            {
                                selector: '#textbox1_fitem',
                                hidden: {
                                    start: false,
                                    end: true
                                }
                            },
                            {
                                selector: '#textbox2_fitem',
                                hidden: {
                                    start: false,
                                    end: false
                                }
                            },
                            {
                                selector: '#textbox3_fitem',
                                hidden: {
                                    start: false,
                                    end: true
                                }
                            },
                        ]
                }
            ];
        };

        given(formProvider())
            .it('Hide dependent items', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                var key,
                    value,
                    isVisible;

                for (key in data.elements) {
                    form.appendChild(Y.Node.create(data.elements[key]));
                }

                // Check the initial value before the form is initialised.
                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('hidden') && value.hidden.hasOwnProperty('start')) {
                        isVisible = value.hidden.start ? 'none' : '';
                        expect(form.one(value.selector).getStyle('display')).to.equal(isVisible);
                    }
                }

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, data.dependencies);

                // Check the values immediately after dependency initialisation.
                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('hidden') && value.hidden.hasOwnProperty('end')) {
                        isVisible = value.hidden.end ? 'none' : '';
                        expect(form.one(value.selector).getStyle('display')).to.equal(isVisible);
                    }
                }
        });
    });
});
