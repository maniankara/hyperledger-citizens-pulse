const { Gateway, Wallets } = require("fabric-network");
const helper = require("./helper");

var getAllPlans = async function get(
  username,
  org_name,
  channelName,
  chaincodeName,
  startKey,
  endKey
) {
  try {
    // load the network configuration
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

    const result = await contract.evaluateTransaction(
      "GetAllPlans",
      startKey,
      endKey
    );
    // Disconnect from the gateway.
    await gateway.disconnect();
    const temp = result.toString();
    return JSON.parse(temp);
  } catch (error) {
    return error.message;
  }
};

module.exports.getAllPlans = getAllPlans;
