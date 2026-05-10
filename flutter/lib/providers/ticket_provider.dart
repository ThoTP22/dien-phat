import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../models/repair_ticket.dart';
import '../services/ticket_service.dart';

class TicketProvider extends ChangeNotifier {
  final _service = TicketService();

  List<RepairTicket> _activeTickets = [];
  List<RepairTicket> _completedTickets = [];
  bool _loading = false;
  String? _error;
  String? _userId;

  List<RepairTicket> get activeTickets => _activeTickets;
  List<RepairTicket> get completedTickets => _completedTickets;
  bool get loading => _loading;
  String? get error => _error;

  void setUserId(String id) {
    _userId = id;
  }

  Future<void> loadTickets() async {
    if (_userId == null) return;
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final all = await _service.getMyTickets(technicianId: _userId!);
      _activeTickets = all
          .where((t) => AppConstants.activeStatuses.contains(t.status))
          .toList();
      _completedTickets = all
          .where((t) => AppConstants.completedStatuses.contains(t.status))
          .toList();
    } catch (_) {
      _error = 'Không thể tải danh sách phiếu. Kiểm tra kết nối mạng.';
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> updateStatus(
    String id,
    String status, {
    String? note,
  }) async {
    try {
      final updated = await _service.updateStatus(id, status, internalNote: note);
      _replaceTicket(updated);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  void _replaceTicket(RepairTicket updated) {
    _activeTickets = _activeTickets.where((t) => t.id != updated.id).toList();
    _completedTickets =
        _completedTickets.where((t) => t.id != updated.id).toList();

    if (AppConstants.activeStatuses.contains(updated.status)) {
      _activeTickets.insert(0, updated);
    } else {
      _completedTickets.insert(0, updated);
    }
  }
}
