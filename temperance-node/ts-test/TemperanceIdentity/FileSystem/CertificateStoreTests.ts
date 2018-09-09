import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import TestConfig from '../../TestConfig';

const pemtools = require('pemtools');

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Certificate from '../../../ts-src/lib/TemperanceIdentity/Certificate'
import CertificateStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import CertificateReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/CertificateReadError';
import ReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/ReadError';
import DirectoryAccess from '../../../ts-src/lib/FileSystem/DirectoryAccess';

var certDirAccess = new  DirectoryAccess("./ts-test/TemperanceIdentity/data/certificates/");

describe('Class CertificateStore', function() {
    describe('initialiseAsync', function() { 
        it('success', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            var initPromise = certificateStore.initialiseAsync();
            initPromise.then( () => {
                certificateStore.initialised.should.equals(true);
                done();
            }).catch( (error) => {done(error);} );
        });
    });
    describe('getCertificateAsync', function() {
        it('successfully get a certificate', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem')})
            .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(Certificate);
                cert.should.have.property('pem').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
            .catch( (error) => {done(error)});
        });
        it('return null on no matching certificate found', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then(() => { return certificateStore.getCertificateAsync('nosuch-cert.pem') })
            .then(
                (cert) => {
                    expect(cert).to.equal(null);
                    done();
                }
            ).catch( (error) => {done(error)});
        });
        it('throws error if certificate file not valid format', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then( () => { return certificateStore.getCertificateAsync('bad-cert.pem') })
            .then( 
                (cert) => { done(new Error("expected to throw error"))})
            .catch( 
                (error) => {
                    error.should.be.an.instanceof(CertificateReadError);
                    done();
                });
        });
        it('throws error if certificate file is say a directory', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then( () => { return certificateStore.getCertificateAsync('not-a-file-cert.pem') })
            .then( 
                (cert) => { done(new Error("expected to throw error")) })
            .catch( 
                (error) => {
                    error.should.be.an.instanceof(CertificateReadError);
                    done();
                });
        });
        it('throws error if store not initialised', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.getCertificateAsync('agent-cert.pem')
            .then( (value) => { done(new Error("expected to throw error")); })
            .catch( (error) => {
                error.should.be.an.instanceof(Error);
                done();
            });
        });
    });
    describe('getCertificateFromAgentStringAsync', function() {
        it('successfully get a certificate', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem')})
            .then((certificate) => { 
                return certificateStore.getCertificateFromAgentStringAsync("CN@sha1:b469c21faab2d71c19cd3daa3df743e6c6777553\\SN@Carter\\GN@Derek\\I@DC\\C@UK\\ST@West-Midlands\\L@Solihull\\O@temperance\\OU@server"); 
            })
            .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(Certificate);
                cert.should.have.property('pem').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
            .catch( (error) => {done(error)});
        });
        it('return null on no matching certificate found', function(done) {
            var certificateStore = new CertificateStore(certDirAccess);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initialiseAsync()
            .then(() => { return certificateStore.getCertificateAsync('agent-cert.pem') })
            .then((certificate) => { return certificateStore.getCertificateFromAgentStringAsync("NO SUCH"); })
            .then(
                (cert) => {
                    expect(cert).to.equal(null);
                    done();
                }
            ).catch( (error) => {done(error)});
        });
    });
});