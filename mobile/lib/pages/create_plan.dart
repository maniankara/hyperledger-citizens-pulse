import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CreatePlan extends StatefulWidget {
  @override
  _CreatePlanState createState() => _CreatePlanState();
}


class _CreatePlanState extends State<CreatePlan> {

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  String _planid;
  String _description;
  String _deadline;
  final DateFormat formatter = DateFormat('yyyy-MM-dd');


  Widget _buildPlanId(){
    return TextFormField(
      decoration: InputDecoration(labelText: 'Enter PlanId'),
      validator: (String value){
        if(value.isEmpty) {
          return "PlanId is required";
        }
      } ,
      onSaved: (String value){
        _planid = value;
      },
    );
  }

  Widget _buildPlanDescription(){
    return TextFormField(
      keyboardType: TextInputType.multiline,
      maxLines: null,
      decoration: InputDecoration(labelText: 'Enter Description'),
      validator: (String value){
        if(value.isEmpty){
          return "Description is required";
        }
      },
      onSaved: (String value){
        _description = value;
      },
    );
  }

  void callDatePicker() async {
    var pickedDate = await getDate();
    final String formatted = formatter.format(pickedDate);

    setState(() {
      _deadline = formatted;
    });
  }


  Future<DateTime> getDate() {
    return showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2021),
    );
  }


  Widget _buildPlanDeadline(context){

    return RaisedButton(
      onPressed: () => callDatePicker(),
      child: Text(
        'Pick a Deadline',
      ),
    );
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    final DateTime now = DateTime.now();
    _deadline = formatter.format(now);
  }

  Future<void> createPlan(data) async{

    String url = "http://18.133.117.45:5000/channels/mychannel/chaincodes/planCC";

    var body = jsonEncode(data);
    var raw = jsonEncode({
      "fcn": "InitPlan",
      "channelName": "mychannel",
      "chaincodeName": "planCC",
      "transient": body,
      "args": [],
    });


    SharedPreferences preferences = await SharedPreferences.getInstance();
    var token = await preferences.getString("user_token");

    final response = await http.post(
        '$url',
        headers: {HttpHeaders.authorizationHeader: "Bearer $token", "Content-Type": "application/json"},
        body: raw
    );

    var resJSON = jsonDecode(response.body);
    var message = resJSON['result']['message'];

    showDialog<void>(
        context: context,
        child: AlertDialog(
          content: Text(message),
        )
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Create Plan"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Container(
          margin: EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                _buildPlanId(),
                _buildPlanDescription(),
                SizedBox(height: 20,),
                _buildPlanDeadline(context),
                Text("Selected Deadline is ${_deadline}", style: TextStyle(color: Colors.teal, fontWeight: FontWeight.w700),),
                SizedBox(height: 50),
                Center(
                  child: RaisedButton(

                    onPressed: () async {
                    if(!_formKey.currentState.validate()){
                      return;
                    }
                    _formKey.currentState.save();

                    Map data = {
                      "planid": _planid,
                      "description": _description,
                      "deadline": _deadline,
                      "upvote": 0,
                      "downvote": 0,
                      "finalupvote": 0,
                      "finaldownvote": 0,
                    };

                    createPlan(data).then((value) => _formKey.currentState.reset());
                  },
                    child: Text("Create", style: TextStyle(color: Colors.blue, fontSize: 16),),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
