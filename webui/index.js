// import React from "react";
// import ReactDOM from "react-dom";
// import { createBrowserHistory } from "history";
// import { Router, HashRouter, Route, Switch, Redirect } from "react-router-dom";
// import EditEvent from "./views/EditEventModal";

// import "bootstrap/dist/css/bootstrap.css";
// import "assets/scss/paper-dashboard.scss?v=1.2.0";
// import "assets/demo/demo.css";
// import "perfect-scrollbar/css/perfect-scrollbar.css";

// import AdminLayout from "layouts/Admin.js";
// import Signup from "./views/Signup";
// import Login from "./views/Login";
// import PrivateRoute from "./components/FixedPlugin/PrivateRoute";
// import { AuthContext } from "./components/context/auth";
// import App from "./App";

// const hist = createBrowserHistory();

// ReactDOM.render(
//   <App></App>,
//   // <AuthContext.Provider value={false}>
//   //     <Router>
//   //       <div>
//   //         <ul>
//   //           ...
//   //         </ul>
//   //         <Route exact path="/" component={Home} />
//   //         <PrivateRoute path="/admin" component={Admin} />
//   //       </div>
//   //     </Router>
//   //   </AuthContext.Provider>
//   // <Router history={hist}>
//   //   <Switch>
//   //     {/* <Route path="/edit-event" component={EditEvent} />
//   //     <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
//   //     <Redirect to="/admin/dashboard" /> */}
//   //     <Route path="/signup" component={Signup}></Route>
//   //     <Route path="/signin" component={Login}></Route>
//   //   </Switch>
//   // </Router>,
//   document.getElementById("app")
// );

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App></App>, document.getElementById("root"));
