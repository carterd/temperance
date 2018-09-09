/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from "../Certificate";
import DirectoryAccess from "../../FileSystem/DirectoryAccess";

/**
 * Module dependencies.
 * @private
 */

export default interface CertificateStore
{
    /**
     * Returns the state of the CertificateFactory true for inialised and false for
     * the CertificateFactory requiring an initailse to be called.
     */
    'initialised': boolean;

    /**
     * The CertificateFactory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initialiseAsync(): Promise<void>;

    /**
     * Once initalised the factory will return an identity form the factory given
     * a unique id string. A certificate will be a reference to a new object for
     * each time the function is called.
     */
    getCertificateAsync(id: string): Promise<Certificate>;

    /** 
     * Gets a certificate given an agent string
     */
    getCertificateFromAgentStringAsync(agentString: string): Promise<Certificate>;

    /**
     * Insert certificate into store
     */
    insertCertificateAsync(id: string, certificate: Certificate): Promise<void>;
}