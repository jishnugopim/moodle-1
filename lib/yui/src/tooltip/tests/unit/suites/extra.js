suite.add(new Y.Test.Case({
    name: 'Checknet passes',

    'Should extend': function() {
        var node = Y.Node.create('<div/>'),
            data = node.getData();

        Y.Assert.isUndefined(Y.Object.keys(data)[0]);
    }
}));

Y.Test.Runner.add(suite);
