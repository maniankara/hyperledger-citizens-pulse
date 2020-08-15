#!/bin/bash

CURL='/usr/bin/curl'
ORG1_USER_TOKEN='token_org1.txt'
ACCESS_TOKEN_ORG1_USER=$(head -n 1 $ORG1_USER_TOKEN)

function createPlan(){
    echo "##########################################################"
    echo "########## Create new plan via ORG 1 user ################"
    echo "##########################################################"

    $CURL --location --request POST 'http://localhost:5000/channels/mychannel/chaincodes/planCC' \
    --header "Authorization: Bearer $ACCESS_TOKEN_ORG1_USER" \
    --header 'Content-Type: application/json' \
    --data-raw '{
            "fcn": "InitPlan",
            "channelName": "mychannel",
            "chaincodeName": "planCC",
            "transient": "{\"planid\":\"plan-test\",\"description\":\"Test Plan Description\",\"deadline\":\"01/01/2000\",\"upvote\":0,\"downvote\":0,\"finalupvote\":0,\"finaldownvote\":0}",
            "args": []
        }'
    echo
}

createPlan