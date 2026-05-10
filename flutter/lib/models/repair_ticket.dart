class RepairTicket {
  final String id;
  final String ticketNumber;
  final String? ticketRefNumber;
  final String status;
  final String serviceType;
  final String serviceLocation;
  final bool isUrgent;

  // Sản phẩm
  final String? productName;
  final String? manufacturer;
  final String? modelName;
  final String? serialNumber;
  final String faultDescription;

  // Khách hàng
  final String customerName;
  final String customerPhone;
  final String? customerAddress;
  final String? area;

  // Thông tin phiếu
  final double? quotedPrice;
  final String? note;
  final String? internalNote;

  final DateTime receivedDate;
  final DateTime? appointmentDate;
  final DateTime? completedDate;

  final List<String> intakeImages;
  final List<String> faultImages;
  final List<String> completedImages;

  RepairTicket({
    required this.id,
    required this.ticketNumber,
    this.ticketRefNumber,
    required this.status,
    required this.serviceType,
    required this.serviceLocation,
    required this.isUrgent,
    this.productName,
    this.manufacturer,
    this.modelName,
    this.serialNumber,
    required this.faultDescription,
    required this.customerName,
    required this.customerPhone,
    this.customerAddress,
    this.area,
    this.quotedPrice,
    this.note,
    this.internalNote,
    required this.receivedDate,
    this.appointmentDate,
    this.completedDate,
    this.intakeImages = const [],
    this.faultImages = const [],
    this.completedImages = const [],
  });

  factory RepairTicket.fromJson(Map<String, dynamic> json) {
    return RepairTicket(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      ticketNumber: json['ticketNumber']?.toString() ?? '',
      ticketRefNumber: json['ticketRefNumber']?.toString(),
      status: json['status']?.toString() ?? 'new',
      serviceType: json['serviceType']?.toString() ?? 'service',
      serviceLocation: json['serviceLocation']?.toString() ?? 'at_station',
      isUrgent: json['isUrgent'] == true,
      productName: json['productName']?.toString(),
      manufacturer: json['manufacturer']?.toString(),
      modelName: json['modelName']?.toString(),
      serialNumber: json['serialNumber']?.toString(),
      faultDescription: json['faultDescription']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? '',
      customerPhone: json['customerPhone']?.toString() ?? '',
      customerAddress: json['customerAddress']?.toString(),
      area: json['area']?.toString(),
      quotedPrice: (json['quotedPrice'] as num?)?.toDouble(),
      note: json['note']?.toString(),
      internalNote: json['internalNote']?.toString(),
      receivedDate:
          DateTime.tryParse(json['receivedDate']?.toString() ?? '') ??
              DateTime.now(),
      appointmentDate: json['appointmentDate'] != null
          ? DateTime.tryParse(json['appointmentDate'].toString())
          : null,
      completedDate: json['completedDate'] != null
          ? DateTime.tryParse(json['completedDate'].toString())
          : null,
      intakeImages: List<String>.from(json['intakeImages'] ?? []),
      faultImages: List<String>.from(json['faultImages'] ?? []),
      completedImages: List<String>.from(json['completedImages'] ?? []),
    );
  }
}
