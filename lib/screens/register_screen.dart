import 'package:flutter/material.dart';
import 'package:menu_del_dia/services/auth_service.dart'; // Adjust import path as needed

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await AuthService().createUserWithEmailAndPassword(
                    _emailController.text,
                    _passwordController.text,
                  );
                  if (mounted) {
                    // Navigate to main screen after successful registration
                    Navigator.pushReplacementNamed(context, '/main');
                  } else {
                    return;
                  }
                } catch (e) {
                  // Show error message in a snackbar
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Registration failed: $e')),
                    );
                  }
                }
              },
              child: const Text('Register'),),
          ],
        ),
      ),
    );
  }
}