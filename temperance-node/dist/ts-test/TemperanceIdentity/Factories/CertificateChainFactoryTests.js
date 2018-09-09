"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const TestConfig_1 = require("../../TestConfig");
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const Certificate_1 = require("../../../ts-src/lib/TemperanceIdentity/Certificate");
const CertificateStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore");
const CertificateChainFactory_1 = require("../../../ts-src/lib/TemperanceIdentity/Factories/CertificateChainFactory");
const CertificateListError_1 = require("../../../ts-src/lib/TemperanceIdentity/Errors/CertificateListError");
var certDir = "./ts-test/TemperanceIdentity/data/agents/certificates/";
var certOne = new Certificate_1.default('certOne', null), certTwo = new Certificate_1.default('certTwo', null), certThree = new Certificate_1.default('certThree', null);
var validCertificateStore = new CertificateStore_1.default(certDir);
sinon.stub(validCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').resolves(certThree);
var missingCertificateStore = new CertificateStore_1.default(certDir);
sinon.stub(missingCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').resolves(null);
var missingCertificateStore = new CertificateStore_1.default(certDir);
sinon.stub(missingCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').rejects(new CertificateListError_1.default("bad certificate", null));
describe('Class CertificateChainFactory', function () {
    describe('getCertificateChainAsync', function () {
        it('success', function (done) {
            var certificateChainFactory = new CertificateChainFactory_1.default(validCertificateStore);
            certificateChainFactory.logger = TestConfig_1.default.logger;
            certificateChainFactory.getCertificateChainAsync(['one', 'two', 'three']).then((value) => {
                value.ids[0].should.equal('one');
                value.certificates[0].should.equal(certOne);
                value.ids[1].should.equal('two');
                value.certificates[1].should.equal(certTwo);
                value.ids[2].should.equal('three');
                value.certificates[2].should.equal(certThree);
                done();
            }).catch((error) => {
                done(error);
            });
        });
        it('failed with missing certificate', function (done) {
            var certificateChainFactory = new CertificateChainFactory_1.default(missingCertificateStore);
            certificateChainFactory.logger = TestConfig_1.default.logger;
            certificateChainFactory.getCertificateChainAsync(['one', 'two', 'three']).then((value) => {
                done("should return with error");
            }).catch((error) => {
                error.should.be.instanceof(CertificateListError_1.default);
                done();
            });
        });
        it('failed with bad certificate', function (done) {
            var certificateChainFactory = new CertificateChainFactory_1.default(missingCertificateStore);
            certificateChainFactory.logger = TestConfig_1.default.logger;
            certificateChainFactory.getCertificateChainAsync(['one', 'two', 'three']).then((value) => {
                done("should return with error");
            }).catch((error) => {
                error.should.be.instanceof(CertificateListError_1.default);
                done();
            });
        });
    });
});
//# sourceMappingURL=CertificateChainFactoryTests.js.map