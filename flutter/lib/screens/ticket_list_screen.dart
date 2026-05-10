import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../models/repair_ticket.dart';
import '../providers/auth_provider.dart';
import '../providers/ticket_provider.dart';

class TicketListScreen extends StatefulWidget {
  const TicketListScreen({super.key});

  @override
  State<TicketListScreen> createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }

  void _loadData() {
    final auth = context.read<AuthProvider>();
    final tickets = context.read<TicketProvider>();
    if (auth.user != null) {
      tickets.setUserId(auth.user!.id);
      tickets.loadTickets();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  List<RepairTicket> _filter(List<RepairTicket> list) {
    final q = _searchQuery.toLowerCase().trim();
    if (q.isEmpty) return list;
    return list.where((t) {
      return t.ticketNumber.toLowerCase().contains(q) ||
          t.customerName.toLowerCase().contains(q) ||
          t.customerPhone.contains(q) ||
          (t.productName?.toLowerCase().contains(q) ?? false) ||
          (t.modelName?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Phiếu sửa chữa'),
            if (auth.user?.fullName != null)
              Text(
                auth.user!.fullName,
                style: const TextStyle(fontSize: 12, color: Colors.white60),
              ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(92),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    cursorColor: Colors.white,
                    decoration: InputDecoration(
                      filled: false,
                      hintText: 'Tìm số phiếu, tên KH, điện thoại...',
                      hintStyle: const TextStyle(color: Colors.white54, fontSize: 13),
                      prefixIcon: const Icon(Icons.search, color: Colors.white60, size: 20),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close, color: Colors.white60, size: 18),
                              onPressed: () {
                                _searchCtrl.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onChanged: (v) => setState(() => _searchQuery = v),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Đang xử lý'),
                  Tab(text: 'Đã hoàn thành'),
                ],
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Làm mới',
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Đăng xuất',
            onPressed: () async {
              await context.read<AuthProvider>().logout();
              if (!mounted) return;
              // ignore: use_build_context_synchronously
              context.go('/login');
            },
          ),
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, provider, _) {
          if (provider.loading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 12),
                  Text('Đang tải...', style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }
          if (provider.error != null) {
            return Center(
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
                    const Text('Không thể kết nối',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    const SizedBox(height: 6),
                    Text(provider.error!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: provider.loadTickets,
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }

          final active = _filter(provider.activeTickets);
          final completed = _filter(provider.completedTickets);
          final urgentCount = provider.activeTickets.where((t) => t.isUrgent).length;

          return Column(
            children: [
              if (_searchQuery.isEmpty)
                _StatsBar(
                  activeCount: provider.activeTickets.length,
                  completedCount: provider.completedTickets.length,
                  urgentCount: urgentCount,
                ),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _TicketList(
                      tickets: active,
                      onRefresh: provider.loadTickets,
                      emptyMessage: _searchQuery.isEmpty ? 'Không có phiếu đang xử lý' : 'Không tìm thấy kết quả',
                    ),
                    _TicketList(
                      tickets: completed,
                      onRefresh: provider.loadTickets,
                      emptyMessage: _searchQuery.isEmpty ? 'Không có phiếu đã hoàn thành' : 'Không tìm thấy kết quả',
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _StatsBar extends StatelessWidget {
  const _StatsBar({required this.activeCount, required this.completedCount, required this.urgentCount});

  final int activeCount;
  final int completedCount;
  final int urgentCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        children: [
          _StatChip(label: 'Đang xử lý', value: activeCount, color: AppTheme.primary, icon: Icons.pending_actions_rounded),
          const SizedBox(width: 10),
          _StatChip(label: 'Hoàn thành', value: completedCount, color: const Color(0xFF2E7D32), icon: Icons.check_circle_outline_rounded),
          if (urgentCount > 0) ...[
            const SizedBox(width: 10),
            _StatChip(label: 'Gấp', value: urgentCount, color: Colors.red, icon: Icons.priority_high_rounded),
          ],
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value, required this.color, required this.icon});

  final String label;
  final int value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 5),
          Text('$value', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: color)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: color.withValues(alpha: 0.8))),
        ],
      ),
    );
  }
}

class _TicketList extends StatelessWidget {
  const _TicketList({required this.tickets, required this.onRefresh, required this.emptyMessage});

  final List<RepairTicket> tickets;
  final Future<void> Function() onRefresh;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    if (tickets.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(36),
              ),
              child: const Icon(Icons.inbox_rounded, size: 36, color: AppTheme.primary),
            ),
            const SizedBox(height: 14),
            Text(emptyMessage, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 15)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: AppTheme.primary,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 20),
        itemCount: tickets.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) => _TicketCard(ticket: tickets[index]),
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.ticket});

  final RepairTicket ticket;

  @override
  Widget build(BuildContext context) {
    final statusLabel = AppConstants.statusLabels[ticket.status] ?? ticket.status;
    final statusColor = AppConstants.statusColors[ticket.status] ?? Colors.grey;
    final dateStr = DateFormat('dd/MM/yyyy').format(ticket.receivedDate);
    final productStr = [ticket.productName, ticket.modelName]
        .where((s) => s != null && s.isNotEmpty)
        .join(' - ');

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => context.push('/tickets/${ticket.id}'),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(ticket.ticketNumber,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textPrimary)),
                  ),
                  if (ticket.isUrgent)
                    Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                      child: const Text('GẤP', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                    ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: statusColor.withValues(alpha: 0.4), width: 1),
                    ),
                    child: Text(statusLabel, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.person_outline_rounded, size: 15, color: AppTheme.textSecondary),
                  const SizedBox(width: 5),
                  Expanded(child: Text(ticket.customerName, style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary), overflow: TextOverflow.ellipsis)),
                  const Icon(Icons.phone_outlined, size: 15, color: AppTheme.textSecondary),
                  const SizedBox(width: 5),
                  Text(ticket.customerPhone, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                ],
              ),
              if (productStr.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.devices_other_outlined, size: 15, color: AppTheme.textSecondary),
                    const SizedBox(width: 5),
                    Expanded(child: Text(productStr, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary), overflow: TextOverflow.ellipsis)),
                  ],
                ),
              ],
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 13, color: AppTheme.textSecondary),
                  const SizedBox(width: 5),
                  Text('Tiếp nhận: $dateStr', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  const Spacer(),
                  const Icon(Icons.chevron_right_rounded, size: 18, color: AppTheme.textSecondary),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
