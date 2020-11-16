import React, { Component } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Button,
  Container,
} from "reactstrap";
import NotificationAlert from "react-notification-alert";
import Login from "./Login";
import { API_BASE_URL } from "../constant";
import { BrowserRouter, Route, Switch, Link, Redirect } from "react-router-dom";

var options = {};
options = {
  place: "tc",
  message: "",
  type: "success",
  icon: "now-ui-icons ui-1_bell-53",
  autoDismiss: 7,
  type: "",
};

export class Signup extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      email: "",
      orgName: "Org1",
      redirect: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  notifier(message, type) {
    options.message = message;
    options.type = type;
    this.refs.notify.notificationAlert(options);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(this.state);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${API_BASE_URL}/signup`, requestOptions)
      .then((response) => {
        if (response.status != 200) {
          throw new Error("Oops, some error occurred");
        }
      })
      .then((result) => {
        this.notifier("Registered user successfully!", "success");
        setTimeout(() => this.setState({ redirect: true }), 3000);
      })
      .catch((error) => {
        this.notifier(error.message, "danger");
        console.log("error", error);
      });
  };

  render() {
    let { username, password, email, orgName } = this.state;

    if (this.state.redirect) {
      return <Redirect to="/signin" />;
    }
    return (
      <>
        <Container className="mt-5">
          <Row className="align-items-center">
            <Col md="1"></Col>
            <Col md="10">
              <Card className="card-stats">
                <CardBody>
                  <form onSubmit={this.handleSubmit} id="formid">
                    <img
                      src="https://cdn4.iconfinder.com/data/icons/election-world-color/64/office-government-capitol-political-residence-512.png"
                      className="rounded mx-auto d-block"
                      alt="..."
                      style={{ maxWidth: "15%" }}
                    />
                    <p className="h6 text-center mb-4">Citizen Pulse</p>
                    <hr />

                    <p className="h4 text-center mb-4">Sign Up</p>
                    <label
                      htmlFor="defaultFormRegisterNameEx"
                      className="grey-text"
                    >
                      Username
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={username}
                      className="form-control"
                      onChange={(event) => this.handleChange(event)}
                    />
                    <label
                      htmlFor="defaultFormRegisterNameEx"
                      className="grey-text"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      name="password"
                      value={password}
                      className="form-control"
                      onChange={(event) => this.handleChange(event)}
                      // onChange={(e) => {
                      //   setUserName(e.target.value);
                      // }}
                    />
                    <label
                      htmlFor="defaultFormRegisterNameEx"
                      className="grey-text"
                    >
                      E-Mail
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      name="email"
                      value={email}
                      className="form-control"
                      onChange={(event) => this.handleChange(event)}
                      // onChange={(e) => {
                      //   setUserName(e.target.value);
                      // }}
                    />

                    <label
                      htmlFor="defaultFormRegisterPasswordEx"
                      className="grey-text"
                    >
                      Organisation MSP
                    </label>
                    <select
                      onChange={(event) => this.handleChange(event)}
                      className="browser-default custom-select"
                      name="orgName"
                      value={orgName}
                    >
                      <option value="Org1">Org1</option>
                      <option value="Org2">Org2</option>
                    </select>
                  </form>
                  <br></br>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="text-center mt-4">
                    <Button type="submit" form="formid">
                      Register
                    </Button>
                    <NotificationAlert ref="notify" />
                  </div>
                  <div className="text-center mt-3">
                    Already signed up ? <Link to="/signin">Sign In</Link>
                  </div>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default Signup;
