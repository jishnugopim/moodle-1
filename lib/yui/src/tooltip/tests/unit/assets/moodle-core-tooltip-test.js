YUI.add('moodle-core-tooltip-test', function (Y) {
    var genericTearDown = function() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    };

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Basic tests',

        tooltip: null,
        tearDown: genericTearDown,

        'Should instantiate correctly': function() {
            this.tooltip = new M.core.tooltip();
            Y.Assert.isInstanceOf(M.core.tooltip, this.tooltip);
        },

        'initializer provides sensible defaults': function() {
            this.tooltip = new M.core.tooltip();

            // Test that we're using the right boundingBox - if we aren't, things may go awry
            Y.Assert.isInstanceOf(Y.Node, this.tooltip.bb);
            Y.Assert.areEqual(this.tooltip.get('boundingBox'), this.tooltip.bb);
        }
    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Handler tests',

        tooltip: null,
        tearDown: genericTearDown,

        'set_header_content works': function() {
            this.tooltip = new M.core.tooltip();
            var fakeResponse = {};

            // Set a sample heading.
            fakeResponse.heading = 'sample text';
            this.tooltip.set_header_content(fakeResponse);
            Y.Assert.isObject(this.tooltip.get('headerContent'));
        }
    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Attribute tests',

        tooltip: null,
        tearDown: genericTearDown,

        'initialheadertext should be an empty string if not specified': function() {
            this.tooltip = new M.core.tooltip();
            Y.Assert.isString(this.tooltip.get('initialheadertext'));
            Y.Assert.areEqual(this.tooltip.get('initialheadertext'), '');
        },

        'Specified header should match exactly': function() {
            var testvalue = 'headercontent';
            this.tooltip = new M.core.tooltip({
                initialheadertext: testvalue
            });
            Y.Assert.isString(this.tooltip.get('initialheadertext'));
            Y.Assert.areEqual(this.tooltip.get('initialheadertext'), testvalue);
        },

        'initialbodytext is set up correctly when content is not supplied': function() {
            this.tooltip = new M.core.tooltip();

            // The body content is put into a Y.Node <div>
            Y.Assert.isObject(this.tooltip.get('initialbodytext'));

            // The initialbodytext should always contain a spinner
            Y.Assert.isNotUndefined(this.tooltip.get('initialbodytext').one('.spinner'));

            // The initialbodytext should have no text value
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('text'), '');

            // Check that there is only one child
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('children').size(), 1);

            // The initialbodytext should have the content-lightbox class applied
            Y.Assert.isTrue(this.tooltip.get('initialbodytext').hasClass('content-lightbox'));
        },

        'initialbodytext is set up correctly when content is supplied': function() {
            var testvalue = 'bodycontent';

            this.tooltip = new M.core.tooltip({
                initialbodytext: testvalue
            });

            // The body content is put into a Y.Node <div>
            Y.Assert.isTrue(this.tooltip.get('initialbodytext') instanceof Y.Node);

            // The initialbodytext should still contain a spinner
            Y.Assert.isNotUndefined(this.tooltip.get('initialbodytext').one('.spinner'));

            // The initialbodytext should now have a text content
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('text'), testvalue);

            // There should still only be one child
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('children').size(), 1);

            // The initialbodytext should not have the content-lightbox class applied
            Y.Assert.isFalse(this.tooltip.get('initialbodytext').hasClass('content-lightbox'));
        },

        'initialbodytext is set up with base content when a null value is specified': function() {
            this.tooltip = new M.core.tooltip({
                initialbodytext: null
            });

            // The body content is put into a Y.Node <div>
            Y.Assert.isObject(this.tooltip.get('initialbodytext'));

            // The initialbodytext should always contain a spinner
            Y.Assert.isNotUndefined(this.tooltip.get('initialbodytext').one('.spinner'));

            // The initialbodytext should have no text value
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('text'), '');

            // Check that there is only one child
            Y.Assert.areEqual(this.tooltip.get('initialbodytext').get('children').size(), 1);

            // The initialbodytext should have the content-lightbox class applied
            Y.Assert.isTrue(this.tooltip.get('initialbodytext').hasClass('content-lightbox'));
        },


        'initialfootertext is setup correctly when content is not supplied': function() {
            this.tooltip = new M.core.tooltip();

            // By default, the initial footer is null
            Y.Assert.isNull(this.tooltip.get('initialfootertext'));
        },

        'initialfootertext is set up correctly when a null setting is specified': function() {
            this.tooltip = new M.core.tooltip({
                initialfootertext: null
            });

            // By default, the initial footer is null
            Y.Assert.isNull(this.tooltip.get('initialfootertext'));
        },

        'initialfootertext is set up correctly when content is supplied': function() {
            var testvalue = 'samplecontent';

            this.tooltip = new M.core.tooltip({
                initialfootertext: testvalue
            });

            // The body content is put into a Y.Node <div>
            Y.Assert.isTrue(this.tooltip.get('initialfootertext') instanceof Y.Node);

            // There should have no content
            Y.Assert.areEqual(this.tooltip.get('initialfootertext').get('children').size(), 0);

            // The initialfootertext should now have a text content
            Y.Assert.areEqual(this.tooltip.get('initialfootertext').get('text'), testvalue);
        },

        'default headerhandler is set': function() {
            this.tooltip = new M.core.tooltip({
            });

            // Retrieve the headerhandler setting
            var headerhandler = this.tooltip.get('headerhandler');

            // The default value itself is a String
            Y.Assert.isString(headerhandler);

            // And it should exist on the M.core.tooltip object
            Y.Assert.isFunction(this.tooltip[headerhandler]);
        },

        'unset headerhandler defaults correctly': function() {
            this.tooltip = new M.core.tooltip({
                headerhandler: null
            });

            // Retrieve the headerhandler setting
            var headerhandler = this.tooltip.get('headerhandler');

            // And it should exist on the M.core.tooltip object
            Y.Assert.isFunction(headerhandler);
            Y.Assert.areEqual(this.tooltip.set_header_content, headerhandler);
        },

        'unset bodyhandler defaults correctly': function() {
            this.tooltip = new M.core.tooltip({
                bodyhandler: null
            });

            // Retrieve the headerhandler setting
            var bodyhandler = this.tooltip.get('bodyhandler');

            // And it should exist on the M.core.tooltip object
            Y.Assert.isFunction(bodyhandler);
            Y.Assert.areEqual(this.tooltip.set_body_content, bodyhandler);
        },

        'default bodyhandler is set': function() {
            this.tooltip = new M.core.tooltip({
            });

            // Retrieve the bodyhandler setting
            var bodyhandler = this.tooltip.get('bodyhandler');

            // The default value itself is a String
            Y.Assert.isString(bodyhandler);

            // And it should exist on the M.core.tooltip object
            Y.Assert.isFunction(this.tooltip[bodyhandler]);
        },

        'default footerhandler is set': function() {
            this.tooltip = new M.core.tooltip({
            });

            // Retrieve the footerhandler setting
            var footerhandler = this.tooltip.get('footerhandler');

            // The default value itself is null and is set to a function in the initializer
            Y.Assert.isFunction(footerhandler);
        }
    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Testing provision of textcache',

        tooltip: null,
        tearDown: genericTearDown,

        'default textcache used in multiple tooltips are separate': function() {
            var ttone = new M.core.tooltip(),
                ttonecache = ttone.get('textcache'),
                tttwo = new M.core.tooltip(),
                tttwocache = tttwo.get('textcache');

            // Confirm that both caches are empty to start with
            Y.Assert.areEqual(0, ttonecache.get('size'));
            Y.Assert.areEqual(0, tttwocache.get('size'));

            // Add to cache one and confirm that only cache one was affected
            ttonecache.add('entrya', 'entrya');
            Y.Assert.areEqual(1, ttonecache.get('size'));
            Y.Assert.areEqual('entrya', ttonecache.retrieve('entrya').response);
            Y.Assert.areEqual(0, tttwocache.get('size'));

            // Add to cache two with an entry of the same name but different value
            tttwocache.add('entrya', 'differentvalue');
            Y.Assert.areEqual(1, ttonecache.get('size'));
            Y.Assert.areEqual('entrya', ttonecache.retrieve('entrya').response);
            Y.Assert.areEqual(1, tttwocache.get('size'));
            Y.Assert.areEqual('differentvalue', tttwocache.retrieve('entrya').response);

            // Confirm that flushing one cache does not affect the other
            ttonecache.flush();
            Y.Assert.areEqual(0, ttonecache.get('size'));
            Y.Assert.areEqual(null, ttonecache.retrieve('entrya'));
            Y.Assert.areEqual(1, tttwocache.get('size'));
            Y.Assert.areEqual('differentvalue', tttwocache.retrieve('entrya').response);

            ttone.destroy();
            tttwo.destroy();
        },

        'shared textcaches': function() {
            var sharedcache = new Y.Cache({
                    max: 5
                }),
                ttone = new M.core.tooltip({
                    textcache: sharedcache
                }),
                ttonecache = ttone.get('textcache'),
                tttwo = new M.core.tooltip({
                    textcache: sharedcache
                }),
                tttwocache = tttwo.get('textcache');

            // Confirm that both textcaches are the sharedcache
            Y.Assert.areEqual(sharedcache, ttonecache);
            Y.Assert.areEqual(sharedcache, tttwocache);

            // Confirm that both caches are empty to start with
            Y.Assert.areEqual(0, ttonecache.get('size'));
            Y.Assert.areEqual(0, tttwocache.get('size'));

            // Add to cache one and confirm that both caches are affected
            ttonecache.add('entrya', 'entrya');
            Y.Assert.areEqual(1, ttonecache.get('size'));
            Y.Assert.areEqual('entrya', ttonecache.retrieve('entrya').response);
            Y.Assert.areEqual(1, tttwocache.get('size'));
            Y.Assert.areEqual('entrya', tttwocache.retrieve('entrya').response);
            Y.Assert.areEqual(1, sharedcache.get('size'));
            Y.Assert.areEqual('entrya', sharedcache.retrieve('entrya').response);

            // Add to cache two and confirm that both caches are affected
            tttwocache.add('entryb', 'entryb');
            Y.Assert.areEqual(2, ttonecache.get('size'));
            Y.Assert.areEqual('entryb', ttonecache.retrieve('entryb').response);
            Y.Assert.areEqual(2, tttwocache.get('size'));
            Y.Assert.areEqual('entryb', tttwocache.retrieve('entryb').response);
            Y.Assert.areEqual(2, sharedcache.get('size'));
            Y.Assert.areEqual('entryb', sharedcache.retrieve('entryb').response);

            // Confirm that adding to the shared cache adds to all
            sharedcache.add('entryc', 'entryc');
            Y.Assert.areEqual(3, ttonecache.get('size'));
            Y.Assert.areEqual('entryc', ttonecache.retrieve('entryc').response);
            Y.Assert.areEqual(3, tttwocache.get('size'));
            Y.Assert.areEqual('entryc', tttwocache.retrieve('entryc').response);
            Y.Assert.areEqual(3, sharedcache.get('size'));
            Y.Assert.areEqual('entryc', sharedcache.retrieve('entryc').response);

            // Confirm that flushing one cache flushes both
            ttonecache.flush();
            Y.Assert.areEqual(0, ttonecache.get('size'));
            Y.Assert.areEqual(null, ttonecache.retrieve('entrya'));
            Y.Assert.areEqual(0, tttwocache.get('size'));
            Y.Assert.areEqual(null, tttwocache.retrieve('entrya'));

            ttone.destroy();
            tttwo.destroy();
            sharedcache.destroy();
        },

        'non-developer mode has a cache': function() {
            M.cfg.developerdebug = false;
            this.tooltip = new M.core.tooltip();
            Y.Assert.areNotEqual(0, this.tooltip.get('textcache').get('max'));
        },

        'developer mode disables the cache': function() {
            M.cfg.developerdebug = true;
            this.tooltip = new M.core.tooltip();
            Y.Assert.areEqual(0, this.tooltip.get('textcache').get('max'));
        },

        'default modify_url adjusts the URL correctly': function() {
            this.tooltip = new M.core.tooltip();

            var base = 'http://www.example.com/example.php?',
                baseexpected = 'http://www.example.com/example_ajax.php?',
                expected,
                testurl,
                resulturl;

            // Initial comparison.
            resulturl = this.tooltip.modify_url(base);
            Y.Assert.areEqual(baseexpected, resulturl);

            // Comparison against a non-php page should make no change with
            // the default handler.
            testurl = 'http://www.example.com/example.html';
            resulturl = this.tooltip.modify_url(testurl);
            Y.Assert.areEqual(testurl, resulturl);

            // Comparison against a URL with parameters.
            testurl = base + 'foo=bar&baz=example';
            expected = baseexpected + 'foo=bar&baz=example';
            resulturl = this.tooltip.modify_url(testurl);
            Y.Assert.areEqual(expected, resulturl);
        }

    }));

}, '@VERSION@' ,{requires:[
    'moodle-core-tooltip',
    'test'
]});
