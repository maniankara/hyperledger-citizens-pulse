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
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

var options = {};
options = {
  place: "tc",
  message: "User registered successfully",
  type: "success",
  icon: "now-ui-icons ui-1_bell-53",
  autoDismiss: 7,
};

export class Signup extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      orgName: "Org1",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  notifier(user) {
    options.message = `${user} registered successfully!`;
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

    fetch("http://localhost:5000/signup", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        this.notifier(this.state.username);
        console.log(result);
      })
      .catch((error) => console.log("error", error));
  };

  render() {
    let { username, orgName } = this.state;
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
                    <br />
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
      //   <MDBContainer className="mt-5">
      //     <MDBRow>
      //       <MDBCol md="12">
      //         <form onSubmit={this.handleSubmit}>
      //           <img
      //             src="https://cdn4.iconfinder.com/data/icons/election-world-color/64/office-government-capitol-political-residence-512.png"
      //             className="rounded mx-auto d-block"
      //             alt="..."
      //             style={{ maxWidth: "15%" }}
      //           />
      //           <p className="h6 text-center mb-4">Citizen Pulse</p>
      //           <p className="h4 text-center mb-4">Sign Up</p>
      //           <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
      //             Username
      //           </label>
      //           <input
      //             type="text"
      //             placeholder="Enter username"
      //             name="username"
      //             value={username}
      //             className="form-control"
      //             onChange={(event) => this.handleChange(event)}
      //           />
      //           <br />
      //           <label
      //             htmlFor="defaultFormRegisterPasswordEx"
      //             className="grey-text"
      //           >
      //             Organisation MSP
      //           </label>
      //           <select
      //             onChange={(event) => this.handleChange(event)}
      //             className="browser-default custom-select"
      //             name="orgName"
      //           >
      //             <option value="Org1">Org1</option>
      //             <option value="Org2">Org2</option>
      //           </select>
      //           {/* <input
      //             type="password"
      //             placeholder="Enter password"
      //             value={password}
      //             name="password"
      //             className="form-control"
      //             onChange={(event) => this.handleChange(event)}
      //           /> */}
      //           <div className="text-center mt-4">
      //             <MDBBtn color="unique" type="submit">
      //               Register
      //             </MDBBtn>
      //             <NotificationAlert ref="notify" />
      //           </div>
      //           <div className="text-center mt-2">
      //             <Link to="/signin">Sign In</Link>
      //           </div>
      //         </form>
      //       </MDBCol>
      //     </MDBRow>
      //   </MDBContainer>
    );
  }
}

export default Signup;
