"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);
const Acquaintances_1 = require("../../ts-src/lib/TemperanceIdentity/Acquaintances");
describe('Class Aquaintances', function () {
    describe('readIdentityJsonPathAsync', function () {
        it('success', function (done) {
            var acquaintances = new Acquaintances_1.default('./ts-test/TemperanceIdentity/data/acquaintances/identities', './ts-test/TemperanceIdentity/data/acquaintances/identities/certs', './ts-test/TemperanceIdentity/data/acquaintances/agents', './ts-test/TemperanceIdentity/data/acquaintances/agents/certs');
            var filePromise = acquaintances.readAcquaintancesAsync();
            filePromise.then((map) => {
            }).catch((error) => {
                error.should.equal(null);
            });
            done();
        });
    });
});
//# sourceMappingURL=AcquaintancesTests.js.map