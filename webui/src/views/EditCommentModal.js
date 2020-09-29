import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "reactstrap";

export class EditCommentModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: "",
      createdAt: "",
    };
  }

  onCommentChange = (e) => {
    let fetched_editedComment = e.target.value;
    let editedComment = fetched_editedComment.trim();

    this.setState({
      comment: editedComment,
      createdAt: Date.now(),
    });
  };

  onEditSubmit = (e) => {
    if (this.state.comment.length == "") {
      alert("Comment empty, please put some content!");
      return;
    }

    this.props.onSubmit(this.state);
    this.props.onHide();
  };

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable={true}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit Comment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <label className="text-muted">Change Comment</label>
            <textarea
              required
              defaultValue={this.props.content.body}
              className="form-control"
              onChange={this.onCommentChange}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onEditSubmit}>Edit</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditCommentModal;
