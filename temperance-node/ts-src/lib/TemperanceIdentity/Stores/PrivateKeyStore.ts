/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import PrivateKey from "../PrivateKey";

/**
 * Module dependencies.
 * @private
 */

export default interface PrivateKeyStore
{
    /**
     * Returns the state of the PrivateKeyStore true for inialised and false for
     * the PrivateKeyStore requiring an initailse to be called.
     */
    'initialised': boolean;

    /**
     * The PrivateKeyStore maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the PrivateKeyStore has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initialiseAsync(): Promise<void>;

    /**
     * Once initalised the store will return an identity form the store given
     * a unique id string. A certificate will be a reference to a new object for
     * each time the function is called.
     */
    getPrivateKeyAsync(id: string): Promise<PrivateKey>;
}