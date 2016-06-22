require('../../testing/js/bootstrap');

describe('lib/javascript-static.js', function() {
    describe('M.util.in_array', function() {
        data = [
            // Basic values.
            ['foo', ['foo', 'bar'], true],
            ['bar', ['foo', 'bar'], true],
            ['baz', ['foo', 'bar'], false],

            // With an integer value.
            [0, ['foo', 'bar'], false],

            [0, ["1", "2"], false],
            ["0", ["1", "2"], false],
        ];
        given.apply(this, data).it("Gets the correct value", function(needle, haystack, result) {
            expect(M.util.in_array(needle, haystack)).to.equal(result);
        });
    });

    describe("M.util.set_user_preference", function() {
        var xhr;
        var requests;
        beforeEach(function(done) {
            requests = [];

            global.XMLHttpRequest = xhr = sinon.useFakeXMLHttpRequest();

            Y.use('io', function(Y) {
                xhr.onCreate = function(req) {
                    requests.push(req);
                };
                done();
            });
        });
        it("Sends one request", function(done) {
            M.util.set_user_preference('foo', 'bar');
            expect(requests).to.have.lengthOf(1);
            done();
        });
    });
});
