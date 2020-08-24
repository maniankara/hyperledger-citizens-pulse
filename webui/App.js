import React, { useState } from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import EditEvent from "./views/EditEventModal";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.2.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";

import AdminLayout from "layouts/Admin.js";
import Signup from "./views/Signup";
import Login from "./views/Login";

import PrivateRoute from "./components/FixedPlugin/PrivateRoute";
import { AuthContext } from "./components/context/auth";

const hist = createBrowserHistory();

function App(props) {
  const existingTokens = localStorage.getItem("user_token");
  const [authTokens, setAuthTokens] = useState(existingTokens);

  const setTokens = (token) => {
    localStorage.setItem("user_token", token);
    setAuthTokens(token);
  };

  return (
    // <AuthContext.Provider value={true}>
    //   <Router>
    //     <Route exact path="/" component={Login} />
    //     <PrivateRoute
    //       path="/admin"
    //       render={(props) => <AdminLayout {...props} />}
    //     />
    //     <Route exact path="/signup" component={Signup} />
    //     <Route exact path="/signin" component={Login} />
    //   </Router>
    // </AuthContext.Provider>

    <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
      <Router history={hist}>
        <Switch>
          <Route exact path="/" component={Login}></Route>
          <Route path="/signin" component={Login}></Route>
          <Route path="/signup" component={Signup}></Route>
          <PrivateRoute path="/edit-event" component={EditEvent} />
          <PrivateRoute
            path="/admin"
            component={AdminLayout}
            render={(props) => <AdminLayout {...props} />}
          />
        </Switch>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
