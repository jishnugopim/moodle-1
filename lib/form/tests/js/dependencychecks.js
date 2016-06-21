require('../../../testing/js/bootstrap');

describe("lib/form/form.js", function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    describe('_dependency_notchecked', function() {
        var _dependency_notcheckedProvider = function() {
            return [
                {
                    description: 'Checkbox: No checked checkboxes',
                    elements: [
                        '<input type="checkbox" name="unchecked">'
                    ],
                    value: null,
                    lock: true,
                    hide: false
                },
                {
                    description: 'Checkbox: at least one checked checkbox',
                    elements: [
                        '<input type="checkbox" name="unchecked">',
                        '<input type="checkbox" checked="1" name="checked">',
                    ],
                    value: null,
                    lock: true,
                    hide: false
                },
                {
                    description: 'Checkbox: All checkboxes checked',
                    elements: [
                        '<input type="checkbox" checked="1" name="checked">'
                    ],
                    value: null,
                    lock: false,
                    hide: false
                },
                {
                    description: 'Radio: Ignored',
                    elements: [
                        '<input type="radio" checked="1" name="checked">'
                    ],
                    value: null,
                    lock: false,
                    hide: false
                }
            ];
        };

        given(_dependency_notcheckedProvider())
            .it("Returns the correct value", function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid) ;
                Y.one('body').appendChild(form);

                var elements = new Y.NodeList();
                data.elements.forEach(function(value) {
                    var element = Y.Node.create(value);
                    elements.push(element);
                    form.appendChild(element);
                });

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, {});

                expect(formManager._dependency_notchecked(elements, data.value)).to.eql({
                    lock: data.lock,
                    hide: data.hide
                });

            });
    });
});
