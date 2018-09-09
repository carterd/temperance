import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.should();
chai.use(chaiAsPromised);

import Identity from '../../ts-src/lib/TemperanceIdentity/Identity';
import DirectoryAccess from '../../ts-src/lib/FileSystem/DirectoryAccess';

/*
describe('Class Identity', function() {
    describe('readIdentityFileAsync', function() { 
        it('throws no such Json file error', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./no_such_file.json','./ts-test/TemperanceIdentity');
            filePromise.should.eventually.rejectedWith("no_such_file.json").notify(done);
        });
        it('throws no such pem file error', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json','./ts-test/TemperanceIdentity/data/no_such_dir');
            filePromise.should.eventually.rejectedWith("no_such_dir").notify(done);
        });
        it('throws mismatch identityString', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity-invalid-identityString.json','./ts-test/TemperanceIdentity/data');
            filePromise.should.eventually.rejectedWith("identityString").notify(done);
        });
        it('success on valid identity', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json','./ts-test/TemperanceIdentity/data');
            filePromise.should.eventually.to.be.instanceOf(Identity).notify(done);
        });
    });
    describe('readAgentFilesAsync', function() { 
        it('issues recorder with missing agent', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity-missing-agent.json','./ts-test/TemperanceIdentity/data');
            filePromise.then(function(identity) {
                identity.readAgentFilesAsync('./ts-test/TemperanceIdentity/data','./ts-test/TemperanceIdentity/data').then(function(issues: Map<string,Error>){
                    issues.size.should.equals(1);
                    issues.has('test-agent-missing.json').should.equal(true);
                    issues.get('test-agent-missing.json').should.be.instanceOf(Error);
                }).catch(function(error)
                {
                    console.log(error);
                    error.should.equal(null);
                });
            }).catch(function(error)
            {
                console.log(error);
                error.should.equal(null);        
            });
            done();
        });
        it('success on valid identity and valid agents', function(done) {
            var filePromise = Identity.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json','./ts-test/TemperanceIdentity/data');
            filePromise.then(function(identity) {
                identity.readAgentFilesAsync('./ts-test/TemperanceIdentity/data','./ts-test/TemperanceIdentity/data').then(function(issues: Map<string,Error>) {
                    issues.keys.length.should.equal(0);
                }).catch(function(error)
                {
                    error.should.equal(null);
                });
            }).catch(function(error)
            {
                error.should.equal(null);                
            });
            done();
        });
    });
});
*/