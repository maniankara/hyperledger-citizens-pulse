/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
var getState = require("./getState");
const crypto = require("crypto");

async function main() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "..",
      "crypto-config",
      "peerOrganizations",
      "org1.example.com",
      "connection-org1.json"
    );
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get("org1User");
    if (!identity) {
      console.log(
        'An identity for the user "org1User" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "org1User",
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");
    // Get the contract from the network.
    const contract = network.getContract("planCC");
    let cert = identity.credentials.certificate;

    let planData = {
      planid: "plan2",
      description: `this is the description of this plan2`,
      deadline: "24/July/2020",
      upvote: 0,
      downvote: 0,
      finalupvote: 0,
      finaldownvote: 0,
    };
    planData = { plan: planData };

    let key = Object.keys(planData)[0];
    const transientDataBuffer = {};
    transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

    let result = await contract
      .createTransaction("InitPlan")
      .setTransient(transientDataBuffer)
      .submit();

    console.log("Transaction has been submitted. Plan created!");

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();
