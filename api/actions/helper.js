/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const util = require("util");

const getCCP = async (org) => {
  let ccpPath;
  if (org == "Org1") {
    ccpPath = path.resolve(
      __dirname,
      "../..",
      "network",
      "crypto-config",
      "peerOrganizations",
      "org1.example.com",
      "connection-org1.json"
    );
  } else if (org == "Org2") {
    ccpPath = path.resolve(
      __dirname,
      "../..",
      "network",
      "crypto-config",
      "peerOrganizations",
      "org2.example.com",
      "connection-org2.json"
    );
  } else return null;
  const ccpJSON = fs.readFileSync(ccpPath, "utf8");
  const ccp = JSON.parse(ccpJSON);
  return ccp;
};

const getCaUrl = async (org, ccp) => {
  let caURL;
  if (org == "Org1") {
    caURL = ccp.certificateAuthorities["ca.org1.example.com"].url;
  } else if (org == "Org2") {
    caURL = ccp.certificateAuthorities["ca.org2.example.com"].url;
  } else return null;
  return caURL;
};

const getWalletPath = async (org) => {
  let walletPath;
  if (org == "Org1") {
    walletPath = path.join(process.cwd(), "org1-wallet");
  } else if (org == "Org2") {
    walletPath = path.join(process.cwd(), "org2-wallet");
  } else return null;
  return walletPath;
};

const getAffiliation = async (org) => {
  return org == "Org1" ? "org1.department1" : "org2.department1";
};

const getAdminName = async (org) => {
  return org == "Org1" ? "admin1" : "admin2";
};

const getOrgMSP = async (org) => {
  return org == "Org1" ? "Org1MSP" : "Org2MSP";
};

const getRegisteredUser = async (username, userOrg, isJson) => {
  try {
    let ccp = await getCCP(userOrg);
    const caUrl = await getCaUrl(userOrg, ccp);

    const ca = new FabricCAServices(caUrl);

    const walletPath = await getWalletPath(userOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
      console.log(
        `An identity for the user ${username} already exists in the wallet`
      );
      var response = {
        success: true,
        message: username + " enrolled Successfully",
      };
      return response;
    }

    let adminName = await getAdminName(userOrg);
    let adminIdentity = await wallet.get(adminName);
    if (!adminIdentity) {
      console.log(
        `An identity for the admin user ${adminName} does not exist in the wallet`
      );
      await enrollAdmin(userOrg, ccp);
      adminIdentity = await wallet.get(adminName);
      console.log("Admin Enrolled Successfully");
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminName);

    console.log(provider);
    const secret = await ca.register(
      {
        affiliation: await getAffiliation(userOrg),
        enrollmentID: username,
        role: "client",
      },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: await getOrgMSP(userOrg),
      type: "X.509",
    };

    await wallet.put(username, x509Identity);
    console.log(
      `Successfully registered and enrolled admin user ${username} and imported it into the wallet`
    );

    var response = {
      success: true,
      message: username + " enrolled Successfully",
    };
    return response;
  } catch (error) {
    return error.message;
  }
};

const getCaInfo = async (org, ccp) => {
  let caInfo;
  if (org == "Org1") {
    caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
  } else if (org == "Org2") {
    caInfo = ccp.certificateAuthorities["ca.org2.example.com"];
  } else return null;
  return caInfo;
};

const enrollAdmin = async (org, ccp) => {
  console.log(`Enrolling admin for org ${org}`);

  try {
    const caInfo = await getCaInfo(org, ccp);

    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = await getWalletPath(org);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    const adminName = await getAdminName(org);
    const identity = await wallet.get(adminName);

    if (identity) {
      console.log(
        `An identity for the ${adminName} user ${adminName} already exists in the wallet`
      );
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: await getOrgMSP(org),
      type: "X.509",
    };

    await wallet.put(adminName, x509Identity);
    console.log(
      `Successfully enrolled ${adminName} user "${adminName}" and imported it into the wallet!`
    );

    return;
  } catch (error) {
    return error.message;
  }
};

exports.getRegisteredUser = getRegisteredUser;

module.exports = {
  getCCP: getCCP,
  getWalletPath: getWalletPath,
  getRegisteredUser: getRegisteredUser,
};
