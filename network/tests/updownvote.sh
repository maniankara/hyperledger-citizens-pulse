#!/bin/bash

CURL='/usr/bin/curl'
ORG1_USER_TOKEN='token_org1.txt'
ORG2_USER_TOKEN='token_org2.txt'

ACCESS_TOKEN_ORG2_USER=$(head -n 1 $ORG2_USER_TOKEN)

function upvote(){
    echo "##########################################################"
    echo "########## Upvoting a plan via ORG 2 user ################"
    echo "##########################################################"

    curl --location --request POST 'http://localhost:5000/channels/mychannel/chaincodes/planCC' \
    --header "Authorization: Bearer $ACCESS_TOKEN_ORG2_USER" \
    --header 'Content-Type: application/json' \
    --data-raw '{
            "fcn": "UpdateVote",
            "channelName": "mychannel",
            "chaincodeName": "planCC",
            "transient": "",
            "args": ["upvote", "plan-test", "hritik"]
        }'

    echo
}

function downvote(){
    echo "##########################################################"
    echo "########## Downvoting a plan via ORG 2 user ##############"
    echo "##########################################################"

    curl --location --request POST 'http://localhost:5000/channels/mychannel/chaincodes/planCC' \
    --header "Authorization: Bearer $ACCESS_TOKEN_ORG2_USER" \
    --header 'Content-Type: application/json' \
    --data-raw '{
            "fcn": "UpdateVote",
            "channelName": "mychannel",
            "chaincodeName": "planCC",
            "transient": "",
            "args": ["downvote", "plan-test", "hritik"]
        }'
    echo
}

upvote
downvote
