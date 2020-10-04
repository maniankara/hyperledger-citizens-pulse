import 'dart:convert';
import 'dart:io';

import 'package:citizenspulse/pages/PlanVotes.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:citizenspulse/pages/Plan.dart';

class ViewVotes extends StatefulWidget {
  @override
  _ViewVotesState createState() => _ViewVotesState();
}

class _ViewVotesState extends State<ViewVotes> {

  String _token;
  String _username;
  String _orgName;
  List<String> _planIDs = List();
  List<PlanVotes> _myVotes = List();

  Future<void> getUsernameAndOrg() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String token = prefs.getString("user_token");

    String url = "http://18.133.117.45:5000/decode";

    var raw = jsonEncode({
      "token": token,
    });

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $token", "Content-Type": "application/json"},
        body: raw
    );

    var resJson = jsonDecode(response.body);
    _token = token;
    _username = resJson['username'];
    _orgName = resJson['orgName'];
  }

  Future<void> getAllPlans() async {

    String url = "http://18.133.117.45:5000/channels/mychannel/chaincodes/planCC";

    var raw = jsonEncode({
      "fcn": "GetAllPlans",
      "channelName": "mychannel",
      "chaincodeName": "planCC",
      "transient": "",
      "args": ["", ""],
    });


    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
        body: raw
    );
    var resJson = jsonDecode(response.body);
    var plans = resJson['result']['message'] as List;

    List<Plan> _fetchedPlanList = plans.map((i)=>Plan.fromJson(i)).toList();
    _fetchedPlanList.forEach((element) {
      _planIDs.add(element.title);
    });
  }

  Future<void> getMyVotes() async {

    String url = "http://18.133.117.45:5000/getMyVotes";

    var raw = jsonEncode({
      "orgName": _orgName,
      "planids": _planIDs,
      "username": _username,
    });

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
        body: raw
    );
    var myVotes = jsonDecode(response.body) as List;

    List<PlanVotes> _fetchedPlanVotesList = myVotes.map((i)=>PlanVotes.fromJson(i)).toList();
    setState(() {
      _myVotes = _fetchedPlanVotesList;
    });
  }

  Future<void>_refresh()async {
    getMyVotes();
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getUsernameAndOrg().then((value) => getAllPlans()).then((value) => getMyVotes());
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("View Votes"), centerTitle: true, actions: <Widget>[
        PopupMenuButton<String>(
          onSelected: (value){
            Navigator.popAndPushNamed(context, '/signin');
          },
          itemBuilder: (BuildContext context) {
            return {'Logout'}.map((String choice) {
              return PopupMenuItem<String>(
                value: choice,
                child: Text(choice),
              );
            }).toList();
          },
        ),
      ],),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView.builder(
          itemCount: _myVotes.length,
          itemBuilder: (BuildContext context, int index) => buildPlanVotesCard(context, index),
        ),
      ),
    );
  }

  Widget buildPlanVotesCard(BuildContext context, int index){

    final plan = _myVotes[index];

    return new Container(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(

              children: <Widget>[

                Row(
                  children: <Widget>[
                    Text(plan.title, style: TextStyle(fontSize: 18),),
                    Spacer(),
                    Chip(
                      backgroundColor: plan.vote == 1?Colors.green:Colors.redAccent,
                      padding: EdgeInsets.all(0),
                      label: Text(plan.vote == 1?"Upvoted":"Downvoted", style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomRight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      Text("Voted : ${DateFormat.yMd().add_jm().format(plan.votedAt).toString()}"),
                      Text("Updated : ${DateFormat.yMd().add_jm().format(plan.updatedVoteAt).toString()}")
                    ],
                  ),
                ),
              ],

            ),
          ),
        )
    );

  }

}
