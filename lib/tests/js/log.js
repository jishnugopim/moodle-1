require('../../testing/js/bootstrap');

describe('core/log', function() {
    describe('setConfig', function() {
        var data = [
            [{}, false],
            [{foo: 'bar'}, false],
            [{level: 'info'}, true, 'info']
        ];

        given.apply(this, data).test('Different log levels can be set', function(config, called, calledWith) {
            // Mock the core/loglevel and spy on the setLevel function which we expect to be called.
            var loglevel = amd.unmock('core/loglevel', 'lib/amd/src/loglevel');
            sinon.spy(loglevel, "setLevel");

            // Require log with the injected core/loglevel.
            var log = amd.unmock('core/log', 'lib/amd/src/log');

            // Run the test.
            log.setConfig(config);
            expect(loglevel.setLevel.called).to.equal(called);
            if (called) {
                expect(loglevel.setLevel.calledWith({level: calledWith}));
            }
        });
    });
});
