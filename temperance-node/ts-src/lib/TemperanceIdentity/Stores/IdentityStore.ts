/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Identity from "../Identity";

/**
 * Module dependencies.
 * @private
 */

export default interface IdentityStore
{
    /**
     * Returns the state of the IdentityFactory true for inialised and false for
     * the IdenttyFactory requiring an initailse to be called.
     */
    'initialised': boolean;

    'identityErrors': Map<string,Error>;

    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initialiseAsync(): Promise<void>;

    /**
     * Once initalised the factory will return an identity from the factory given
     * a full identity id.
     */
    getIdentityAsync(id: string): Promise<Identity>;

    /**
     * Once initalised the factory will return an identity from the store given
     * a identity string.
     */
    getIdentityFromIdentityStringAsync(identityString: string): Promise<Identity>;

    /**
     * Returns all the entry id's in the store
     */
    getAllStoreIdsAsync(): Promise<Array<string>>;
}