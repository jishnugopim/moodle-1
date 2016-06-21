require('../../../testing/js/bootstrap');

describe("lib/form/form.js", function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    describe('Reserved field names', function() {
        var formProvider = function () {
            return [
                {
                    description: 'unused sort',
                    elements: [
                            '<input type="hidden" name="sort">',
                            '<input type="checkbox" name="checkbox1">',
                            '<input type="text" name="text1">',
                        ],
                    dependencies: {
                        checkbox1: {
                            notchecked: {
                                1: [
                                    'text1'
                                ]
                            }
                        }
                    },
                    expectations: [
                            {
                                selector: '[name="text1"]',
                                attribute: 'disabled',
                                startValue: '',
                                endValue: 'disabled'
                            }
                        ]
                    },
                    {
                        description: 'dependon sort: disabled',
                        elements: [
                                '<input type="checkbox" name="sort">',
                                '<input type="text" name="text1">',
                            ],
                        dependencies: {
                            sort: {
                                notchecked: {
                                    1: [
                                        'text1'
                                    ]
                                }
                            }
                        },
                        expectations: [
                                {
                                    selector: '[name="text1"]',
                                    attribute: 'disabled',
                                    startValue: '',
                                    endValue: 'disabled'
                                }
                            ]
                    },
                    {
                        description: 'dependon sort: enabled',
                        elements: [
                                '<input type="checkbox" name="sort">',
                                '<input type="text" name="text1">',
                            ],
                        dependencies: {
                            sort: {
                                checked: {
                                    1: [
                                        'text1'
                                    ]
                                }
                            }
                        },
                        expectations: [
                                {
                                    selector: '[name="text1"]',
                                    attribute: 'disabled',
                                    startValue: '',
                                    endValue: ''
                                }
                            ]
                    },
                    {
                        description: 'dependency sort disabled',
                        elements: [
                                '<input type="checkbox" name="cb1">',
                                '<input type="text" name="sort">',
                            ],
                        dependencies: {
                            cb1: {
                                notchecked: {
                                    1: [
                                        'sort'
                                    ]
                                }
                            }
                        },
                        expectations: [
                                {
                                    selector: '[name="sort"]',
                                    attribute: 'disabled',
                                    startValue: '',
                                    endValue: 'disabled'
                                }
                            ]
                    },
                    {
                        description: 'dependency sort enabled',
                        elements: [
                                '<input type="checkbox" name="cb1">',
                                '<input type="text" name="sort">',
                            ],
                        dependencies: {
                            cb1: {
                                checked: {
                                    1: [
                                        'sort'
                                    ]
                                }
                            }
                        },
                        expectations: [
                                {
                                    selector: '[name="sort"]',
                                    attribute: 'disabled',
                                    startValue: '',
                                    endValue: ''
                                }
                            ]
                    }
                ];
        };

        given(formProvider())
            .it('Initial values work with reserved names', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                var key,
                    value;

                for (key in data.elements) {
                    form.appendChild(Y.Node.create(data.elements[key]));
                }

                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('startValue')) {
                        expect(form.one(value.selector).getAttribute(value.attribute)).to.eql(value.startValue);
                    }
                }

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, data.dependencies);

                for (key in data.expectations) {
                    value = data.expectations[key];
                    if (value.hasOwnProperty('endValue')) {
                        expect(form.one(value.selector).getAttribute(value.attribute)).to.eql(value.endValue);
                    }
                }
            });

        var prototypalProperties = function () {
            return [
                'constructor',
                'valueOf',
                'hasOwnProperty'
            ];
        };

        given(prototypalProperties())
            .it('Fetching a prototypal property should return an empty NodeList', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, {});

                var result = formManager.elementsByName(data);
                expect(result).to.be.an.instanceof(Y.NodeList);
                expect(result.size()).to.eql(0);
        });

        given(prototypalProperties())
            .it('Using a prototypal property is fine', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                form.appendChild(
                        Y.Node.create('<input type="text">')
                            .setAttribute('name', data)
                    );

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, {});

                var result = formManager.elementsByName(data);
                expect(result).to.be.an.instanceof(Y.NodeList);
                expect(result.size()).to.eql(0);
        });

        given(prototypalProperties())
            .it('Using a prototypal property is fine', function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                form.appendChild(Y.Node.create('<input type="text" name=="__dependent__">'));
                form.appendChild(
                        Y.Node.create('<input type="text">')
                            .setAttribute('name', data)
                    );

                var dependencies = {},
                    dependency = {
                        notchecked: {
                            1: [
                                '__dependent__'
                            ]
                        }
                    };

                dependencies[data] = dependency;

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, dependencies);

                var result = formManager.elementsByName(data);
                expect(result).to.be.an.instanceof(Y.NodeList);
                expect(result.size()).to.eql(1);
        });
    });
});
