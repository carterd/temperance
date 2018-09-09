import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as NodeForge from 'node-forge';

import Certificate from '../../ts-src/lib/TemperanceIdentity/Certificate'
import CertificateChain from '../../ts-src/lib/TemperanceIdentity/CertificateChain';
import DistingishedName from '../../ts-src/lib/TemperanceIdentity/DistingishedName';
import CertificateStore from '../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import DirectoryAccess from '../../ts-src/lib/FileSystem/DirectoryAccess';

import TestConfig from '../TestConfig';

chai.should();
chai.use(chaiAsPromised);

const pemtools = require('pemtools');

var certDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/certificates/");
var certStore = new CertificateStore(certDirAccess);
certStore.logger = TestConfig.logger;

describe('Class CertificateChain', function() {
    describe('constructor', function() {
        it('success on valid certificate', function(done) {
            var agentCert: Certificate, identityCert: Certificate;
            certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => { 
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
            .then( (certificate) => {
                identityCert = certificate;
                var certificateChain = new CertificateChain([agentCert, identityCert],["one", "two"]);   
                certificateChain.length.should.equal(2);
                certificateChain.ids[0].should.equal("one");
                certificateChain.ids[1].should.equal("two");
                certificateChain.certificates[0].should.equal(agentCert);
                certificateChain.certificates[1].should.equal(identityCert);
                done();
            })
            .catch( (error) => { console.log(error); done(error); });
        }); 
    });
    describe('push', function() {
        it('push success', function(done) {
            var agentCert: Certificate, identityCert: Certificate;
            certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => { 
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
            .then( (certificate) => {
                identityCert = certificate;
                var empty1 = new Certificate('empty1',null);
                var empty2 = new Certificate('empty2',null);
                var certificateChain = new CertificateChain([empty1, empty2],['empty1','empty2']);
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
            .catch( (error) => { console.log(error); done(error); });
        });
    });
    describe('unshift', function() {
        it('unshift success', function(done) {
            var agentCert: Certificate, identityCert: Certificate;
            certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => { 
                agentCert = certificate;
                return certStore.getCertificateAsync('identity-cert.pem');
            })
            .then( (certificate) => {
                identityCert = certificate;
                var empty1 = new Certificate('empty1',null);
                var empty2 = new Certificate('empty2',null);
                var certificateChain = new CertificateChain([empty1, empty2],['empty1','empty2']);
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
            .catch( (error) => { console.log(error); done(error); });
        });
    });
});

