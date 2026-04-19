class ScanHistoryItem {
  final String id;
  final String barcode;
  final String productName;
  final String productBrand;
  final String? productImage;
  final double healthScore;
  final String grade;
  final String? source;
  final DateTime scannedAt;

  const ScanHistoryItem({
    required this.id,
    required this.barcode,
    required this.productName,
    required this.productBrand,
    this.productImage,
    required this.healthScore,
    required this.grade,
    this.source,
    required this.scannedAt,
  });

  factory ScanHistoryItem.fromJson(Map<String, dynamic> json) => ScanHistoryItem(
        id: json['id'] as String,
        barcode: json['barcode'] as String,
        productName: json['productName'] as String,
        productBrand: (json['productBrand'] as String?) ?? '',
        productImage: json['productImage'] as String?,
        healthScore: (json['healthScore'] as num).toDouble(),
        grade: json['grade'] as String,
        source: json['source'] as String?,
        scannedAt: DateTime.parse(json['scannedAt'] as String),
      );
}
