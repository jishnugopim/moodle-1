require('../../testing/js/bootstrap');

describe('core/ajax', function() {
    var ajax;
    beforeEach(function(done) {
        ajax = amd.unmock('core/ajax', 'lib/amd/src/ajax');
        done();
    });

    it("defines the call function", function() {
        expect(ajax).to.have.property('call');
    });

    describe("It interacts with the server", function() {
        var jQuery;
        beforeEach(function() {
            jQuery = requirejs('jquery');
            sinon.spy(jQuery, "ajax");
        });

        afterEach(function() {
            jQuery.ajax.restore();
        });

        it("Returns an array of promises", function() {
            var data = {methodname: 'example', args: {}};
            var result = ajax.call([data]);
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.be.an('Object');
            expect(result[0]).to.have.all.keys('state', 'always', 'then', 'promise', 'pipe', 'done', 'fail', 'progress');
        });

        it("Passes the data to the data in a POST", function() {
            var data = {methodname: 'example', args: {}};
            ajax.call([data]);

            expect(jQuery.ajax.calledOnce);
            
            var args = jQuery.ajax.args[0];
            expect(args[0]).to.match(new RegExp("" + M.cfg.wwwroot + '/lib/ajax/service.php.*'));
            expect(args[1].type).to.equal('POST');
            var parsedData = JSON.parse(args[1].data);
            expect(parsedData).to.eql([{
                    index: 0,
                    methodname: 'example',
                    args: {}
                }]);
        });
    });
});

