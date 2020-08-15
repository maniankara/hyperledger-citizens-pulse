#!/bin/bash

CURL='/usr/bin/curl'

function org1(){
    echo "##########################################################"
    echo "############ Registering user to ORG 1 ###################"
    echo "##########################################################"

    $CURL --location --request POST 'http://localhost:5000/signup' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "username": "hritik",
    "orgName": "Org1"
    }'
    echo
}

function org2(){
    echo "##########################################################"
    echo "############ Registering user to ORG 2 ###################"
    echo "##########################################################"

    $CURL --location --request POST 'http://localhost:5000/signup' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "username": "user",
    "orgName": "Org2"
    }'
    echo
}

org1
org2