# hyperledger-citizens-pulse

- Setup

  - Spin a Fabric 2.0 Network
    - 1 Org with 1 Peer; 1 Orderer & CA
  - Deploy a helloWorld chaincode that toggles a value

    ```
    cd test-network/
    ./network.sh up -ca
    ./network.sh createChannel
    ./network.sh deployCC -l javascript
    ```

  - Node SDK to toggle value

    ```
    cd ../helloWorld/
    npm install
    node enrollAdmin.js
    node registerUser.js
    node invoke.js OR node query.js
    ```
