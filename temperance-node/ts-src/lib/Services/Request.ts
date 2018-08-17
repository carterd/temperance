/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import Identity from "../TemperanceIdentity/Identity";
import Agent from "../TemperanceIdentity/Agent";

export default class Request
{
    public requestIdentity : Identity;

    public requestAgent : Agent;

    public selfIdentity : Identity;

    public selfAgent : Agent;
}