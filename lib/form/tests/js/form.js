describe("lib/form/form.js tests", function() {
    beforeEach(function() {
        global.initBeforeTest();

        requireLegacyFile('lib/form/form.js');
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
            global.Y.use('base', function(Y) {
                var formManager = M.form.initFormDependencies(Y, formid, []);
                expect(formManager).toEqual(jasmine.any(M.form.dependencyManager));
            });
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

        fit("Should be separate instances", function() {
            global.Y.use('base', function(Y) {
                console.log("Initting with " + formaid);
                var formaManager = M.form.initFormDependencies(Y, formaid, []);
                console.log("Initting with " + formbid);
                var formbManager = M.form.initFormDependencies(Y, formbid, []);

                // Both should be dependencyManager instances.
                expect(formaManager).toEqual(jasmine.any(M.form.dependencyManager));
                expect(formbManager).toEqual(jasmine.any(M.form.dependencyManager));

                // They should not be the same.
                expect(formaManager).not.toBe(formbManager);

                // Prototypal properties should not be the same.
                expect(formaManager._form).not.toBe(formbManager._form);
                expect(formaManager._locks).not.toBe(formbManager._locks);
                expect(formaManager._hides).not.toBe(formbManager._hides);
                expect(formaManager._dirty).not.toBe(formbManager._dirty);
            });
        });
    });
});
