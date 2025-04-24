import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/restaurant.dart';
import '../services/firestore_service.dart';

class OwnerScreen extends StatefulWidget {
  const OwnerScreen({super.key});

  @override
  State<OwnerScreen> createState() => _OwnerScreenState();
}

class _OwnerScreenState extends State<OwnerScreen> {
  final _firestoreService = FirestoreService();
  final _auth = FirebaseAuth.instance;

  @override
  Widget build(BuildContext context) {
    final user = _auth.currentUser;
    if (user == null) {
      return const Scaffold(
        body: Center(
          child: Text("No user logged in."),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Restaurants'),
      ),
      body: FutureBuilder<List<Restaurant>>(
        future: _firestoreService.getRestaurants().then((restaurants) =>
            restaurants
                .where((restaurant) => restaurant.ownerId == user.uid)
                .toList()),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('You have no restaurants.'));
          } else {
            final restaurants = snapshot.data!;
            return ListView.builder(
              itemCount: restaurants.length,
              itemBuilder: (context, index) {
                final restaurant = restaurants[index];
                return Card(
                  margin: const EdgeInsets.all(10),
                  child: ListTile(
                    title: Text(restaurant.name),
                    subtitle: Text(restaurant.address),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.restaurant_menu),
                          onPressed: () {
                            Navigator.pushNamed(
                              context,
                              '/menu_form',
                              arguments: restaurant.id,
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () {
                            Navigator.pushNamed(
                              context,
                              '/restaurant_form',
                              arguments: restaurant,
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () async {
                            try {
                              await _firestoreService
                                  .deleteRestaurant(restaurant.id);
                              setState(() {}); // Refresh the list
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Restaurant "${restaurant.name}" deleted.')),
                              );
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Error deleting restaurant: $e')),
                                );
                              } else {
                                debugPrint(
                                    'Error deleting restaurant: $e (Widget not mounted)',
                                  );
                                // You might want to log the error or display a message in a different way
                                // if you still need to inform the user about the failure.
                              }
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/restaurant_form');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}