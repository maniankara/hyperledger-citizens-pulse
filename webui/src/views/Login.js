import React, { useState } from "react";
// import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
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
import "bootstrap/dist/css/bootstrap.css";

import { Link, Redirect } from "react-router-dom";
import { useAuth } from "../components/context/auth";

export default function Login() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthTokens } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      username: username,
      password: password,
    };
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(payload);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:5000/authenticate", requestOptions)
      .then((response) => {
        if (response.status == 400) {
          throw new Error("Incorrect username or password");
        }
        return response.json();
      })
      .then((result) => {
        setAuthTokens(result.token);
        setLoggedIn(true);
      })
      .catch((error) => {
        setIsError(true);
      });
  }

  if (isLoggedIn) {
    return <Redirect to="/admin/dashboard" />;
  }

  return (
    <>
      <Container className="mt-5">
        <Row className="align-items-center">
          <Col md="1"></Col>
          <Col md="10">
            <Card className="card-stats">
              <CardBody>
                <form onSubmit={handleSubmit} id="login">
                  <img
                    src="https://cdn4.iconfinder.com/data/icons/election-world-color/64/office-government-capitol-political-residence-512.png"
                    className="rounded mx-auto d-block"
                    alt="..."
                    style={{ maxWidth: "15%" }}
                  />
                  <p className="h6 text-center mb-4">Citizen Pulse</p>
                  <hr />

                  <p className="h4 text-center mb-4">Login</p>
                  <label
                    htmlFor="defaultFormRegisterNameEx"
                    className="grey-text"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={username}
                    className="form-control"
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                  />
                  <br />

                  <label
                    htmlFor="defaultFormRegisterPasswordEx"
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />

                  {/* <label
                    htmlFor="defaultFormRegisterPasswordEx"
                    className="grey-text"
                  >
                    Organisation MSP
                  </label>
                  <select
                    onChange={(e) => {
                      setOrgName(e.target.value);
                    }}
                    className="browser-default custom-select"
                    name="orgName"
                    value={orgName}
                  >
                    <option value="Org1">Org1</option>
                    <option value="Org2">Org2</option>
                  </select> */}
                </form>
                <br></br>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="text-center mt-4">
                  <Button color="unique" type="submit" form="login">
                    Login
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    Sign Up
                  </Link>
                  {isError && (
                    <div>The username or password provided were incorrect!</div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col md="1"></Col>
        </Row>
      </Container>
    </>
    // <MDBContainer className="mt-5">
    //   <MDBRow>
    //     <MDBCol md="12">
    //       <form>
    //         <img
    //           src="https://cdn4.iconfinder.com/data/icons/election-world-color/64/office-government-capitol-political-residence-512.png"
    //           className="rounded mx-auto d-block"
    //           alt="..."
    //           style={{ maxWidth: "15%" }}
    //         />
    //         <p className="h6 text-center mb-4">Citizen Pulse</p>
    //         <p className="h4 text-center mb-4">Login</p>
    //         <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
    //           Username
    //         </label>
    //         <input
    //           type="text"
    //           placeholder="Enter username"
    //           name="username"
    //           value={username}
    //           className="form-control"
    //           onChange={(e) => {
    //             setUserName(e.target.value);
    //           }}
    //         />
    //         <br />
    //         <label
    //           htmlFor="defaultFormRegisterPasswordEx"
    //           className="grey-text"
    //         >
    //           Organisation MSP
    //         </label>
    //         <select
    //           onChange={(e) => {
    //             setOrgName(e.target.value);
    //           }}
    //           className="browser-default custom-select"
    //           name="orgName"
    //           value={orgName}
    //         >
    //           <option value="Org1">Org1</option>
    //           <option value="Org2">Org2</option>
    //         </select>

    //         <div className="text-center mt-4">
    //           <MDBBtn color="unique" type="submit" onClick={handleSubmit}>
    //             Login
    //           </MDBBtn>
    //         </div>
    //         <div className="text-center mt-2">
    //           <Link to="/signup">Sign Up</Link>
    //           {isError && (
    //             <div>The username or password provided were incorrect!</div>
    //           )}
    //         </div>
    //       </form>
    //     </MDBCol>
    //   </MDBRow>
    // </MDBContainer>
  );
}
