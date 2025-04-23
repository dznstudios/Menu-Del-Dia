import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:menu_del_dia/models/restaurant.dart';
import 'package:menu_del_dia/services/firestore_service.dart';

class RestaurantForm extends StatefulWidget {
  final Restaurant? restaurant;

  const RestaurantForm({super.key, this.restaurant});

  @override
  _RestaurantFormState createState() => _RestaurantFormState();
}

class _RestaurantFormState extends State<RestaurantForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  List<String> _tags = [];

  @override
  void initState() {
    super.initState();
    if (widget.restaurant != null) {
      _nameController.text = widget.restaurant!.name;
      _addressController.text = widget.restaurant!.address;
      _latitudeController.text = widget.restaurant!.latitude.toString();
      _longitudeController.text = widget.restaurant!.longitude.toString();
      _tags = widget.restaurant!.tags ?? [];
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    super.dispose();
  }

  Future<void> _saveRestaurant() async {
    if (_formKey.currentState!.validate()) {
      final name = _nameController.text;
      final address = _addressController.text;
      final latitude = double.tryParse(_latitudeController.text) ?? 0.0;
      final longitude = double.tryParse(_longitudeController.text) ?? 0.0;

      final restaurant = Restaurant(
        id: widget.restaurant?.id ?? '', // Will be auto-generated if empty
        name: name,
        address: address,
        latitude: latitude,
        longitude: longitude,
        ownerId: FirebaseAuth.instance.currentUser?.uid ?? '',
        tags: _tags,
      );

      try {
        if (widget.restaurant == null) {
          await FirestoreService().addRestaurant(restaurant);
        } else {
          await FirestoreService().updateRestaurant(restaurant);
        }
        Navigator.pop(context); // Return to OwnerScreen
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving restaurant: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.restaurant == null ? 'Add Restaurant' : 'Edit Restaurant'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (value) => value == null || value.isEmpty ? 'Please enter a name' : null,
              ),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(labelText: 'Address'),
                validator: (value) => value == null || value.isEmpty ? 'Please enter an address' : null,
              ),
              TextFormField(
                controller: _latitudeController,
                decoration: const InputDecoration(labelText: 'Latitude'),
                keyboardType: TextInputType.number,
                validator: (value) => value == null || value.isEmpty ? 'Please enter latitude' : null,
              ),
              TextFormField(
                controller: _longitudeController,
                decoration: const InputDecoration(labelText: 'Longitude'),
                keyboardType: TextInputType.number,
                validator: (value) => value == null || value.isEmpty ? 'Please enter longitude' : null,
              ),
              Wrap(
                children: _tags.map((tag) => Chip(label: Text(tag))).toList(),
              ),
              // Add tag input and add button here (implementation omitted for brevity)
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  ElevatedButton(
                    onPressed: _saveRestaurant,
                    child: const Text('Save'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}