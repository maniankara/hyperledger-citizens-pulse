import React from "react";
import EditCommentModal from "./EditCommentModal";
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
  Table,
} from "reactstrap";
// core components

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plans: [],
      username: "", //  decoded from token
      orgName: "", //  decoded from token
      comment: [],
      editCommentModalShow: false,
      passedCommentData: {},
    };
    this.fetchUserVoteForPlan = this.fetchUserVoteForPlan.bind(this);
    this.commentHandler = this.commentHandler.bind(this);
    this.setModalShow = this.setModalShow.bind(this);
    this.handleCommentEdit = this.handleCommentEdit.bind(this);
  }

  setModalShow(val, commentData) {
    this.setState({
      editCommentModalShow: val,
      passedCommentData: commentData,
    });
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
      args: [action, planName, "admin1"],
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
        const choice = parseInt(result.choice);

        var newState = this.state.plans;
        newState[idx].choice = choice;
        newState[idx].comments = result.comments
          ? result.comments.reverse()
          : [];

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
        this.componentDidMount();
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

  handleCommentChange = (e) => {
    let plans = this.state.plans;
    let idx = e.target.dataset.id;

    plans[e.target.dataset.id]["comment"] = e.target.value;
  };

  handleCommentEdit(editedCommentJSON) {
    let planIndex = parseInt(this.state.passedCommentData.planIndex);
    let commentIndex = parseInt(this.state.passedCommentData.commentIndex);
    var allPlans = this.state.plans;

    allPlans[planIndex]["comments"][commentIndex] = editedCommentJSON;

    this.setState({
      plans: allPlans,
    });

    var planName = allPlans[planIndex].planid;
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );

    var payload = {
      index: commentIndex,
      data: editedCommentJSON,
    };

    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      fcn: "EditComment",
      channelName: "mychannel",
      chaincodeName: "planCC",
      transient: "",
      args: [planName, "admin1", payload],
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
      .then((response) => {
        if (response.status == 400) {
          throw new Error("Some error occurred");
        }
        return response.json();
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log("error", error));
  }

  commentHandler = (planName, idx) => (e) => {
    e.preventDefault();

    let comment_rec = this.state.plans[idx]["comment"];
    var comment_body = comment_rec.trim();

    e.target.reset();
    if (!comment_body) {
      return;
    }

    var newState = [...this.state.plans];
    newState[idx].comments.unshift({ comment: comment_body });

    this.setState({
      plans: newState,
    });

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      fcn: "AddComment",
      channelName: "mychannel",
      chaincodeName: "planCC",
      transient: "",
      args: [planName, "admin1", comment_body],
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
      .then((response) => {
        if (response.status == 400) {
          throw new Error("Some error occurred");
        }
        return response.json();
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log("error", error));
  };

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
                      <div className="mt-4">
                        <label>Comments</label>

                        {plan.IsActive ? (
                          <>
                            <form
                              onSubmit={this.commentHandler(plan.planid, idx)}
                            >
                              <input
                                type="text"
                                ref="comment_param"
                                placeholder="Write a comment..."
                                className="form-control"
                                name="comment"
                                data-id={idx}
                                onChange={this.handleCommentChange}
                              ></input>
                            </form>
                            <div>
                              <Table size="sm">
                                <tbody>
                                  {plan.comments &&
                                    plan.comments.map((comment, cidx) => {
                                      var time = comment["createdAt"]
                                        ? new Date(comment["createdAt"])
                                        : new Date();

                                      var curr_time = new Date();

                                      var diff_mins =
                                        (curr_time.getTime() - time.getTime()) /
                                        1000;
                                      diff_mins = parseInt(diff_mins / 60);
                                      var diff_hours = parseInt(diff_mins / 60);
                                      var diff_days = parseInt(diff_hours / 24);

                                      return (
                                        <tr key={`comment-row-${cidx}`}>
                                          <td
                                            colSpan="1"
                                            key={`icontd-${cidx}`}
                                          >
                                            <i
                                              className="nc-icon nc-single-02"
                                              key={`icon-${cidx}`}
                                            ></i>
                                          </td>
                                          <td
                                            className="col-md-7"
                                            key={`comment-${cidx}`}
                                          >
                                            {comment["comment"]}
                                          </td>
                                          <td
                                            className="col-md-1 text-muted"
                                            key={`edit-${cidx}`}
                                          >
                                            {diff_mins < 15 ? (
                                              <small
                                                key={`editbut-${cidx}`}
                                                onClick={() =>
                                                  this.setModalShow(true, {
                                                    commentIndex: cidx,
                                                    planIndex: idx,
                                                    body: comment["comment"],
                                                    createdAt:
                                                      comment["createdAt"],
                                                  })
                                                }
                                              >
                                                Edit
                                              </small>
                                            ) : (
                                              <small></small>
                                            )}
                                          </td>
                                          <td
                                            className="col-md-1 text-muted"
                                            key={`time-${idx}`}
                                          >
                                            <div title={time}>
                                              {diff_mins < 60 ? (
                                                <small>{diff_mins}m</small>
                                              ) : diff_hours < 24 ? (
                                                <small>{diff_hours}h</small>
                                              ) : (
                                                <small>{diff_days}d</small>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </Table>
                              <EditCommentModal
                                content={this.state.passedCommentData}
                                show={this.state.editCommentModalShow}
                                onSubmit={this.handleCommentEdit}
                                onHide={() => this.setModalShow(false, {})}
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <Table size="sm">
                              <tbody>
                                {plan.FinalComments &&
                                  plan.FinalComments.map((comment, idx) => {
                                    return (
                                      <tr>
                                        <td colSpan="1">
                                          <i className="nc-icon nc-single-02"></i>
                                        </td>
                                        <td className="col-md-11">{comment}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Table>
                          </div>
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
