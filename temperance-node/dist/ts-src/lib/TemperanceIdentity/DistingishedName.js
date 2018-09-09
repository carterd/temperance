"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
const Util = require("util");
class DistingishedName {
    constructor(attributes = null) {
        this.attributes = attributes == null ? new Map() : attributes;
    }
    /**
     * Convert a NodeForge type distingished name object to the DistinigishedName object
     * @param forgeAttributes node-forge attributes of the distingished name
     */
    static getFromNodeForgeDistingishedName(forgeAttributes) {
        var distingishedName = new DistingishedName();
        for (var attribute of forgeAttributes) {
            if (!('type' in attribute))
                throw new Error('node-forge produced an attribute without a valid type for a certificate distingished name');
            if (!('value' in attribute))
                throw new Error('node-forge produced an attribute without a valid value for a certificate distingished name');
            if (attribute['valueTagClass'] != 19)
                throw new Error('node-forge produced an attribute without a valid tag type for a certificate distingished name');
            var attributeType = attribute['type'];
            var attributeKey = DistingishedName.forgeTypeToAttributeKeyMap.has(attributeType) ? DistingishedName.forgeTypeToAttributeKeyMap.get(attributeType) : attributeType;
            distingishedName.addAttribute(attributeKey, attribute['value']);
        }
        distingishedName.updateIdentityString();
        distingishedName.updateLookupString();
        return distingishedName;
    }
    addAttribute(attributeKey, attribute) {
        if (this.attributes.has(attributeKey))
            throw new Error(Util.format("error attempting to add duplicate attribute key '%s' to DistingishedName", attributeKey));
        if (DistingishedName.invalidAttributeCharacters.test(attribute))
            throw new Error(Util.format("error attempting to add attribute key '%s' to DistingishedName, value '%s' contains invalid charaters", attributeKey, attribute));
        this.attributes.set(attributeKey, attribute);
    }
    /**
     * Convert the list of attributes to a simple to use lookup string
     */
    updateLookupString() {
        this.lookupString = this.attributesToString(DistingishedName.lookupAttributeKeys);
    }
    /**
     * Convert the list of attributes to a simple to use identity string
     */
    updateIdentityString() {
        this.identityString = this.attributesToString(DistingishedName.identityAttributeKeys);
    }
    equals(distingishedName) {
        if (this.attributes.size != distingishedName.attributes.size)
            return false;
        for (var attributeKey of this.attributes.keys()) {
            if (!distingishedName.attributes.has(attributeKey) ||
                this.attributes.get(attributeKey) != distingishedName.attributes.get(attributeKey))
                return false;
        }
        return true;
    }
    /**
     * The convert the current attribute map into a string given the attribute keys to use
     * @param attributeKeys An array of attribute keys used to create the string
     */
    attributesToString(attributeKeys) {
        var result = null;
        for (var attributeKey of attributeKeys) {
            if (!this.attributes.has(attributeKey)) {
                throw new Error(Util.format("distinighed name missing attribute '%s'", attributeKey));
            }
            if (result == null)
                result = "";
            else
                result += DistingishedName.attributeSeparator;
            result += attributeKey + DistingishedName.keyValueSeparator + this.attributes.get(attributeKey);
        }
        return result;
    }
    /**
     * Convert the TLS formatted distingished name object to the x509 libaray object
     *
     * @param distingishedName The TLS distingished name to convert to a x509 library object
     */
    static convertTLSDistingishedName(distingishedName) {
        return {
            'commonName': distingishedName['CN'],
            'givenName': distingishedName['GN'],
            'surname': distingishedName['SN'],
            'initials': distingishedName['initials'],
            'localityName': distingishedName['L'],
            'stateOrProvinceName': distingishedName['ST'],
            'countryName': distingishedName['C'],
            'organizationName': distingishedName['O'],
            'organizationalUnitName': distingishedName['OU']
        };
    }
}
DistingishedName.forgeTypeToAttributeKeyMap = new Map([
    ['2.5.4.3', 'CN'],
    ['2.5.4.4', 'SN'],
    ['2.5.4.6', 'C'],
    ['2.5.4.7', 'L'],
    ['2.5.4.8', 'ST'],
    ['2.5.4.9', 'AD'],
    ['2.5.4.10', 'O'],
    ['2.5.4.11', 'OU'],
    ['2.5.4.12', 'TL'],
    ['2.5.4.42', 'GN'],
    ['2.5.4.43', 'I'],
]);
DistingishedName.lookupAttributeKeys = [
    'CN', 'SN', 'GN', 'I', 'C', 'ST', 'L', 'O', 'OU'
];
DistingishedName.identityAttributeKeys = [
    'CN', 'SN', 'GN', 'I', 'C', 'ST', 'L', 'O'
];
DistingishedName.attributeSeparator = "\\";
DistingishedName.keyValueSeparator = "@";
DistingishedName.invalidAttributeCharacters = new RegExp("[^A-Za-z0-9 '()+,-./:=?]", 'm');
exports.default = DistingishedName;
//# sourceMappingURL=DistingishedName.js.map