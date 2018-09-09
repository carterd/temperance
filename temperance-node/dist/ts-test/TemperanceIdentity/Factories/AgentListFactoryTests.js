"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const TestConfig_1 = require("../../TestConfig");
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
const Agent_1 = require("../../../ts-src/lib/TemperanceIdentity/Agent");
const AgentStore_1 = require("../../../ts-src/lib/TemperanceIdentity/FileSystem/AgentStore");
const AgentListFactory_1 = require("../../../ts-src/lib/TemperanceIdentity/Factories/AgentListFactory");
const AgentListError_1 = require("../../../ts-src/lib/TemperanceIdentity/Errors/AgentListError");
var certDir = "./ts-test/TemperanceIdentity/data/agents/agents/certificates";
var agentDir = "./ts-test/TemperanceIdentity/data/agents/agents/";
var agentOne = new Agent_1.default("one", "one", null, null, null, null), agentTwo = new Agent_1.default("two", "two", null, null, null, null), agentThree = new Agent_1.default("three", "three", null, null, null, null);
var validAgentStore = new AgentStore_1.default(agentDir, null);
sinon.stub(validAgentStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').resolves(agentThree);
var missingCertificateStore = new AgentStore_1.default(agentDir, null);
sinon.stub(missingCertificateStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').resolves(null);
var missingCertificateStore = new AgentStore_1.default(certDir, null);
sinon.stub(missingCertificateStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').rejects(new Error("bad agent"));
describe('Class AgentListFactory', function () {
    describe('getAgentSetAsync', function () {
        it('success', function (done) {
            var agentSetFactory = new AgentListFactory_1.default(validAgentStore);
            agentSetFactory.logger = TestConfig_1.default.logger;
            agentSetFactory.getAgentListAsync(['one', 'two', 'three']).then((value) => {
                value.getById('one').should.equal(agentOne);
                value.getById('two').should.equal(agentTwo);
                value.getById('three').should.equal(agentThree);
                done();
            }).catch((error) => {
                done(error);
            });
        });
        it('failed with missing agent', function (done) {
            var certificateChainFactory = new AgentListFactory_1.default(missingCertificateStore);
            certificateChainFactory.logger = TestConfig_1.default.logger;
            certificateChainFactory.getAgentListAsync(['one', 'two', 'three']).then((value) => {
                done("should return with error");
            }).catch((error) => {
                error.should.be.instanceof(AgentListError_1.default);
                done();
            });
        });
        it('failed with bad agent', function (done) {
            var certificateChainFactory = new AgentListFactory_1.default(missingCertificateStore);
            certificateChainFactory.logger = TestConfig_1.default.logger;
            certificateChainFactory.getAgentListAsync(['one', 'two', 'three']).then((value) => {
                done("should return with error");
            }).catch((error) => {
                error.should.be.instanceof(AgentListError_1.default);
                done();
            });
        });
    });
});
//# sourceMappingURL=AgentListFactoryTests.js.map