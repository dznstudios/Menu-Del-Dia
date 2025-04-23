class UserModel {
  final String uid;
  final String email;
  final String? name;
  final String? role;

  UserModel({
    required this.uid,
    required this.email,
    this.name,
    this.role,
  });

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'role': role,
    };
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
      role: json['role'] as String?,
    );
  }
}