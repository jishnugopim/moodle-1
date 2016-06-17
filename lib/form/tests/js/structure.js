require('../../../testing/js/bootstrap');

describe('lib/form/form.js', function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    describe('structure', function() {
        it("Creates M.form if it does not already exist", function(done) {
            delete M.form;
            Y.use('base', function() {
                include('lib/form/form.js');
                expect(M.form).to.be.a('Object');
                done();
            });
        });

        it("M.form.dependencyManager exists", function() {
            expect(M.form.dependencyManagers).to.be.a('Object');
        });

        it("M.form.initFormDependencies exists", function() {
            expect(M.form.initFormDependencies).to.be.a('Function');
        });

        it("M.form.updateFormState exists", function() {
            expect(M.form.updateFormState).to.be.a('Function');
        });
    });

    describe("M.form.updateFormState", function() {
        it("Should not be called if dependencyManagers does not contain the formId", function() {
            expect(M.form.dependencyManagers).to.be.a('Object');
            expect(M.form.dependencyManagers).to.be.empty;
            expect(M.form.updateFormState(Math.random() * 10000)).to.equal(undefined);
        });

        it("Should call updateAllDependencies if the formId Matches", function() {
            var randId = Math.random() * 10000;
            M.form.dependencyManagers[randId] = {
                updateAllDependencies: function() {}
            };

            var spy = sinon.spy(M.form.dependencyManagers[randId], "updateAllDependencies");
            M.form.updateFormState(randId);
            expect(spy.calledOnce).to.be.true;
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

        it("Should return false if there are no dependencies", function() {
            var formManager = M.form.initFormDependencies(Y, formid, null);
            expect(formManager).to.equal(false);
        });

        it("Should work", function() {
            var formManager = M.form.initFormDependencies(Y, formid, []);
            expect(formManager).to.be.an.instanceof(M.form.dependencyManager);
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
            expect(formaManager).to.be.an.instanceof(M.form.dependencyManager);
            expect(formbManager).to.be.an.instanceof(M.form.dependencyManager);

            // They should not be the same.
            expect(formaManager).not.to.equal(formbManager);

            // Prototypal properties should not be the same.
            expect(formaManager._locks).not.to.equal(formbManager._locks);
            expect(formaManager._hides).not.to.equal(formbManager._hides);
            expect(formaManager._dirty).not.to.equal(formbManager._dirty);
            expect(formaManager.get('form')).not.to.equal(formbManager.get('form'));
        });
    });
});
