var expect = require("expect.js");
describe('Socket server', function() {

    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            expect([1,2,3].indexOf(5)).to.equal(-1);
            expect([1,2,3].indexOf(2)).to.equal(1);
        });
    });
});