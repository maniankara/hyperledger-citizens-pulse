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
const getPlanState = require("./getState");
const pollComplete = require("./pollComplete");
const getPlans = require("./getAllPlans");
const crypto = require("crypto");
const helper = require("./helper");
const log4js = require("log4js");
const logger = log4js.getLogger("PlanNet");
const util = require("util");
const UserVote = require("../src/vote.model");
const PlanData = require("../src/planData.model");

function sha256(data) {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

const invokeTransaction = async (
  channelName,
  chaincodeName,
  fcn,
  args,
  username,
  org_name,
  transientData
) => {
  try {
    logger.debug(
      util.format(
        "\n============ invoking  transaction on channel %s ============\n",
        channelName
      )
    );

    const ccp = await helper.getCCP(org_name);

    // Create a new file system based wallet for managing identities.
    const walletPath = await helper.getWalletPath(org_name);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    let identity = await wallet.get(username);
    if (!identity) {
      console.log(
        `An identity for the user ${username} does not exist in the wallet`
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const connectOptions = {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
      eventHandlerOptions: {
        commitTimeout: 100,
        strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
      },
    };
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, connectOptions);

    const network = await gateway.getNetwork(channelName);
    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);

    let message;
    let result;

    if (fcn == "UpdateVote") {
      if (org_name == "Org1") {
        message = `${org_name} user not authorised to update vote.`;
      } else {
        const option = args[0]; // the user choice; can be upvote or downvote
        const planName = args[1]; // the plan user wants to upvote or downvote
        const user_council = args[2]; // needed to fetch the current state of the private data collection

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
        let cert = identity.credentials.certificate;
        let cert_hash = sha256(cert.concat(planName));

        let planData;
        let user_vote = choices[option];

        var res = await getPlanState
          .state(user_council, planName, channelName, chaincodeName)
          .then((res) => {
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

            var query = { hash: cert_hash };
            var payload_mongo = {
              hash: cert_hash,
              choice: user_vote,
            };

            UserVote.findOneAndUpdate(
              query,
              payload_mongo,
              { upsert: true, useFindAndModify: false },
              function (err, doc) {
                if (err) return err;
              }
            );

            planData = { plan: curr_state };
          });

        let key = Object.keys(planData)[0];
        const transientDataBuffer = {};
        transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

        result = await contract
          .createTransaction("UpdateVote")
          .setTransient(transientDataBuffer)
          .submit();

        message = `Transaction has been submitted. ${username} has ${option}d for ${planName}!`;
      }
    } else if (fcn == "AddComment") {
      const planName = args[0]; // the plan user wants to upvote or downvote
      const user_council = args[1]; // needed to fetch the current state of the private data collection
      const comment_body = args[2];

      let cert = identity.credentials.certificate;
      let cert_hash = sha256(cert.concat(planName));

      let planData;

      var requestPlanState = await getPlanState
        .state(user_council, planName, channelName, chaincodeName)
        .then((res) => {
          let curr_state = JSON.parse(res.toString("utf8"));
          var commentsDict = curr_state["Comments"];

          commentsDict[cert_hash] = commentsDict[cert_hash] || [];
          commentsDict[cert_hash].push(comment_body);

          planData = { plan: curr_state };
        });

      let key = Object.keys(planData)[0];
      const transientDataBuffer = {};
      transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

      result = await contract
        .createTransaction("UpdateVote")
        .setTransient(transientDataBuffer)
        .submit();

      var queryOptions = {
        upsert: true,
        useFindAndModify: false,
        new: true,
      };
      var comment = { comment: comment_body, createdAt: Date.now() };

      PlanData.findOneAndUpdate(
        { hash: cert_hash },
        { $push: { comments: comment } },
        queryOptions,
        function (err, doc) {
          if (err) return err;
        }
      );
      message = `Transaction has been submitted. ${username} has commented on ${planName}!`;
    } else if (fcn == "EditComment") {
      const planName = args[0]; // the plan user wants to upvote or downvote
      const user_council = args[1]; // needed to fetch the current state of the private data collection
      var plansJSON = args[2];

      let modifCommentIndex = parseInt(plansJSON["index"]);
      let modifCommentData = plansJSON["data"];
      let modifCommentTime = modifCommentData["createdAt"];
      let modifComment = modifCommentData["comment"];

      let cert = identity.credentials.certificate;
      let cert_hash = sha256(cert.concat(planName));

      let planData;

      /*
       * Check if the modified comment is created with
       * 15 mins of the posted comment
       * if not, then DONT MODIFY COMMENT
       */
      var expired = false;
      var checkTimeout = await PlanData.findOne({ hash: cert_hash }, function (
        err,
        doc
      ) {
        if (err) return err;

        let totComments = doc.comments.length - 1;
        let differenceEpoch =
          modifCommentTime -
          doc.comments[totComments - modifCommentIndex].createdAt;

        let differenceMinutes = differenceEpoch / 60 / 1000;

        if (differenceMinutes > 15) {
          message = `Comment update period timed out.`;
          expired = true;
        }
      });

      if (expired === false) {
        var requestPlanState = await getPlanState
          .state(user_council, planName, channelName, chaincodeName)
          .then((res) => {
            let curr_state = JSON.parse(res.toString("utf8"));
            var commentsDict = curr_state["Comments"];
            let totComments = commentsDict[cert_hash].length - 1;

            commentsDict[cert_hash][
              totComments - modifCommentIndex
            ] = modifComment;

            planData = { plan: curr_state };
          });

        let key = Object.keys(planData)[0];
        const transientDataBuffer = {};
        transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

        result = await contract
          .createTransaction("UpdateVote")
          .setTransient(transientDataBuffer)
          .submit();

        var queryOptions = {
          upsert: false,
          useFindAndModify: true,
        };

        PlanData.findOne({ hash: cert_hash }, function (err, doc) {
          if (err) return err;

          let totComments = doc.comments.length - 1;

          doc.comments[totComments - modifCommentIndex].comment = modifComment;
          doc.comments[
            totComments - modifCommentIndex
          ].createdAt = modifCommentTime;

          doc.markModified("comments");
          doc.save();
        });

        message = `Transaction has been submitted. ${username} has edited comment on ${planName}!`;
      }
    } else if (fcn == "InitPlan") {
      if (org_name == "Org2") {
        message = `${org_name} user not authorised to create plan.`;
      } else {
        let planData = JSON.parse(transientData);
        planData["IsActive"] = true;
        let planName = planData.planid;
        planData = { plan: planData };

        let key = Object.keys(planData)[0];
        const transientDataBuffer = {};
        transientDataBuffer[key] = Buffer.from(JSON.stringify(planData.plan));

        result = await contract
          .createTransaction("InitPlan")
          .setTransient(transientDataBuffer)
          .submit();

        message = `Transaction has been submitted. ${planName} successfully created!`;
      }
    } else if (fcn == "StopPolling") {
      if (org_name == "Org2") {
        message = `${org_name} user not authorised to stop the poll.`;
      } else {
        const planName = args[0];

        var res = await pollComplete
          .pollComplete(username, planName, channelName, chaincodeName)
          .then((res) => {
            message = res;
          });
      }
    } else if (fcn == "GetAllPlans") {
      const startKey = args[0];
      const endKey = args[1];

      var res = await getPlans
        .getAllPlans(
          username,
          org_name,
          channelName,
          chaincodeName,
          startKey,
          endKey
        )
        .then((res) => {
          message = res;
        });
    }

    let response = {
      message: message,
      result,
    };

    return response;
  } catch (error) {
    return error.message;
  }
};

exports.invokeTransaction = invokeTransaction;
