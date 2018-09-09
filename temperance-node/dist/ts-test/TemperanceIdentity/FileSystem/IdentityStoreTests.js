"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const TestConfig_1 = require("../../TestConfig");
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const Identity_1 = require("../../../ts-src/lib/TemperanceIdentity/Identity");
const CertificateStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore");
const CertificateChainFactory_1 = require("../../../ts-src/lib/TemperanceIdentity/Factories/CertificateChainFactory");
const AgentStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/AgentStore");
const AgentListFactory_1 = require("../../../ts-src/lib/TemperanceIdentity/Factories/AgentListFactory");
const IdentityStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/IdentityStore");
var identityCertDir = "./ts-test/TemperanceIdentity/data/identities/certificates/";
var agentDir = "./ts-test/TemperanceIdentity/data/agents/";
var agentCertDir = "./ts-test/TemperanceIdentity/data/agents/certificates/";
var identityDir = "./ts-test/TemperanceIdentity/data/identities/";
// Certificate stores
var validIdentityCertificateStore = new CertificateStore_1.default(identityCertDir);
validIdentityCertificateStore.logger = TestConfig_1.default.logger;
var validAgentCertificateStore = new CertificateStore_1.default(agentCertDir);
validIdentityCertificateStore.logger = TestConfig_1.default.logger;
// Certificate factories
var validIdentityCertificateChainFactory = new CertificateChainFactory_1.default(validIdentityCertificateStore);
validIdentityCertificateChainFactory.logger = TestConfig_1.default.logger;
var validAgentCertificateChainFactory = new CertificateChainFactory_1.default(validAgentCertificateStore);
validAgentCertificateChainFactory.logger = TestConfig_1.default.logger;
// Agent store
var validAgentStore = new AgentStore_1.default(agentDir, validAgentCertificateChainFactory);
// AgentSetFactory
var validAgentSetFactory = new AgentListFactory_1.default(validAgentStore);
describe('Class IdentityStore', function () {
    describe('initialiseAsync', function () {
        it('success', function (done) {
            var identityStore = new IdentityStore_1.default(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig_1.default.logger;
            validIdentityCertificateStore.initialiseAsync()
                .then(() => { return validAgentCertificateStore.initialiseAsync(); })
                .then(() => { return validAgentStore.initialiseAsync(); })
                .then(() => { return identityStore.initialiseAsync(); })
                .then(() => {
                identityStore.identityErrors.size.should.equal(1);
                identityStore.initialised.should.equal(true);
                done();
            })
                .catch((error) => { done(error); });
        });
    });
    describe('getIdentityAsync', function () {
        it('successfully get an identity', function (done) {
            var identityStore = new IdentityStore_1.default(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig_1.default.logger;
            validIdentityCertificateStore.initialiseAsync()
                .then(() => { return validAgentCertificateStore.initialiseAsync(); })
                .then(() => { return validAgentStore.initialiseAsync(); })
                .then(() => { return identityStore.initialiseAsync(); })
                .then(() => { return identityStore.getIdentityAsync('identity.json'); })
                .then((value) => {
                value.should.not.equal(null);
                value.should.be.instanceOf(Identity_1.default);
                value.identityString.should.be.equal("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance");
                done();
            })
                .catch((error) => { done(error); });
        });
    });
    describe('getAllIdsAsync', function () {
        it('successfully get an identity', function (done) {
            var identityStore = new IdentityStore_1.default(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig_1.default.logger;
            validIdentityCertificateStore.initialiseAsync()
                .then(() => { return validAgentCertificateStore.initialiseAsync(); })
                .then(() => { return validAgentStore.initialiseAsync(); })
                .then(() => { return identityStore.initialiseAsync(); })
                .then(() => { return identityStore.getAllIdentityIdsAsync(); })
                .then((allIds) => {
                //console.log( identityStore.identityStringToIdMap );
                allIds.length.should.equal(2);
                allIds.indexOf('identity.json').should.not.equal(-1);
                allIds.indexOf('bad-identity.json').should.not.equal(-1);
                done();
            })
                .catch((error) => { done(error); });
        });
    });
    describe('getIdentityFromIdentityStringAsync', function () {
        it('successfully get an identity', function (done) {
            var identityStore = new IdentityStore_1.default(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig_1.default.logger;
            validIdentityCertificateStore.initialiseAsync()
                .then(() => { return validAgentCertificateStore.initialiseAsync(); })
                .then(() => { return validAgentStore.initialiseAsync(); })
                .then(() => { return identityStore.initialiseAsync(); })
                .then(() => { return identityStore.getIdentityAsync('identity.json'); })
                .then(() => { return identityStore.getIdentityFromIdentityStringAsync("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance"); })
                .then((value) => {
                value.should.not.equal(null);
                value.should.be.instanceOf(Identity_1.default);
                value.identityString.should.be.equal("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance");
                done();
            })
                .catch((error) => { done(error); });
        });
    });
});
//# sourceMappingURL=IdentityStoreTests.js.map