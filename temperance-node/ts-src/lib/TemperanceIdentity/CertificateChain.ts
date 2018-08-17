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

/**
 * The certificate chain is used to store a chain of certificates
 */
export default class CertificateChain extends CertificateList
{
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

    public validateCertificateChain()
    {
        
    }
}