/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

export default class BaseError extends Error 
{
    /**
     * Base wrapper for errors in the application
     * @param message 
     */
    constructor (message) 
    {
        // Calling parent constructor of base Error class.
        super(message);
      
        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;
  
        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
  };