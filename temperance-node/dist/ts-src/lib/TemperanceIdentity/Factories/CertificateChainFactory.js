"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
const CertificateListFactory_1 = require("./CertificateListFactory");
// TemperanceIdentity Objects
const CertificateChain_1 = require("../CertificateChain");
/**
 * The CertificateChainFactory is a factory that on calls to getCertificateChainAsync
 * will convert a given list of certificateIds to an CertificateChain object.
 */
class CertificateChainFactory extends CertificateListFactory_1.default {
    /**
     * Convert the given certificate ids into a certificate chain
     * @param certificateChainIds the list of certifcate ids to construct the certificate chain
     */
    getCertificateChainAsync(certificateChainIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var certificateList = yield this.getCertificateListAsync(certificateChainIds);
                return new CertificateChain_1.default(certificateList.certificates, certificateList.ids);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = CertificateChainFactory;
//# sourceMappingURL=CertificateChainFactory.js.map