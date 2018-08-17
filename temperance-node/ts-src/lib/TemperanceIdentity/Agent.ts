/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from './Certificate';
import CertificateChain from './CertificateChain';
import Identity from './Identity';
import AgentAccessControl from './AgentAccessControl';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readFileAsync = Util.promisify(FS.readFile);

/**
 * The Agent class is
 */
export default class Agent
{
    // Agent identifier string
    'agentId': string;
    // Filename of the certificate file.
    'certificateChain': CertificateChain;
    // The access stucture
    'accessControl': AgentAccessControl;
    // The identity object for this agent
    'identity': Identity;

    /**
     * Validate the x509Cert and identity's distingishedName
     *
     * @param certificate the cert object in x509 library object form.
     * @param identityDistingishedName the DN of the identity to validate
     */
    public static validateAgentCertificateChain(certificateChain: CertificateChain, agentId: string)
    {  
        if (certificateChain.length == 0)
            throw new Error("agent certificate chain cannot be empty");
        var agentCertificate = certificateChain.entityCertificiate;
        if (agentCertificate.isSelfSigned()) 
            throw new Error("agent certificate cannot be self signed");

        var certificateAgentString = Certificate.distingishedNameToIdentityString(agentCertificate.subject)
        if (certificateAgentString !== agentId)
            throw new Error(Util.format("agent certificate subject '%s' doesn't match the associated agentId '%s'",
                certificateAgentString, agentId));
    }

    /**
     * Identity class to represent Identity and associated access.
     */
    constructor(agentId: string, identity: Identity, certificateChain: CertificateChain, accessControl: AgentAccessControl) 
    {
        this.agentId = agentId;
        this.certificateChain = certificateChain;
        this.accessControl = accessControl;
        this.identity = identity;
    }

    /**
     * Returns true if the raw certificate given matches the agent certificate
     * 
     * @param certRaw the raw certificate buffer to check with agent
     */
    /*
    public matchesCertificate(certificateRaw: Buffer): boolean
    {
        if (this.certificateRaw.equals(certificateRaw)) 
        {
	        return true;
        }
        return false;
    }
    */

    /**
     * Return true if the given namespace token exists in the identity.
     *
     * @param namespace Namespace to use to access tokens.
     * @param token Token name to identify in the namespace.
     */
    /*
    public getAccessToken(namespace: string, token) 
    {
        if (!(namespace in this.access))
        {
        	return false;
        }
        return this.access[namespace][token] === true;
    }
    */

    /**
     * Read each of the agent Json files from the given agentJsonPath. 
     * Populate the identiy entity with instances of agent instance identified by objects current agent files.
     * 
     * @param agentJsonPath 
     */
    /*
    public readPrivateKeyAsync(privateKeyDir: string, logger: any = null) : Promise<Map<string, Error>>
    {
        return new Promise( async (resolve, reject) => {
            let issues = new Map<string, Error>();
            logger ? logger.debug(Util.format("Agent.readPrivateKeyAsync() : reading in private-key '%s'", this.privateKey)) : null;
            try
            {
                if (this.privateKey == null) 
                    throw Error(Util.format("agent '%s' has no privateKey defined", this.agentString));
                var privateKeyPath = Path.join(privateKeyDir, this.privateKey);
                var privateKeyRaw = await readFileAsync(privateKeyPath);
                this.privateKeyRaw = privateKeyRaw;
            }
            catch (error)
            {
                issues.set('privateKey', error);
            }
            return resolve(issues);
        });
    }
    */
}