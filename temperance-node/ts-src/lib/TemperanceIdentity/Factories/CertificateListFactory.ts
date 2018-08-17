/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// TemperanceIdentity Objects
import CertificateList from '../CertificateList';
// TemperanceIdentity store Objects
import CertificateStore from '../Stores/CertificateStore';
// TemperanceIdentity error Objects
import CertificateListError from '../Errors/CertificateListError';

// Node Libraries
import * as Util from 'util';

/**
 * The CertificateListFactory is a factory that on calls to getCertificateListAsync
 * will convert a given list of certificateIds to an CertificateChain object.
 */
export default class CertificateListFactory
{
        
    /**
     *  Optional logger object
     */
    'logger': any;

    /**
     * This is the certififcate store used to instanciate certificate chains
     */
    private _certificateStore: CertificateStore;

    /**
     * Constructor for the certificate list factory
     * @param certificateStore The certificate store used to convert ids to certificates
     */
    constructor(certificateStore: CertificateStore)
    {
        this._certificateStore = certificateStore;
    }

    /**
     * convert the given certificate ids into a certificate list
     * @param certificateIds 
     */
    public getCertificateListAsync(certificateIds: Array<string>) : Promise<CertificateList>
    {
        return new Promise(async (resolve, reject) => 
        {
            var certificateList = new CertificateList();
            var certificateErrors = new Array<Error>();
            for (var id of certificateIds)
            {
                try
                {
                    this.logger ? this.logger.debug(Util.format("CertificateListFactory.getCertificateListAsync() : associating agent certificates id '%s'", id)) : null;
                    var certificate = await this._certificateStore.getCertificateAsync(id);
                    if (certificate == null)
                    {
                        certificateErrors.push(new Error(Util.format("failed to find certificate in certificate store with id '%s'", id)));
                    }
                    else
                    {
                        certificateList.push(id, certificate);
                    }
                }
                catch (error)
                {
                    certificateErrors.push(error);
                }
            }
            if (certificateErrors.length != 0)
                return reject(new CertificateListError("errors during resolution of certificates", certificateErrors));
            return resolve(certificateList);
        });
    }
}