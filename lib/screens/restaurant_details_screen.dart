import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:menu_del_dia/models/restaurant.dart';
import 'package:menu_del_dia/services/firestore_service.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sqflite/sqflite.dart'; // Import sqflite
import 'package:path/path.dart'; // Import path
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class RestaurantDetailsScreen extends StatefulWidget {
  final Restaurant restaurant;

  const RestaurantDetailsScreen({super.key, required this.restaurant});

  @override
  State<RestaurantDetailsScreen> createState() => _RestaurantDetailsScreenState();
}

class _RestaurantDetailsScreenState extends State<RestaurantDetailsScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  List<Map<String, dynamic>> _menus = [];
  List<Map<String, dynamic>> _reviews = [];
  bool _isFavorite = false;

  late Database _database;

  @override
  void initState() {
    super.initState();
    _checkIfFavorite();
    _fetchData();
    _initDatabase();
  }

  Future<void> _initDatabase() async {
    _database = await openDatabase(
      join(await getDatabasesPath(), 'menu_database.db'),
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE menus(restaurantId TEXT PRIMARY KEY, menuData TEXT)',
        );
      },
      version: 1,
    );
  }

  Future<void> _fetchData() async {
    var connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult.contains(ConnectivityResult.none)) {
      // No internet connection, load from cache
      _loadFromCache();
    } else {
      // Internet connection available, fetch from Firestore and update cache
      _fetchFromFirestoreAndUpdateCache();
    }
  }

  Future<void> _loadFromCache() async {
    try {
      final List<Map<String, dynamic>> results = await _database.query(
        'menus',
        where: 'restaurantId = ?',
        whereArgs: [widget.restaurant.id],
      );

      if (results.isNotEmpty) {
        final cachedMenuData = results.first['menuData'] as String;
        setState(() {
          _menus = (jsonDecode(cachedMenuData) as List<dynamic>)
              .map((e) => e as Map<String, dynamic>)
              .toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Loaded menu from cache.')));
      }
    } catch (e) {
      debugPrint('Error loading menu from cache: $e');
    }
  }

  Future<void> _fetchFromFirestoreAndUpdateCache() async {
    try {
      final menus = await _firestoreService.getMenus(widget.restaurant.id);
      final reviews = await _firestoreService.getReviews(widget.restaurant.id);
      setState(() {
        _menus = menus;
        _reviews = reviews;
      });
      _updateCache(menus);
    } catch (e) {
      // Handle error, e.g., show a snackbar
      debugPrint('Error fetching data: $e');
    }
  }

  Future<void> _updateCache(List<Map<String, dynamic>> menus) async {
    try {
      await _database.insert(
        'menus',
        {'restaurantId': widget.restaurant.id, 'menuData': jsonEncode(menus)},
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      debugPrint('Menu cache updated for restaurant ${widget.restaurant.id}');
    } catch (e) {
      debugPrint('Error updating menu cache: $e');
    }
  }

  Future<void> _checkIfFavorite() async {
    if (_userId != null) {
      final favorites = await _firestoreService.getFavorites(_userId!);
      setState(() {
        _isFavorite = favorites.contains(widget.restaurant.id);
      });
    }
  }

  String? get _userId {
    // Replace with your actual user ID retrieval logic
    // This is a placeholder and will not work without proper implementation
    return 'some_user_id'; 
  }


 @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.restaurant.name),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.restaurant.name,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(widget.restaurant.address),
            const SizedBox(height: 20),
            Text(
              "Menu",
              style: Theme.of(context).textTheme.titleLarge,
            ),
            _menus.isEmpty
                ? const Text("No menus available.")
                : Column(
                    children: _menus.map((menu) {
                      final tags = (menu['tags'] as List<dynamic>?) ?? [];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 4.0),
                        child: ListTile(
                          title: Text(menu['description'] ?? ''),
                          subtitle: Text('€${(menu['price'] as num?)?.toStringAsFixed(2) ?? ''}'),
                          trailing: Wrap(
                            spacing: 4.0,
                            children: tags.map((t) => Chip(label: Text(t.toString()))).toList(),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
            const SizedBox(height: 20),
            Text(
              "Reviews",
              style: Theme.of(context).textTheme.titleLarge,
            ),
            _reviews.isEmpty
                ? const Text("No reviews yet.")
                : Column(
                    children: _reviews.map((review) => ListTile(title: Text(review['text'] ?? ''))).toList(),
                  ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () async {
                    if (_userId != null) {
                      if (_isFavorite) {
                        await _firestoreService.removeFavorite(_userId!, widget.restaurant.id);
                      } else {
                        await _firestoreService.addFavorite(_userId!, widget.restaurant.id);
                      }
                      setState(() {
                        _isFavorite = !_isFavorite;
                      });
                    } else {
                      // Handle case where user is not logged in
                    }
                  },
                  child: Text(_isFavorite ? "Unsave" : "Save"),
                ),
                ElevatedButton(
                  onPressed: () {
                    Share.share(
                        'Check out ${widget.restaurant.name} at ${widget.restaurant.address}');
                  },
                  child: const Text("Share"),
                ),
                ElevatedButton(
                  onPressed: () async {
                    _launchMapsUrl(widget.restaurant.address);
                  },
                  child: const Text("Directions"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchMapsUrl(String address) async {
    final encodedAddress = Uri.encodeComponent(address);
    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$encodedAddress');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}