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
- Create admins for City and Council, register City users and invoke actions (upvote/downvote/polling-complete)
  ```
  $> cd sdk
  $> node enrollCouncilAdmin.js
  $> node enrollCityAdmin.js
  $> node registerCouncilUser.js
  $> node registerCityUser.js hritik
  $> node invoke.js plan1 hritik upvote
  $> node pollComplete.js plan1
  ```
