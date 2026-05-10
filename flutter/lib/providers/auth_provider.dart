import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final _authService = AuthService();

  AuthStatus _status = AuthStatus.unknown;
  AppUser? _user;
  String? _error;

  AuthStatus get status => _status;
  AppUser? get user => _user;
  String? get error => _error;

  Future<void> checkAuth() async {
    if (await _authService.hasToken()) {
      final user = await _authService.getMe();
      if (user != null) {
        _user = user;
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    try {
      final user = await _authService.login(email, password);
      if (user.role != 'technician' && user.role != 'admin') {
        _error = 'Tài khoản không có quyền truy cập ứng dụng KTV';
        await _authService.logout();
        notifyListeners();
        return false;
      }
      _user = user;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (_) {
      _error = 'Email hoặc mật khẩu không đúng';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
