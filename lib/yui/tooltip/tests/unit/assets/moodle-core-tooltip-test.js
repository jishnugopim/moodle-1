YUI.add('moodle-core-tooltip-test', function (Y) {
    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Basic tests',
        
        tooltip: null,
        tearDown: function() {
            if (this.tooltip) {
                this.tooltip.destroy();
                this.tooltip = null;
            }
        },

        'Should instantiate correctly': function() {
            this.tooltip = new M.core.tooltip();
            Y.Assert.isTrue(this.tooltip instanceof M.core.tooltip);
        }

    }));

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'Attribute tests',

        tooltip: null,
        tearDown: function() {
            if (this.tooltip) {
                this.tooltip.destroy();
                this.tooltip = null;
            }
        },

        'Initial Header should be empty': function() {
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

        'initialfootertext is setup correctly when content is not supplied': function() {
            this.tooltip = new M.core.tooltip();

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
        }

    }));
}, '@VERSION@' ,{requires:[
    'moodle-core-tooltip',
    'test'
]});
