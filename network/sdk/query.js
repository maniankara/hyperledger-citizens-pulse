/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

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
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    /********* USERS CHOICES ******/

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

    // Evaluate the specified transaction.
    const result = await contract.evaluateTransaction("ReadPlan", "plan1");

    console.log(`Transaction has been evaluated, result is: ${result}`);
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
}

main();
