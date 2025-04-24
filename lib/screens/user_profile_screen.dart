import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:menu_del_dia/models/user.dart' as models;
import 'package:menu_del_dia/services/firestore_service.dart';

class UserProfileScreen extends StatefulWidget {
  final models.UserModel user;

  const UserProfileScreen({super.key, required this.user});

    @override
  _UserProfileScreenState createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  List<Map<String, dynamic>> _favoriteRestaurants = [];

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    try {
      final favorites = await _firestoreService.getFavorites(widget.user.uid);
      setState(() {
        _favoriteRestaurants = favorites.map((e) => e as Map<String, dynamic>).toList();
      });
    } catch (e) {
      print("Error loading favorites: $e");
      // Handle error appropriately, e.g., show a snackbar
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Name: ${widget.user.name ?? "Not available"}',
              style: const TextStyle(fontSize: 18),
            ),
            Text(
              'Email: ${widget.user.email}',
              style: const TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 20),
            const Text(
              'Favorite Restaurants:',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            _favoriteRestaurants.isEmpty
                ? const Text('No favorites yet.')
                : Expanded(
                    child: ListView.builder(
                      itemCount: _favoriteRestaurants.length,
                      itemBuilder: (context, index) {
                        final restaurant = _favoriteRestaurants[index];
                        return ListTile(
                          title: Text(restaurant['name'] ?? 'Restaurant Name'),
                          subtitle: Text(restaurant['address'] ?? 'Restaurant Address'),
                          trailing: IconButton(
                            icon: const Icon(Icons.rate_review),
                            onPressed: () {
                              print('Write Review Tapped');
                              // TODO: Implement review functionality
                            },
                          ),
                        );
                      },
                    ),
                  ),
            const SizedBox(height: 20),
            // Add a button to navigate to the OwnerScreen if the user is an owner
            FutureBuilder<models.UserModel?>(
              future: _firestoreService.getUser(FirebaseAuth.instance.currentUser!.uid),
              builder: (context, snapshot) {
                if (snapshot.hasData && snapshot.data?.role == 'owner') {
                  return ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/owner'),
                    child: const Text('Manage Restaurants (Owner)'),
                  );
                }
                return const SizedBox.shrink(); // Return an empty widget if not an owner
              },
            ),
          ],
        ),
      ),
    );
  }
}