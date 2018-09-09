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
    // storage id
    'id': string;
    // identity string for identity.
    'identityString': string;
    // Certificates that are the identity
    'identityCertificates': CertificateList;
    // Agents that represent users of the identity
    'agents': AgentList;

    /**
     * Validate X509 distingished name is valid identity certificate. 
     * This is done by ensuring the commonName is the hashed public key, and
     * that the certificate is effectively self signed.
     *
     * @param certificate the certificate object
     * @return the certificate's issuer also used as the identity string
     */
    public static validateIdentityCertificates(identityCertificates: CertificateList, identityString: string): void
    {
        for (var identityCertificate of identityCertificates.certificates)
        {
            if (identityCertificate.subject.identityString != identityString)
                throw new Error(Util.format("identity certificate subject '%s' doesn't match identity-string '%s", 
                    identityCertificate.subject.identityString, identityString));
            // Could possibly ensure self-signed for all identity certificates
        }
    }

    public static validateAgents(identityAgents: AgentList, identityCertificates: CertificateList)
    {
        for (var agent of identityAgents.agents)
        {
            var matchIdentityCertificate : Certificate = null;
            for (var identityCertificate of identityCertificates.certificates)
            {
                if (identityCertificate.forge.verify(agent.certificateChain.rootCertificate.forge))
                {
                    matchIdentityCertificate = identityCertificate;
                    break;
                }
            }
            if (matchIdentityCertificate == null)
                throw new Error("agent's certificate chain doesn't match any identity certificates");
            if (matchIdentityCertificate.subject.identityString != agent.identityString)
                throw new Error(Util.format("agent's certificate identity '%s' doesn't match identity certificate identity '%s", 
                    agent.identityString, matchIdentityCertificate.subject.identityString));
        }
    }

    /**
     * Identity class to represent Identity and associated access.
     * 
     * @param identityString The identity string that is associated with the issuer in matching identity certificate
     * @param certificateFilename The filename of the identity certificate
     * @param identityCertificate The identity certificate object
     * @param agentJsonFilenames The filenames of the agent json files
     */
    public constructor(id: string, identityString: string, identityCertificates: CertificateList, agents: AgentList) 
    {
        this.id = id;
        this.identityString = identityString;
        this.identityCertificates = identityCertificates;
        this.agents = agents;
        this.agents.setAgentsIdentity(this);
    }
}
