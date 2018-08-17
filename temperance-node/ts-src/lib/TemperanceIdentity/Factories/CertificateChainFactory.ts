/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import CertificateListFactory from './CertificateListFactory';
// TemperanceIdentity Objects
import CertificateChain from '../CertificateChain';

/**
 * The CertificateChainFactory is a factory that on calls to getCertificateChainAsync
 * will convert a given list of certificateIds to an CertificateChain object.
 */
export default class CertificateChainFactory extends CertificateListFactory
{
    /**
     * Convert the given certificate ids into a certificate chain
     * @param certificateChainIds the list of certifcate ids to construct the certificate chain 
     */
    public getCertificateChainAsync(certificateChainIds: Array<string>) : Promise<CertificateChain>
    {
        return new Promise(async (resolve, reject) => 
        {
            try
            {
                var certificateList = await this.getCertificateListAsync(certificateChainIds);
                return resolve(new CertificateChain(certificateList.certificates, certificateList.ids));
            }
            catch (error)
            {
                return reject(error);
            }
        });
    }
}