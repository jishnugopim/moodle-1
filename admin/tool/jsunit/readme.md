JSUnit testing support in Moodle
================================

Configure your development system
---------------------------------
You need to create a new jsunit root directory for the test environment.
This must be outside of your standard moodle dirroot.

To do so, add `$CFG->jsunit-root = '/path/to/jsunitdataroot';` to your config.php file


Execute tests
--------------
To run a set of unit tests, execute `php admin/tool/jsunit/cli/util.php --test`

You can also generate coverage reports by specifying the `--coverage` option.

You can optionally specify the names of specific YUI modules within Moodle.

For full details, run `php admin/tool/jsunit/cli/util.php --help`.


How to add more tests?
----------------------
Before they can be run, tests must be defined. Since much of the testing
system is standard boilerplate code, this has been abstracted and tests
must instead be compiled using the phpunit tool's CLI helper script.

Test files are structured as follows within your YUI module:
```
tests/
└── unit
    ├── assets
    │   ├── image.gif
    │   ├── image.png
    │   └── style.css
    ├── config.json
    ├── html
    │   └── snippet.html
    └── suites
        ├── base.js
        └── extended.js
```

The `config.json` file describes each of the testsuites for your module.
It is described in more detail below.

Assets which are required for your tests can be included in the `assets`
directory. This may include things such as images, or style sheets which
you need to fetch.

The `html` directory contains HTML snippets which are included inline with the
compiled boilplate code for your test. This may include any markup you
specifically require for your test.

The `suites` directory contains the actual test suite JavaScript files.

Each suite is run inside a closure and provided with the variable `runner`
which contains a reference to the `Y.Test.Runner` instance created for this
testsuite.

config.json
-----------
```
{
    "moodle-yui-modulename": {
        "tests": {
            "SUITENAME": {
                "suites": [
                    "somefile.js",
                    "another.js",
                    "file.js",
                    "with.js",
                    "more.js",
                    "tests.js"
                ],
                "requires": [
                    "any-additional-dependencies-for-your-tests-only"
                ],
                "html": [
                    "somecontent.html"
                ]
            }
        }
    }
}
```

The `tests` object contains a set of uniquely named test suites.

The `suites` array contains a list of files for this suite. These must
exist within the `suites` directory.

The `requires` array is an optional list of YUI modules which are needed.
It _must not_ be used to specify additional dependencies for the module
itself.

The `html` array is an optional list of HTML snippets which are included
inline with the compiled boilplate code for your test. This may include any
markup you specifically require for your test.


Windows support
---------------
To be confirmed.
