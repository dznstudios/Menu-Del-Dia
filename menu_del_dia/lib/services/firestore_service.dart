import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user.dart';
import '../models/restaurant.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> addUser(UserModel user) async {
    try {
      await _db.collection('users').doc(user.uid).set(user.toJson());
    } catch (e) {
      throw Exception('Failed to add user: $e');
    }
  }

  Future<UserModel> getUser(String uid) async {
    try {
      DocumentSnapshot doc = await _db.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserModel.fromJson(doc.data() as Map<String, dynamic>);
      } else {
        throw Exception('User not found');
      }
    } catch (e) {
      throw Exception('Failed to get user: $e');
    }
  }

  Future<void> addRestaurant(Restaurant restaurant) async {
    try {
      DocumentReference doc = _db.collection('restaurants').doc();
      if (restaurant.id.isEmpty) {
        restaurant = Restaurant(
          id: doc.id,
          name: restaurant.name,
          address: restaurant.address,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          ownerId: restaurant.ownerId,
          tags: restaurant.tags,);
      } else {
        doc = _db.collection('restaurants').doc(restaurant.id);
      }
      await doc.set(restaurant.toJson());
    } catch (e) {
      throw Exception('Failed to add restaurant: $e');
    }
  }

  Future<List<Restaurant>> getRestaurants() async {
    try {
      QuerySnapshot snapshot = await _db.collection('restaurants').get();
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        return Restaurant.fromJson(data..['id'] = doc.id);
      }).toList();
    } catch (e) {
      throw Exception('Failed to get restaurants: $e');
    }
  }

  Future<Restaurant> getRestaurant(String id) async {
    try {
      DocumentSnapshot doc = await _db.collection('restaurants').doc(id).get();
      if (doc.exists) {
        final data = doc.data() as Map<String, dynamic>;
        return Restaurant.fromJson(data..['id'] = doc.id);
      } else {
        throw Exception('Restaurant not found');
      }
    } catch (e) {
      throw Exception('Failed to get restaurant: $e');
    }
  }

  Future<void> updateRestaurant(Restaurant restaurant) async {
    try {
      await _db.collection('restaurants').doc(restaurant.id).update(restaurant.toJson());
    } catch (e) {
      throw Exception('Failed to update restaurant: $e');
    }
  }

  Future<void> deleteRestaurant(String id) async {
    try {
      await _db.collection('restaurants').doc(id).delete();
    } catch (e) {
      throw Exception('Failed to delete restaurant: $e');
    }
  }

  Future<void> addMenu(String restaurantId, Map<String, dynamic> menuData) async {
    try {
      await _db.collection('restaurants').doc(restaurantId).collection('menus').add(menuData);
    } catch (e) {
      throw Exception('Failed to add menu: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getMenus(String restaurantId) async {
    try {
      QuerySnapshot snapshot = await _db.collection('restaurants').doc(restaurantId).collection('menus').get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      throw Exception('Failed to get menus: $e');
    }
  }

  Future<void> addReview(String restaurantId, Map<String, dynamic> reviewData) async {
    try {
      await _db.collection('restaurants').doc(restaurantId).collection('reviews').add(reviewData);
    } catch (e) {
      throw Exception('Failed to add review: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getReviews(String restaurantId) async {
    try {
      QuerySnapshot snapshot = await _db.collection('restaurants').doc(restaurantId).collection('reviews').get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      throw Exception('Failed to get reviews: $e');
    }
  }

  Future<void> addFavorite(String userId, String restaurantId) async {
    try {
      await _db.collection('users').doc(userId).collection('favorites').doc(restaurantId).set({'restaurantId': restaurantId});
    } catch (e) {
      throw Exception('Failed to add favorite: $e');
    }
  }

  Future<List<String>> getFavorites(String userId) async {
    try {
      QuerySnapshot snapshot = await _db.collection('users').doc(userId).collection('favorites').get();
      return snapshot.docs.map((doc) => doc.id).toList();
    } catch (e) {
      throw Exception('Failed to get favorites: $e');
    }
  }

  Future<void> removeFavorite(String userId, String restaurantId) async {
    try {
      await _db.collection('users').doc(userId).collection('favorites').doc(restaurantId).delete();
    } catch (e) {
      throw Exception('Failed to remove favorite: $e');
    }
  }
}