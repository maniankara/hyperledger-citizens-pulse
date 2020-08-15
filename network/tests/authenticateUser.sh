#!/bin/bash

CURL='/usr/bin/curl'
ORG1_USER_TOKEN='token_org1.txt'
ORG2_USER_TOKEN='token_org2.txt'

function org1(){
    echo "##########################################################"
    echo "########## Authenticating ORG 1 user login ###############"
    echo "##########################################################"
    
    $CURL -s --location --request POST 'http://localhost:5000/authenticate' \
    --header 'Content-Type: application/json' \
    --data-raw '{
            "username": "hritik",
            "orgName": "Org1"
        }' |  jq -r '.token' >> $ORG1_USER_TOKEN
    echo
}

function org2(){
    echo "##########################################################"
    echo "########## Authenticating ORG 2 user login ###############"
    echo "##########################################################"

    $CURL -s --location --request POST 'http://localhost:5000/authenticate' \
    --header 'Content-Type: application/json' \
    --data-raw '{
            "username": "user",
            "orgName": "Org2"
        }' |  jq -r '.token' >> $ORG2_USER_TOKEN
    echo
}

org1
org2