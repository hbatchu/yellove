import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../core/constants.dart';
import '../models/user.dart';

class AuthService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';

  final _googleSignIn = GoogleSignIn(
    serverClientId: AppConstants.googleWebClientId,
  );

  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<void> _saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<void> clearSession() => _storage.delete(key: _tokenKey);

  Future<({String token, AppUser user})> login(
      String email, String password) async {
    final res = await _dio
        .post('/auth/login', data: {'email': email, 'password': password});
    final token = res.data['token'] as String;
    final user =
        AppUser.fromJson(res.data['user'] as Map<String, dynamic>);
    await _saveToken(token);
    return (token: token, user: user);
  }

  Future<({String token, AppUser user})> register(
      String name, String email, String password) async {
    final res = await _dio.post('/auth/register',
        data: {'name': name, 'email': email, 'password': password});
    final token = res.data['token'] as String;
    final user =
        AppUser.fromJson(res.data['user'] as Map<String, dynamic>);
    await _saveToken(token);
    return (token: token, user: user);
  }

  Future<({String token, AppUser user})> signInWithGoogle() async {
    final account = await _googleSignIn.signIn();
    if (account == null) throw Exception('Google sign-in cancelled');

    final auth = await account.authentication;
    final idToken = auth.idToken;
    if (idToken == null) throw Exception('Failed to get Google ID token');

    final res = await _dio.post('/auth/google', data: {'idToken': idToken});
    final token = res.data['token'] as String;
    final user = AppUser.fromJson(res.data['user'] as Map<String, dynamic>);
    await _saveToken(token);
    return (token: token, user: user);
  }
}
