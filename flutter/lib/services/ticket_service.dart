import '../core/api_client.dart';
import '../models/repair_ticket.dart';

class TicketService {
  final _api = ApiClient();

  Future<List<RepairTicket>> getMyTickets({required String technicianId}) async {
    final resp = await _api.dio.get(
      '/admin/repair-tickets',
      queryParameters: {
        'technicianId': technicianId,
        'limit': 100,
      },
    );
    final items = (resp.data['data']?['items'] as List?) ?? [];
    return items
        .map((e) => RepairTicket.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<RepairTicket> getById(String id) async {
    final resp = await _api.dio.get('/admin/repair-tickets/$id');
    return RepairTicket.fromJson(
        resp.data['data'] as Map<String, dynamic>);
  }

  Future<RepairTicket> updateStatus(
    String id,
    String status, {
    String? internalNote,
  }) async {
    final body = <String, dynamic>{'status': status};
    if (internalNote != null && internalNote.isNotEmpty) {
      body['internalNote'] = internalNote;
    }
    final resp = await _api.dio.put('/admin/repair-tickets/$id', data: body);
    return RepairTicket.fromJson(
        resp.data['data'] as Map<String, dynamic>);
  }

  /// Cập nhật một nhóm ảnh cho phiếu (intakeImages / faultImages / completedImages)
  Future<RepairTicket> updateTicketImages(
    String id,
    String field,
    List<String> urls,
  ) async {
    final body = {field: urls};
    final resp = await _api.dio.put('/admin/repair-tickets/$id', data: body);
    return RepairTicket.fromJson(
        resp.data['data'] as Map<String, dynamic>);
  }
}
