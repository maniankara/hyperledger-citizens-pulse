/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");

let user_name = process.argv[2];

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

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities["ca.org2.example.com"].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(user_name);
    if (userIdentity) {
      console.log(
        `An identity for the user ${user_name} already exists in the wallet`
      );
      return;
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get("admin2");
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin2" does not exist in the wallet'
      );
      console.log("Run the enrollCityAdmin.js application before retrying");
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin2");

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
      {
        affiliation: "org2.department1",
        enrollmentID: user_name,
        role: "client",
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: user_name,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org2MSP",
      type: "X.509",
    };
    await wallet.put(user_name, x509Identity);
    console.log(
      `Successfully registered and enrolled admin user ${user_name} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${user_name}: ${error}`);
    process.exit(1);
  }
}

main();
