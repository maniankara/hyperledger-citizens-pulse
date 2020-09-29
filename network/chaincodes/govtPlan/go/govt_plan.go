/*
Copyright IBM Corp. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
package main

import (
	"encoding/json"
	"fmt"
	// "strconv"
	// "strings"
	// "encoding/hex"
	// "crypto/sha256"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type Plan struct {
	ObjectType    string   `json:"docType"` //docType is used to distinguish the various types of objects in state database
	PlanId        string   `json:"planid"`  //the fieldtags are needed to keep case from bouncing around
	Description   string   `json:"description"`
	Deadline      string   `json:"deadline"`
	FinalUpvote   int      `json:"finalupvote"`
	FinalDownvote int      `json:"finaldownvote"`
	IsActive      bool     `json: "isactive"`
	FinalComments []string `json: "finalcomments"`
}

type PlanPrivateDetails struct {
	ObjectType string              `json:"docType"` //docType is used to distinguish the various types of objects in state database
	PlanId     string              `json:"planid"`  //the fieldtags are needed to keep case from bouncing around
	Upvote     int                 `json:"upvote"`
	Downvote   int                 `json:"downvote"`
	UserMap    map[string]int      `json:"usermap"`
	Comments   map[string][]string `json: "comments"`
}

type SmartContract struct {
	contractapi.Contract
}

// inits a govt plan
func (s *SmartContract) InitPlan(ctx contractapi.TransactionContextInterface) error {

	transMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("Error getting transient: " + err.Error())
	}

	// plan properties are private, therefore they get passed in transient field
	transientPlanJSON, ok := transMap["plan"]
	if !ok {
		return fmt.Errorf("plan not found in the transient map")
	}

	type planTransientInput struct {
		PlanId        string              `json:"planid"` //the fieldtags are needed to keep case from bouncing around
		Description   string              `json:"description"`
		Deadline      string              `json:"deadline"`
		Upvote        int                 `json:"upvote"`
		Downvote      int                 `json:"downvote"`
		FinalUpvote   int                 `json:"finalupvote"`
		FinalDownvote int                 `json:"finaldownvote"`
		IsActive      bool                `json:"isactive"`
		UserMap       map[string]int      `json:"usermap"`
		Comments      map[string][]string `json: "comments"`
		FinalComments []string            `json: "finalcomments"`
	}

	var planInput planTransientInput
	err = json.Unmarshal(transientPlanJSON, &planInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %s", err.Error())
	}

	if len(planInput.PlanId) == 0 {
		return fmt.Errorf("planid field must be a non-empty string")
	}
	if len(planInput.Description) == 0 {
		return fmt.Errorf("description field must be a non-empty string")
	}
	if len(planInput.Deadline) == 0 {
		return fmt.Errorf("deadline field must be a non-empty string")
	}
	if planInput.Upvote > 0 || planInput.Upvote < 0 {
		return fmt.Errorf("upvote field must be a zero during init")
	}
	if planInput.Downvote > 0 || planInput.Downvote < 0 {
		return fmt.Errorf("downvote field must be a zero during init")
	}
	if planInput.FinalUpvote > 0 || planInput.FinalUpvote < 0 {
		return fmt.Errorf("final-upvote field must be a zero during init")
	}
	if planInput.FinalDownvote > 0 || planInput.FinalDownvote < 0 {
		return fmt.Errorf("final-downvote field must be a zero during init")
	}

	// ==== Check if plan already exists ====
	planAsBytes, err := ctx.GetStub().GetPrivateData("collectionPlan", planInput.PlanId)
	if err != nil {
		return fmt.Errorf("Failed to get plan: " + err.Error())
	} else if planAsBytes != nil {
		fmt.Println("This plan already exists: " + planInput.PlanId)
		return fmt.Errorf("This plan already exists: " + planInput.PlanId)
	}

	// ==== Create plan object, marshal to JSON, and save to state ====
	final_comments := []string{}

	plan := &Plan{
		ObjectType:    "Plan",
		PlanId:        planInput.PlanId,
		Description:   planInput.Description,
		Deadline:      planInput.Deadline,
		FinalUpvote:   planInput.FinalUpvote,
		FinalDownvote: planInput.FinalDownvote,
		IsActive:      planInput.IsActive,
		FinalComments: final_comments,
	}
	planJSONasBytes, err := json.Marshal(plan)
	if err != nil {
		return fmt.Errorf(err.Error())
	}

	// === Save plan to state ===
	err = ctx.GetStub().PutPrivateData("collectionPlan", planInput.PlanId, planJSONasBytes)
	if err != nil {
		return fmt.Errorf("failed to put Plan: %s", err.Error())
	}

	user_comments := make(map[string][]string)
	user_map := map[string]int{}

	// ==== Create plan private details object with votes, marshal to JSON, and save to state ====
	planPrivateDetails := &PlanPrivateDetails{
		ObjectType: "PlanPrivateDetails",
		PlanId:     planInput.PlanId,
		Upvote:     planInput.Upvote,
		Downvote:   planInput.Downvote,
		UserMap:    user_map,
		Comments:   user_comments,
	}
	planPrivateDetailsAsBytes, err := json.Marshal(planPrivateDetails)
	if err != nil {
		return fmt.Errorf(err.Error())
	}
	err = ctx.GetStub().PutPrivateData("collectionPlanPrivateDetails", planInput.PlanId, planPrivateDetailsAsBytes)
	if err != nil {
		return fmt.Errorf("failed to put Plan private details: %s", err.Error())
	}

	return nil
}

// ===============================================
// readPlan - read a plan from chaincode state
// ===============================================

func (s *SmartContract) ReadPlan(ctx contractapi.TransactionContextInterface, planID string) (*Plan, error) {

	planJSON, err := ctx.GetStub().GetPrivateData("collectionPlan", planID) //get the plan from chaincode state
	if err != nil {
		return nil, fmt.Errorf("failed to read from plan %s", err.Error())
	}
	if planJSON == nil {
		return nil, fmt.Errorf("%s does not exist", planID)
	}

	plan := new(Plan)
	_ = json.Unmarshal(planJSON, plan)

	return plan, nil
}

// ===============================================
// ReadPlanPrivateDetails - read a plan private details from chaincode state
// ===============================================
func (s *SmartContract) ReadPlanPrivateDetails(ctx contractapi.TransactionContextInterface, planID string) (*PlanPrivateDetails, error) {

	planDetailsJSON, err := ctx.GetStub().GetPrivateData("collectionPlanPrivateDetails", planID) //get the plan from chaincode state
	if err != nil {
		return nil, fmt.Errorf("failed to read from plan details %s", err.Error())
	}
	if planDetailsJSON == nil {
		return nil, fmt.Errorf("%s does not exist", planID)
	}

	planDetails := new(PlanPrivateDetails)
	_ = json.Unmarshal(planDetailsJSON, planDetails)

	return planDetails, nil
}

func (s *SmartContract) GetAllPlans(ctx contractapi.TransactionContextInterface, startKey string, endKey string) ([]Plan, error) {

	resultsIterator, err := ctx.GetStub().GetPrivateDataByRange("collectionPlan", startKey, endKey)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []Plan{}

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		newPlan := new(Plan)

		err = json.Unmarshal(response.Value, newPlan)
		if err != nil {
			return nil, err
		}

		results = append(results, *newPlan)
	}

	return results, nil
}

func (s *SmartContract) UpdateVote(ctx contractapi.TransactionContextInterface) error {

	transMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("Error getting transient: " + err.Error())
	}

	transientPlanJSON, ok := transMap["plan"]
	if !ok {
		return fmt.Errorf("plan not found in the transient map")
	}

	type planTransientInput struct {
		PlanId   string              `json:"planid"` //the fieldtags are needed to keep case from bouncing around
		Upvote   int                 `json:"upvote"`
		Downvote int                 `json:"downvote"`
		UserMap  map[string]int      `json:"usermap"`
		Comments map[string][]string `json: "comments"`
	}

	var planInput planTransientInput
	err = json.Unmarshal(transientPlanJSON, &planInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %s", err.Error())
	}

	planPrivateDetails := &PlanPrivateDetails{
		ObjectType: "PlanPrivateDetails",
		PlanId:     planInput.PlanId,
		Upvote:     planInput.Upvote,
		Downvote:   planInput.Downvote,
		UserMap:    planInput.UserMap,
		Comments:   planInput.Comments,
	}
	planPrivateDetailsAsBytes, err := json.Marshal(planPrivateDetails)
	if err != nil {
		return fmt.Errorf(err.Error())
	}
	err = ctx.GetStub().PutPrivateData("collectionPlanPrivateDetails", planInput.PlanId, planPrivateDetailsAsBytes)
	if err != nil {
		return fmt.Errorf("failed to put Plan private details: %s", err.Error())
	}

	return nil
}

func (s *SmartContract) UpdateGlobalPlan(ctx contractapi.TransactionContextInterface) error {

	transMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("Error getting transient: " + err.Error())
	}

	transientPlanJSON, ok := transMap["plan"]
	if !ok {
		return fmt.Errorf("plan not found in the transient map")
	}

	type planTransientInput struct {
		PlanId        string   `json:"planid"` //the fieldtags are needed to keep case from bouncing around
		Description   string   `json:"description"`
		Deadline      string   `json:"deadline"`
		FinalUpvote   int      `json:"finalupvote"`
		FinalDownvote int      `json:"finaldownvote"`
		IsActive      bool     `json:"isactive"`
		FinalComments []string `json:"finalcomments"`
	}

	var planInput planTransientInput
	err = json.Unmarshal(transientPlanJSON, &planInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %s", err.Error())
	}

	plan := &Plan{
		ObjectType:    "Plan",
		PlanId:        planInput.PlanId,
		Description:   planInput.Description,
		Deadline:      planInput.Deadline,
		FinalUpvote:   planInput.FinalUpvote,
		FinalDownvote: planInput.FinalDownvote,
		IsActive:      planInput.IsActive,
		FinalComments: planInput.FinalComments,
	}
	planPrivateDetailsAsBytes, err := json.Marshal(plan)
	if err != nil {
		return fmt.Errorf(err.Error())
	}
	err = ctx.GetStub().PutPrivateData("collectionPlan", planInput.PlanId, planPrivateDetailsAsBytes)
	if err != nil {
		return fmt.Errorf("failed to put Plan details: %s", err.Error())
	}

	return nil
}

// Delete plan votes collection when polling stops
func (s *SmartContract) DeletePrivatePlan(ctx contractapi.TransactionContextInterface) error {

	transMap, err := ctx.GetStub().GetTransient()
	if err != nil {
		return fmt.Errorf("Error getting transient: " + err.Error())
	}

	// Plan properties are private, therefore they get passed in transient field
	transientDeletePlanJSON, ok := transMap["plan_delete"]
	if !ok {
		return fmt.Errorf("plan to delete not found in the transient map")
	}

	type planDelete struct {
		PlanId string `json:"planid"`
	}

	var planDeleteInput planDelete
	err = json.Unmarshal(transientDeletePlanJSON, &planDeleteInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %s", err.Error())
	}

	if len(planDeleteInput.PlanId) == 0 {
		return fmt.Errorf("planid field must be a non-empty string")
	}

	// delete the plan votes from state
	err = ctx.GetStub().DelPrivateData("collectionPlanPrivateDetails", planDeleteInput.PlanId)
	if err != nil {
		return fmt.Errorf("Failed to delete state:" + err.Error())
	}

	return nil
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error creating private plans chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting private plans chaincode: %s", err.Error())
	}
}
