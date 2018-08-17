import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as NodeForge from 'node-forge';

import Certificate from '../../ts-src/lib/TemperanceIdentity/Certificate'
import CertificateStore from '../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';

chai.should();
chai.use(chaiAsPromised);

const pemtools = require('pemtools');

var certDir = "./ts-test/TemperanceIdentity/data/certificates/";
var certStore = new CertificateStore(certDir);

describe('Class Certificate', function() {
    describe('get issuer', function() {
        it('success on valid certificate', function(done) {
            var certificate = certStore.initaliseAsync()
            .then( () => { return certStore.getCertificateAsync('cert.pem') })
            .then( (certificate) => {
                console.log(certificate);
                var forgeCert : NodeForge.pki.Certificate = certificate.forge;
                
                //console.log(NodeForge.pki.certificateToAsn1(forgeCert));
                console.log(forgeCert.issuer.attributes);
                certificate.issuer['commonName'].should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                done();
            })
            .catch( (error) => { console.log("error"); done(error); return null });
//            console.log(certificate);
//            console.log(certificate.issuer['commonName']);
//            done();
        });
    });
});
    /*
    describe('get subject', function() {
        it('success on valid certificate', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (certificate.subject['commonName']).should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                done();
            });
        });
    });
    describe('get publicKey', function() {
        it('success on valid certificate', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (certificate.publicKey['bitSize']).should.be.equal(2048);
                done();
            });
        })
    });
    describe('distingishedNameToAgentString', function() {
        it('success on valid distingished name', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (Certificate.distingishedNameToAgentString(certificate.issuer)).should.be.equal("sha1:b469c21faab2d71c19cd3daa3df743e6c6777553/Derek/Carter/DC/Solihull/West-Midlands/UK/temperance/identity");
                done();
            });
        });
        it('throws on invalid distingished name', function(done) {
            (function() { 
                Certificate.distingishedNameToAgentString({
                    'commonName': 'sha1:b469c21faab2d71c19cd3daa3df743e6c6777553',
                    'givenName': 'Derek',
                    'surname': 'Carter',
                    'initials': 'DC',
                    'localityName': 'Solihull',
                    'stateOrProvinceName': 'West-Midlands',
                    'countryName': 'UK',
                    'organizationName': 'Temperance',
                    //'organizationalUnitName': 'ok'
                })
            }).should.to.throw(Error);
            done();
        });
    });
    describe('distingishedNameToIdentityString', function() {
        it('success on valid distingished name', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (Certificate.distingishedNameToAgentString(certificate.issuer)).should.be.equal("sha1:b469c21faab2d71c19cd3daa3df743e6c6777553/Derek/Carter/DC/Solihull/West-Midlands/UK/temperance/identity");
                done();
            });
        });
        it('throws on invalid distingished name', function(done) {
            (function() { 
                Certificate.distingishedNameToAgentString({
                    'commonName': 'sha1:b469c21faab2d71c19cd3daa3df743e6c6777553',
                    'givenName': 'Derek',
                    'surname': 'Carter',
                    'initials': 'DC',
                    'localityName': 'Solihull',
                    'stateOrProvinceName': 'West-Midlands',
                    'countryName': 'UK',
                    //'organizationName': 'Temperance',
                    'organizationalUnitName': 'ok'
                })
            }).should.to.throw(Error);
            done();
        });
    });
    describe('uniqueIdentityToHashObject', function() {
        it('success on valid distingished name', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (Certificate.uniqueIdentityToHashObject(certificate.issuer['commonName'])).should.have.property('hashType').equal("sha1");
                (Certificate.uniqueIdentityToHashObject(certificate.issuer['commonName'])).should.have.property('hashValue').equal("b469c21faab2d71c19cd3daa3df743e6c6777553");
                done();
            });
        });
    });
    describe('compareDistingishedNames', function() {
        it('success on valid compare', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (Certificate.compareDistingishedNames(certificate.issuer, certificate.subject)).should.be.true;
                done();
            })
        });
    });
    describe('isSelfSigned', function() {
        it('true on self-signed cert', function(done) {
            var filePromise = Certificate.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function(certificate) {
                (certificate.isSelfSigned()).should.be.true;
                done();
            })
        });
    });
});
*/
