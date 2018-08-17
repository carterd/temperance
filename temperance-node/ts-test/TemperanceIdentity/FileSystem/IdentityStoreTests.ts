import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import TestConfig from '../../TestConfig';

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Agent from '../../../ts-src/lib/TemperanceIdentity/Agent';
import Identity from '../../../ts-src/lib/TemperanceIdentity/Identity';
import Certificate from '../../../ts-src/lib/TemperanceIdentity/Certificate';
import CertificateStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import CertificateChainFactory from '../../../ts-src/lib/TemperanceIdentity/Factories/CertificateChainFactory';
import AgentReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/AgentReadError';
import AgentStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/AgentStore';
import AgentSetFactory from '../../../ts-src/lib/TemperanceIdentity/Factories/AgentListFactory';
import IdentityStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/IdentityStore';
import CertificateChainError from '../../../ts-src/lib/TemperanceIdentity/Errors/CertificateListError';
import CertificateChain from '../../../ts-src/lib/TemperanceIdentity/CertificateChain';

var identityCertDir = "./ts-test/TemperanceIdentity/data/identities/certificates/";
var agentDir = "./ts-test/TemperanceIdentity/data/agents/";
var agentCertDir = "./ts-test/TemperanceIdentity/data/agents/certificates/";
var identityDir = "./ts-test/TemperanceIdentity/data/identities/";

// Certificate stores
var validIdentityCertificateStore = new CertificateStore(identityCertDir);
validIdentityCertificateStore.logger = TestConfig.logger;
var validAgentCertificateStore = new CertificateStore(agentCertDir);
validIdentityCertificateStore.logger = TestConfig.logger;

// Certificate factories
var validIdentityCertificateChainFactory = new CertificateChainFactory(validIdentityCertificateStore);
validIdentityCertificateChainFactory.logger = TestConfig.logger;
var validAgentCertificateChainFactory = new CertificateChainFactory(validAgentCertificateStore);
validAgentCertificateChainFactory.logger = TestConfig.logger;

// Agent store
var validAgentStore = new AgentStore(agentDir, validAgentCertificateChainFactory);

// AgentSetFactory
var validAgentSetFactory = new AgentSetFactory(validAgentStore);


describe('Class IdentityStore', function() {
    describe('initialiseAsync', function() { 
        it('success', function(done) {
            var identityStore = new IdentityStore(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            identityStore.initaliseAsync()
            .then( () => {
                identityStore.initalised.should.equal(true);
                done();
            })
            .catch( (error) => {done(error)} );
        });
    });
    describe('getIdentityAsync', function() {
        it('successfully get an identity', function(done) {
            var identityStore = new IdentityStore(identityDir, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            validIdentityCertificateStore.initaliseAsync()
            .then( () => { return validAgentCertificateStore.initaliseAsync() })
            .then( () => { return validAgentStore.initaliseAsync() })
            .then( () => { return identityStore.initaliseAsync() })
            .then( () => { return identityStore.getIdentityAsync('identity.json') })
            .then( (value) => {
                value.should.not.equal(null);
                value.should.be.instanceOf(Identity);
                value.identityId.should.be.equal("sha1:b469c21faab2d71c19cd3daa3df743e6c6777553/Derek/Carter/DC/Solihull/West-Midlands/UK/temperance/identity");
                done();
            })
            .catch( (error) => {done(error)});
        });
    });    
});