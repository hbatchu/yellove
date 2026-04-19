import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../models/user.dart';

final authServiceProvider = Provider((_) => AuthService());

class AuthState {
  final AppUser? user;
  final String? token;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => token != null;

  AuthState copyWith({
    AppUser? user,
    String? token,
    bool? isLoading,
    String? error,
    bool clearToken = false,
    bool clearError = false,
  }) =>
      AuthState(
        user: user ?? this.user,
        token: clearToken ? null : (token ?? this.token),
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _svc;

  AuthNotifier(this._svc) : super(const AuthState());

  Future<void> checkStoredToken() async {
    final token = await _svc.getToken();
    if (token != null) state = state.copyWith(token: token);
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final r = await _svc.login(email, password);
      state = AuthState(token: r.token, user: r.user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _msg(e));
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final r = await _svc.register(name, email, password);
      state = AuthState(token: r.token, user: r.user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _msg(e));
    }
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final r = await _svc.signInWithGoogle();
      state = AuthState(token: r.token, user: r.user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _msg(e));
    }
  }

  Future<void> logout() async {
    await _svc.clearSession();
    state = const AuthState();
  }

  String _msg(Object e) {
    final s = e.toString();
    if (s.contains('409')) return 'Email already registered.';
    if (s.contains('401')) return 'Invalid email or password.';
    if (s.contains('SocketException') || s.contains('connect')) {
      return 'Cannot connect to server.';
    }
    return 'Something went wrong. Please try again.';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(authServiceProvider)),
);
