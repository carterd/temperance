import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import TestConfig from '../../TestConfig';

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Agent from '../../../ts-src/lib/TemperanceIdentity/Agent';
import AgentStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/AgentStore';
import AgentListFactory from '../../../ts-src/lib/TemperanceIdentity/Factories/AgentListFactory';
import AgentListError from '../../../ts-src/lib/TemperanceIdentity/Errors/AgentListError';
import AgentList from '../../../ts-src/lib/TemperanceIdentity/AgentList';

var certDir = "./ts-test/TemperanceIdentity/data/agents/agents/certificates";
var agentDir = "./ts-test/TemperanceIdentity/data/agents/agents/";

var agentOne = new Agent("one",null,null,null), agentTwo = new Agent("two", null,null,null), agentThree = new Agent("three",null,null,null);
var validAgentStore = new AgentStore(agentDir, null);
sinon.stub(validAgentStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').resolves(agentThree);
var missingCertificateStore = new AgentStore(agentDir, null);
sinon.stub(missingCertificateStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').resolves(null);
var missingCertificateStore = new AgentStore(certDir, null);
sinon.stub(missingCertificateStore, "getAgentAsync")
    .withArgs('one').resolves(agentOne)
    .withArgs('two').resolves(agentTwo)
    .withArgs('three').rejects(new Error("bad agent"));
    
describe('Class AgentListFactory', function() {
    describe('getAgentSetAsync', function() { 
        it('success', function(done) {
            var agentSetFactory = new AgentListFactory(validAgentStore);
            agentSetFactory.logger = TestConfig.logger;
            agentSetFactory.getAgentSetAsync( ['one','two','three' ] ).then( (value) => {
                value.getById('one').should.equal(agentOne);
                value.getById('two').should.equal(agentTwo);
                value.getById('three').should.equal(agentThree);
                done();
            }).catch( (error) => {
                done(error)
            });
        });
        it('failed with missing agent', function(done) {
            var certificateChainFactory = new AgentListFactory(missingCertificateStore);
            certificateChainFactory.logger = TestConfig.logger;
            certificateChainFactory.getAgentSetAsync( ['one','two','three' ]).then( (value) => {
                done("should return with error");
            }).catch( (error) => {
                error.should.be.instanceof(AgentListError);
                done();
            });
        });
        it('failed with bad agent', function(done) {
            var certificateChainFactory = new AgentListFactory(missingCertificateStore);
            certificateChainFactory.logger = TestConfig.logger;
            certificateChainFactory.getAgentSetAsync( ['one','two','three' ]).then( (value) => {
                done("should return with error");
            }).catch( (error) => {
                error.should.be.instanceof(AgentListError);
                done();
            });
        });
    });
});