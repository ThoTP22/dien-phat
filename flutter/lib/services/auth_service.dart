import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../models/user.dart';

class AuthService {
  final _api = ApiClient();

  Future<AppUser> login(String email, String password) async {
    final resp = await _api.dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final data = resp.data['data'] as Map<String, dynamic>;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', data['accessToken'].toString());
    return AppUser.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<AppUser?> getMe() async {
    try {
      final resp = await _api.dio.get('/auth/me');
      return AppUser.fromJson(resp.data['data'] as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
  }

  Future<bool> hasToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token') != null;
  }
}
