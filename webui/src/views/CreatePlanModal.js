// content

import React from "react";
import Modal from "react-bootstrap/Modal";
import NotificationAlert from "react-notification-alert";
import { Button } from "reactstrap";
import { API_BASE_URL } from "../constant";

import { Component } from "react";

var options = {};
options = {
  place: "tc",
  message: "You have created a plan successfully!",
  type: "success",
  icon: "now-ui-icons ui-1_bell-53",
  autoDismiss: 7,
};

export class CreatePlanModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      planid: "",
      description: "",
      deadline: "",
      upvote: 0,
      downvote: 0,
      finalupvote: 0,
      finaldownvote: 0,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  notifier() {
    this.refs.notify.notificationAlert(options);
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // API call to create a new plan
  handleSubmit = (e) => {
    e.preventDefault();

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("user_token")}`
    );
    myHeaders.append("Content-Type", "application/json");
    const data = JSON.stringify(this.state);

    var raw = JSON.stringify({
      fcn: "InitPlan",
      channelName: "mychannel",
      chaincodeName: "planCC",
      transient: data,
      args: [],
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${API_BASE_URL}/channels/mychannel/chaincodes/planCC`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        window.location.reload();
        console.log(result);
      })
      .catch((error) => console.log("error", error));
  };

  render() {
    let { planid, description, deadline } = this.state;
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Create a new poll
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit} id="FORMID">
            <div className="form-group">
              <label htmlFor="name">Poll ID</label>
              <input
                required
                type="text"
                name="planid"
                value={planid}
                className="form-control"
                placeholder="Enter Poll ID"
                onChange={(event) => this.handleChange(event)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                required
                type="textbox"
                name="description"
                value={description}
                className="form-control"
                placeholder="Enter poll description"
                onChange={(event) => this.handleChange(event)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Deadline</label>
              <input
                required
                type="date"
                name="deadline"
                value={deadline}
                min={new Date().toISOString().split("T")[0]}
                className="form-control"
                placeholder="Set a deadline for this poll"
                onChange={(event) => this.handleChange(event)}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <NotificationAlert ref="notify" />
          <Button form="FORMID" type="submit">
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreatePlanModal;
