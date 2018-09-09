/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import * as Util from 'util';
import * as NodeForge from 'node-forge';
import * as TLS from 'tls';
import { isNullOrUndefined } from 'util';

export default class DistingishedName
{
    /**
     * The attributes of the Distingished name
     */
    'attributes': Map<string,string>;

    /**
     * Lookup string is used to identify the certificate within stores
     */
    'lookupString': string;

    /**
     * Identity string is used to identify as associated with an identity
     */
    'identityString': string;

    private static readonly forgeTypeToAttributeKeyMap : Map<string, string> = new Map<string, string>([
        ['2.5.4.3','CN'],
        ['2.5.4.4','SN'],
        ['2.5.4.6','C'],
        ['2.5.4.7','L'],
        ['2.5.4.8','ST'],
        ['2.5.4.9','AD'],
        ['2.5.4.10','O'],
        ['2.5.4.11','OU'],
        ['2.5.4.12','TL'],
        ['2.5.4.42','GN'],
        ['2.5.4.43','I'],
    ]);

    private static readonly lookupAttributeKeys : Array<string> =
    [
        'CN','SN','GN','I','C','ST','L','O','OU'
    ];

    private static readonly identityAttributeKeys : Array<string> =
    [
        'CN','SN','GN','I','C','ST','L','O'
    ];

    public static readonly attributeSeparator = "\\";

    public static readonly keyValueSeparator = "@";

    private static readonly invalidAttributeCharacters = new RegExp("[^A-Za-z0-9 '()+,-./:=?]",'m');

    /**
     * Convert a NodeForge type distingished name object to the DistinigishedName object
     * @param forgeAttributes node-forge attributes of the distingished name
     */
    public static getFromNodeForgeDistingishedName(forgeAttributes: Array<any>) : DistingishedName
    {
        var distingishedName = new DistingishedName();

        for (var attribute of forgeAttributes)
        {
            if (! ('type' in attribute))
                throw new Error('node-forge produced an attribute without a valid type for a certificate distingished name');
            if (! ('value' in attribute))
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

    public constructor(attributes: Map<string, string> = null) 
    {
        this.attributes = attributes == null ? new Map<string,string>() : attributes;
    }

    public addAttribute(attributeKey: string, attribute: string)
    {
        if (this.attributes.has(attributeKey))
            throw new Error(Util.format("error attempting to add duplicate attribute key '%s' to DistingishedName", attributeKey));
        if (DistingishedName.invalidAttributeCharacters.test(attribute))
            throw new Error(Util.format("error attempting to add attribute key '%s' to DistingishedName, value '%s' contains invalid charaters", attributeKey, attribute));
        this.attributes.set(attributeKey, attribute);
    }

    /**
     * Convert the list of attributes to a simple to use lookup string
     */
    public updateLookupString()
    {
        this.lookupString = this.attributesToString(DistingishedName.lookupAttributeKeys);
    }

    /**
     * Convert the list of attributes to a simple to use identity string
     */
    public updateIdentityString()
    {
        this.identityString = this.attributesToString(DistingishedName.identityAttributeKeys);
    }

    public equals(distingishedName) : boolean
    {
        if (this.attributes.size != distingishedName.attributes.size)
            return false;
        for (var attributeKey of this.attributes.keys())
        {
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
    private attributesToString(attributeKeys : Array<string>) : string
    {
        var result : string = null;
        for (var attributeKey of attributeKeys)
        {
            if (!this.attributes.has(attributeKey))
            {
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
    public static convertTLSDistingishedName(distingishedName: any) : any
    {
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