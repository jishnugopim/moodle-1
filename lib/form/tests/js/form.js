var using = require('jasmine-data-provider');

describe("lib/form/form.js tests", function() {
    beforeEach(function() {
        global.initBeforeTest();

        global.Y.use('base', function(Y) {
            requireLegacyFile('lib/form/form.js');
        });
    });

    describe("M.form structure", function() {
        it("M.form exists", function() {
            expect(M.form).toEqual(jasmine.any(Object));
        });

        it("M.form.dependencyManager exists", function() {
            expect(M.form.dependencyManagers).toEqual(jasmine.any(Object));
        });

        it("M.form.initFormDependencies exists", function() {
            expect(M.form.initFormDependencies).toEqual(jasmine.any(Function));
        });

        it("M.form.updateFormState exists", function() {
            expect(M.form.updateFormState).toEqual(jasmine.any(Function));
        });
    });

    describe("M.form.updateFormState", function() {
        it("Should not be called if dependencyManagers does not contain the formId", function() {
            expect(M.form.dependencyManagers).toEqual({});
            expect(M.form.updateFormState(Math.random() * 10000)).toEqual(undefined);
        });

        it("Should call updateAllDependencies if the formId Matches", function() {
            var randId = Math.random() * 10000;
            M.form.dependencyManagers[randId] = {
                updateAllDependencies: function() {}
            };

            spyOn(M.form.dependencyManagers[randId], 'updateAllDependencies');
            M.form.updateFormState(randId);
            expect(M.form.dependencyManagers[randId].updateAllDependencies).toHaveBeenCalledTimes(1);
        });
    });

    describe("Initialisation", function() {
        var formid = 'form-' + parseInt(Math.random() * 10000, 10);

        beforeEach(function() {
            var form = Y.Node.create('<form>')
                .setAttribute('id', formid)
                ;
            Y.one('body').appendChild(form);
        });

        it("Should work", function() {
            var formManager = M.form.initFormDependencies(Y, formid, []);
            expect(formManager).toEqual(jasmine.any(M.form.dependencyManager));
        });
    });

    describe("Initialisation with multiple forms", function() {
        var formaid = 'form-' + parseInt(Math.random() * 10000, 10) + '-a',
            formbid = 'form-' + parseInt(Math.random() * 10000, 10) + '-b',
            forma,
            formb
            ;

        beforeEach(function() {
            forma = Y.Node.create('<form>')
                .setAttribute('id', formaid)
                ;
            formb = Y.Node.create('<form>')
                .setAttribute('id', formbid)
                ;
            Y.one('body').appendChild(forma);
            Y.one('body').appendChild(formb);
        });

        it("Should be separate instances", function() {
            var formaManager = M.form.initFormDependencies(Y, formaid, []);
            var formbManager = M.form.initFormDependencies(Y, formbid, []);

            // Both should be dependencyManager instances.
            expect(formaManager).toEqual(jasmine.any(M.form.dependencyManager));
            expect(formbManager).toEqual(jasmine.any(M.form.dependencyManager));

            // They should not be the same.
            expect(formaManager).not.toBe(formbManager);

            // Prototypal properties should not be the same.
            expect(formaManager.get('form')).not.toBe(formbManager.get('form'));
            expect(formaManager._locks).not.toBe(formbManager._locks);
            expect(formaManager._hides).not.toBe(formbManager._hides);
            expect(formaManager._dirty).not.toBe(formbManager._dirty);
        });
    });

    describe('foo', function() {
        var formProvider = function () {
            return [
                    {
                        elements: [
                                '<input type="checkbox" name="cb1">',
                                '<input type="text" name="te1">'
                            ],
                        dependencies: {
                            cb1: {
                                notchecked: [
                                    'te1'
                                ]
                            }
                        },
                        startExpectation: [
                                {
                                    selector: '[name="te1"]',
                                    attribute: 'disabled',
                                    hasValue: ''
                                }
                            ],
                        endExpectation: [
                                {
                                    selector: '[name="te1"]',
                                    attribute: 'disabled',
                                    hasValue: 'disabled'
                                }
                            ]
                    },
                    {
                        elements: [
                                '<input type="checkbox" name="cb1">',
                                '<input type="text" name="te1">',
                                '<input type="text" name="te2">'
                            ],
                        dependencies: {
                            cb1: {
                                notchecked: [
                                    'te1'
                                ]
                            }
                        },
                        startExpectation: [
                                {
                                    selector: '[name="te1"]',
                                    attribute: 'disabled',
                                    hasValue: ''
                                },
                                {
                                    selector: '[name="te2"]',
                                    attribute: 'disabled',
                                    hasValue: ''
                                }
                            ],
                        endExpectation: [
                                {
                                    selector: '[name="te1"]',
                                    attribute: 'disabled',
                                    hasValue: 'disabled'
                                },
                                {
                                    selector: '[name="te2"]',
                                    attribute: 'disabled',
                                    hasValue: ''
                                }
                            ]
                    }
                ];
        };

        using(formProvider, function(data) {
            fit('Test', function() {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10) + '-a',
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid)
                        ;
                Y.one('body').appendChild(form);

                var key,
                    value;

                for (key in data.elements) {
                    form.appendChild(Y.Node.create(data.elements[key]));
                }

                if (data.startExpectation) {
                    for (key in data.startExpectation) {
                        value = data.startExpectation[key];
                        expect(form.one(value.selector).getAttribute(value.attribute)).toEqual(value.hasValue);
                    }
                }

                var formaManager = M.form.initFormDependencies(Y, formid, data.dependencies);

                if (data.startExpectation) {
                    for (key in data.endExpectation) {
                        value = data.endExpectation[key];
                        expect(form.one(value.selector).getAttribute(value.attribute)).toEqual(value.hasValue);
                    }
                }
            });
        });
    });
});
