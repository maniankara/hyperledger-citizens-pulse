import React, { Component } from "react";
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import routes from "routes.js";
import { Button } from "react-bootstrap";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Table,
  CardSubtitle,
} from "reactstrap";
import { Line, Pie } from "react-chartjs-2";
import PlotStats from "./PlotStats";

import {
  dashboard24HoursPerformanceChart,
  dashboardEmailStatisticsChart,
  dashboardNASDAQChart,
} from "variables/charts.js";

const queryString = require("query-string");

export class PlanInsights extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetched_details: {},
    };
    const parsed = queryString.parse(this.props.location.search);
    const user_data = this.props.location.state;
    this.plan_details = {
      planid: parsed.planid,
      orgName: user_data.orgName,
      username: user_data.username,
    };
    this.downloadInsights = this.downloadInsights.bind(this);
  }

  downloadInsights() {
    const planid = this.plan_details.planid;
    var myHeaders = new Headers();

    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `http://localhost:5000/download-insights/user/${this.plan_details.username}/org/${this.plan_details.orgName}/plan/${planid}/`,
      requestOptions
    )
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => {
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      })
      .catch((error) => console.log("error", error));
  }

  componentDidMount() {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `http://localhost:5000/getGlobalState/user/${this.plan_details.username}/org/${this.plan_details.orgName}/plan/${this.plan_details.planid}/`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          fetched_details: result,
        });
      })
      .catch((error) => console.log("error", error));
  }

  render() {
    return (
      <div className="wrapper">
        <Sidebar
          {...this.props}
          routes={routes}
          bgColor="black"
          activeColor="info"
        />
        <div className="main-panel" ref={this.mainPanel}>
          <DemoNavbar {...this.props} name="Plan Insights" />

          <div className="content">
            <Row>
              <Col md="12">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5">{this.plan_details.planid}</CardTitle>
                    <CardSubtitle>
                      <Row>
                        <Col md="10" align="justify">
                          {this.state.fetched_details.description} conetnt large
                          rextra conetnt large rextra conetnt large rextra
                          conetnt large rextra conetnt large rextra conetnt
                          large rextra conetnt large rextra conetnt large rextra
                          conetnt large rextra conetnt large rextra conetnt
                          large rextra
                        </Col>
                        <Col md="2">
                          <Button
                            // disabled={this.state.orgName == "Org2"}
                            className="btn btn-outline-warning mr-2"
                            size="sm"
                            // key={footerid + "14"}
                            // id={plan.planid}
                            onClick={this.downloadInsights}
                            style={{ float: "right" }}
                          >
                            Download Report
                            <i className="ml-2 fas fa-download" />
                          </Button>
                        </Col>
                      </Row>
                    </CardSubtitle>
                  </CardHeader>
                  <CardBody></CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5">Poll Statistics</CardTitle>
                    <p className="card-category">Citizens' Pulse on Pie</p>
                  </CardHeader>
                  <CardBody>
                    <PlotStats
                      upvotes={this.state.fetched_details.finalupvote}
                      downvotes={this.state.fetched_details.finaldownvote}
                    />
                  </CardBody>
                  <CardFooter>
                    <div className="legend">
                      <i className="fa fa-circle text-primary" /> Upvoted{" "}
                      {/* <i className="fa fa-circle text-warning" /> Read{" "} */}
                      <i className="fa fa-circle text-danger" /> Downvoted{" "}
                      <i className="fa fa-circle text-gray" /> No Votes Received
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-check" /> Data information certified
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col md="8">
                <Card className="card-chart">
                  <CardHeader>
                    <CardTitle tag="h5">Poll Data</CardTitle>
                    <p className="card-category">Citizens' Voices</p>
                  </CardHeader>
                  <CardBody>
                    {/* <Line
                      data={dashboardNASDAQChart.data}
                      options={dashboardNASDAQChart.options}
                      width={400}
                      height={100}
                    /> */}
                    {/* {(this.state.fetched_details.FinalComments &&
                        this.state.fetched_details.FinalComments.length == 0 )? return (
                            <span>No Comments Received</span>
                        ): return(<span></span> );
                    } */}

                    {this.state.fetched_details.FinalComments &&
                    this.state.fetched_details.FinalComments.length == 0 ? (
                      <span>No Comments Received</span>
                    ) : (
                      <ul>
                        {this.state.fetched_details.FinalComments &&
                          this.state.fetched_details.FinalComments.map(
                            (comment, idx) => {
                              return <li key={idx}>{comment}</li>;
                            }
                          )}
                      </ul>
                    )}
                  </CardBody>
                  <CardFooter>
                    {/* <div className="chart-legend">
                      <i className="fa fa-circle text-info" /> Tesla Model S{" "}
                      <i className="fa fa-circle text-warning" /> BMW 5 Series
                    </div>
                    <hr /> */}
                    <div className="card-stats">
                      <i className="fa fa-calendar" /> Polling ended on{" "}
                      {this.state.fetched_details.deadline}
                      {/* <i className="fa fa-check" /> Data information certified */}
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </div>
          <Footer fluid />
        </div>
      </div>
    );
  }
}

export default PlanInsights;
