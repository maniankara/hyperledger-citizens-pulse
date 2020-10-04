import 'package:citizenspulse/pages/home_screen.dart';
import 'package:citizenspulse/pages/view_votes.dart';
import 'package:flutter/material.dart';


class TabNavigationItem {

  final Widget page;
  final String title;
  final Icon icon;

  TabNavigationItem({@required this.page, @required this.title, @required this.icon});


  static List<TabNavigationItem> get items => [

    TabNavigationItem(
      page: HomeScreen(),
      icon: Icon(Icons.account_balance),
      title: "Active Polls",
    ),
    TabNavigationItem(
      page: ViewVotes(),
      icon: Icon(Icons.touch_app),
      title: "View Votes",
    ),
  ];

}