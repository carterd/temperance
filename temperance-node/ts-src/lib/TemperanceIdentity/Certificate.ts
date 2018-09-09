/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import DistingishedName from './DistingishedName';

import * as FS from 'fs';
import * as Util from 'util';
import * as PemTools from 'pemtools';
import * as NodeForge from 'node-forge';
import * as X509 from 'x509';
import * as TLS from 'tls';

const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

/**
 * Private module constants.
 * @private
 */
const SUPPORTED_COMMON_NAME_HASH_TYPES = [ 'sha1', 'sha224', 'sha256' ];

/**
 * Interface for the hashObject which contains a hashType and hash value.
 */
interface HashObject
{
    'hashType': string;
    'hashValue': string;
}

/**
 * Certificate is a wrapper for the PEM certificates.
 * The object itself stores both the raw file and the converted PEM certificate instance.
 * Currently uses pemtools
 */
export default class Certificate
{
    // An optional id associated with certificate object
    'id'
    // The der string in 'binary'
    'der': string = null;
    // The instance of the raw PEM file
    'pem': Buffer = null;
    // The instance of node-forge certificate object
    'forge': NodeForge.pki.Certificate = null;
    // The issuer string for this certificate
    'issuer': DistingishedName = null;
    // The subject string for this certificate
    'subject': DistingishedName = null;

    static 'strict': boolean;

    /**
     * Basic constructor for the certificate object
     * @param pem The raw characters of the decoded certificate
     * @param x509 The x509 object created from the PEM
     */
    public constructor(id: string, der: string, pem: Buffer = null)
    {
        this.id = id;
        this.pem = pem;
        if (der != null)
        {
            this.der = der;
            var obj = NodeForge.asn1.fromDer(this.der, Certificate.strict);
            this.forge = NodeForge.pki.certificateFromAsn1(obj);
            //this.forge = NodeForge.pki.certificateFromPem(pem.toString('binary'));
            this.issuer = DistingishedName.getFromNodeForgeDistingishedName(this.forge.issuer.attributes);
            this.subject = DistingishedName.getFromNodeForgeDistingishedName(this.forge.subject.attributes);
        }
    }

    public get isIdentityCertificate() : boolean
    {
        return (this.subject.lookupString == this.subject.identityString);
    }

    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate object.
     * 
     * @param tlsCertificate
     */
    public static fromTLSCertificate(tlsCertificate: TLS.DetailedPeerCertificate) : Certificate
    {
        var certificate = new Certificate(null,tlsCertificate.raw.toString('binary'));
        return certificate;
    }

    /**
     * Helper function to process a given pemCertificate buffer and returns instance of the
     * constructed certificate object.
     * @param id 
     * @param pemBuffer 
     */
    public static fromPEM(id, pemBuffer) : Certificate
    {
        var msg = NodeForge.pem.decode(pemBuffer)[0];

        if(msg.type !== 'CERTIFICATE' &&
          msg.type !== 'X509 CERTIFICATE' &&
          msg.type !== 'TRUSTED CERTIFICATE') {
          var error: any = new Error('Could not convert certificate from PEM; PEM header type ' +
            'is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".');
          error.headerType = msg.type;
          throw error;
        }
        if(msg.procType && msg.procType.type === 'ENCRYPTED') {
          throw new Error('Could not convert certificate from PEM; PEM is encrypted.');
        }
        return new Certificate(id, msg.body, pemBuffer);
    }

    /**
     * Convert the TLS formatted distingished name object to the x509 libaray object
     * 
     * @param distingishedName The TLS distingished name to convert to a x509 library object
     */
    private static convertTLSDistingishedName(distingishedName: any) : any
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

    /**
     * Convert the node forge distingishedName either issue or subject.
     * @param distingishedName 
     */
    private static convertNodeForgeDistingishedName(distingishedName: any) : any
    {
        return NodeForge.pki.certificateFromPem( distingishedName).issuer.attributes
    }
    
    /**
     * Convert the distingished name object to an agent name string.
     *
     * @param distingishedName x509 name object.
     */
    public static distingishedNameToIdentityString(distingishedName: Object) : string
    {
        const identityNameFields: string[] = [
            'commonName',
			'givenName',
			'surname',
			'initials',
			'localityName',
			'stateOrProvinceName',
			'countryName',
    		'organizationName',
            'organizationalUnitName'
        ];
        return Certificate.distingishedNameToString(distingishedName, identityNameFields);
    }

    /**
     * Convert uniqueIdentity string to hashObject which identifies the hashType and hashValue.
     * The format of the uniqueIdentity string is 'type:value', the function splits the identity
     * into a type and value, and the type is checked against the supported hash types.
     *
     * @param uniqueIdentity unique identity string to convert
     * @return HashObject with hashType and hashValue
     */
    public static uniqueIdentityToHashObject( uniqueIdentity: string ) : HashObject
    {
        var terms: string[] = uniqueIdentity.split(':');
        if (terms.length != 2) 
        {
	        throw new Error("unique-identity has invalid format");
        }
        let hashType: string = terms[0];
        let hashValue: string = terms[1];
        if ( SUPPORTED_COMMON_NAME_HASH_TYPES.indexOf(hashType) < 0 ) 
        {
	        throw new Error(Util.format("hash function '%s' is not supported for certificate Common Name unique identity", hashType));
        }
        
        return {
            'hashType': hashType, 
            'hashValue': hashValue 
        };
    }

    /**
     * Returns true if the certificates are the same
     * @param certificate The certificate to check
     */
    public equals(certificate: Certificate) : boolean
    {
        return this.der === certificate.der;
    }

    /**
     * Returns true if the certificate is a self signed certificate.
     * 
     * @return true if the certificate is self signed.
     */
    public isSelfSigned() : boolean
    {
        return this.subject.equals(this.issuer);
    }

    /**
     * Convert the distingished name object to an agent name string.
     *
     * @param distingishedName x509 name object.
     */
    private static distingishedNameToString(distingishedName: Object, nameFields: string[]) : string
    {
        var result: string = "";
        for (var i = 0 ; i < nameFields.length ; i++) 
        {
    	    let nameField = nameFields[i];
            if (i)
            {
    	        result +="/";
	        }
            if (distingishedName[nameField]) 
            {
        	    result += distingishedName[nameField];
    	    } else {
                throw new Error(Util.format("distingishedNameToString expected name-field '%s' not found in distingished name", nameField));
            }
        }
        return result;
    }
}