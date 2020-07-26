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
      username: "",
      orgName: "",
    };
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
      args: ["plan1", "plan99999"],
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
                          className="fa fa-circle text-success mr-1"
                          key={footerid + "00"}
                        />
                        Active
                      </div>
                      <hr />
                      <div className="stats" key={footerid + "1"}>
                        <Button
                          disabled={this.state.orgName == "Org1"}
                          className="btn btn-outline-success mr-2"
                          key={footerid + "10"}
                          id={plan.planid}
                          onClick={this.handleClick}
                          value="upvote"
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
                    </CardFooter>
                  </Card>
                );
              })}
            </Col>
          </Row>
          {/* <Row>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-globe text-warning" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Capacity</p>
                        <CardTitle tag="p">150GB</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-sync-alt" /> Update Now
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-money-coins text-success" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Revenue</p>
                        <CardTitle tag="p">$ 1,345</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="far fa-calendar" /> Last day
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-vector text-danger" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Errors</p>
                        <CardTitle tag="p">23</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="far fa-clock" /> In the last hour
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-favourite-28 text-primary" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Followers</p>
                        <CardTitle tag="p">+45K</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-sync-alt" /> Update now
                  </div>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Users Behavior</CardTitle>
                  <p className="card-category">24 Hours performance</p>
                </CardHeader>
                <CardBody></CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fa fa-history" /> Updated 3 minutes ago
                  </div>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Email Statistics</CardTitle>
                  <p className="card-category">Last Campaign Performance</p>
                </CardHeader>
                <CardBody></CardBody>
                <CardFooter>
                  <div className="legend">
                    <i className="fa fa-circle text-primary" /> Opened{" "}
                    <i className="fa fa-circle text-warning" /> Read{" "}
                    <i className="fa fa-circle text-danger" /> Deleted{" "}
                    <i className="fa fa-circle text-gray" /> Unopened
                  </div>
                  <hr />
                  <div className="stats">
                    <i className="fa fa-calendar" /> Number of emails sent
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col md="8">
              <Card className="card-chart">
                <CardHeader>
                  <CardTitle tag="h5">NASDAQ: AAPL</CardTitle>
                  <p className="card-category">Line Chart with Points</p>
                </CardHeader>
                <CardBody></CardBody>
                <CardFooter>
                  <div className="chart-legend">
                    <i className="fa fa-circle text-info" /> Tesla Model S{" "}
                    <i className="fa fa-circle text-warning" /> BMW 5 Series
                  </div>
                  <hr />
                  <div className="card-stats">
                    <i className="fa fa-check" /> Data information certified
                  </div>
                </CardFooter>
              </Card> 
            </Col>
          </Row>*/}
        </div>
      </>
    );
  }
}

export default Dashboard;
