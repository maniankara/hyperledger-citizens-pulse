import 'dart:convert';
import 'dart:ffi';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:citizenspulse/pages/Plan.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {

  String _token;
  String _username;
  String _orgName;
  bool loading = true;
  List<Plan> PlanList = List();

  Future<void> getUsernameAndOrg() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String token = prefs.getString("user_token");

    String url = "http://18.133.117.45:5000/decode";

    var raw = jsonEncode({
      "token": token,
    });

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
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
    setState(() {
      PlanList = _fetchedPlanList;
    });
  }

  Future<void> getUserVotes() async {

    for(var i = 0; i < PlanList.length; i++){

      String url = "http://18.133.117.45:5000/user_vote/${_username}/${_orgName}/${PlanList[i].title}";

      final response = await http.get(
          '$url',
          headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
      );
      var resJSON = jsonDecode(response.body);

      if(resJSON.containsKey("choice")){
        PlanList[i].choice = int.parse(resJSON["choice"]);
      }
    }
    setState(() {
      PlanList;
      loading = false;
    });
  }


  Future<void> handleVote(String action, String planName, int index) async {

    String url = "http://18.133.117.45:5000/channels/mychannel/chaincodes/planCC";

    Map<String, int> _choiceHash = {
      "upvote": 1,
      "downvote": -1
    };
    PlanList[index].choice = _choiceHash[action];
    setState(() {
      PlanList;
    });

    var raw = jsonEncode({
      "fcn": "UpdateVote",
      "channelName": "mychannel",
      "chaincodeName": "planCC",
      "transient": "",
      "args": [action, planName, "hritik"],
    });

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
        body: raw
    );

    var resJson = jsonDecode(response.body);
    var message = resJson['result']['message'];
    print (message);
  }

  Future<void> handleClosing(int planIndex) async {

    String url = "http://18.133.117.45:5000/close-voting/user/${_username}/org/${_orgName}/plan/${PlanList[planIndex].title}/";

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $_token", "Content-Type": "application/json"},
    );
    var resJson = jsonDecode(response.body);
    var message = resJson['message'];

    showDialog<void>(
        context: context,
        child: AlertDialog(
          content: Text(message),
        )
    );
  }

  Future<void>_refresh()async {
    loading = true;
    getAllPlans().then((value) => getUserVotes());
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getUsernameAndOrg().then((value) => getAllPlans()).then((value) => getUserVotes());
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: (){
          Navigator.pushNamed(context, '/create-plan');
        },
        child: Icon(Icons.add),
        backgroundColor: Colors.teal,
      ),
      appBar: AppBar(title: Text("Active Polls"), centerTitle: true, actions: <Widget>[
          PopupMenuButton<String>(
            onSelected: (value) async {
              SharedPreferences preferences = await SharedPreferences.getInstance();
              await preferences.remove("user_token");

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
      body: loading ? SpinKitRing(color: Colors.teal,) : RefreshIndicator(
        onRefresh: _refresh,
        child: ListView.builder(
          itemCount: PlanList.length,
          itemBuilder: (BuildContext context, int index) => buildPlanCard(context, index),
        ),
      ),
    );
  }


  Widget buildPlanCard(BuildContext context, int index){

    final plan = PlanList[index];

    return new Container(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 4.0),
                  child: Row(
                    children: <Widget>[
                      Text(plan.title, style: TextStyle(fontSize: 20),),
                      ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 4.0, bottom: 30),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(plan.description,),
                      ),
                    ],
                  ),
                ),

                Row(
                  children: <Widget>[
                    _orgName == "Org2" && plan.isActive ?
                    RaisedButton(
                      onPressed: (){
                        handleVote("upvote", plan.title, index);
                      },
                      child: Text("Upvote", style: TextStyle(color: plan.choice == 1 ? Colors.green:null),),
                    ):Container(),
                    SizedBox(width: 5,),
                    _orgName == "Org2" && plan.isActive ?
                    RaisedButton(
                      onPressed: (){
                        handleVote("downvote", plan.title, index);
                      },
                      child: Text("Downvote", style: TextStyle(color: plan.choice == -1 ? Colors.pink:null),),
                    ):Container(),
                    SizedBox(width: 5,),
                    _orgName == "Org1" && plan.isActive ?
                    RaisedButton(
                      onPressed: (){
                        handleClosing(index);
                      },
                      child: Text("Close Polling"),
                    ):Container()
                  ],
                ),
                Divider(),
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 8),
                  child: Row(
                    children: <Widget>[
                      Text("Ends on ${plan.endDate}"),
                      Spacer(),
                      Icon(
                        Icons.album,
//                        plan.isActive? Icons.panorama_fish_eye : Icons.remove_circle_outline,
                        color: plan.isActive ? Colors.green: Colors.red,
                      ),
                    ],
                  ),
                ),
                !plan.isActive ? Padding(
                  padding: EdgeInsets.only(bottom: 2),
                  child: Row(
                    children: [
                      Icon(
                        Icons.thumb_up
                      ),
                      SizedBox(width: 10,),
                      Text("${plan.finalUpvote}"),
                      SizedBox(width: 40,),
                      Icon(
                          Icons.thumb_down
                      ),
                      SizedBox(width: 10,),
                      Text("${plan.finalDownvote}"),
                    ],
                  ),
                ):Container()
              ],
            ),
          ),
        )
    );
  }

}
