import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import TestConfig from '../../TestConfig';

const pemtools = require('pemtools');

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Certificate from '../../../ts-src/lib/TemperanceIdentity/Certificate'
import CertificateStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import CertificateReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/CertificateReadError';
import ReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/ReadError';

var certDir = "./ts-test/TemperanceIdentity/data/certificates/";

describe('Class CertificateStore', function() {
    describe('initialiseAsync', function() { 
        it('success', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            var initPromise = certificateStore.initaliseAsync();
            initPromise.then( () => {
                certificateStore.initalised.should.equals(true);
                done();
            }).catch( (error) => {done(error);} );
        });
    });
    describe('getCertificateAsync', function() {
        it('successfully get a certificate', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initaliseAsync()
            .then(() => { return certificateStore.getCertificateAsync('cert.pem')})
            .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(Certificate);
                cert.should.have.property('raw').to.be.instanceOf(Buffer);
                cert.should.have.property('pem').to.be.instanceOf(pemtools.PEM);
                cert.should.have.property('x509').to.be.instanceOf(Object);
                done();
            })
            .catch( (error) => {done(error)});
        });
        it('return null on no matching certificate found', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initaliseAsync()
            .then(() => { return certificateStore.getCertificateAsync('nosuch-cert.pem') })
            .then(
                (cert) => {
                    expect(cert).to.equal(null);
                    done();
                }
            ).catch( (error) => {done(error)});
        });
        it('throws error if certificate file not valid format', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initaliseAsync()
            .then( () => { return certificateStore.getCertificateAsync('bad-cert.pem') })
            .then( 
                (cert) => { done(new Error("expected to throw error"))},
                (error) => {
                    error.should.be.an.instanceof(CertificateReadError);
                    done();
                })
            .catch( (error) => { done(error) } );
        });
        it('throws error if certificate file is say a directory', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            certificateStore.initaliseAsync()
            .then( () => { return certificateStore.getCertificateAsync('not-a-file-cert.pem') })
            .then( 
                (cert) => { done(new Error("expected to throw error")) },
                (error) => {
                        error.should.be.an.instanceof(CertificateReadError);
                        done();
                })
            .catch( (error) => {done(error)} );
        });
        it('throws error if store not initialised', function(done) {
            var certificateStore = new CertificateStore(certDir);
            certificateStore.logger = TestConfig.logger;
            certificateStore.getCertificateAsync('cert.pem')
            .then( (value) => { done(new Error("expected to throw error")); })
            .catch( (error) => {
                error.should.be.an.instanceof(Error);
                done();
            });
        });
    });
});