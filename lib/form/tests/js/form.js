require('../../../testing/js/bootstrap');

describe("lib/form/form.js", function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    describe('Initial dependency tests', function() {
        var formProvider = function () {
            var dependentValues = [
                '<input type="text" name="text1">',
                '<input type="text" name="text2">',
                '<input type="button" name="button1">',
                '<input type="button" name="button2">',
                '<input type="submit" name="submit1">',
                '<input type="submit" name="submit2">',
                '<input type="radio" name="radio1">',
                '<input type="radio" name="radio2">',
                '<input type="checkbox" name="checkbox1">',
                '<input type="checkbox" name="checkbox2">',
                '<select name="select1"><option>a</option></select>',
                '<select name="select2"><option>a</option></select>',
                '<input type="radio" name="radio1">',
                '<input type="radio" name="radio2">'
            ];

            var baseExpectations = [
                {
                    selector: '[name="text1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="text2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                },
                {
                    selector: '[name="button1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="button2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                },
                {
                    selector: '[name="submit1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="submit2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                },
                {
                    selector: '[name="checkbox1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="checkbox2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                },
                {
                    selector: '[name="select1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="select2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                },
                {
                    selector: '[name="radio1"]',
                    disabled: {
                        start: false
                    }
                },
                {
                    selector: '[name="radio2"]',
                    disabled: {
                        start: false,
                        end: false
                    }
                }
            ];

            return [
                {
                    description: 'checkbox, notchecked',
                    elements: dependentValues.concat([
                            '<input type="checkbox" name="inputValue">',
                        ]),
                    dependencies: {
                        inputValue: {
                            notchecked: {
                                "0": [
                                    'text1',
                                    'button1',
                                    'submit1',
                                    'checkbox1',
                                    'select1',
                                    'radio1'
                                ]
                            }
                        }
                    },
                    expectations: baseExpectations.concat([
                            {
                                selector: '[name="text1"]',
                                disabled: {
                                    end: true
                                }
                            },
                            {
                                selector: '[name="button1"]',
                                disabled: {
                                    end: true
                                }
                            },
                            {
                                selector: '[name="submit1"]',
                                disabled: {
                                    end: true
                                }
                            },
                            {
                                selector: '[name="checkbox1"]',
                                disabled: {
                                    end: true
                                }
                            },
                            {
                                selector: '[name="select1"]',
                                disabled: {
                                    end: true
                                }
                            },
                            {
                                selector: '[name="radio1"]',
                                disabled: {
                                    end: true
                                }
                            }
                        ])
                    },
                    {
                        description: 'checkbox, checked',
                        elements: dependentValues.concat([
                                '<input type="checkbox" name="inputValue">',
                            ]),
                        dependencies: {
                            inputValue: {
                                checked: [
                                    'text1',
                                    'button1',
                                    'submit1',
                                    'checkbox1',
                                    'select1',
                                    'radio1'
                                ]
                            }
                        },
                        expectations: baseExpectations.concat([
                                {
                                    selector: '[name="text1"]',
                                    disabled: {
                                        end: false
                                    }
                                },
                                {
                                    selector: '[name="button1"]',
                                    disabled: {
                                        end: false
                                    }
                                },
                                {
                                    selector: '[name="submit1"]',
                                    disabled: {
                                        end: false
                                    }
                                },
                                {
                                    selector: '[name="checkbox1"]',
                                    disabled: {
                                        end: false
                                    }
                                },
                                {
                                    selector: '[name="select1"]',
                                    disabled: {
                                        end: false
                                    }
                                },
                                {
                                    selector: '[name="radio1"]',
                                    disabled: {
                                        end: false
                                    }
                                }
                            ])
                    }
                ];
        };

        given(formProvider())
            .it('Different form elements can affect each other', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10) + '-a',
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                var key,
                    value,
                    isDisabled;

                for (key in data.elements) {
                    form.appendChild(Y.Node.create(data.elements[key]));
                }

                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('disabled') && value.disabled.hasOwnProperty('start')) {
                        isDisabled = value.disabled.start ? 'disabled' : '';
                        expect(form.one(value.selector).getAttribute('disabled')).to.eql(isDisabled);
                    }
                }

                Manager = M.form.initFormDependencies(Y, formid, data.dependencies);

                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('disabled') && value.disabled.hasOwnProperty('end')) {
                        isDisabled = value.disabled.end ? 'disabled' : '';
                        expect(form.one(value.selector).getAttribute('disabled')).to.eql(isDisabled);
                    }
                }

        });
    });
});
