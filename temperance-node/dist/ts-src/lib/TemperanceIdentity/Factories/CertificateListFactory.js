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
// TemperanceIdentity Objects
const CertificateList_1 = require("../CertificateList");
// TemperanceIdentity error Objects
const CertificateListError_1 = require("../Errors/CertificateListError");
// Node Libraries
const Util = require("util");
/**
 * The CertificateListFactory is a factory that on calls to getCertificateListAsync
 * will convert a given list of certificateIds to an CertificateChain object.
 */
class CertificateListFactory {
    /**
     * Constructor for the certificate list factory
     * @param certificateStore The certificate store used to convert ids to certificates
     */
    constructor(certificateStore) {
        this.certificateStore = certificateStore;
    }
    /**
     * convert the given certificate ids into a certificate list
     * @param certificateIds
     */
    getCertificateListAsync(certificateIds) {
        return __awaiter(this, void 0, void 0, function* () {
            var certificateList = new CertificateList_1.default();
            var certificateErrors = new Array();
            for (var id of certificateIds) {
                try {
                    this.logger ? this.logger.debug(Util.format("CertificateListFactory.getCertificateListAsync() : associating agent certificates id '%s'", id)) : null;
                    var certificate = yield this.certificateStore.getCertificateAsync(id);
                    if (certificate == null) {
                        this.logger ? this.logger.error(Util.format("CertificateListFactory.getCertificateListAsync() : failed to find certificate in certificate store with id '%s'", id)) : null;
                        certificateErrors.push(new Error(Util.format("failed to find certificate in certificate store with id '%s'", id)));
                    }
                    else {
                        certificateList.push(id, certificate);
                    }
                }
                catch (error) {
                    this.logger ? this.logger.error(Util.format("CertificateListFactory.getCertificateListAsync() : error getting from certificate store '%s'", error)) : null;
                    certificateErrors.push(error);
                }
            }
            if (certificateErrors.length != 0) {
                this.logger ? this.logger.error("CertificateListFactory.getCertificateListAsync() : errors during resolution of certificates") : null;
                throw new CertificateListError_1.default("errors during resolution of certificates", certificateErrors);
            }
            return certificateList;
        });
    }
}
exports.default = CertificateListFactory;
//# sourceMappingURL=CertificateListFactory.js.map