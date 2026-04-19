import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../models/scan_history.dart';
import '../providers/history_provider.dart';
import '../providers/product_provider.dart';
import 'product_screen.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(historyProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Scan History',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: AppTheme.primary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: history.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text('Failed to load history',
              style: GoogleFonts.poppins(color: Colors.grey)),
        ),
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.history, size: 72, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('No scans yet',
                      style: GoogleFonts.poppins(
                          fontSize: 18, color: Colors.grey[600])),
                  const SizedBox(height: 8),
                  Text('Your scanned products will appear here',
                      style: GoogleFonts.poppins(color: Colors.grey)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(historyProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) => _HistoryTile(
                item: items[i],
                onTap: () async {
                  await ref
                      .read(productProvider.notifier)
                      .fetch(items[i].barcode);
                  if (!ctx.mounted) return;
                  Navigator.push(ctx,
                      MaterialPageRoute(builder: (_) => const ProductScreen()));
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  final ScanHistoryItem item;
  final VoidCallback onTap;

  const _HistoryTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.gradeColor(item.grade);
    return Card(
      child: ListTile(
        onTap: onTap,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: item.productImage != null && item.productImage!.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: item.productImage!,
                  width: 52,
                  height: 52,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => _placeholder(),
                )
              : _placeholder(),
        ),
        title: Text(item.productName,
            style: GoogleFonts.poppins(
                fontWeight: FontWeight.w600, fontSize: 14),
            maxLines: 1,
            overflow: TextOverflow.ellipsis),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (item.productBrand.isNotEmpty)
              Text(item.productBrand,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: Colors.grey[600])),
            Text(
              _formatDate(item.scannedAt),
              style:
                  GoogleFonts.poppins(fontSize: 11, color: Colors.grey[500]),
            ),
          ],
        ),
        trailing: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(item.grade,
              style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14)),
        ),
      ),
    );
  }

  Widget _placeholder() => Container(
        width: 52,
        height: 52,
        color: Colors.grey[200],
        child: const Icon(Icons.fastfood, color: Colors.grey),
      );

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
