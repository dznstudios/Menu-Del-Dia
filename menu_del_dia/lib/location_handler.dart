import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:menu_del_dia/services/location_provider.dart';
class LocationHandler extends StatefulWidget {
  const LocationHandler({super.key});

  @override
  State<LocationHandler> createState() => _LocationHandlerState();
}

class _LocationHandlerState extends State<LocationHandler> {

  @override
  void initState() {
    super.initState();
    _getLocation();
  }

  Future<void> _getLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception(
            'Location permissions are permanently denied, we cannot request permissions.');
      }

      Position position = await Geolocator.getCurrentPosition();
      Provider.of<LocationProvider>(context, listen: false)
          .updateLocation(position);
      Navigator.pushReplacementNamed(context, '/main');
    } catch (e) {
      // TODO: Handle error (e.g., show a dialog or snackbar)
      print('Error getting location: ${e.toString()}');
    }
  }
}
}