# Hyperledger Citizens Pulse

A fully distributed platform for state/city councils to propose plans and garner voices of the public, built with Hyperledger Fabric.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. The following commands assume the operating system to be a Linux based distribution.

### Prerequisites

Following are a few dependencies that need to be installed:

- Git
- Docker, Docker Compose
- Go release, version 1.13 or greater
- Node: any 12.x version starting with v12.0.0 or greater

### Installing

1. Clone the repository
   ```
   git clone https://github.com/maniankara/hyperledger-citizens-pulse.git
   ```
2. Install fabric-binaries by running the following command.
   ```
   ./binaries.sh -d -s # if you only want to install the binaries
   ./binaries.sh -s # if you want to install the docker images as well as binaries
   ```
3. `cd` into the `network` directory. Delete any previous running containers, images or network instances
   ```
   ./generate.sh delNet
   ```
4. Bring up the project i.e. the Hyperledger Fabric network, the API and Web Server. The network entails creation of channel having two Orgs, deployment of chaincode on all peers of both the organisations. The API server is to interacts with the network once up, while the Web server delivers pages to client-side thus enabling the user to send requests.
   ```
   ./generate.sh projectUp
   ```
   In case of a failure, try bringing up the containers individually, as follows:
   ```
   ./generate.sh createChannel
   ./generate.sh deployCC       # deploys the chaincode
   ./generate.sh api            # starts the API server, runs on localhost:5000
   ./generate.sh webui          # starts the Web server, runs on localhost:3000
   ```
   The CouchDB GUI showing all the databases and documents can be viewed at http://localhost:5984/\_utils/. To make sure that the private-collections (meant for plan data persistence) have been created, check-out the `mychannel_plan$c$c\$$pcollection$plan` and `mychannel_plan$c$c\$$pcollection$plan$private$details` documents.
5. Navigate to `http://localhost:3000/` in your browser. Signup `hritik` to `Org1` as a dummy user mandatorily.


## Testing (Manual)
### Web
### Mobile - Testing with Android emulator
* Setup
1. Start the emulator/AVD
2. Add a device which supports API 28 (at the time of writing)
3. Drag and Drop the .apk file on top of the device and accept for installation
* Test login
1. Provide credentials `user/test`

### Mobile - Testing with real device
This is to handle times when you do not have a device to test the mobile part


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details.
