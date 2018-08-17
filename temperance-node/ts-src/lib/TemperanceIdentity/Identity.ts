/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from './Certificate';
import CertificateList from './CertificateList';
import Agent from './Agent';
import AgentList from './AgentList';

import * as FS from 'fs';
import * as Crypto from 'crypto';
import * as Util from 'util';
import * as Path from 'path';

const readFileAsync = Util.promisify(FS.readFile);

/**
 * Module dependencies.
 * @private
 */

export default class Identity
{
    // Path location of the certificate file that identifies the identity.
    'identityId': string;
    'identityCertificates': CertificateList;
    'agents': AgentList;

    /**
     * Validate X509 distingished name is valid identity certificate. 
     * This is done by ensuring the commonName is the hashed public key, and
     * that the certificate is effectively self signed.
     *
     * @param certificate the certificate object
     * @return the certificate's issuer also used as the identity string
     */
    public static validateIdentityCertificate(identityCertificates: CertificateList, identityString: string): void
    {
        if (identityCertificates.length != 1)
            throw new Error("identity certificate chain is required to be a single certificate")

//        var hashObject = Certificate.uniqueIdentityToHashObject(identityCertificate.issuer['commonName']);
//        var hash = Crypto.createHash(hashObject.hashType);

//        hash.update(identityCertificate.publicKey['n']);
//        if (hash.digest('hex') != hashObject.hashValue)
//            throw new Error("identity certificate Common Name unique identity doesn't match it's public key");
            
//        var certIdentityString = Certificate.distingishedNameToIdentityString(identityCertificate.issuer)
//        if  ( certIdentityString !== identityString)
//            throw new Error(Util.format("identity certificate identityString '%s' doesn't match the configured identityString '%s'", certIdentityString, identityString));
    }

    /**
     * Identity class to represent Identity and associated access.
     * 
     * @param identityString The identity string that is associated with the issuer in matching identity certificate
     * @param certificateFilename The filename of the identity certificate
     * @param identityCertificate The identity certificate object
     * @param agentJsonFilenames The filenames of the agent json files
     */
    public constructor(identityId: string, identityCertificates: CertificateList, agents: AgentList) 
    {
        this.identityId = identityId;
        this.identityCertificates = identityCertificates;
        this.agents = agents;
        this.agents.setAgentsIdentity(this);
    }
}
