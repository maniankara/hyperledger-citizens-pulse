/*
 * SPDX-License-Identifier: Apache-2.0
 */
/* This module is responsible for getting the current value of upvote and downvote count
 of a particular plan persisiting in the private collection */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const helper = require("./helper");

var state = async function returnState(
  username,
  planName,
  channelName,
  chaincodeName
) {
  try {
    // load the network configuration
    const org_name = "Org1";
    const ccp = await helper.getCCP(org_name);

    // Create a new file system based wallet for managing identities.
    const walletPath = await helper.getWalletPath(org_name);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(username);
    if (!identity) {
      console.log(
        `An identity for the user ${username} does not exist in the wallet`
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);
    // Evaluate the specified transaction.
    const result = await contract.evaluateTransaction(
      "ReadPlanPrivateDetails",
      planName
    );

    return result;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports.state = state;
