import 'package:flutter/material.dart';
import 'package:menu_del_dia/models/restaurant.dart';
import 'package:menu_del_dia/services/firestore_service.dart';
import 'package:provider/provider.dart';
import 'package:menu_del_dia/services/location_provider.dart';
import 'package:geolocator/geolocator.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  final FirestoreService firestoreService = FirestoreService();
  List<Restaurant> _restaurants = [], _filteredRestaurants = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadRestaurantsAndCreateMarkers();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadRestaurantsAndCreateMarkers() async {
    try {
      List<Restaurant> restaurants = await firestoreService.getRestaurants();
      setState(() {
        _restaurants = restaurants;
        _filteredRestaurants = restaurants;
      });
      _applyProximityFilter();
    } catch (e) {
      debugPrint('Error loading restaurants: $e');
    }
  }

  void _applyProximityFilter() {
    final locationProvider = Provider.of<LocationProvider>(context, listen: false);
    final userPosition = locationProvider.currentPosition;

    if (userPosition != null) {
      _sortByProximity(userPosition);
    }
  }

  void _navigateToRestaurantDetails(Restaurant restaurant) {
    Navigator.pushNamed(context, '/restaurant_details', arguments: restaurant);
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredRestaurants =
          _restaurants
              .where(
                (restaurant) =>
                    restaurant.tags?.any(
                      (tag) => tag.toLowerCase().contains(query),
                    ) ==
                        true,
              )
              .toList();
    });
  }

  void _sortByProximity(Position userPosition) {
    _filteredRestaurants.sort((a, b) {
      double distanceA = _calculateDistance(userPosition, a);
      double distanceB = _calculateDistance(userPosition, b);
      return distanceA.compareTo(distanceB);
    });
  }

  double _calculateDistance(Position userPosition, Restaurant restaurant) => Geolocator.distanceBetween(userPosition.latitude, userPosition.longitude, restaurant.latitude, restaurant.longitude);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Restaurants'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Placeholder for filter options
              showDialog(
                context: context,
                builder:
                    (context) => AlertDialog(
                  title: const Text("Filter Options"),
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ListTile(
                            title: const Text("Sort by Proximity"),
                            onTap: () {
                              _sortByProximity();
                              Navigator.pop(context);
                            },
                          ),
                          ListTile(
                            title: const Text("Sort by Price (Experimental)"),
                            subtitle: const Text(
                              "Note: Price data may not be available for all restaurants.",
                            ),
                            isThreeLine: true,
                            enabled: false,
                            onTap: () {
                              // Show a message or disable if not implemented
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    "Price sorting not yet implemented.",
                                  ),
                                ),
                              );
                              // TODO: Implement price filtering
                              Navigator.pop(context);
                            },
                          ),
                        ],
                      ),
                    ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              Navigator.pushNamed(context, '/profile');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by tags',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _filteredRestaurants.length,
              itemBuilder: (context, index) {
                final restaurant = _filteredRestaurants[index];
                return Card(
                  margin: const EdgeInsets.all(8.0),
                  child: ListTile(
                    title: Text(restaurant.name),
                    subtitle: Text(restaurant.address),
                    onTap: () {
                      _navigateToRestaurantDetails(restaurant);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
