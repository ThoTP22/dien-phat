import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:4000/api/v1';

  static const Map<String, String> statusLabels = {
    'new': 'Tiếp nhận mới',
    'assigned': 'Đã phân công',
    'quoted': 'Đã báo giá',
    'pending_confirm': 'Chờ xác nhận',
    'waiting_parts': 'Chờ linh kiện',
    'parts_ready': 'Có linh kiện',
    'customer_rejected': 'KH từ chối',
    'returned': 'Đã trả máy',
    'repaired': 'Đã sửa xong',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã huỷ',
    'outsourced': 'Giao ra ngoài',
  };

  static const Map<String, Color> statusColors = {
    'new': Color(0xFF2196F3),
    'assigned': Color(0xFF9C27B0),
    'quoted': Color(0xFFFF9800),
    'pending_confirm': Color(0xFFFF5722),
    'waiting_parts': Color(0xFF795548),
    'parts_ready': Color(0xFF009688),
    'customer_rejected': Color(0xFFF44336),
    'returned': Color(0xFF607D8B),
    'repaired': Color(0xFF4CAF50),
    'delivered': Color(0xFF388E3C),
    'cancelled': Color(0xFF9E9E9E),
    'outsourced': Color(0xFFFF9800),
  };

  static const Map<String, String> serviceTypeLabels = {
    'warranty': 'Bảo hành',
    'warranty_repair': 'Bảo hành có sửa chữa',
    'service': 'Dịch vụ',
  };

  static const Map<String, String> serviceLocationLabels = {
    'at_station': 'Tại cửa hàng',
    'at_home': 'Tại nhà khách hàng',
  };

  // Các trạng thái KTV được phép chuyển đến
  static const List<String> ktvAllowedStatuses = [
    'assigned',
    'quoted',
    'pending_confirm',
    'waiting_parts',
    'parts_ready',
    'repaired',
    'delivered',
  ];

  // Trạng thái đang xử lý (tab 1)
  static const List<String> activeStatuses = [
    'new',
    'assigned',
    'quoted',
    'pending_confirm',
    'waiting_parts',
    'parts_ready',
    'outsourced',
  ];

  // Trạng thái hoàn thành (tab 2)
  static const List<String> completedStatuses = [
    'repaired',
    'delivered',
    'returned',
    'customer_rejected',
    'cancelled',
  ];
}
