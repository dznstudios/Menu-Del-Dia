import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:menu_del_dia/screens/welcome_screen.dart';
import 'package:menu_del_dia/screens/login_screen.dart';
import 'package:menu_del_dia/location_handler.dart';
import 'package:menu_del_dia/screens/main_screen.dart';
import 'package:menu_del_dia/screens/restaurant_details_screen.dart';
import 'package:menu_del_dia/screens/register_screen.dart';
import 'package:menu_del_dia/screens/user_profile_screen.dart';
import 'package:menu_del_dia/screens/owner_screen.dart';
import 'package:menu_del_dia/screens/restaurant_form_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:menu_del_dia/screens/splash_screen.dart';
import 'package:menu_del_dia/screens/map_view_screen.dart';
import 'package:menu_del_dia/screens/menu_form_screen.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:menu_del_dia/screens/forgot_password_screen.dart';

import 'services/location_provider.dart';
import 'models/user.dart';
import 'models/restaurant.dart';
import 'l10n/app_localizations.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // print("Handling a background message: ${message.messageId}");
  // print("Message data: ${message.data}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Set the background message handler
  FirebaseMessaging.onBackgroundMessage(
      _firebaseMessagingBackgroundHandler);

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  _MyAppState();
  final List<Locale> _supportedLocales = const [Locale('en'), Locale('es')];
  final Locale _locale = const Locale('es');
  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    @override
    void initState() {
      super.initState();
      _setupPushNotifications();
    }

    Future<void> _setupPushNotifications() async {
      final messaging = FirebaseMessaging.instance;

      await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      // Initialize local notifications
      const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
      final InitializationSettings initializationSettings = InitializationSettings(android: initializationSettingsAndroid);
      await _flutterLocalNotificationsPlugin.initialize(initializationSettings);

      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        final notification = message.notification;
        final android = message.notification?.android;
        if (notification != null && android != null) {
          _flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                'default_channel',
                'Default',
                channelDescription: 'Default channel',
                importance: Importance.max,
                priority: Priority.high,
              ),
            ),
          );
        }
      });

      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {});

      FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {});
    }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocationProvider()),
      ],
      child: MaterialApp(
        title: 'MenuDelDia',
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/welcome': (context) => const WelcomeScreen(),
          '/login': (context) => LoginScreen(),
          '/register': (context) => RegisterScreen(),
          '/location': (context) => const LocationHandler(),
          '/main': (context) => const MainScreen(),
          '/profile': (context) => UserProfileScreen(
            user: UserModel(
              uid: FirebaseAuth.instance.currentUser?.uid ?? '',
              email: FirebaseAuth.instance.currentUser?.email ?? '',
              name: '',
            ),
          ),
          '/owner': (context) => const OwnerScreen(),
          '/restaurant_form': (context) => RestaurantForm(
            restaurant: ModalRoute.of(context)?.settings.arguments as Restaurant?,
          ),
          '/menu_form': (context) => MenuFormScreen(
            restaurantId: ModalRoute.of(context)!.settings.arguments as String,
          ),
          '/restaurant_details': (context) => RestaurantDetailsScreen(
            restaurant: ModalRoute.of(context)!.settings.arguments as Restaurant,
          ),
          '/map': (context) => const MapViewScreen(),
          '/forgot_password': (context) => const ForgotPasswordScreen(),
        },
        supportedLocales: _supportedLocales,
        locale: _locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        localeResolutionCallback: (locale, supportedLocales) {
          return locale;
        },
      ),
    );
  }
}
