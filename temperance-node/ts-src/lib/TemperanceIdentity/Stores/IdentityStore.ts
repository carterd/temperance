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
    initalised: boolean;

    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initaliseAsync(): Promise<void>;

    /**
     * Once initalised the factory will return an identity from the factory given
     * a full identity string. An identity will be a reference to a new object for
     * each time the function is called.
     */
    getIdentityAsync(id: string): Promise<Identity>;
}