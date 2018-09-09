import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as NodeForge from 'node-forge';

import Certificate from '../../ts-src/lib/TemperanceIdentity/Certificate'
import DistingishedName from '../../ts-src/lib/TemperanceIdentity/DistingishedName';
import CertificateStore from '../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import DirectoryAccess from '../../ts-src/lib/FileSystem/DirectoryAccess';

import TestConfig from '../TestConfig';

chai.should();
chai.use(chaiAsPromised);

var certDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/certificates/");
var certStore = new CertificateStore(certDirAccess);
certStore.logger = TestConfig.logger;

describe('Class Certificate', function() {
    describe('get issuer', function() {
        it('success on valid certificate', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.issuer.attributes.get('CN').should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                certificate.issuer.attributes.get('SN').should.be.equal('Carter');
                certificate.issuer.attributes.get('GN').should.be.equal('Derek');
                certificate.issuer.attributes.get('I').should.be.equal('DC');
                certificate.issuer.attributes.get('C').should.be.equal('UK');
                certificate.issuer.attributes.get('ST').should.be.equal('West-Midlands');
                certificate.issuer.attributes.get('L').should.be.equal('Solihull');
                certificate.issuer.attributes.get('O').should.be.equal('temperance');
                certificate.issuer.attributes.get('OU').should.be.equal('identity');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });
        });
        it('success on valid lookupString', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.issuer.lookupString.should.be.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@identity');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });        
        });
        it('success on valid idenityString', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.issuer.identityString.should.be.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });        
        });
    });
    describe('get subject', function() {
        it('success on valid attributes', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.subject.attributes.get('CN').should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                certificate.subject.attributes.get('SN').should.be.equal('Carter');
                certificate.subject.attributes.get('GN').should.be.equal('Derek');
                certificate.subject.attributes.get('I').should.be.equal('DC');
                certificate.subject.attributes.get('C').should.be.equal('UK');
                certificate.subject.attributes.get('ST').should.be.equal('West-Midlands');
                certificate.subject.attributes.get('L').should.be.equal('Solihull');
                certificate.subject.attributes.get('O').should.be.equal('temperance');
                certificate.subject.attributes.get('OU').should.be.equal('server');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });
        });
        it('success on valid lookupString', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.subject.lookupString.should.be.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });        
        });
        it('success on valid idenityString', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('agent-cert.pem') })
            .then( (certificate) => {
                certificate.subject.identityString.should.be.equal('CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance');
                done();
            })
            .catch( (error) => { console.log(error); done(error); });        
        });
    });
    describe('isSelfSigned', function() {
        it('true on self-signed cert', function(done) {
            var certificate = certStore.initialiseAsync()
            .then( () => { return certStore.getCertificateAsync('identity-cert.pem') })
            .then( (certificate) => {
                (certificate.isSelfSigned()).should.be.true;
                done();
            })
            .catch( (error) => { console.log(error); done(error); });
        });
    });
});

