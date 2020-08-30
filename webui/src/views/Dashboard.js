import React from "react";
// react plugin used to create charts
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Button,
} from "reactstrap";
// core components

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plans: [],
      username: "", //  decoded from token
      orgName: "", //  decoded from token
    };
    this.fetchUserVoteForPlan = this.fetchUserVoteForPlan.bind(this);
  }

  handleClick = (e) => {
    e.preventDefault();
    const planName = e.target.id;
    const action = e.target.value;

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      fcn: "UpdateVote",
      channelName: "mychannel",
      chaincodeName: "planCC",
      transient: "",
      args: [action, planName, "hritik"],
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "http://localhost:5000/channels/mychannel/chaincodes/planCC",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log("error", error));
    this.componentDidMount();
  };

  fetchUserVoteForPlan(planName, orgName, username, idx) {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `http://localhost:5000/user_vote/${username}/${orgName}/${planName}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        const choice = result.choice;

        var newState = [...this.state.plans];
        newState[idx].choice = choice;

        this.setState({
          plans: newState,
        });
      })
      .catch((error) => console.log("error", error));
  }

  handleClosePoll = (e) => {
    var myHeaders = new Headers();

    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    const planid = e.target.id;
    fetch(
      `http://localhost:5000/close-voting/user/${this.state.username}/org/${this.state.orgName}/plan/${planid}/`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log("error", error));
  };

  // Sets user details in state
  // Fetches all the plans
  componentDidMount() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      token: localStorage.getItem("user_token"),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:5000/decode", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          username: result.username,
          orgName: result.orgName,
        });
      })
      .catch((error) => console.log("error", error));

    // =========================================================

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      fcn: "GetAllPlans",
      channelName: "mychannel",
      chaincodeName: "planCC",
      transient: "",
      args: ["", ""],
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "http://localhost:5000/channels/mychannel/chaincodes/planCC",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          plans: result.result.message,
        });

        let self = this;
        var currState = [...this.state.plans];
        currState.forEach(function (plan, idx) {
          self.fetchUserVoteForPlan(
            plan.planid,
            self.state.orgName,
            self.state.username,
            idx
          );
        });
      })
      .catch((error) => console.log("error", error));
  }

  render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              {this.state.plans.map((plan, idx) => {
                let headerid = `plan-${idx}-head`,
                  bodyid = `plan-${idx}-body`,
                  footerid = `plan-${idx}-foot`;
                return (
                  <Card key={headerid + "0"}>
                    <CardHeader key={headerid}>
                      <CardTitle tag="h5" key={headerid}>
                        {plan.planid}
                      </CardTitle>
                      <p className="card-category" key={headerid + "0"}>
                        Ends on {plan.deadline}
                      </p>
                    </CardHeader>
                    <CardBody key={bodyid}>
                      <p key={bodyid + "0"}>{plan.description}</p>
                    </CardBody>
                    <CardFooter key={footerid}>
                      <div className="legend" key={footerid + "0"}>
                        <i
                          className={`${
                            plan.IsActive ? "text-success" : "text-danger"
                          } fa fa-circle mr-1`}
                          key={footerid + "00"}
                        />
                        {plan.IsActive ? "Active" : "Polling ended"}
                      </div>
                      <hr />
                      <div className="stats" key={footerid + "1"}>
                        {plan.IsActive ? (
                          <div>
                            <Button
                              disabled={this.state.orgName == "Org1"}
                              className="btn btn-outline-success mr-2"
                              key={footerid + "10"}
                              id={plan.planid}
                              onClick={this.handleClick}
                              value="upvote"
                              active={this.state.plans[idx].choice == 1}
                            >
                              Upvote
                            </Button>
                            <Button
                              disabled={this.state.orgName == "Org1"}
                              className="btn btn-outline-danger"
                              key={footerid + "11"}
                              id={plan.planid}
                              onClick={this.handleClick}
                              value="downvote"
                              active={this.state.plans[idx].choice == -1}
                            >
                              Downvote
                            </Button>

                            <Button
                              disabled={this.state.orgName == "Org2"}
                              className="btn btn-outline-info"
                              key={footerid + "12"}
                              id={plan.planid}
                              onClick={this.handleClosePoll}
                              value="downvote"
                              style={{ float: "right" }}
                            >
                              Close Voting
                            </Button>
                          </div>
                        ) : (
                          <Row>
                            <Col md="2">
                              <i
                                className="fas fa-arrow-up"
                                style={{
                                  color:
                                    this.state.plans[idx].choice == 1
                                      ? "green"
                                      : "",
                                }}
                              ></i>
                              {plan.finalupvote}
                            </Col>
                            <Col md="2">
                              <i
                                className="fas fa-arrow-down"
                                style={{
                                  color:
                                    this.state.plans[idx].choice == -1
                                      ? "red"
                                      : "",
                                }}
                              ></i>
                              {plan.finaldownvote}
                            </Col>
                          </Row>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Dashboard;
