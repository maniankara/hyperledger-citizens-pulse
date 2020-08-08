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
  orgname,
  planName,
  channelName,
  chaincodeName
) {
  // load the network configuration
  const org_name = orgname;
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
  let message;

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
      .then((response) => {
        if (response instanceof Error) {
          throw response;
        }
        let curr_state = JSON.parse(response.toString("utf8"));
        planVoteData = curr_state;

        final_upvotes = curr_state.upvote;
        final_downvotes = curr_state.downvote;
      });

    const result = await contract.evaluateTransaction("ReadPlan", planName);
    let global_state = JSON.parse(result.toString("utf8"));

    global_state.finalupvote = final_upvotes;
    global_state.finaldownvote = final_downvotes;
    global_state.IsActive = false;

    let planData = { plan: global_state };
    let key = Object.keys(planData)[0];
    const transientDataBuffer = {};
    transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

    // Update global plan with the details fetched from private plan
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

    // Delete private collection from peer persistence
    let result_del = await contract
      .createTransaction("DeletePrivatePlan")
      .setTransient(transientDelDataBuffer)
      .submit();

    var end_response = {};
    message = `Polling for plan ${planName} stopped. Votes made public!`;
    // Disconnect from the gateway.
    await gateway.disconnect();

    end_response = {
      message: message,
    };
    return end_response;
  } catch (error) {
    return error.message;
  }
};

module.exports.pollComplete = pollComplete;
