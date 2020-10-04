import 'package:citizenspulse/pages/create_plan.dart';
import 'package:citizenspulse/pages/home_screen.dart';
import 'package:citizenspulse/pages/signin_page.dart';
import 'package:citizenspulse/pages/signup_screen.dart';
import 'package:citizenspulse/pages/tabs/tabs_page.dart';
import 'package:citizenspulse/pages/view_votes.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Citizens Pulse",
      theme: ThemeData(
        primaryColor: Colors.teal
      ),
      home: SigninScreen(),
      debugShowCheckedModeBanner: false,
      routes: {
        '/signup': (context) => SignupScreen(),
        '/signin': (context) => SigninScreen(),
        '/welcome': (context) => TabsPage(),
        '/home': (context) => HomeScreen(),
        'viewVotes' : (context) => ViewVotes(),
        '/create-plan': (context) => CreatePlan(),
      },
    );
  }
}