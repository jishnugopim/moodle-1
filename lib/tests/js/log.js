require('../../testing/js/bootstrap');

describe('core/log', function() {
    describe('setConfig', function() {
        var data = [
            [{}, false],
            [{foo: 'bar'}, false],
            [{level: 'foo'}, true, 'foo']
        ];

        given.apply(this, data).test('Different log levels can be set', function(config, called, calledWith) {
            // Mock the core/loglevel and spy on the setLevel function which we expect to be called.
            var spy = sinon.spy();
            injector.mock('core/loglevel', {
                    setLevel: spy
                });

            // Require log with the injected core/loglevel.
            var log = injector.require('lib/amd/src/log.js');

            // Run the test.
            log.setConfig(config);
            expect(spy.called).to.equal(called);
            if (called) {
                expect(spy.calledWith({level: calledWith}));
            }
        });
    });
});
