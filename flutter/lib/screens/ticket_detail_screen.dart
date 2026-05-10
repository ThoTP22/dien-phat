import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../models/repair_ticket.dart';
import '../providers/ticket_provider.dart';
import '../services/ticket_service.dart';
import '../widgets/ticket_image_section.dart';

class TicketDetailScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailScreen({super.key, required this.ticketId});

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final _service = TicketService();
  RepairTicket? _ticket;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final t = await _service.getById(widget.ticketId);
      setState(() {
        _ticket = t;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Không thể tải phiếu. Kiểm tra kết nối mạng.';
        _loading = false;
      });
    }
  }

  Future<void> _callCustomer(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _updateImages(String field, List<String> urls) async {
    if (_ticket == null) return;
    try {
      final updated = await _service.updateTicketImages(
          _ticket!.id, field, urls);
      setState(() => _ticket = updated);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật ảnh thành công')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật ảnh thất bại')),
        );
      }
    }
  }

  Future<void> _showUpdateStatusDialog() async {
    if (_ticket == null) return;
    String selectedStatus = _ticket!.status;
    final noteCtrl = TextEditingController(text: _ticket!.internalNote ?? '');

    await showDialog<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Cập nhật trạng thái'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Chọn trạng thái mới:',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: AppConstants.ktvAllowedStatuses.contains(selectedStatus)
                    ? selectedStatus
                    : AppConstants.ktvAllowedStatuses.first,
                items: AppConstants.ktvAllowedStatuses
                    .map(
                      (s) => DropdownMenuItem(
                        value: s,
                        child: Text(AppConstants.statusLabels[s] ?? s),
                      ),
                    )
                    .toList(),
                onChanged: (v) =>
                    setDialogState(() => selectedStatus = v ?? selectedStatus),
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: noteCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Ghi chú nội bộ (tùy chọn)',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Huỷ'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                final provider = context.read<TicketProvider>();
                final ok = await provider.updateStatus(
                  widget.ticketId,
                  selectedStatus,
                  note: noteCtrl.text,
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        ok ? 'Cập nhật thành công' : 'Cập nhật thất bại',
                      ),
                      backgroundColor: ok ? Colors.green : Colors.red,
                    ),
                  );
                  if (ok) _load();
                }
              },
              child: const Text('Cập nhật'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: AppTheme.surface,
        appBar: AppBar(title: const Text('Chi tiết phiếu')),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 12),
              Text('Đang tải...', style: TextStyle(color: AppTheme.textSecondary)),
            ],
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: AppTheme.surface,
        appBar: AppBar(title: const Text('Chi tiết phiếu')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(36),
                  ),
                  child: const Icon(Icons.wifi_off_rounded, size: 36, color: Colors.red),
                ),
                const SizedBox(height: 16),
                Text(_error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh, size: 18),
                  label: const Text('Thử lại'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final t = _ticket!;
    final statusLabel = AppConstants.statusLabels[t.status] ?? t.status;
    final statusColor = AppConstants.statusColors[t.status] ?? Colors.grey;
    final isCompleted = AppConstants.completedStatuses.contains(t.status);
    final df = DateFormat('dd/MM/yyyy');
    final dtf = DateFormat('dd/MM/yyyy HH:mm');
    final currencyFmt = NumberFormat.currency(
      locale: 'vi',
      symbol: 'đ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text(t.ticketNumber),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _load,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.08),
                border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    statusLabel,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const Spacer(),
                  if (t.isUrgent)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.priority_high_rounded, color: Colors.white, size: 14),
                          SizedBox(width: 3),
                          Text('GẤP', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Thông tin khách hàng
            _SectionCard(
              title: 'Thông tin khách hàng',
              icon: Icons.person_outline_rounded,
              children: [
                _InfoRow(label: 'Khách hàng', value: t.customerName),
                _InfoRow(
                  label: 'Điện thoại',
                  value: t.customerPhone,
                  trailing: IconButton(
                    icon: const Icon(Icons.phone_rounded,
                        color: AppTheme.primary, size: 20),
                    tooltip: 'Gọi điện',
                    onPressed: () => _callCustomer(t.customerPhone),
                  ),
                ),
                if (t.customerAddress != null && t.customerAddress!.isNotEmpty)
                  _InfoRow(label: 'Địa chỉ', value: t.customerAddress!),
                if (t.area != null && t.area!.isNotEmpty)
                  _InfoRow(label: 'Khu vực', value: t.area!),
              ],
            ),
            const SizedBox(height: 12),

            // Thông tin sản phẩm
            _SectionCard(
              title: 'Thông tin sản phẩm',
              icon: Icons.devices_other_outlined,
              children: [
                if (t.productName != null && t.productName!.isNotEmpty)
                  _InfoRow(label: 'Sản phẩm', value: t.productName!),
                if (t.manufacturer != null && t.manufacturer!.isNotEmpty)
                  _InfoRow(label: 'Hãng', value: t.manufacturer!),
                if (t.modelName != null && t.modelName!.isNotEmpty)
                  _InfoRow(label: 'Model', value: t.modelName!),
                if (t.serialNumber != null && t.serialNumber!.isNotEmpty)
                  _InfoRow(label: 'Serial', value: t.serialNumber!),
                _InfoRow(
                  label: 'Loại dịch vụ',
                  value: AppConstants.serviceTypeLabels[t.serviceType] ??
                      t.serviceType,
                ),
                _InfoRow(
                  label: 'Hình thức',
                  value:
                      AppConstants.serviceLocationLabels[t.serviceLocation] ??
                          t.serviceLocation,
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Mô tả lỗi + ghi chú
            _SectionCard(
              title: 'Mô tả lỗi & ghi chú',
              icon: Icons.description_outlined,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    t.faultDescription,
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                if (t.note != null && t.note!.isNotEmpty) ...[
                  const Divider(height: 16),
                  _InfoRow(label: 'Ghi chú KH', value: t.note!),
                ],
                if (t.internalNote != null && t.internalNote!.isNotEmpty) ...[
                  const Divider(height: 16),
                  _InfoRow(label: 'Ghi chú nội bộ', value: t.internalNote!),
                ],
              ],
            ),
            const SizedBox(height: 12),

            // Ảnh tiếp nhận
            _SectionCard(
              title: 'Ảnh tiếp nhận',
              icon: Icons.photo_camera_outlined,
              children: [
                TicketImageSection(
                  label: 'Ảnh tiếp nhận',
                  imageUrls: t.intakeImages,
                  readOnly: isCompleted,
                  onChanged: (urls) => _updateImages('intakeImages', urls),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Ảnh lỗi / hỏng
            _SectionCard(
              title: 'Ảnh lỗi / hỏng',
              icon: Icons.broken_image_outlined,
              children: [
                TicketImageSection(
                  label: 'Ảnh lỗi',
                  imageUrls: t.faultImages,
                  readOnly: isCompleted,
                  onChanged: (urls) => _updateImages('faultImages', urls),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Ảnh hoàn thành
            _SectionCard(
              title: 'Ảnh hoàn thành',
              icon: Icons.check_circle_outline_rounded,
              children: [
                TicketImageSection(
                  label: 'Ảnh hoàn thành',
                  imageUrls: t.completedImages,
                  readOnly: isCompleted,
                  onChanged: (urls) => _updateImages('completedImages', urls),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Thông tin phiếu
            _SectionCard(
              title: 'Thông tin phiếu',
              icon: Icons.receipt_long_outlined,
              children: [
                _InfoRow(
                  label: 'Tiếp nhận',
                  value: dtf.format(t.receivedDate),
                ),
                if (t.appointmentDate != null)
                  _InfoRow(
                    label: 'Ngày hẹn',
                    value: df.format(t.appointmentDate!),
                  ),
                if (t.completedDate != null)
                  _InfoRow(
                    label: 'Hoàn thành',
                    value: df.format(t.completedDate!),
                  ),
                if (t.quotedPrice != null)
                  _InfoRow(
                    label: 'Báo giá',
                    value: currencyFmt.format(t.quotedPrice),
                  ),
              ],
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: isCompleted
          ? null
          : Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppTheme.divider)),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                  child: ElevatedButton.icon(
                    onPressed: _showUpdateStatusDialog,
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    label: const Text(
                      'Cập nhật trạng thái',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(48),
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children, this.icon});

  final String title;
  final List<Widget> children;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (icon != null) ...[  
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Icon(icon, size: 16, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 8),
                ],
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppTheme.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(height: 1, color: AppTheme.divider),
            const SizedBox(height: 10),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.trailing,
  });

  final String label;
  final String value;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 115,
            child: Text(
              label,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary)),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
