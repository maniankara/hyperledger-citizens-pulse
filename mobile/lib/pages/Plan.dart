import 'dart:convert';

Plan fromJson(String str) => Plan.fromJson(json.decode(str));

class Plan {

  final String title;
  final String endDate;
  final String description;
  final bool isActive;
  final int finalUpvote;
  final int finalDownvote;
  int choice;

  Plan(this.title, this.endDate, this.description, this.isActive, this.finalUpvote, this.finalDownvote, this.choice);

  factory Plan.fromJson(Map<String, dynamic> json) => Plan(
    json["planid"],
    json["deadline"],
    json["description"],
    json["IsActive"],
    json["finalupvote"],
    json["finaldownvote"],
    0
  );
}