import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';
import 'home_screen.dart';
import 'scanner_screen.dart';
import 'submit_product_screen.dart';

class ProductScreen extends ConsumerWidget {
  const ProductScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productProvider);

    if (state.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (state.error != null) {
      return _ErrorView(
        error: state.error!,
        barcode: state.lastBarcode,
        isNotFound: state.isNotFound,
        onRetry: () {
          ref.read(productProvider.notifier).reset();
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (_) => const ScannerScreen()),
              (r) => false);
        },
        onHome: () {
          ref.read(productProvider.notifier).reset();
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (_) => const HomeScreen()),
              (r) => false);
        },
      );
    }

    if (state.product == null) {
      return const Scaffold(body: Center(child: Text('No product data')));
    }

    return _ProductView(product: state.product!);
  }
}

// ── Product view ─────────────────────────────────────────────────────────────

class _ProductView extends StatelessWidget {
  final Product product;
  const _ProductView({required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildScoreCard(),
                  const SizedBox(height: 16),
                  _buildInsights(),
                  const SizedBox(height: 16),
                  _buildNutritionCard(),
                  const SizedBox(height: 16),
                  _buildIngredientsCard(),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const ScannerScreen()),
          (r) => false,
        ),
        backgroundColor: AppTheme.primary,
        icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
        label: Text('Scan Again',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: product.image != null ? 280 : 100,
      pinned: true,
      backgroundColor: AppTheme.primary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (_) => const HomeScreen()), (r) => false),
      ),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(product.name,
            style: GoogleFonts.poppins(
                color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
            maxLines: 2,
            overflow: TextOverflow.ellipsis),
        background: product.image != null
            ? Stack(fit: StackFit.expand, children: [
                CachedNetworkImage(
                  imageUrl: product.image!,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: Colors.grey[200]),
                  errorWidget: (_, __, ___) => Container(
                    color: Colors.grey[200],
                    child: const Icon(Icons.image_not_supported,
                        size: 60, color: Colors.grey),
                  ),
                ),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black54],
                    ),
                  ),
                ),
              ])
            : null,
      ),
    );
  }

  Widget _buildScoreCard() {
    final color = AppTheme.gradeColor(product.grade);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircularPercentIndicator(
              radius: 60,
              lineWidth: 10,
              percent: product.healthScore / 100,
              center: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('${product.healthScore}',
                      style: GoogleFonts.poppins(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: color)),
                  Text('/100',
                      style:
                          GoogleFonts.poppins(fontSize: 10, color: Colors.grey)),
                ],
              ),
              progressColor: color,
              backgroundColor: color.withValues(alpha: 0.15),
              circularStrokeCap: CircularStrokeCap.round,
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(spacing: 8, runSpacing: 6, children: [
                    _gradeBadge(product.grade, color),
                    if (product.nutriScore.isNotEmpty)
                      _nutriScoreBadge(product.nutriScore),
                  ]),
                  const SizedBox(height: 8),
                  if (product.brand.isNotEmpty)
                    Text(product.brand,
                        style: GoogleFonts.poppins(
                            color: Colors.grey[600], fontSize: 13)),
                  if (product.quantity.isNotEmpty)
                    Text(product.quantity,
                        style: GoogleFonts.poppins(
                            color: Colors.grey[500], fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _gradeBadge(String grade, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration:
            BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
        child: Text('Grade $grade',
            style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      );

  Widget _nutriScoreBadge(String nutriScore) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[400]!),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text('Nutri-Score $nutriScore',
            style:
                GoogleFonts.poppins(fontSize: 11, color: Colors.grey[700])),
      );

  Widget _buildInsights() {
    if (product.insights.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Health Insights',
            style:
                GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        ...product.insights.map((insight) {
          final isPositive = insight.startsWith('Good source');
          return Container(
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isPositive ? Colors.green[50] : Colors.red[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: isPositive ? Colors.green[200]! : Colors.red[200]!),
            ),
            child: Row(
              children: [
                Icon(
                  isPositive
                      ? Icons.check_circle_outline
                      : Icons.warning_amber_outlined,
                  color:
                      isPositive ? Colors.green[700] : Colors.red[700],
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(insight,
                        style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: isPositive
                                ? Colors.green[800]
                                : Colors.red[800]))),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNutritionCard() {
    final n = product.nutrition;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Nutrition per 100g',
                style: GoogleFonts.poppins(
                    fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  mainAxisExtent: 52),
              itemCount: 8,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemBuilder: (context, i) {
                final tiles = [
                  _nutriTile('Calories', '${n.calories.round()} kcal', Colors.orange),
                  _nutriTile('Fat', '${n.fat}g', Colors.red[300]!),
                  _nutriTile('Saturated Fat', '${n.saturatedFat}g', Colors.red[500]!),
                  _nutriTile('Carbs', '${n.carbs}g', Colors.amber[700]!),
                  _nutriTile('Sugar', '${n.sugar}g', Colors.pink[300]!),
                  _nutriTile('Fiber', '${n.fiber}g', Colors.green[600]!),
                  _nutriTile('Protein', '${n.protein}g', Colors.blue[400]!),
                  _nutriTile('Sodium', '${n.sodium}g', Colors.purple[300]!),
                ];
                return tiles[i];
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _nutriTile(String label, String value, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 28,
              decoration: BoxDecoration(
                  color: color, borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(label,
                      style: GoogleFonts.poppins(
                          fontSize: 10, color: Colors.grey[600])),
                  Text(value,
                      style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800])),
                ],
              ),
            ),
          ],
        ),
      );

  Widget _buildIngredientsCard() {
    if (product.ingredients.isEmpty) return const SizedBox.shrink();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Ingredients',
                style: GoogleFonts.poppins(
                    fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(product.ingredients,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: Colors.grey[700], height: 1.6)),
          ],
        ),
      ),
    );
  }
}

// ── Error view ────────────────────────────────────────────────────────────────

class _ErrorView extends StatelessWidget {
  final String error;
  final String? barcode;
  final bool isNotFound;
  final VoidCallback onRetry;
  final VoidCallback onHome;

  const _ErrorView({
    required this.error,
    required this.barcode,
    required this.isNotFound,
    required this.onRetry,
    required this.onHome,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isNotFound ? Icons.search_off : Icons.error_outline,
                size: 72,
                color: isNotFound ? Colors.orange : Colors.red,
              ),
              const SizedBox(height: 16),
              Text(isNotFound ? 'Product Not Found' : 'Oops!',
                  style: GoogleFonts.poppins(
                      fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(error,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(color: Colors.grey[600])),
              const SizedBox(height: 32),
              if (isNotFound && barcode != null)
                ElevatedButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) =>
                            SubmitProductScreen(barcode: barcode!)),
                  ),
                  icon: const Icon(Icons.add_circle_outline),
                  label: const Text('Add This Product'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary),
                ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Try Again'),
              ),
              const SizedBox(height: 12),
              TextButton.icon(
                onPressed: onHome,
                icon: const Icon(Icons.home),
                label: const Text('Back to Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
