"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const Certificate_1 = require("../../ts-src/lib/TemperanceIdentity/Certificate");
const CertificateChain_1 = require("../../ts-src/lib/TemperanceIdentity/CertificateChain");
const CertificateStore_1 = require("../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore");
const TestConfig_1 = require("../TestConfig");
chai.should();
chai.use(chaiAsPromised);
const pemtools = require('pemtools');
var certDir = "./ts-test/TemperanceIdentity/data/certificates/";
var certStore = new CertificateStore_1.default(certDir);
certStore.logger = TestConfig_1.default.logger;
describe('Class CertificateChain', function () {
    describe('constructor', function () {
        it('success on valid certificate', function (done) {
            var agentCert, identityCert;
            certStore.initialiseAsync()
                .then(() => { return certStore.getCertificateAsync('agent-cert.pem'); })
                .then((certificate) => {
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
                .then((certificate) => {
                identityCert = certificate;
                var certificateChain = new CertificateChain_1.default([agentCert, identityCert], ["one", "two"]);
                certificateChain.length.should.equal(2);
                certificateChain.ids[0].should.equal("one");
                certificateChain.ids[1].should.equal("two");
                certificateChain.certificates[0].should.equal(agentCert);
                certificateChain.certificates[1].should.equal(identityCert);
                done();
            })
                .catch((error) => { console.log(error); done(error); });
        });
    });
    describe('push', function () {
        it('push success', function (done) {
            var agentCert, identityCert;
            certStore.initialiseAsync()
                .then(() => { return certStore.getCertificateAsync('agent-cert.pem'); })
                .then((certificate) => {
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
                .then((certificate) => {
                identityCert = certificate;
                var empty1 = new Certificate_1.default('empty1', null);
                var empty2 = new Certificate_1.default('empty2', null);
                var certificateChain = new CertificateChain_1.default([empty1, empty2], ['empty1', 'empty2']);
                certificateChain.push("identity", identityCert);
                certificateChain.length.should.equal(3);
                certificateChain.ids[0].should.equal("empty1");
                certificateChain.ids[1].should.equal("empty2");
                certificateChain.ids[2].should.equal("identity");
                certificateChain.certificates[0].should.equal(empty1);
                certificateChain.certificates[1].should.equal(empty2);
                certificateChain.certificates[2].should.equal(identityCert);
                done();
            })
                .catch((error) => { console.log(error); done(error); });
        });
    });
    describe('unshift', function () {
        it('unshift success', function (done) {
            var agentCert, identityCert;
            certStore.initialiseAsync()
                .then(() => { return certStore.getCertificateAsync('agent-cert.pem'); })
                .then((certificate) => {
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
                .then((certificate) => {
                identityCert = certificate;
                var empty1 = new Certificate_1.default('empty1', null);
                var empty2 = new Certificate_1.default('empty2', null);
                var certificateChain = new CertificateChain_1.default([empty1, empty2], ['empty1', 'empty2']);
                certificateChain.unshift("identity", identityCert);
                certificateChain.length.should.equal(3);
                certificateChain.ids[1].should.equal("empty1");
                certificateChain.ids[2].should.equal("empty2");
                certificateChain.ids[0].should.equal("identity");
                certificateChain.certificates[1].should.equal(empty1);
                certificateChain.certificates[2].should.equal(empty2);
                certificateChain.certificates[0].should.equal(identityCert);
                done();
            })
                .catch((error) => { console.log(error); done(error); });
        });
    });
});
//# sourceMappingURL=CertificateChainTests.js.map