/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from './Certificate';
import CertificateListError from './Errors/CertificateListError';
import CertificateList from './CertificateList';

import * as Util from 'util';
import * as TLS from 'tls';

/**
 * The certificate chain is used to store a chain of certificates
 */
export default class CertificateChain extends CertificateList
{
    /**
     * Restrict excessive chain sizes
     */
    public static maxCertificateChainLength = 8;

    /**
     * Returns the entity certificate at the start of the certificate chain or null if chain is empty
     */
    public get entityCertificiate() : Certificate
    {
        if (this.length > 0)
            return this._objects[0];
        else
            return null;
    }
    
    /**
     * Returns the root of the chain i.e. last in the chain
     */
    public get rootCertificate() : Certificate
    {
        if (this.length > 0)
            return this._objects[this.length-1];
        else
            return null;
    }

    /**
     * Throws an error if the certificate chain, each certificate in chain is verified by the next
     */
    public validateCertificateChain()
    {
        if (this.length > 0)
        {
            for (var i = 0; i < this.length - 1; i++)
            {
                if (this._objects[i].isSelfSigned())
                    throw new Error("invalid certificate chain contains a self signed certificate");
                if (!this._objects[i].forge.verify(this._objects[i+1].forge))
                    throw new Error("invalid certificate chain failed to verify");
                if (this._objects[i].subject.identityString != this._objects[i+1].subject.identityString)
                    throw new Error("invalid certificate subject doesn't match identity");
            }
        }
    }

    /**
     * Throws error if certificates are not signed by the identity certificate
     * @param identityCertificate 
     */
    public validateCertificateChainWithIdentity(identityCertificate: Certificate)
    { 
        if (this.length > 0)
        {
            if (!this.rootCertificate.forge.verify(identityCertificate.forge))
                throw new Error("invalid certificate chain doesn't match identity certificate");
            if (this.rootCertificate.subject.identityString != identityCertificate.subject.identityString)
                throw new Error("invalid certificate chain doesn't match identity");
        }
    }

    /**
     * Return the index of the identity certificate in the certificate chain
     */
    public findIndexIdentityCertificate() : number
    {
        for (var index = 0; index < this.length ; index++ )
        {
            if (this._objects[index].isIdentityCertificate)
                return index;
        }
        return -1;
    }

    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate objects. Including the identity certificate if given.
     * 
     * @param tlsCertificate
     */
    public static fromTLSCertificate(tlsCertificate: TLS.DetailedPeerCertificate) : CertificateChain
    {
        var certificates = new CertificateChain();
        if (tlsCertificate == null)
            return certificates;

        // From the TLS chain generate CertificateChain
        var id = 0;
        var oldTLSCertificate = null;
        do 
        {
            if (id > CertificateChain.maxCertificateChainLength)
                throw new CertificateListError(Util.format("certificate chain length is greater than '%i'", this.maxCertificateChainLength), new Array<Error>());
            var oldTlsCertificate = tlsCertificate;
            tlsCertificate = tlsCertificate.issuerCertificate;
            certificates.push(String(id), Certificate.fromTLSCertificate(oldTlsCertificate));
            id++;
        } while (tlsCertificate == null || tlsCertificate == oldTLSCertificate)

        // Return the certifcates chain
        return certificates;
    }
}