"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);
const pemtools = require('pemtools');
const Identity_1 = require("../../ts-src/lib/TemperanceIdentity/Identity");
describe('Class Identity', function () {
    describe('readIdentityFileAsync', function () {
        it('throws no such Json file error', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./no_such_file.json', './ts-test/TemperanceIdentity');
            filePromise.should.eventually.rejectedWith("no_such_file.json").notify(done);
        });
        it('throws no such pem file error', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data/no_such_dir');
            filePromise.should.eventually.rejectedWith("no_such_dir").notify(done);
        });
        it('throws mismatch identityString', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity-invalid-identityString.json', './ts-test/TemperanceIdentity/data');
            filePromise.should.eventually.rejectedWith("identityString").notify(done);
        });
        it('success on valid identity', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data');
            filePromise.should.eventually.to.be.instanceOf(Identity_1.default).notify(done);
        });
    });
    describe('readAgentFilesAsync', function () {
        it('issues recorder with missing agent', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity-missing-agent.json', './ts-test/TemperanceIdentity/data');
            filePromise.then(function (identity) {
                identity.readAgentFilesAsync('./ts-test/TemperanceIdentity/data', './ts-test/TemperanceIdentity/data').then(function (issues) {
                    issues.size.should.equals(1);
                    issues.has('test-agent-missing.json').should.equal(true);
                    issues.get('test-agent-missing.json').should.be.instanceOf(Error);
                }).catch(function (error) {
                    console.log(error);
                    error.should.equal(null);
                });
            }).catch(function (error) {
                console.log(error);
                error.should.equal(null);
            });
            done();
        });
        it('success on valid identity and valid agents', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data');
            filePromise.then(function (identity) {
                identity.readAgentFilesAsync('./ts-test/TemperanceIdentity/data', './ts-test/TemperanceIdentity/data').then(function (issues) {
                    issues.keys.length.should.equal(0);
                }).catch(function (error) {
                    error.should.equal(null);
                });
            }).catch(function (error) {
                error.should.equal(null);
            });
            done();
        });
    });
    describe('clone', function () {
        it('success on clone full identity', function (done) {
            var filePromise = Identity_1.default.readIdentityFileAsync('./ts-test/TemperanceIdentity/data/test-identity.json', './ts-test/TemperanceIdentity/data');
            filePromise.then(function (identity) {
                identity.readAgentFilesAsync('./ts-test/TemperanceIdentity/data', './ts-test/TemperanceIdentity/data').then(function (issues) {
                    issues.keys.length.should.equal(0);
                    var identityClone = identity.clone();
                    identityClone.identityString.should.equal(identity.identityString);
                }).catch(function (error) {
                    error.should.equal(null);
                });
            }).catch(function (error) {
                error.should.equal(null);
            });
            done();
        });
    });
});
//# sourceMappingURL=IdentityTests.js.map