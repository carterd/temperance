"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);
const CertificatePEM_1 = require("../../ts-src/lib/TemperanceIdentity/CertificatePEM");
describe('Class CertificatePEM', function () {
    describe('readCertFileAsync', function () {
        it('no such file error', function (done) {
            var filePromise = CertificatePEM_1.default.readCertFileAsync('./no_such_file.pem');
            filePromise.should.eventually.rejectedWith("no such file").notify(done);
        });
        it('read PEM file', function (done) {
            try {
                var filePromise = CertificatePEM_1.default.readCertFileAsync('./cert.pm');
                filePromise.should.eventually.rejected.notify(done);
            }
            catch (_a) { }
        });
    });
});
//# sourceMappingURL=TestCertificatePEM.js.map