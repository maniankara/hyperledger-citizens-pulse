/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
var getPlanState = require("./getState");
const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

async function main() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "..",
      "crypto-config",
      "peerOrganizations",
      "org2.example.com",
      "connection-org2.json"
    );
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    /********* USERS CHOICES ******/

    var option = String(process.argv[4]);
    var planName = String(process.argv[3]);
    var user_name = String(process.argv[2]);
    /*********************** ******/

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(user_name);
    if (!identity) {
      console.log(
        `An identity for the user ${user_name} does not exist in the wallet`
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    var choices = {
      upvote: 1,
      downvote: -1,
    };

    if (option !== "upvote" && option !== "downvote") {
      console.log(
        `Wrong choice : ${option}. Choice can only be upvote/downvote`
      );
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: user_name,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // Get the contract from the network.
    const contract = network.getContract("planCC");
    let cert = identity.credentials.certificate;
    let cert_hash = sha256(cert.concat(planName));

    let planData;
    let user_vote = choices[option];

    var res = await getPlanState.state(planName).then((res) => {
      let curr_state = JSON.parse(res.toString("utf8"));

      if (!(cert_hash in curr_state.usermap)) {
        curr_state.usermap[cert_hash] = user_vote;
        if (user_vote > 0) curr_state.upvote += 1;
        else curr_state.downvote += 1;
      } else {
        let prev_vote = curr_state.usermap[cert_hash];
        curr_state.usermap[cert_hash] = user_vote;
        if (user_vote != prev_vote) {
          if (user_vote > 0) {
            curr_state.downvote -= 1;
            curr_state.upvote += 1;
          } else {
            curr_state.downvote += 1;
            curr_state.upvote -= 1;
          }
        }
      }

      planData = { plan: curr_state };
    });

    let key = Object.keys(planData)[0];
    const transientDataBuffer = {};
    transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

    let result = await contract
      .createTransaction("UpdateVote")
      .setTransient(transientDataBuffer)
      .submit();

    console.log(
      `Transaction has been submitted. ${user_name} has ${option}d for ${planName}!`
    );

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();
