import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/scan_history.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';

final historyProvider =
    FutureProvider.autoDispose<List<ScanHistoryItem>>((ref) async {
  final auth = ref.watch(authProvider);
  if (!auth.isAuthenticated) return [];
  final api = ref.read(apiServiceProvider);
  final data = await api.getHistory();
  return (data['items'] as List)
      .map((e) => ScanHistoryItem.fromJson(e as Map<String, dynamic>))
      .toList();
});
