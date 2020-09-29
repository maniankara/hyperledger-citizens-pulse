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
const PlanData = require("../src/planData.model");

function sha256(data) {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

const makeUserComments = async (username, org_name, planName, userComment) => {
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

    let cert = identity.credentials.certificate;
    let cert_hash = sha256(cert.concat(planName));

    var queryOptions = {
      upsert: true,
      useFindAndModify: false,
      new: true,
    };
    var comment = { comment: userComment, createdAt: Date.now() };

    PlanData.findOneAndUpdate(
      { hash: cert_hash },
      { $push: { comments: comment } },
      queryOptions,
      function (err, doc) {
        if (err) return err;
      }
    );

    return { message: "Comment saved!" };
  } catch (error) {
    return error.message;
  }
};

exports.makeUserComments = makeUserComments;
