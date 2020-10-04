import 'dart:convert';

PlanVotes fromJson(String str) => PlanVotes.fromJson(json.decode(str));

class PlanVotes {

  final String title;
  final DateTime votedAt;
  final DateTime updatedVoteAt;
  final int vote;

  PlanVotes(this.title, this.votedAt, this.updatedVoteAt, this.vote);

  factory PlanVotes.fromJson(Map<String, dynamic> json) => PlanVotes(
      json["plan"],
      DateTime.parse(json["createdAt"]).toLocal(),
      DateTime.parse(json["updatedAt"]).toLocal(),
//      json["updatedAt"],
      int.parse(json["choice"])
  );
}