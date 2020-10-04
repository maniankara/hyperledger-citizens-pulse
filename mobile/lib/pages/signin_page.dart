import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SigninScreen extends StatefulWidget {
  @override
  _SigninScreenState createState() => _SigninScreenState();
}

class _SigninScreenState extends State<SigninScreen> {

  bool _passwordVisible;

  @override
  void initState() {
    super.initState();
    _passwordVisible = false;
  }

  String _username;
  String _password;

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  Widget _buildUsername(){
    return TextFormField(
      decoration: InputDecoration(labelText: 'Enter username'),
      validator: (String value){
        if(value.isEmpty){
          return "Username is required";
        }

      },
      onSaved: (String value){
        _username = value;
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

  Future loginUser(data) async {

    String url = "http://18.133.117.45:5000/authenticate";
    var body = jsonEncode(data);

    final response = await http.post(
        '$url',
        headers: {"Content-Type": "application/json"},
        body: body
    );

    String resBody = response.body.toString();

    if (response.statusCode == 200) {
      final Map<String, dynamic> authResponseData = json.decode(response.body.toString());
      String token = authResponseData['token'];
      SharedPreferences preferences = await SharedPreferences.getInstance();
      await preferences.setString("user_token", token);
      Navigator.popAndPushNamed(context, "/welcome");
    } else{
        showDialog<void>(
          context: context,
          child: AlertDialog(
            content: Text(resBody),
          )
        );
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Sign In • Citizens Pulse"), centerTitle: true,),
      body: Container(
        margin: EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              children: <Widget>[
                _buildUsername(),
                _buildPassword(),

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
                    };

                    await loginUser(data);
                    _formKey.currentState.reset();
                  },
                  child: Text("Submit", style: TextStyle(color: Colors.blue, fontSize: 16),),
                ),
                SizedBox(height: 20,),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Text(
                      'New here?',
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.black,
                      ),
                    ),
                    MaterialButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/signup');
                      },
                      minWidth: 0,
                      height: 0,
                      padding: EdgeInsets.fromLTRB(5, 0, 0, 0),
                      child: Text('Sign Up', style: TextStyle(color: Colors.black, fontSize: 15),),
                    )
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
