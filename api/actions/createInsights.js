/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
var getGlobalState = require("./getGlobalState");
var getState = require("./getState");
const crypto = require("crypto");
const helper = require("./helper");
const { jsPDF } = require("jspdf");

var createInsights = async function create(
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
  var doc = new jsPDF();

  try {
    var res = await getGlobalState
      .state(username, org_name, planName, channelName, chaincodeName)
      .then((res) => {
        let curr_state = JSON.parse(res.toString("utf8"));
        console.log(curr_state);

        doc.setFontSize(20);
        doc.text(`${curr_state["planid"]}`, 105, 15, null, null, "center");
        doc.line(10, 20, 200, 20);
        doc.setFontSize(10);
        doc.text(
          `Downloaded by ${username} on ${new Date().toISOString()}.`,
          200,
          25,
          null,
          null,
          "right"
        );

        // doc.setFontSize(15);
        var desc = `Description : ${curr_state["description"]}`;
        var lines = doc.splitTextToSize(desc, 180);

        // var pageHeight = doc.internal.pageSize.height;
        doc.setFontSize("11");
        var y = 35;
        for (var i = 0; i < lines.length; i++) {
          if (y > 280) {
            y = 10;
            doc.addPage();
          }
          doc.text(10, y, lines[i]);
          y = y + 7;
        }

        // doc.text(10, 35, lines);

        let sum = curr_state["finalupvote"] + curr_state["finaldownvote"];
        let upv = curr_state["finalupvote"];
        let downv = curr_state["finaldownvote"];

        doc.text(`Total no. of votes received : ${sum}`, 10, y + 5);
        let perc1 = sum != 0 ? (upv / sum) * 100 : 0;
        let perc2 = sum != 0 ? (downv / sum) * 100 : 0;

        doc.text(`% of upvotes : ${perc1}`, 10, y + 10);
        doc.text(`% of downvotes : ${perc2}`, 10, y + 15);

        doc.text("Comments at a glance", 10, 90);
        var generateData = function (amount) {
          var result = [];

          for (var i = 0; i < curr_state["FinalComments"].length; i++) {
            var data = {
              Comments: curr_state["FinalComments"][i],
            };
            result.push(Object.assign({}, data));
          }
          return result;
        };

        function createHeaders(keys) {
          var result = [];
          for (var i = 0; i < keys.length; i += 1) {
            result.push({
              id: keys[i],
              name: keys[i],
              prompt: keys[i],
              width: 250,
              align: "left",
              padding: 0,
            });
          }
          return result;
        }

        var headers = createHeaders(["Comments"]);
        doc.table(10, 95, generateData(10), headers, {
          autoSize: false,
          printHeaders: true,
        });
      });

    return doc;
  } catch (error) {
    return error.message;
  }
};

module.exports.createInsights = createInsights;
