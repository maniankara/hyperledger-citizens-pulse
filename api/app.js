"use strict";
const bodyParser = require("body-parser");

const log4js = require("log4js");
const logger = log4js.getLogger("PlanNet");
let cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
var jwt_decode = require("jwt-decode");
const _ = require("lodash");

const jwt = require("jsonwebtoken");
const constants = require("./config/constants.json");

// make connection to mongodb storing user votes
const connectDb = require("./src/connection");
const User = require("./src/user.model");
const UserVote = require("./src/vote.model");

logger.level = "all";

const http = require("http");
const util = require("util");
const express = require("express");
const expressJWT = require("express-jwt");
const bearerToken = require("express-bearer-token");

var helper = require("./actions/helper");
var invoke = require("./actions/invoke");
var fetchUserVote = require("./actions/obtainUserVote");
var adminExists = require("./actions/checkForAdmin");

var pollComplete = require("./actions/pollComplete");
const { json } = require("body-parser");
const { Model } = require("mongoose");
const { result } = require("lodash");
const { db } = require("./src/user.model");
const { makeUserComments } = require("./actions/makeUserComments");

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
    path: [
      "/getMyVotes",
      "/signup",
      "/authenticate",
      "/decode",
      "/listall",
      "/deleteuser",
      "/admin-exists"
    ],
  })
);
app.use(bearerToken());
app.use(cors());

function sha256(data) {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

app.use((req, res, next) => {
  logger.debug("New req for %s", req.originalUrl);
  if (
    req.originalUrl.indexOf("/getMyVotes") >= 0 ||
    req.originalUrl.indexOf("/signup") >= 0 ||
    req.originalUrl.indexOf("/authenticate") >= 0 ||
    req.originalUrl.indexOf("/decode") >= 0 ||
    req.originalUrl.indexOf("/listall") >= 0 ||
    req.originalUrl.indexOf("/deleteuser") >= 0 ||
    req.originalUrl.indexOf("admin-exists") >= 0
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
  connectDb().then(() => {
    console.log("MongoDb connected");
  });
});

logger.info("****************** SERVER STARTED ************************");
logger.info("***************  http://%s:%s  ******************", host, port);

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
  var password = req.body.password;
  var email = req.body.email;

  logger.info("End point : /signup");
  logger.info("User name : " + username);
  logger.info("Org name  : " + orgName);
  logger.info("Email   : " + email);

  const foundUser = await User.findOne({ email: email });

  if (foundUser) {
    res.status(400).send("User with this email already exists!");
    return;
  }

  let response = await helper.getRegisteredUser(
    username,
    orgName,
    password,
    email,
    true
  );
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
    res.status(200).json(response);
  } else {
    logger.debug(
      "Failed to register the username %s for organization %s with::%s",
      username,
      orgName,
      response
    );
    res.status(500).json({ success: false, message: response });
  }
});

app.post("/authenticate", async function (req, res) {
  var user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).send("User does not exists!");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send("Incorrect password.");
  }

  logger.info("End point : /authenticate");
  logger.info("User name : " + user.username);

  var username = user["username"];
  var orgName = user["org"];

  var token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      userid: user["_id"],
      username: username,
      orgName: orgName,
    },
    app.get("secret")
  );
  var result = {};
  result.username = username;
  result.success = true;
  result.token = token;

  res.status(200).send(result);
});

app.post("/decode", async function (req, res) {
  var token = req.body.token;
  var decoded = jwt_decode(token);
  res.send(decoded);
});

app.get("/listall", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/user_vote/:username/:org/:planName", async function (req, res) {
  var username = req.params.username;
  var planName = req.params.planName;
  var orgName = req.params.org;

  var result = {};
  var temp = await fetchUserVote
    .fetchUserVote(username, orgName, planName)
    .then((res) => {
      result = res;
    });

  res.send(result);
});

app.post(
  "/close-voting/user/:username/org/:orgname/plan/:planName/",
  async function (req, res) {
    var username = req.params.username;
    var planName = req.params.planName;
    var orgName = req.params.orgname;

    var result = {};
    var temp = await pollComplete
      .pollComplete(username, orgName, planName, "mychannel", "planCC")
      .then((res) => {
        result = res;
      });

    res.send(result);
  }
);

app.post("/getMyVotes", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;
  var planids = req.body.planids;

  var user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).send("User does not exists!");
  }
  var pubkey = user.cert.credentials.certificate;

  var list = [];

  for (let i = 0; i < planids.length; i++) {
    var planName = planids[i];
    let cert_hash = sha256(pubkey.concat(planName));

    let query = await UserVote.findOne({ hash: cert_hash }).lean();

    if (query !== null) {
      const resp = Object.assign(
        {
          plan: planName,
        },
        query
      );
      list.push(resp);
    }
  }
  res.status(200).send(list);
});

app.delete("/deleteuser", async function (req, res) {
  const deletedItem = await User.findByIdAndDelete(req.body.id).catch((err) =>
    res.status(400).send(err.message)
  );

  res.status(200).send(deletedItem);
});

app.get("/admin-exists", async function(req, res){
  const doesExists = adminExists.checkAdmin("Org1").then((value) => {
    res.send(value);
  });
});