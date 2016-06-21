require('../../../testing/js/bootstrap');

describe("lib/form/form.js", function() {
    beforeEach(function(done) {
        // Include the unit under test.
        Y.use('base', function() {
            include('lib/form/form.js');
            done();
        });
    });

    var createFilePicker = function(name) {
        var region = Y.Node.create(
                '<span class="fitem fitem_ffilepicker">' +
                    '<input type="hidden">' +
                '</span>'
            ),
            input = region.one('input');

        input.setAttribute('name', name);

        return region;

    };

    describe('File picker tests', function() {
        var isFilePickerProvider = function() {
            return [
                {
                    description: 'No filepickers',
                    filepickers: [
                    ],
                    tests: {
                        example: false,
                        another: false
                    }
                },
                {
                    description: 'One filepicker',
                    filepickers: [
                        'example',
                    ],
                    tests: {
                        example: true,
                        another: false
                    }
                },
                {
                    description: 'Reserved words',
                    filepickers: [
                        'hasOwnProperty',
                        'constructor',
                        'sort',
                        'example',
                    ],
                    tests: {
                        example: true,
                        another: false
                    }
                },
            ];
        };

        given(isFilePickerProvider())
            .it("isFilePicker", function(data) {
                var formid = 'form-' + parseInt(Math.random() * 10000, 10),
                    form = Y.Node.create('<form>')
                        .setAttribute('id', formid) ;
                Y.one('body').appendChild(form);

                var key, value;

                for (key in data.filepickers) {
                    value = data.filepickers[key];
                    var filepicker = createFilePicker(value);
                    form.appendChild(filepicker);
                }

                // Initialise the form manager. This will cause the initial values to be set.
                var formManager = M.form.initFormDependencies(Y, formid, {});

                for (key in data.tests) {
                    value = data.tests[key];
                    expect(formManager.isFilePicker(key)).to.eql(value);
                }
        });
    });
});
