import 'package:flutter/material.dart';
import 'package:menu_del_dia/services/firestore_service.dart';
import 'package:menu_del_dia/models/restaurant.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapViewScreen extends StatefulWidget {
  const MapViewScreen({Key? key}) : super(key: key);

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  Set<Marker> _markers = {};
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    _loadRestaurants();
  }

  Future<void> _loadRestaurants() async {
    final restaurants = await _firestoreService.getRestaurants();
    setState(() {
      _markers = restaurants.map((r) => Marker(
        markerId: MarkerId(r.id),
        position: LatLng(r.latitude, r.longitude),
        infoWindow: InfoWindow(title: r.name),
        onTap: () => _showRestaurantDetails(r),
      )).toSet();
    });
  }

  void _showRestaurantDetails(Restaurant r) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => ListTile(
        title: Text(r.name),
        subtitle: Text(r.address),
        onTap: () {
          Navigator.pop(ctx);
          Navigator.pushNamed(context, '/restaurant_details', arguments: r);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Map View')),
      body: Center(
        child: GoogleMap(
          initialCameraPosition: CameraPosition(
            target: _markers.isNotEmpty ? _markers.first.position : LatLng(0, 0),
            zoom: 12,
          ),
          markers: _markers,
          onMapCreated: (controller) => _mapController = controller,
        ),
      ),
    );
  }
}
