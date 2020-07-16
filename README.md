# hyperledger-citizens-pulse

- Install fabric-binaries by running the following command and `cd` into the network directory
  ```
  $> ./binaries.sh
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
  This starts the API server at `localhost:3000`.
- Register users by sending requests to API endpoints with JSON data, illustrated using the following cURL commands.

  ```
  $> curl --location --request POST 'localhost:3000/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "username": "anoop",
    "orgName": "Org1"
  }'
  Returns ACCESS_TOKEN_ORG1_USER

  $> curl --location --request POST 'localhost:3000/users' \
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

  $> curl --location --request POST 'localhost:3000/channels/mychannel/chaincodes/planCC' \
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

  $> curl --location --request POST 'localhost:3000/channels/mychannel/chaincodes/planCC' \
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

  $> curl --location --request POST 'localhost:3000/channels/mychannel/chaincodes/planCC' \
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
