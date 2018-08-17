import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.should();
chai.use(chaiAsPromised);

import Acquaintances from '../../ts-src/lib/TemperanceIdentity/Acquaintances';
import { IdentityReadErrors } from '../../ts-src/lib/TemperanceIdentity/Acquaintances';
/*
describe('Class Aquaintances', function() {
    describe('readIdentityJsonPathAsync', function() { 
        it('success', function(done) {
            var acquaintances = new Acquaintances(
                './ts-test/TemperanceIdentity/data/acquaintances/identities',
                './ts-test/TemperanceIdentity/data/acquaintances/identities/certs',
                './ts-test/TemperanceIdentity/data/acquaintances/agents',
                './ts-test/TemperanceIdentity/data/acquaintances/agents/certs'
            );
            var filePromise = acquaintances.readAcquaintancesAsync();
            filePromise.then( (map) => {
                
            }).catch( (error) => {
                error.should.equal(null);
            });
            done();
        });
    });
});
*/