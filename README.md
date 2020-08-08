# hyperledger-citizens-pulse

## Bringing up API and Web Server

- `cd` into the network directory from the ROOT of the Project.
  - Firstly, make sure to perform the cleaning by deleting all the previous running containers and unwanted images.
    ```
    $> ./generate delNet
    ```
  - Bring the Fabric network up, by running:
    ```
    $> ./generate createChannel
    $> ./generate deployCC  #deploys the chaincode
    ```
  - To start the API and Web server, run:
    ```
    $> ./generate api # starts the API server, runs on localhost:5000
    $> ./generate webui # starts the Web server, runs on localhost:3000
    ```
  - Navigate to `http://localhost:3000/` in your browser and get started. Signup `hritik` to `Org1` as a dummy user.

## Headstart for downloading binaries, spinning network and testing API

- Install fabric-binaries by running the following command and `cd` into the network directory
  ```
  $> ./binaries.sh -d -s # if you only have to install the binaries
  $> ./binaries.sh -s # if you have to install the docker images as well as the binaries
  ```
- Delete any previous running containers or network instances
  ```
  $> ./generate.sh delNet
  ```
- Create a network with 2 Orgs having 2 peers each, along with couchdb containers for each peer; deploy the Plan chaincode
  ```
  $> ./generate createChannel
  $> ./generate deployCC
  ```
  The CouchDB GUI showing all the databases and documents can be viewed at `http://localhost:5984/_utils/`. To make sure that the collections have been created, check-out the `mychannel_plan$c$c$$pcollection$plan` and `mychannel_plan$c$c$$pcollection$plan$private$details` documents.
- Start the API Container
  ```
  $> ./generate api
  ```
  This starts the API server at `localhost:5000`.
- Register users by sending requests to API endpoints with JSON data, illustrated using the following cURL commands.

  ```
  $> curl --location --request POST 'localhost:5000/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "username": "anoop",
    "orgName": "Org1"
  }'
  Returns ACCESS_TOKEN_ORG1_USER

  $> curl --location --request POST 'localhost:5000/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "username": "hritik",
    "orgName": "Org2"
  }'
  Returns ACCESS_TOKEN_ORG2_USER

  # This returns a token corresponding to the user. Make note of it, as the token will be used to perform further actions.
  # Org1 signifies Council, whereas Org2 signifies City. The private collection of plan votes is persisted in Org1.
  ```

  - Once the users are registered, the user can perform actions he/she is authorised to, using the token obtained on registration, illustrated using the following cURL commands.

  ```
  # TO CREATE A PLAN: Pass the Org1 User bearer token obtained from the previous step for authorization. Org2 (or City) user is not allowed this operation.

  $> curl --location --request POST 'localhost:5000/channels/mychannel/chaincodes/planCC' \
  --header 'Authorization: Bearer ACCESS_TOKEN_ORG1_USER' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "fcn": "InitPlan",
      "channelName": "mychannel",
      "chaincodeName": "planCC",
      "transient": "{\"planid\":\"plan2\",\"description\":\"this is desc of plan2\",\"deadline\":\"19/07/2020\",\"upvote\":0,\"downvote\":0,\"finalupvote\":0,\"finaldownvote\":0}",
      "args": []
  }'

  # TO UPVOTE/DOWNVOTE: Pass the Org2 User bearer token obtained from the previous step for authorization. Org1 (or Council) user is not allowed this operation.

  $> curl --location --request POST 'localhost:5000/channels/mychannel/chaincodes/planCC' \
  --header 'Authorization: Bearer ACCESS_TOKEN_ORG2_USER' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "fcn": "UpdateVote",
    "channelName": "mychannel",
    "chaincodeName": "planCC",
    "transient": "",
    "args": ["downvote", "plan1", "anoop"]
  }'

  # TO END POLLING FOR A PLAN: Pass the Org1 User bearer token obtained from the previous step for authorization. Org2 (or City) user is not allowed this operation.

  $> curl --location --request POST 'localhost:5000/channels/mychannel/chaincodes/planCC' \
  --header 'Authorization: Bearer ACCESS_TOKEN_ORG1_USER' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "fcn": "StopPolling",
    "channelName": "mychannel",
    "chaincodeName": "planCC",
    "transient": "",
    "args": ["plan1"]
  }'

  # This removes the plan collection from persistence and updates the final up/down votes in the global collection.
  ```
