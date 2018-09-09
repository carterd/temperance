"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const TestConfig_1 = require("../../TestConfig");
const pemtools = require('pemtools');
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const Agent_1 = require("../../../ts-src/lib/TemperanceIdentity/Agent");
const CertificateStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore");
const CertificateChainFactory_1 = require("../../../ts-src/lib/TemperanceIdentity/Factories/CertificateChainFactory");
const AgentReadError_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/AgentReadError");
const AgentStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/AgentStore");
const CertificateListError_1 = require("../../../ts-src/lib/TemperanceIdentity/Errors/CertificateListError");
var certDir = "./ts-test/TemperanceIdentity/data/agents/certificates/";
var agentDir = "./ts-test/TemperanceIdentity/data/agents/";
var validCertificateStore = new CertificateStore_1.default(certDir);
var validCertificateChainFactory = new CertificateChainFactory_1.default(validCertificateStore);
var mocBadCertificateChainFactory = new CertificateChainFactory_1.default(validCertificateStore);
sinon.stub(mocBadCertificateChainFactory, "getCertificateChainAsync").throws(new CertificateListError_1.default("errors during association of agent certificates", [new Error()]));
describe('Class AgentStore', function () {
    describe('initialiseAsync', function () {
        it('success', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => {
                agentStore.initialised.should.equal(true);
                done();
            })
                .catch((error) => { done(error); });
        });
    });
    describe('getAgent', function () {
        it('successfully get a agent', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('agent.json'); })
                .then((agent) => {
                agent.should.not.equal(null);
                agent.should.be.instanceOf(Agent_1.default);
                agent.agentString.should.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server');
                agent.certificateChain.length.should.equal(1);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('return null on no matching agents found', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('agent.json'); })
                .then(() => { return agentStore.getAgentAsync('nosuch-agent.json'); })
                .then((value) => {
                expect(value).to.equal(null);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('throws error if agent file not valid format', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('bad-agent.json'); })
                .then((value) => {
                done("we are not expecting valid agent for a bad agent");
            }, (error) => {
                error.should.be.an.instanceof(AgentReadError_1.default);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('throws error if agent file has invalid certificates in chain', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, mocBadCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return agentStore.getAgentAsync('bad-cert-agent.json'); })
                .then((value) => {
                done("we are not expecting valid agent for a bad agent");
            })
                .catch((error) => {
                error.should.be.an.instanceof(AgentReadError_1.default);
                error.fileError.should.be.an.instanceof(CertificateListError_1.default);
                done();
            });
        });
        it('throws error if agent id mismatches certificate', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('cert-mismatch-agent.json'); })
                .then((agent) => {
                done("not expecting a valid agent for mismatched cert");
            })
                .catch((error) => { done(); });
        });
        it('throws error if store not initialised', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.getAgentAsync('agent.json')
                .then((vallue) => {
                done("should have reported error as not initialsed");
            })
                .catch((error) => {
                agentStore.initialised.should.equal(false);
                done();
            });
        });
    });
    describe('getAgentFromAgentIdentityAsync', function () {
        it('successfully get a agent', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('agent.json'); })
                .then((agent) => {
                return agentStore.getAgentFromAgentStringAsync("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server");
            })
                .then((agent) => {
                agent.should.not.equal(null);
                agent.should.be.instanceOf(Agent_1.default);
                agent.agentString.should.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server');
                agent.certificateChain.length.should.equal(1);
                done();
            })
                .catch((error) => { done(error); });
        });
        it('return null on no matching agents found', function (done) {
            var agentStore = new AgentStore_1.default(agentDir, validCertificateChainFactory);
            agentStore.logger = TestConfig_1.default.logger;
            agentStore.initialiseAsync()
                .then(() => { return validCertificateStore.initialiseAsync(); })
                .then(() => { return agentStore.getAgentAsync('agent.json'); })
                .then(() => { return agentStore.getAgentFromAgentStringAsync('NOT-THERE'); })
                .then((value) => {
                expect(value).to.equal(null);
                done();
            })
                .catch((error) => { done(error); });
        });
    });
});
//# sourceMappingURL=AgentStoreTests.js.map