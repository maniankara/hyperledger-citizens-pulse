"use strict";
const bodyParser = require("body-parser");

const log4js = require("log4js");
const logger = log4js.getLogger("PlanNet");
let cors = require("cors");
var jwt_decode = require("jwt-decode");

const jwt = require("jsonwebtoken");
const constants = require("./config/constants.json");

logger.level = "all";

const http = require("http");
const util = require("util");
const express = require("express");
const expressJWT = require("express-jwt");
const bearerToken = require("express-bearer-token");

var helper = require("./actions/helper");
var invoke = require("./actions/invoke");
const { json } = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.set("secret", "randomsecret");
app.use(
  expressJWT({
    secret: "randomsecret",
    algorithms: ["HS256"],
  }).unless({
    path: ["/users", "/signup", "/authenticate", "/decode"],
  })
);
app.use(bearerToken());
app.use(cors());

app.use((req, res, next) => {
  logger.debug("New req for %s", req.originalUrl);
  if (
    req.originalUrl.indexOf("/users") >= 0 ||
    req.originalUrl.indexOf("/signup") >= 0 ||
    req.originalUrl.indexOf("/authenticate") >= 0 ||
    req.originalUrl.indexOf("/decode") >= 0
  ) {
    return next();
  }
  var token = req.token;
  jwt.verify(token, app.get("secret"), (err, decoded) => {
    if (err) {
      res.send({
        success: false,
        message:
          "Failed to authenticate token. Make sure to include the " +
          "token returned from /users call in the authorization header " +
          " as a Bearer token",
      });
      return;
    } else {
      req.username = decoded.username;
      req.orgname = decoded.orgName;
      logger.debug(
        util.format(
          "Decoded from JWT token: username - %s, orgname - %s",
          decoded.username,
          decoded.orgName
        )
      );
      return next();
    }
  });
});

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 5000;

var server = app.listen(port, function () {
  console.log(`Server started on ${port}`);
});
logger.info("****************** SERVER STARTED ************************");
logger.info("***************  http://%s:%s  ******************", host, port);

app.post("/users", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;

  logger.info("End point : /users");
  logger.info("User name : " + username);
  logger.info("Org name  : " + orgName);

  var token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      username: username,
      orgName: orgName,
    },
    app.get("secret")
  );

  let response = await helper.getRegisteredUser(username, orgName, true);
  logger.debug(
    "-- returned from registering the username %s for organization %s",
    username,
    orgName
  );

  if (response && typeof response !== "string") {
    logger.debug(
      "Successfully registered the username %s for organization %s",
      username,
      orgName
    );
    response.token = token;
    res.json(response);
  } else {
    logger.debug(
      "Failed to register the username %s for organization %s with::%s",
      username,
      orgName,
      response
    );
    res.json({ success: false, message: response });
  }
});

app.post("/channels/:channelName/chaincodes/:chaincodeName", async function (
  req,
  res
) {
  try {
    logger.debug(
      "==================== Invoke operation on Chaincode =================="
    );
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var fcn = req.body.fcn;
    var args = req.body.args;
    var transient = req.body.transient;

    console.log(`Transient data is ;${transient}`);
    logger.debug("channelName  : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn  : " + fcn);
    logger.debug("args  : " + args);

    let message = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      req.username,
      req.orgname,
      transient
    );
    console.log(`message result is : ${message.message}`);

    const response_payload = {
      result: message,
      error: null,
      errorData: null,
    };
    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.post("/signup", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;

  logger.info("End point : /signup");
  logger.info("User name : " + username);
  logger.info("Org name  : " + orgName);

  let response = await helper.getRegisteredUser(username, orgName, true);
  logger.debug(
    "-- returned from registering the username %s for organization %s",
    username,
    orgName
  );

  if (response && typeof response !== "string") {
    logger.debug(
      "Successfully registered the username %s for organization %s",
      username,
      orgName
    );
    res.json(response);
  } else {
    logger.debug(
      "Failed to register the username %s for organization %s with::%s",
      username,
      orgName,
      response
    );
    res.json({ success: false, message: response });
  }
});

app.post("/authenticate", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;

  console.log(req.body);
  logger.info("End point : /authenticate");
  logger.info("User name : " + username);

  let response = await helper.getUserDetails(username, orgName, true);
  var result = {};
  if (response.success) {
    const userDetails = response.details;
    const pubkey = userDetails.credentials.certificate;

    var token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName,
      },
      app.get("secret")
    );

    result.username = username;
    result.success = true;
    result.token = token;
  } else {
    result = response;
  }
  res.send(result);
});

app.post("/decode", async function (req, res) {
  var token = req.body.token;
  var decoded = jwt_decode(token);
  res.send(decoded);
});
