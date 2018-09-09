"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestConfig_1 = require("../../TestConfig");
const pemtools = require('pemtools');
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const PrivateKey_1 = require("../../../ts-src/lib/TemperanceIdentity/PrivateKey");
const PrivateKeyStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/PrivateKeyStore");
const ReadError_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/ReadError");
var keysDir = "./ts-test/TemperanceIdentity/data/private-keys/";
describe('Class PrivateKeyStore', function () {
    describe('initialiseAsync', function () {
        it('success', function (done) {
            var keyStore = new PrivateKeyStore_1.default(keysDir);
            keyStore.logger = TestConfig_1.default.logger;
            var initPromise = keyStore.initialiseAsync();
            initPromise.then(() => {
                keyStore.initialised.should.equals(true);
                done();
            }).catch((error) => { done(error); });
        });
    });
    describe('getCertificateAsync', function () {
        it('successfully get a private-key', function (done) {
            var keyStore = new PrivateKeyStore_1.default(keysDir);
            keyStore.logger = TestConfig_1.default.logger;
            keyStore.initialiseAsync()
                .then(() => { return keyStore.getPrivateKeyAsync('service-private-key.pem'); })
                .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(PrivateKey_1.default);
                cert.should.have.property('raw').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('return null on no matching private-key found', function (done) {
            var keyStore = new PrivateKeyStore_1.default(keysDir);
            keyStore.logger = TestConfig_1.default.logger;
            keyStore.initialiseAsync()
                .then(() => { return keyStore.getPrivateKeyAsync('nosuch-private-key.pem'); })
                .then((cert) => {
                expect(cert).to.equal(null);
                done();
            }).catch((error) => { done(error); });
        });
        it('throws error if private-key file not valid format', function (done) {
            var keyStore = new PrivateKeyStore_1.default(keysDir);
            keyStore.logger = TestConfig_1.default.logger;
            keyStore.initialiseAsync()
                .then(() => { return keyStore.getPrivateKeyAsync('bad-private-key.pem'); })
                .then((cert) => { done(new Error("expected to throw error")); })
                .catch((error) => {
                error.should.be.an.instanceof(ReadError_1.default);
                done();
            });
        });
        it('throws error if store not initialised', function (done) {
            var keyStore = new PrivateKeyStore_1.default(keysDir);
            keyStore.logger = TestConfig_1.default.logger;
            keyStore.getPrivateKeyAsync('service-private-key.pem')
                .then((value) => { done(new Error("expected to throw error")); })
                .catch((error) => {
                error.should.be.an.instanceof(Error);
                done();
            });
        });
    });
});
//# sourceMappingURL=PrivateKeyStoreTests.js.map