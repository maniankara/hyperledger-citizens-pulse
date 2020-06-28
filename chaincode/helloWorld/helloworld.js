/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require("fabric-shim");
const util = require("util");

var HelloWorld = class {
  // Initialize the chaincode
  async Init(stub) {
    console.info("========= HelloWorld Init =========");
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;
    if (args.length != 0) {
      return shim.error("Incorrect number of arguments. Expecting 0");
    }

    try {
      await stub.putState("Hello World", Buffer.from("1"));
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log("no method of name:" + ret.fcn + " found");
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async toggle(stub, args) {
    if (args.length != 0) {
      throw new Error("Incorrect number of arguments. Expecting 0");
    }

    // Get the state from the ledger
    let currStatusBytes = await stub.getState("Hello World");
    if (!currStatusBytes) {
      throw new Error("Failed to get state");
    }
    let currStatus = parseInt(currStatusBytes.toString());
    currStatus = currStatus ^ 1;
    console.info(util.format("currStatus = %d", currStatus));

    // Write the states back to the ledger
    await stub.putState("Hello World", Buffer.from(currStatus.toString()));
  }

  // query callback representing the query of a chaincode
  async query(stub, args) {
    if (args.length != 0) {
      throw new Error("Incorrect number of arguments. Expecting 0 arguments");
    }

    let A = "Hello World";

    let jsonResp = {};
    // Get the state from the ledger
    let respBytes = await stub.getState(A);
    if (!respBytes) {
      jsonResp.error = "Failed to get state for " + A;
      throw new Error(JSON.stringify(jsonResp));
    }

    jsonResp.text = "Hello World";
    jsonResp.status = respBytes.toString();
    console.info("Query Response:");
    console.info(jsonResp);

    return Buffer.from(JSON.stringify(jsonResp));
  }
};

shim.start(new HelloWorld());
