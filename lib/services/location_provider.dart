import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;

  Position? get currentPosition => _currentPosition;

  set currentPosition(Position? position) {
    _currentPosition = position;
    notifyListeners();
  }

  LocationProvider();

  void updateLocation(Position position) {
    _currentPosition = position;
    notifyListeners();
  }
}