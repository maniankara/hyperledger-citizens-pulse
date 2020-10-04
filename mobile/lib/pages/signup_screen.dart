import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:dropdown_formfield/dropdown_formfield.dart';
import 'package:http/http.dart' as http;

class SignupScreen extends StatefulWidget {
  @override
  _SignupScreenState createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {

  String _userOrg;
  bool _passwordVisible;

  @override
  void initState() {
    super.initState();
    _userOrg = '';
    _passwordVisible = false;
  }

  String _username;
  String _email;
  String _password;
  String _orgName;

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  Widget _buildUsername(){
    return TextFormField(
      decoration: InputDecoration(labelText: 'Enter username'),
      validator: (String value){
        if(value.isEmpty) {
          return "Username is required";
        }
      } ,
      onSaved: (String value){
        _username = value;
      },
    );
  }

  Widget _buildEmail(){
    return TextFormField(
      decoration: InputDecoration(labelText: 'Enter email'),
      validator: (String value){
        if(value.isEmpty){
          return "Email is required";
        }

        if(!RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+").hasMatch(value)){
          return "Please enter a valid email.";
        }
      },
      onSaved: (String value){
        _email = value;
      },
    );
  }

  Widget _buildPassword(){
    return TextFormField(
      decoration: InputDecoration(labelText: 'Enter password',
        suffixIcon: IconButton(
          icon: Icon(
            _passwordVisible? Icons.visibility : Icons.visibility_off,
            color: Theme.of(context).primaryColorDark,
          ),
          onPressed: () {
            setState(() {
              _passwordVisible = !_passwordVisible;
            });
          },
        )
      ),
      obscureText: !_passwordVisible,
      validator: (String value){
        if(value.isEmpty) {
          return "Password is required";
        }
      } ,
      onSaved: (String value){
        _password = value;
      },
    );
  }

  Widget _buildOrgname(){

    return Container(
      padding: EdgeInsets.fromLTRB(0, 15, 0, 0),
      child: DropDownFormField(
        titleText: 'Organisation MSP',
        hintText: 'Select Org',
        value: _userOrg,
        onSaved: (value) {
          setState(() {
            _userOrg = value;
          });
        },
        onChanged: (value) {
          setState(() {
            _userOrg = value;
          });
        },
        dataSource: [
          {
            "display": "Org1",
            "value": "Org1",
          },
          {
            "display": "Org2",
            "value": "Org2",
          },
        ],
        textField: 'display',
        valueField: 'value',
      ),
    );
  }

  Future<void> registerUser(data) async{

    String url = "http://18.133.117.45:5000/signup";
    var body = jsonEncode(data);

    final response = await http.post(
        '$url',
        headers: {"Content-Type": "application/json"},
        body: body
    ).then((value) => {
        showDialog(
        context: this.context,
        child: AlertDialog(
          content: Text(value.body),
        )
      )
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Sign Up • Citizens Pulse"), centerTitle: true,),
      body: Container(
        margin: EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              children: <Widget>[
                _buildUsername(),
                _buildEmail(),
                _buildPassword(),
                _buildOrgname(),

              SizedBox(height: 50),
              RaisedButton(
                onPressed: () async {
                  if(!_formKey.currentState.validate()){
                    return;
                  }
                  _formKey.currentState.save();

                  Map data = {
                    "username": _username,
                    "password": _password,
                    "email": _email,
                    "orgName": _userOrg,
                  };

                  await registerUser(data);
                  _formKey.currentState.reset();
                },
                child: Text("Submit", style: TextStyle(color: Colors.blue, fontSize: 16),),
              ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
