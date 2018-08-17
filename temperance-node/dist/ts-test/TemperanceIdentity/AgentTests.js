"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);
const pemtools = require('pemtools');
const Agent_1 = require("../../ts-src/lib/TemperanceIdentity/Agent");
const Identity_1 = require("../../ts-src/lib/TemperanceIdentity/Identity");
describe('Class Agent', function () {
    describe('readAgentFileAsync', function () {
        it('throws no such Json file error', function (done) {
            var filePromise = Agent_1.default.readAgentFileAsync('./no_such_file.json', './ts-test/TemperanceIdentity', null);
            filePromise.should.eventually.rejectedWith("no_such_file.json").notify(done);
        });
        it('throws no such pem file error', function (done) {
            var filePromise = Agent_1.default.readAgentFileAsync('./ts-test/TemperanceIdentity/data/test-agent.json', './ts-test/TemperanceIdentity/data/no_such_dir', null);
            filePromise.should.eventually.rejectedWith("no_such_dir").notify(done);
        });
        it('throws mismatch identityString', function (done) {
            var identityPromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data');
            identityPromise.then(function (identity) {
                var agentPromise = Agent_1.default.readAgentFileAsync('./ts-test/TemperanceIdentity/data/test-agent-invalid-agentString.json', './ts-test/TemperanceIdentity/data', identity);
                agentPromise.should.eventually.rejectedWith("agentString");
                done();
            });
        });
        it('success on valid agent', function (done) {
            var identityPromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data');
            identityPromise.then(function (identity) {
                var agentPromise = Agent_1.default.readAgentFileAsync('./ts-test/TemperanceIdentity/data/test-agent.json', './ts-test/TemperanceIdentity/data', identity);
                agentPromise.should.eventually.to.be.instanceOf(Agent_1.default);
                done();
            });
        });
    });
});
//# sourceMappingURL=AgentTests.js.map