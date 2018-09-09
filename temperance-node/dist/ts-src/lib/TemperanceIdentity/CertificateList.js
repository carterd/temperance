"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const IdObjectList_1 = require("./IdObjectList");
/**
 * The certificate chain is used to store a chain of certificates
 */
class CertificateList extends IdObjectList_1.default {
    /**
     * Certificate constructor takes an optional array of certificates
     * @param certificates
     * @param certificateIds
     */
    constructor(certificates = null, certificateIds = null) {
        super(certificates, certificateIds);
    }
    /**
     * Parameter certificates is the objects
     */
    get certificates() {
        return this._objects;
    }
}
exports.default = CertificateList;
//# sourceMappingURL=CertificateList.js.map