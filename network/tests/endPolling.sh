#!/bin/bash

CURL='/usr/bin/curl'
ORG1_USER_TOKEN='token_org1.txt'
ORG2_USER_TOKEN='token_org2.txt'

ACCESS_TOKEN_ORG1_USER=$(head -n 1 $ORG1_USER_TOKEN)

function endPolling(){
    echo "##########################################################"
    echo "########## Ending Polling for Test Plan  #################"
    echo "##########################################################"

    curl --location --request POST 'http://localhost:5000/close-voting/user/hritik/org/Org1/plan/plan-test/' \
    --header "Authorization: Bearer $ACCESS_TOKEN_ORG1_USER" 

    echo
}

endPolling