/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

const AsyncHandler = fn => (req, res, next) => 
{
    Promise
        .resolve(fn(req,res,next))
        .catch(next);
}

export default AsyncHandler;
