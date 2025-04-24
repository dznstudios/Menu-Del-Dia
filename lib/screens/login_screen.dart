import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
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
                final navigator = Navigator.of(context);
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                try {                  
                  await AuthService().signInWithEmailAndPassword(_emailController.text, _passwordController.text);                  
                  if (!mounted) return;                  
                  navigator.pushReplacementNamed('/main');                
                } catch (e) {                  
                  if (!mounted) return;                  
                  scaffoldMessenger.showSnackBar(SnackBar(content: Text('Failed to sign in: $e')));                
                }              
              },
              child: const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}