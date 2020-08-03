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
const helper = require("./helper");
const log4js = require("log4js");
const crypto = require("crypto");
const util = require("util");
const User = require("../src/user.model");

function sha256(data) {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

const fetchUserVote = async (username, org_name, planName) => {
  try {
    const ccp = await helper.getCCP(org_name);
    const walletPath = await helper.getWalletPath(org_name);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(username);

    if (!identity) {
      console.log(
        `An identity for the user ${username} does not exist in the wallet`
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    var response = {
      choice: 0,
    };

    let cert = identity.credentials.certificate;
    let cert_hash = sha256(cert.concat(planName));

    const result = await User.find({
      hash: cert_hash,
    })
      .exec()
      .then((val, err) => {
        if (val.length > 0) {
          response["choice"] = parseInt(val[0].choice);
        }
      });

    return response;
  } catch (error) {
    return error.message;
  }
};

exports.fetchUserVote = fetchUserVote;
