import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import TestConfig from '../../TestConfig';

const pemtools = require('pemtools');

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import PrivateKey from '../../../ts-src/lib/TemperanceIdentity/PrivateKey'
import PrivateKeyStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/PrivateKeyStore';
import ReadError from '../../../ts-src/lib/TemperanceIdentity/FileSystem/Errors/ReadError';
import DirectoryAccess from '../../../ts-src/lib/FileSystem/DirectoryAccess';

var keysDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/private-keys/");

describe('Class PrivateKeyStore', function() {
    describe('initialiseAsync', function() { 
        it('success', function(done) {
            var keyStore = new PrivateKeyStore(keysDirAccess);
            keyStore.logger = TestConfig.logger;
            var initPromise = keyStore.initialiseAsync();
            initPromise.then( () => {
                keyStore.initialised.should.equals(true);
                done();
            }).catch( (error) => {done(error);} );
        });
    });
    describe('getCertificateAsync', function() {
        it('successfully get a private-key', function(done) {
            var keyStore = new PrivateKeyStore(keysDirAccess);
            keyStore.logger = TestConfig.logger;
            keyStore.initialiseAsync()
            .then(() => { return keyStore.getPrivateKeyAsync('service-private-key.pem')})
            .then((cert) => {
                cert.should.not.equal(null);
                cert.should.be.instanceOf(PrivateKey);
                cert.should.have.property('raw').to.be.instanceOf(Buffer);
                cert.should.have.property('forge').to.be.instanceOf(Object);
                done();
            })
            .catch( (error) => {done(error)});
        });
        it('return null on no matching private-key found', function(done) {
            var keyStore = new PrivateKeyStore(keysDirAccess);
            keyStore.logger = TestConfig.logger;
            keyStore.initialiseAsync()
            .then(() => { return keyStore.getPrivateKeyAsync('nosuch-private-key.pem') })
            .then(
                (cert) => {
                    expect(cert).to.equal(null);
                    done();
                }
            ).catch( (error) => {done(error)});
        });
        it('throws error if private-key file not valid format', function(done) {
            var keyStore = new PrivateKeyStore(keysDirAccess);
            keyStore.logger = TestConfig.logger;
            keyStore.initialiseAsync()
            .then( () => { return keyStore.getPrivateKeyAsync('bad-private-key.pem') })
            .then( 
                (cert) => { done(new Error("expected to throw error"))})
            .catch( 
                (error) => {
                    error.should.be.an.instanceof(ReadError);
                    done();
                });
        });
        it('throws error if store not initialised', function(done) {
            var keyStore = new PrivateKeyStore(keysDirAccess);
            keyStore.logger = TestConfig.logger;
            keyStore.getPrivateKeyAsync('service-private-key.pem')
            .then( (value) => { done(new Error("expected to throw error")); })
            .catch( (error) => {
                error.should.be.an.instanceof(Error);
                done();
            });
        });
    });
});