#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script brings up a Hyperledger Fabric network for testing smart contracts
# and applications. The test network consists of two organizations with one
# peer each, and a single node Raft ordering service. Users can also use this
# script to create a channel deploy a chaincode on the channel
#
# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries
# this may be commented out to resolve installed version of tools if desired
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/cryptogen
export VERBOSE=false
COMPOSE_FILE_BASE=docker/docker-compose-basic.yaml
COMPOSE_FILE_CA=docker/docker-compose-ca.yaml
COMPOSE_FILE_COUCH=docker/docker-compose-couch.yaml
COMPOSE_FILE_API=docker/docker-compose-api.yaml
CHANNEL_NAME="mychannel"
MAX_RETRY=5
CLI_DELAY=3
export VERBOSE=false
CC_SRC_LANGUAGE=golang
VERSION=1

function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

function createOrgs() {
    echo "##########################################################"
    echo "##### Generate certificates using Fabric CA's ############"
    echo "##########################################################"

    IMAGE_TAG=$IMAGE_TAG docker-compose -f $COMPOSE_FILE_CA up -d 2>&1

    . crypto-config/fabric-ca/registerEnroll.sh

    sleep 10

    echo "##########################################################"
    echo "############ Create Org1 Identities ######################"
    echo "##########################################################"

    createOrg1

    echo "##########################################################"
    echo "############ Create Org2 Identities ######################"
    echo "##########################################################"

    createOrg2

    echo "##########################################################"
    echo "############ Create Orderer Org Identities ###############"
    echo "##########################################################"

    createOrderer

  echo
  echo "Generate CCP files for Org1 and Org2"
  ./crypto-config/ccp-generate.sh
}

# Generate orderer system channel genesis block.
function createConsortium() {

  echo "#########  Generating Orderer Genesis block ##############"

  set -x
  configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./artifacts/genesis.block
  res=$?
  set +x
  if [ $res -ne 0 ]; then
    echo "Failed to generate orderer genesis block..."
    exit 1
  fi
}


# Bring up the peer and orderer nodes using docker compose.
function networkUp() {
  set -a
  source .env
  set +a

  createOrgs
  createConsortium
  
  COMPOSE_FILES="-f ${COMPOSE_FILE_BASE}"

  COMPOSE_FILES="${COMPOSE_FILES} -f ${COMPOSE_FILE_COUCH}"
  IMAGE_TAG=$IMAGE_TAG docker-compose ${COMPOSE_FILES} up -d 2>&1

  docker ps -a
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start network"
    exit 1
  fi
}

## call the script to join create the channel and join the peers of org1 and org2
function createChannel() {
## Bring up the network if it is not arleady up.
  if [ ! -d "crypto-config/peerOrganizations" ]; then
    echo "Bringing up network"
    networkUp
  fi

  echo $COMPOSE_PROJECT_NAME

 scripts/createChannel.sh $CHANNEL_NAME $CLI_DELAY $MAX_RETRY $VERBOSE
  if [ $? -ne 0 ]; then
    echo "Error !!! Create channel failed"
    exit 1
  fi

}

function delNet(){
    rm *.tar.gz
    sudo rm -rf ./crypto-config/fabric-ca/or*
    rm sdk/wallet/*
    docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
    removeUnwantedImages
    docker network prune -f
    docker volume prune -f
    rm -fr artifacts/*
    rm -fr crypto-config/ordererOrganizations
    rm -fr crypto-config/peerOrganizations
}

function deployCC(){
  scripts/deployCC-plan.sh $CHANNEL_NAME $CC_SRC_LANGUAGE $VERSION $CLI_DELAY $MAX_RETRY $VERBOSE
}

function api(){
  IMAGE_TAG=$IMAGE_TAG docker-compose -f $COMPOSE_FILE_API up -d 2>&1
}

function createUsers(){
  cd sdk/
  node enrollAdmin1.js
  sleep 2
  node enrollAdmin2.js
  sleep 2
  node registerUser.js
  sleep 2
  node registerCouncil.js
}


"$@"

# ./generate.sh delNet; ./generate.sh createChannel; ./generate.sh deployCC; ./generate.sh createUsers
