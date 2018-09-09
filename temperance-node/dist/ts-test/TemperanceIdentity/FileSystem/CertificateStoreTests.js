"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestConfig_1 = require("../../TestConfig");
const pemtools = require('pemtools');
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const Certificate_1 = require("../../../ts-src/lib/TemperanceIdentity/Certificate");
const CertificateStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore");
const CertificateReadError_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/CertificateReadError");
var certDir = "./ts-test/TemperanceIdentity/data/certificates/";
describe('Class CertificateStore', function () {
    describe('initialiseAsync', function () {
        it('success', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            var initPromise = certificateStore.initialiseAsync();
            initPromise.then(() => {
                certificateStore.initialised.should.equals(true);
                done();
            }).catch((error) => { done(error); });
        });
    });
    describe('getCertificateAsync', function () {
        it('successfully get a certificate', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem'); })
                .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(Certificate_1.default);
                cert.should.have.property('pem').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('return null on no matching certificate found', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('nosuch-cert.pem'); })
                .then((cert) => {
                expect(cert).to.equal(null);
                done();
            }).catch((error) => { done(error); });
        });
        it('throws error if certificate file not valid format', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('bad-cert.pem'); })
                .then((cert) => { done(new Error("expected to throw error")); })
                .catch((error) => {
                error.should.be.an.instanceof(CertificateReadError_1.default);
                done();
            });
        });
        it('throws error if certificate file is say a directory', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('not-a-file-cert.pem'); })
                .then((cert) => { done(new Error("expected to throw error")); })
                .catch((error) => {
                error.should.be.an.instanceof(CertificateReadError_1.default);
                done();
            });
        });
        it('throws error if store not initialised', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.getCertificateAsync('agent-cert.pem')
                .then((value) => { done(new Error("expected to throw error")); })
                .catch((error) => {
                error.should.be.an.instanceof(Error);
                done();
            });
        });
    });
    describe('getCertificateFromAgentStringAsync', function () {
        it('successfully get a certificate', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem'); })
                .then((certificate) => {
                return certificateStore.getCertificateFromAgentStringAsync("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server");
            })
                .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(Certificate_1.default);
                cert.should.have.property('pem').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('return null on no matching certificate found', function (done) {
            var certificateStore = new CertificateStore_1.default(certDir);
            certificateStore.logger = TestConfig_1.default.logger;
            certificateStore.initialiseAsync()
                .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem'); })
                .then((certificate) => { return certificateStore.getCertificateFromAgentStringAsync("NO SUCH"); })
                .then((cert) => {
                expect(cert).to.equal(null);
                done();
            }).catch((error) => { done(error); });
        });
    });
});
//# sourceMappingURL=CertificateStoreTests.js.map