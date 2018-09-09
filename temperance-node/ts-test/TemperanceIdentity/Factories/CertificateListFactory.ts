import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import TestConfig from '../../TestConfig';

var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Certificate from '../../../ts-src/lib/TemperanceIdentity/Certificate';
import CertificateStore from '../../../ts-src/lib/TemperanceIdentity/FileSystem/CertificateStore';
import CertificateListFactory from '../../../ts-src/lib/TemperanceIdentity/Factories/CertificateListFactory';
import CertificateListError from '../../../ts-src/lib/TemperanceIdentity/Errors/CertificateListError';
import CertificateChain from '../../../ts-src/lib/TemperanceIdentity/CertificateChain';
import DirectoryAccess from '../../../ts-src/lib/FileSystem/DirectoryAccess';

var certDirAccess = new DirectoryAccess("./ts-test/TemperanceIdentity/data/agents/certificates/");

var certOne = new Certificate('certOne',null), certTwo = new Certificate('certTwo',null), certThree = new Certificate('certThree',null);
var validCertificateStore = new CertificateStore(certDirAccess);
sinon.stub(validCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').resolves(certThree);
var missingCertificateStore = new CertificateStore(certDirAccess);
sinon.stub(missingCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').resolves(null);
var missingCertificateStore = new CertificateStore(certDirAccess);
sinon.stub(missingCertificateStore, "getCertificateAsync")
    .withArgs('one').resolves(certOne)
    .withArgs('two').resolves(certTwo)
    .withArgs('three').rejects(new CertificateListError("bad certificate",null));
    
describe('Class CertificateChainFactory', function() {
    describe('getCertificateChainAsync', function() { 
        it('success', function(done) {
            var certificateChainFactory = new CertificateListFactory(validCertificateStore);
            certificateChainFactory.logger = TestConfig.logger;
            certificateChainFactory.getCertificateListAsync( ['one','two','three' ]).then( (value) => {
                value.ids[0].should.equal('one');
                value.certificates[0].should.equal(certOne);
                value.ids[1].should.equal('two');
                value.certificates[1].should.equal(certTwo);
                value.ids[2].should.equal('three');
                value.certificates[2].should.equal(certThree);
                done();
            }).catch( (error) => {
                done(error)
            });
        });
        it('failed with missing certificate', function(done) {
            var certificateChainFactory = new CertificateListFactory(missingCertificateStore);
            certificateChainFactory.logger = TestConfig.logger;
            certificateChainFactory.getCertificateListAsync( ['one','two','three' ]).then( (value) => {
                done("should return with error");
            }).catch( (error) => {
                error.should.be.instanceof(CertificateListError);
                done();
            });
        });
        it('failed with bad certificate', function(done) {
            var certificateChainFactory = new CertificateListFactory(missingCertificateStore);
            certificateChainFactory.logger = TestConfig.logger;
            certificateChainFactory.getCertificateListAsync( ['one','two','three' ]).then( (value) => {
                done("should return with error");
            }).catch( (error) => {
                error.should.be.instanceof(CertificateListError);
                done();
            });
        });
    });
});