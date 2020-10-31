/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const {
  Gateway,
  Wallets,
  DefaultEventHandlerStrategies,
  TxEventHandlerFactory,
} = require("fabric-network");
const fs = require("fs");
const path = require("path");
const getPlanState = require("./getState");
const pollComplete = require("./pollComplete");
const getPlans = require("./getAllPlans");
const crypto = require("crypto");
const helper = require("./helper");
const log4js = require("log4js");
const logger = log4js.getLogger("PlanNet");
const util = require("util");

const checkAdmin = async (org_name) => {
  try {
    const username = "admin1";
    const ccp = await helper.getCCP(org_name);

    // Create a new file system based wallet for managing identities.
    const walletPath = await helper.getWalletPath(org_name);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    let identity = await wallet.get(username);
    if (!identity) {
      return false;
    }

    return true;
  } catch (error) {
    return error.message;
  }
};

exports.checkAdmin = checkAdmin;
