import 'package:firebase_auth/firebase_auth.dart';
import 'firestore_service.dart';
import '../models/user.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<UserCredential> createUserWithEmailAndPassword(String email, String password) async {
    final UserCredential userCredential = await _auth.createUserWithEmailAndPassword(email: email, password: password);

    // Add user to Firestore with default role
    final FirestoreService firestoreService = FirestoreService();
    final UserModel user = UserModel(
      uid: userCredential.user!.uid,
      email: email,
      role: 'user',
    );
    await firestoreService.addUser(user);
    return userCredential;
  }

  Future<void> signOut() async {
    return await _auth.signOut();
  }
}