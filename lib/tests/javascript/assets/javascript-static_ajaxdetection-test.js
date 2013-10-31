YUI.add('javascript-static_ajaxdetection-test', function (Y) {

    /**
     * A generic setUp function we generally want to use for all tests.
     *
     * This resets all of the tracking arrays used by the underlying functions.  *
     * @method generic_setUp
     */
    var generic_setUp = function() {
        // Clear the tracking arrays that we have
        M.util.pending_js = [];
        M.util.complete_js = [];
    };

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Input sanitisation on js_pending',

        // Use our generic setUp function.
        setUp: generic_setUp,

        'js_pending: passed empty value': function() {
            // Empty !== false
            var result = M.util.js_pending();
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed explicit null value': function() {
            // null !== false
            var result = M.util.js_pending(null);
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed explicit false value': function() {
            // false === false
            var result = M.util.js_pending(false);
            Y.Assert.areEqual(0, result);
        },

        'js_pending: passed unique values': function() {
            var result;
            result = M.util.js_pending('example1');
            Y.Assert.areEqual(1, result);

            result = M.util.js_pending('example2');
            Y.Assert.areEqual(2, result);

            result = M.util.js_pending('example3');
            Y.Assert.areEqual(3, result);
        },

        'js_pending: passed non-unique values': function() {
            // uniqid is not unique
            var uniqid = 'example',
                result;
            result = M.util.js_pending(uniqid);
            Y.Assert.areEqual(1, result);

            result = M.util.js_pending(uniqid);
            Y.Assert.areEqual(2, result);
        },

        'js_pending: passed an empty array': function() {
            var result;
            result = M.util.js_pending([]);
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed an array with content': function() {
            var result;
            result = M.util.js_pending([
                'somevalue'
            ]);
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed an empty object': function() {
            var result;
            result = M.util.js_pending({});
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed an object with content': function() {
            var result;
            result = M.util.js_pending({
                'somevalue': true
            });
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed a number': function() {
            var result;
            result = M.util.js_pending(42);
            Y.Assert.areEqual(1, result);
        },

        'js_pending: passed a String': function() {
            var result;
            result = M.util.js_pending("Some String");
            Y.Assert.areEqual(1, result);
        }
    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Input sanitisation on js_complete',

        // Use our generic setUp function.
        setUp: generic_setUp,

        'js_complete: passed empty value': function() {
            // Empty !== false
            var result = M.util.js_complete();
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed explicit null value': function() {
            // null !== false
            var result = M.util.js_complete(null);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed explicit false value': function() {
            // false === false
            var result = M.util.js_complete(false);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed unique values': function() {
            var result;
            result = M.util.js_complete('example1');
            Y.Assert.areEqual(0, result);

            result = M.util.js_complete('example2');
            Y.Assert.areEqual(0, result);

            result = M.util.js_complete('example3');
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed non-unique values': function() {
            // uniqid is not unique
            var uniqid = 'example',
                result;
            result = M.util.js_complete(uniqid);
            Y.Assert.areEqual(0, result);

            result = M.util.js_complete(uniqid);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed an empty array': function() {
            var result;
            result = M.util.js_complete([]);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed an array with content': function() {
            var result;
            result = M.util.js_complete([
                'somevalue'
            ]);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed an empty object': function() {
            var result;
            result = M.util.js_complete({});
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed an object with content': function() {
            var result;
            result = M.util.js_complete({
                'somevalue': true
            });
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed a number': function() {
            var result;
            result = M.util.js_complete(42);
            Y.Assert.areEqual(0, result);
        },

        'js_complete: passed a String': function() {
            var result;
            result = M.util.js_complete("Some String");
            Y.Assert.areEqual(0, result);
        }
    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'js_complete: Pushing to the completion array',

        // Use our generic setUp function.
        setUp: generic_setUp,

        'js_complete: Removing incorrect values does not modify the completion array': function() {
            // Add and remove the same item.
            var item1 = 'one',
                result;

            result = M.util.js_complete(item1);
            Y.Assert.areEqual(0, result);

            // We also should not have added it to the completeion array.
            Y.Assert.areEqual(0, M.util.complete_js.length);
        }

    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Start + Complete combined',

        // Use our generic setUp function.
        setUp: generic_setUp,

        'combined: basic': function() {
            // Add and remove the same item.
            var item1 = 'one',
                result;

            // Adding should increment.
            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            // Completing should take us back down.
            result = M.util.js_complete(item1);
            Y.Assert.areEqual(0, result);
        },

        'combined: basic with multiple - in order': function() {
            // Add and remove the same item.
            var item1 = 'one',
                item2 = 'two',
                result;

            // Adding should increment.
            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            result = M.util.js_pending(item2);
            Y.Assert.areEqual(2, result);

            // Completing should take us back down.
            result = M.util.js_complete(item1);
            Y.Assert.areEqual(1, result);

            result = M.util.js_complete(item2);
            Y.Assert.areEqual(0, result);
        },

        'combined: basic with multiple - out of order': function() {
            // Add and remove the same item.
            var item1 = 'one',
                item2 = 'two',
                result;

            // Adding should increment.
            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            result = M.util.js_pending(item2);
            Y.Assert.areEqual(2, result);

            // Completing should take us back down.
            result = M.util.js_complete(item2);
            Y.Assert.areEqual(1, result);

            result = M.util.js_complete(item1);
            Y.Assert.areEqual(0, result);
        },

        'combined: basic with multiple - sequential add/remove': function() {
            // Add and remove the same item.
            var item1 = 'one',
                item2 = 'two',
                result;

            // Adding should increment.
            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            // Completing should take us back down.
            result = M.util.js_complete(item1);
            Y.Assert.areEqual(0, result);

            result = M.util.js_pending(item2);
            Y.Assert.areEqual(1, result);

            result = M.util.js_complete(item2);
            Y.Assert.areEqual(0, result);
        },

        'combined: basic with multiple - mis-ordered add/remove': function() {
            // Add and remove the same item.
            var item1 = 'one',
                item2 = 'two',
                result;

            // Adding should increment.
            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            // item2 has not been added, so it will not be removed.
            result = M.util.js_complete(item2);
            Y.Assert.areEqual(1, result);

            // We also should not have added it to the completion array.
            Y.Assert.areEqual(0, M.util.complete_js.length);

            // Now we add item2, we should not expect it to remove the item.
            result = M.util.js_pending(item2);
            Y.Assert.areEqual(2, result);

            result = M.util.js_complete(item1);
            Y.Assert.areEqual(1, result);
        },

        'combined: basic with multiple - duplicate values': function() {
            // Add and remove the same item.
            var item1 = 'one',
                result;

            result = M.util.js_pending(item1);
            Y.Assert.areEqual(1, result);

            result = M.util.js_pending(item1);
            Y.Assert.areEqual(2, result);

            result = M.util.js_complete(item1);
            Y.Assert.areEqual(1, result);
            Y.Assert.areEqual(1, M.util.complete_js.length);

            result = M.util.js_complete(item1);
            Y.Assert.areEqual(0, result);
            Y.Assert.areEqual(2, M.util.complete_js.length);
        }

    }));

}, '@VERSION@' ,{requires:[
    'test', 'io'
]});
