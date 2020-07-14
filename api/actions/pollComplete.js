/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
var getState = require("./getState");
const crypto = require("crypto");
const helper = require("./helper");

var pollComplete = async function endPoll(
  username,
  planName,
  channelName,
  chaincodeName
) {
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

  let cert = identity.credentials.certificate;

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork(channelName);

  // Get the contract from the network.
  const contract = network.getContract(chaincodeName);
  let final_upvotes = 0,
    final_downvotes = 0;

  try {
    let planVoteData;
    var res = await getState
      .state(username, planName, channelName, chaincodeName)
      .then((res) => {
        let curr_state = JSON.parse(res.toString("utf8"));
        planVoteData = curr_state;

        final_upvotes = curr_state.upvote;
        final_downvotes = curr_state.downvote;
      });

    const result = await contract.evaluateTransaction("ReadPlan", planName);
    let global_state = JSON.parse(result.toString("utf8"));

    global_state.finalupvote = final_upvotes;
    global_state.finaldownvote = final_downvotes;

    let planData = { plan: global_state };
    let key = Object.keys(planData)[0];
    const transientDataBuffer = {};
    transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

    console.log(planData);
    let response = await contract
      .createTransaction("UpdateGlobalPlan")
      .setTransient(transientDataBuffer)
      .submit();

    let planDeleteData = {
      plan_delete: {
        planid: planName,
      },
    };

    let del_key = Object.keys(planDeleteData)[0];
    const transientDelDataBuffer = {};
    transientDelDataBuffer[del_key] = Buffer.from(
      JSON.stringify(planDeleteData.plan_delete)
    );

    let result_del = await contract
      .createTransaction("DeletePrivatePlan")
      .setTransient(transientDelDataBuffer)
      .submit();

    var message = `Polling for plan ${planName} stopped. Votes made public!`;
    // Disconnect from the gateway.
    await gateway.disconnect();

    return message;
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
};

module.exports.pollComplete = pollComplete;
