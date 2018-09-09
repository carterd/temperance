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
import DirectoryAccess from '../../../ts-src/lib/FileSystem/DirectoryAccess';

var identityCertDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/identities/certificates/");
var agentDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/agents/");
var agentCertDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/agents/certificates/");
var identityDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/identities/");

// Certificate stores
var validIdentityCertificateStore = new CertificateStore(identityCertDirAccess);
validIdentityCertificateStore.logger = TestConfig.logger;
var validAgentCertificateStore = new CertificateStore(agentCertDirAccess);
validIdentityCertificateStore.logger = TestConfig.logger;

// Certificate factories
var validIdentityCertificateChainFactory = new CertificateChainFactory(validIdentityCertificateStore);
validIdentityCertificateChainFactory.logger = TestConfig.logger;
var validAgentCertificateChainFactory = new CertificateChainFactory(validAgentCertificateStore);
validAgentCertificateChainFactory.logger = TestConfig.logger;

// Agent store
var validAgentStore = new AgentStore(agentDirAccess, validAgentCertificateChainFactory);

// AgentSetFactory
var validAgentSetFactory = new AgentSetFactory(validAgentStore);


describe('Class IdentityStore', function() {
    describe('initialiseAsync', function() { 
        it('success', function(done) {
            var identityStore = new IdentityStore(identityDirAccess, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            validIdentityCertificateStore.initialiseAsync()
            .then( () => { return validAgentCertificateStore.initialiseAsync() })
            .then( () => { return validAgentStore.initialiseAsync() })
            .then( () => { return identityStore.initialiseAsync() })
            .then( () => {
                identityStore.identityErrors.size.should.equal(1);
                identityStore.initialised.should.equal(true);
                done();
            })
            .catch( (error) => {done(error)} );
        });
    });
    describe('getIdentityAsync', function() {
        it('successfully get an identity', function(done) {
            var identityStore = new IdentityStore(identityDirAccess, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            validIdentityCertificateStore.initialiseAsync()
            .then( () => { return validAgentCertificateStore.initialiseAsync() })
            .then( () => { return validAgentStore.initialiseAsync() })
            .then( () => { return identityStore.initialiseAsync() })
            .then( () => { return identityStore.getIdentityAsync('identity.json') })
            .then( (value) => {
                value.should.not.equal(null);
                value.should.be.instanceOf(Identity);
                value.identityString.should.be.equal("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance");
                done();
            })
            .catch( (error) => {done(error)});
        });
    });
    describe('getAllIdsAsync', function() {
        it('successfully get an identity', function(done) {
            var identityStore = new IdentityStore(identityDirAccess, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            validIdentityCertificateStore.initialiseAsync()
            .then( () => { return validAgentCertificateStore.initialiseAsync() })
            .then( () => { return validAgentStore.initialiseAsync() })
            .then( () => { return identityStore.initialiseAsync() })
            .then( () => { return identityStore.getAllIdentityIdsAsync() })
            .then( (allIds) => {
                //console.log( identityStore.identityStringToIdMap );
                allIds.length.should.equal(2);
                allIds.indexOf('identity.json').should.not.equal(-1);
                allIds.indexOf('bad-identity.json').should.not.equal(-1);
                done();
            })
            .catch( (error) => {done(error)});
        });
    });
    describe('getIdentityFromIdentityStringAsync', function() {
        it('successfully get an identity', function(done) {
            var identityStore = new IdentityStore(identityDirAccess, validIdentityCertificateChainFactory, validAgentSetFactory);
            identityStore.logger = TestConfig.logger;
            validIdentityCertificateStore.initialiseAsync()
            .then( () => { return validAgentCertificateStore.initialiseAsync() })
            .then( () => { return validAgentStore.initialiseAsync() })
            .then( () => { return identityStore.initialiseAsync() })
            .then( () => { return identityStore.getIdentityAsync('identity.json') })
            .then( () => { return identityStore.getIdentityFromIdentityStringAsync("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance")})
            .then( (value) => {
                value.should.not.equal(null);
                value.should.be.instanceOf(Identity);
                value.identityString.should.be.equal("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance");
                done();
            })
            .catch( (error) => {done(error)});
        });
    });
});