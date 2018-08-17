/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import * as FS from 'fs';
import * as Util from 'util';
import * as PemTools from 'pemtools';
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
    // The instance of the raw PEM file
    'raw': Buffer = null;
    // The instance of the PEM tools object
    'pem': any = null;
    // The instance of the X509 certificate
    'x509': any = null;
    // The instance of node-forge certificate object
    'forge': any = null;

    /**
     * Basic constructor for the certificate object
     * @param raw The raw characters of the decoded certificate
     * @param pem The pem formatted certificate
     * @param x509 The x509 object created from the PEM
     */
    public constructor(raw: Buffer = null, pem: any = null, x509: any = null, forge: any = null)
    {
        this.raw = raw;
        this.pem = pem;
        this.x509 = x509;
        this.forge = forge;
    }

    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate object.
     * 
     * @param tlsCertificate
     */
    public static convertTLSCertificate(tlsCertificate: TLS.DetailedPeerCertificate) : Certificate
    {
        var certificate = new Certificate();
        certificate.raw = tlsCertificate.raw;
        certificate.pem = null;
        certificate.x509 = {
            issuer: this.convertTLSDistingishedName(tlsCertificate.issuer),
            subject: this.convertTLSDistingishedName(tlsCertificate.subject),
            publicKey: { 
                'n': tlsCertificate.modulus,
            }
        };
        return certificate;
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
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     * 
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    /*
    public static readCertFileAsync(certPath) : Promise<Certificate>
    {
        return new Promise( async (resolve, reject) =>
        {
            try 
            {
                var certificate = new Certificate();
                certificate.raw = await readFileAsync(certPath);
	            certificate.x509 = X509.parseCert(certificate.raw.toString());
	            certificate.pem = PemTools(certificate.raw.toString());	    

        	    return resolve(certificate);
            } 
            catch (err) 
            {
		        return reject(err);
	        }
        });
    }
    */

    /**
     * Compare two distinished names and return true if they are infact the same
     */
    public static compareDistingishedNames(distingishedNameA: Object, distingishedNameB: Object) : boolean
    {
        var nameFieldsA = Object.keys(distingishedNameA);
        var nameFieldsB = Object.keys(distingishedNameB);

        if (nameFieldsA.length != nameFieldsB.length) return false;
        for (var i = 0; i < nameFieldsA.length; i++) {
            let nameField = nameFieldsA[i];
            if (!distingishedNameB.hasOwnProperty(nameField)) return false;
            if (distingishedNameA[nameField] !== distingishedNameB[nameField]) return false;
        }
        return true;
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
     * Returns true if the certificate is a self signed certificate.
     * 
     * @return true if the certificate is self signed.
     */
    public isSelfSigned() : boolean
    {
        return Certificate.compareDistingishedNames(this.issuer,this.subject);
    }

    /**
     * Returns the associated array of issuer components, or null if certificate has no valid issuer.
     * 
     * @return An associated array of issuer components, or null.
     */
    get issuer() : any
    {
        if (this.x509 == null) throw new Error('certificate not initialised with valid certificate');
        return this.x509.issuer;
    }

    /**
     * Return the associated array of subject components, or null if certificate has no valid subject.
     * 
     * @return An associated array of subject components, or null.
     */
    get subject() : any
    {
        if (this.x509 == null) throw new Error('certificate not initialised with valid certificate');
        return this.x509.subject;
    }

    /**
     * Return the associated array of public-key components, or null if certificate has no valid subject.
     * 
     * @return An associated array of public-key components, or null.
     */
    get publicKey() : any
    {
        if (this.x509 == null) return null;
        return this.x509.publicKey;
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