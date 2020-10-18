const getPlans = require("./getAllPlans");
const pollComplete = require("./pollComplete");

var closeExpired = async function closeExpired() {
  let council_admin = "hritik";

  try {
    console.log("cron hit!");
    var plans = await getPlans
      .getAllPlans(council_admin, "Org1", "mychannel", "planCC", "", "")
      .then((plans) => {
        plans.forEach(async function (plan, idx) {
          if (plan["IsActive"]) {
            var today = new Date();
            var deadline = plan["deadline"];
            var planDeadline = new Date(deadline);

            console.log(today, planDeadline);
            if (today >= planDeadline) {
              console.log("Closing ", plan["planid"]);
              var temp = await pollComplete
                .pollComplete(
                  council_admin,
                  "Org1",
                  plan["planid"],
                  "mychannel",
                  "planCC"
                )
                .then((res) => {
                  console.log(res);
                });
            }
          }
        });
      });
  } catch (error) {
    return error.message;
  }
};

module.exports.closeExpired = closeExpired;
