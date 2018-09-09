/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from './Certificate';
import CertificateChainError from './Errors/CertificateListError';
import IdObjectList from './IdObjectList';

import * as Util from 'util';

/**
 * The certificate chain is used to store a chain of certificates
 */
export default class CertificateList extends IdObjectList<Certificate>
{
    /**
     * Certificate constructor takes an optional array of certificates
     * @param certificates
     * @param certificateIds  
     */
    public constructor(certificates: Array<Certificate> = null, certificateIds: Array<string> = null)
    {
        super(certificates, certificateIds);
    }

    /**
     * Parameter certificates is the objects
     */
    public get certificates() : Array<Certificate>
    {
        return this._objects;
    }
}