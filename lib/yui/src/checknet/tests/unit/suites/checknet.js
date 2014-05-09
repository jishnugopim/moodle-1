var validCheck = 'assets/checknet.txt',
    invalidCheck = 'assets/nofile.txt';

suite.add(new Y.Test.Case({
    name: 'Basic tests',

    tearDown: function() {
        if (this.instance) {
            this.instance.checkTimer.cancel();
            if (this.instance._alertDialogue) {
                this.instance._alertDialogue.destroy();
            }
            this.instance = null;
        }

        if (this._io) {
            Y.io = this._io;
        }
    },

    'Should instantiate with no arguments defined': function() {
        var instance = M.core.checknet.init();
        Y.Assert.isObject(instance);

        instance.checkTimer.cancel();
    },

    'Should not display a warning on test success': function() {
        this.instance = M.core.checknet.init({
            frequency: 100,
            timeout: 100,
            uri: validCheck
        });

        this.wait(function()  {
            // Wait for a period until after the checks would have failed.
            Y.Assert.isNull(this.instance._alertDialogue);
        }, 400);
    },

    'Should display a warning on test success': function() {
        this.instance = M.core.checknet.init({
            frequency: 100,
            timeout: 100,
            uri: invalidCheck
        });

        this.wait(function()  {
            // Wait for a period until after the checks would have failed.
            Y.Assert.isInstanceOf(M.core.alert, this.instance._alertDialogue);
            Y.Assert.isTrue(this.instance._alertDialogue.get('visible'));
        }, 400);
    },

    'Should display a warning which goes away when file can be found again': function() {
        this.instance = M.core.checknet.init({
            frequency: 100,
            timeout: 100,
            uri: invalidCheck
        });

        this.wait(function()  {
            // Wait for a period until after the checks would have failed.
            Y.Assert.isInstanceOf(M.core.alert, this.instance._alertDialogue);
            Y.Assert.isTrue(this.instance._alertDialogue.get('visible'));

            // Now change the URI to a valid URI to allow it to be found.
            this.instance.set('uri', validCheck);

            this.wait(function() {
                Y.Assert.isNull(this.instance._alertDialogue);
            }, 400);

        }, 400);
    },

    'Should not warn before the timeout': function() {
        this.instance = M.core.checknet.init({
            frequency: 200,
            uri: invalidCheck
        });

        // At this stage, we should have no failure.
        Y.Assert.isNull(this.instance._alertDialogue);

        this.wait(function()  {
            // After 100ms we shoudl still have no failure.
            Y.Assert.isNull(this.instance._alertDialogue);

            this.wait(function() {
                // After another 300ms we should now have a failure.
                Y.Assert.isInstanceOf(M.core.alert, this.instance._alertDialogue);
                Y.Assert.isTrue(this.instance._alertDialogue.get('visible'));
            }, 300);

        }, 100);
    },

    'Should not fail if there is a response without status': function() {
        // Mockup a new IO to return a dodgy status.
        this._io = Y.io;
        Y.io = function(url, config) {
            Y.later(50, config.context, config.on.complete, [
                Y.guid(), {
                    // No status here.
                    status: undefined
                }
            ]);
        };

        this.instance = M.core.checknet.init({
            frequency: 200,
            uri: invalidCheck
        });

        this.wait(function() {
            // After frequency + the false delay in the mocked Y.io, check
            // that we have no dialogue.
            Y.Assert.isNull(this.instance._alertDialogue);
        }, 300);

    },

    'Should not fail if the response code is in the redirect range': function() {
        // Mockup a new IO to return a dodgy status.
        this._io = Y.io;
        Y.io = function(url, config) {
            Y.later(50, config.context, config.on.complete, [
                Y.guid(), {
                    // A response of 304 (redirect).
                    status: 304
                }
            ]);
        };

        this.instance = M.core.checknet.init({
            frequency: 200,
            uri: invalidCheck
        });

        this.wait(function() {
            // After frequency + the false delay in the mocked Y.io, check
            // that we have no dialogue.
            Y.Assert.isNull(this.instance._alertDialogue);
        }, 300);
    }
}));
