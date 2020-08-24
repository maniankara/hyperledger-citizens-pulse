import React from "react";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Table,
  Badge,
} from "reactstrap";

class Icons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planids: [],
      username: "", //  decoded from token
      orgName: "", //  decoded from token
      myvotes: [],
    };
  }

  async componentDidMount() {
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

    await fetch(
      "http://localhost:5000/channels/mychannel/chaincodes/planCC",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        var ids = [];
        result.result.message.forEach((element, idx) => {
          const id = element.planid;
          this.setState({
            planids: [...this.state.planids, id],
          });
        });
      })
      .catch((error) => console.log("error", error));

    var raw = JSON.stringify({
      token: localStorage.getItem("user_token"),
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    await fetch("http://localhost:5000/decode", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          username: result.username,
          orgName: result.orgName,
        });
      })
      .catch((error) => console.log("error", error));

    var raw = JSON.stringify({
      orgName: this.state.orgName,
      planids: this.state.planids,
      username: this.state.username,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    await fetch("http://localhost:5000/getMyVotes", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          myvotes: result,
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
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">
                    Viewing all the plans you've voted for
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Table>
                    <thead className="text-primary">
                      <tr>
                        <th>PlanId</th>
                        <th>Choice</th>
                        <th>Voted at</th>
                        <th>Updated vote at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state &&
                        this.state.myvotes.map((votedata, idx) => {
                          var created = new Date(
                            votedata.createdAt
                          ).toUTCString();
                          var updated = new Date(
                            votedata.updatedAt
                          ).toUTCString();

                          return (
                            <tr key={`data-${idx}-row`}>
                              <td key={`data-${idx}-name`}>{votedata.plan}</td>
                              <td key={`data-${idx}-ch`}>
                                {votedata.choice === "1" ? (
                                  <Badge color="success">Upvoted</Badge>
                                ) : (
                                  <Badge color="danger">Downvoted</Badge>
                                )}
                              </td>
                              <td key={`data-${idx}-cr`}>{created}</td>
                              <td key={`data-${idx}-up`}>{updated}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Icons;
