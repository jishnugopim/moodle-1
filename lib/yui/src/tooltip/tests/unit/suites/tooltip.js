suite.add(new Y.Test.Case({
    name: 'main tooltip',

    'somethingBasic': function() {
        Y.Assert.isTrue(true);
        Y.Assert.isFalse(false);
    }
}));

Y.Test.Runner.add(suite);
