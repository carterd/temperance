"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);
const pemtools = require('pemtools');
const Certificate_1 = require("../../ts-src/lib/TemperanceIdentity/Certificate");
describe('Class Certificate', function () {
    describe('readCertFileAsync', function () {
        it('throws no such file error', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./no_such_file.pem');
            filePromise.should.eventually.rejectedWith("no such file").notify(done);
        });
        it('read PEM file', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.should.eventually.to.be.instanceOf(Certificate_1.default);
            filePromise.should.eventually.have.property('raw').to.be.instanceOf(Buffer);
            filePromise.should.eventually.have.property('pem').to.be.instanceOf(pemtools.PEM);
            filePromise.should.eventually.have.property('x509').to.be.instanceOf(Object);
            filePromise.should.eventually.notify(done);
        });
    });
    describe('get issuer', function () {
        it('success on valid certificate', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificatePEM) {
                (certificatePEM.issuer['commonName']).should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                done();
            });
        });
    });
    describe('get subject', function () {
        it('success on valid certificate', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (certificate.subject['commonName']).should.be.equal('sha1:b469c21faab2d71c19cd3daa3df743e6c6777553');
                done();
            });
        });
    });
    describe('get publicKey', function () {
        it('success on valid certificate', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (certificate.publicKey['bitSize']).should.be.equal(2048);
                done();
            });
        });
    });
    describe('distingishedNameToAgentString', function () {
        it('success on valid distingished name', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (Certificate_1.default.distingishedNameToAgentString(certificate.issuer)).should.be.equal("sha1:b469c21faab2d71c19cd3daa3df743e6c6777553/Derek/Carter/DC/Solihull/West-Midlands/UK/temperance/identity");
                done();
            });
        });
        it('throws on invalid distingished name', function (done) {
            (function () {
                Certificate_1.default.distingishedNameToAgentString({
                    'commonName': 'sha1:b469c21faab2d71c19cd3daa3df743e6c6777553',
                    'givenName': 'Derek',
                    'surname': 'Carter',
                    'initials': 'DC',
                    'localityName': 'Solihull',
                    'stateOrProvinceName': 'West-Midlands',
                    'countryName': 'UK',
                    'organizationName': 'Temperance',
                });
            }).should.to.throw(Error);
            done();
        });
    });
    describe('distingishedNameToIdentityString', function () {
        it('success on valid distingished name', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (Certificate_1.default.distingishedNameToAgentString(certificate.issuer)).should.be.equal("sha1:b469c21faab2d71c19cd3daa3df743e6c6777553/Derek/Carter/DC/Solihull/West-Midlands/UK/temperance/identity");
                done();
            });
        });
        it('throws on invalid distingished name', function (done) {
            (function () {
                Certificate_1.default.distingishedNameToAgentString({
                    'commonName': 'sha1:b469c21faab2d71c19cd3daa3df743e6c6777553',
                    'givenName': 'Derek',
                    'surname': 'Carter',
                    'initials': 'DC',
                    'localityName': 'Solihull',
                    'stateOrProvinceName': 'West-Midlands',
                    'countryName': 'UK',
                    //'organizationName': 'Temperance',
                    'organizationalUnitName': 'ok'
                });
            }).should.to.throw(Error);
            done();
        });
    });
    describe('uniqueIdentityToHashObject', function () {
        it('success on valid distingished name', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (Certificate_1.default.uniqueIdentityToHashObject(certificate.issuer['commonName'])).should.have.property('hashType').equal("sha1");
                (Certificate_1.default.uniqueIdentityToHashObject(certificate.issuer['commonName'])).should.have.property('hashValue').equal("b469c21faab2d71c19cd3daa3df743e6c6777553");
                done();
            });
        });
    });
    describe('compareDistingishedNames', function () {
        it('success on valid compare', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (Certificate_1.default.compareDistingishedNames(certificate.issuer, certificate.subject)).should.be.true;
                done();
            });
        });
    });
    describe('isSelfSigned', function () {
        it('true on self-signed cert', function (done) {
            var filePromise = Certificate_1.default.readCertFileAsync('./ts-test/TemperanceIdentity/data/cert.pem');
            filePromise.then(function (certificate) {
                (certificate.isSelfSigned()).should.be.true;
                done();
            });
        });
    });
});
//# sourceMappingURL=CertificateTests.js.map