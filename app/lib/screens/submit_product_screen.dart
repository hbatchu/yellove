import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../core/theme.dart';
import '../models/analysis_result.dart';
import '../providers/product_provider.dart';

enum _Step { photoCapture, analyzing, form }

class SubmitProductScreen extends ConsumerStatefulWidget {
  final String barcode;
  const SubmitProductScreen({super.key, required this.barcode});

  @override
  ConsumerState<SubmitProductScreen> createState() => _SubmitProductScreenState();
}

class _SubmitProductScreenState extends ConsumerState<SubmitProductScreen> {
  _Step _step = _Step.photoCapture;

  File? _frontImage;
  File? _backImage;
  AnalysisResult? _analysis;

  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _brandCtrl = TextEditingController();
  final _ingredientsCtrl = TextEditingController();
  final _caloriesCtrl = TextEditingController();
  final _fatCtrl = TextEditingController();
  final _carbsCtrl = TextEditingController();
  final _sugarCtrl = TextEditingController();
  final _fiberCtrl = TextEditingController();
  final _proteinCtrl = TextEditingController();
  final _sodiumCtrl = TextEditingController();

  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [
      _nameCtrl, _brandCtrl, _ingredientsCtrl,
      _caloriesCtrl, _fatCtrl, _carbsCtrl,
      _sugarCtrl, _fiberCtrl, _proteinCtrl, _sodiumCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickImage(bool isFront, ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: source, imageQuality: 85, maxWidth: 1200,
    );
    if (picked == null) return;
    setState(() {
      if (isFront) {
        _frontImage = File(picked.path);
      } else {
        _backImage = File(picked.path);
      }
    });
  }

  void _showImageOptions(bool isFront) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppTheme.primary),
              title: Text('Take Photo', style: GoogleFonts.poppins()),
              onTap: () { Navigator.pop(context); _pickImage(isFront, ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppTheme.primary),
              title: Text('Choose from Gallery', style: GoogleFonts.poppins()),
              onTap: () { Navigator.pop(context); _pickImage(isFront, ImageSource.gallery); },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _analyzePhotos() async {
    if (_frontImage == null) return;
    setState(() => _step = _Step.analyzing);

    try {
      final api = ref.read(apiServiceProvider);
      final result = await api.analyzeProduct(
        frontImagePath: _frontImage!.path,
        backImagePath: _backImage?.path,
      );
      _populateForm(result);
      setState(() {
        _analysis = result;
        _step = _Step.form;
      });
    } catch (e) {
      // ignore: avoid_print
      print('ANALYZE ERROR: $e');
      setState(() => _step = _Step.form);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not analyze image: $e',
                style: GoogleFonts.poppins(fontSize: 12)),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 8),
          ),
        );
      }
    }
  }

  void _populateForm(AnalysisResult r) {
    if (r.name != null) _nameCtrl.text = r.name!;
    if (r.brand != null) _brandCtrl.text = r.brand!;
    if (r.ingredients != null) _ingredientsCtrl.text = r.ingredients!;
    final n = r.nutrition;
    if (n.calories != null) _caloriesCtrl.text = n.calories!.toStringAsFixed(1);
    if (n.fat != null) _fatCtrl.text = n.fat!.toStringAsFixed(1);
    if (n.carbs != null) _carbsCtrl.text = n.carbs!.toStringAsFixed(1);
    if (n.sugar != null) _sugarCtrl.text = n.sugar!.toStringAsFixed(1);
    if (n.fiber != null) _fiberCtrl.text = n.fiber!.toStringAsFixed(1);
    if (n.protein != null) _proteinCtrl.text = n.protein!.toStringAsFixed(1);
    if (n.sodium != null) _sodiumCtrl.text = n.sodium!.toStringAsFixed(2);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _submitting = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      await api.submitCommunityProduct(
        barcode: widget.barcode,
        name: _nameCtrl.text.trim(),
        brand: _brandCtrl.text.trim().isEmpty ? null : _brandCtrl.text.trim(),
        ingredients: _ingredientsCtrl.text.trim().isEmpty ? null : _ingredientsCtrl.text.trim(),
        nutrition: {
          'calories': double.tryParse(_caloriesCtrl.text) ?? 0,
          'fat': double.tryParse(_fatCtrl.text) ?? 0,
          'carbs': double.tryParse(_carbsCtrl.text) ?? 0,
          'sugar': double.tryParse(_sugarCtrl.text) ?? 0,
          'fiber': double.tryParse(_fiberCtrl.text) ?? 0,
          'protein': double.tryParse(_proteinCtrl.text) ?? 0,
          'sodium': double.tryParse(_sodiumCtrl.text) ?? 0,
        },
        imagePath: _frontImage?.path,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Product submitted! Thank you for contributing.'),
          backgroundColor: AppTheme.primary,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      setState(() => _error = 'Submission failed. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  // ─── Grade helpers ────────────────────────────────────────────────────────

  Color _gradeColor(String grade) => switch (grade) {
    'A' => const Color(0xFF2E7D32),
    'B' => const Color(0xFF558B2F),
    'C' => const Color(0xFFF9A825),
    'D' => const Color(0xFFE65100),
    _ => const Color(0xFFB71C1C),
  };

  // ─── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _step == _Step.analyzing ? 'Analyzing…' : 'Add Product',
          style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        backgroundColor: AppTheme.primary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: switch (_step) {
        _Step.photoCapture => _buildPhotoCapture(),
        _Step.analyzing => _buildAnalyzing(),
        _Step.form => _buildForm(),
      },
    );
  }

  // ─── Step 1: Photo Capture ─────────────────────────────────────────────────

  Widget _buildPhotoCapture() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _barcodeChip(),
        const SizedBox(height: 16),
        Text('Photograph the product',
            style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text('Front + back label gives the best results.',
            style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[600])),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _photoCard('Front', _frontImage, true, required: true)),
            const SizedBox(width: 12),
            Expanded(child: _photoCard('Back / Label', _backImage, false)),
          ],
        ),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: _frontImage != null ? _analyzePhotos : null,
          icon: const Icon(Icons.auto_awesome, color: Colors.white),
          label: Text('Analyze with AI',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            disabledBackgroundColor: Colors.grey[300],
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() => _step = _Step.form),
          child: Text('Skip & fill manually',
              style: GoogleFonts.poppins(color: Colors.grey[600])),
        ),
      ],
    );
  }

  Widget _photoCard(String label, File? image, bool isFront, {bool required = false}) {
    return GestureDetector(
      onTap: () => _showImageOptions(isFront),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isFront && image == null
                ? AppTheme.primary.withValues(alpha: 0.5)
                : Colors.grey[300]!,
            width: isFront && image == null ? 2 : 1,
          ),
        ),
        child: image != null
            ? Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(image, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: 6, right: 6,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.edit, color: Colors.white, size: 16),
                        onPressed: () => _showImageOptions(isFront),
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        padding: const EdgeInsets.all(6),
                      ),
                    ),
                  ),
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isFront ? Icons.camera_front : Icons.camera_rear,
                    size: 36,
                    color: isFront ? AppTheme.primary : Colors.grey[400],
                  ),
                  const SizedBox(height: 8),
                  Text(label,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        color: isFront ? AppTheme.primary : Colors.grey[500],
                        fontSize: 13,
                      )),
                  if (required)
                    Text('Required',
                        style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.primary)),
                  if (!required)
                    Text('Optional',
                        style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[400])),
                ],
              ),
      ),
    );
  }

  // ─── Step 2: Analyzing ─────────────────────────────────────────────────────

  Widget _buildAnalyzing() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 64,
              height: 64,
              child: CircularProgressIndicator(
                strokeWidth: 5,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 32),
            Text('Reading label with AI…',
                style: GoogleFonts.poppins(
                  fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.primary)),
            const SizedBox(height: 12),
            Text(
              'Extracting product name, ingredients\nand nutrition facts from your photos.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Step 3: Form with insights ───────────────────────────────────────────

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _barcodeChip(),
          const SizedBox(height: 16),
          if (_analysis != null) ...[
            _insightsCard(_analysis!),
            const SizedBox(height: 20),
          ],
          _section('Product Info'),
          _field(_nameCtrl, 'Product Name *',
              validator: (v) => v != null && v.trim().length >= 2 ? null : 'Required'),
          const SizedBox(height: 12),
          _field(_brandCtrl, 'Brand'),
          const SizedBox(height: 12),
          _field(_ingredientsCtrl, 'Ingredients', maxLines: 3),
          const SizedBox(height: 20),
          _section('Nutrition (per 100g)'),
          _nutritionGrid(),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!,
                style: GoogleFonts.poppins(color: Colors.red, fontSize: 13)),
          ],
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _submitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: _submitting
                ? const SizedBox(
                    height: 20, width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text('Submit Product',
                    style: GoogleFonts.poppins(
                        color: Colors.white, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _insightsCard(AnalysisResult r) {
    final color = _gradeColor(r.grade);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                child: Center(
                  child: Text(r.grade,
                      style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 24)),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Health Grade',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600, fontSize: 15)),
                  Text('Score: ${r.score}/100',
                      style: GoogleFonts.poppins(
                          color: Colors.grey[600], fontSize: 13)),
                ],
              ),
            ],
          ),
          if (r.insights.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 10),
            ...r.insights.map(
              (insight) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, size: 15, color: color),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(insight,
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[800])),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 8),
          Text('Review and correct any details below before submitting.',
              style: GoogleFonts.poppins(
                  fontSize: 11, color: Colors.grey[600], fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }

  // ─── Shared widgets ────────────────────────────────────────────────────────

  Widget _barcodeChip() => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.qr_code, size: 16, color: AppTheme.primary),
            const SizedBox(width: 8),
            Text('Barcode: ${widget.barcode}',
                style: GoogleFonts.poppins(
                    color: AppTheme.primary, fontWeight: FontWeight.w500)),
          ],
        ),
      );

  Widget _section(String title) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(title,
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
      );

  Widget _field(TextEditingController ctrl, String label,
          {String? Function(String?)? validator, int maxLines = 1}) =>
      TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
      );

  Widget _nutritionGrid() {
    final fields = [
      (_caloriesCtrl, 'Calories (kcal)'),
      (_fatCtrl, 'Fat (g)'),
      (_carbsCtrl, 'Carbs (g)'),
      (_sugarCtrl, 'Sugar (g)'),
      (_fiberCtrl, 'Fiber (g)'),
      (_proteinCtrl, 'Protein (g)'),
      (_sodiumCtrl, 'Sodium (g)'),
    ];
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 3),
      itemCount: fields.length,
      itemBuilder: (_, i) => TextFormField(
        controller: fields[i].$1,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(
          labelText: fields[i].$2,
          labelStyle: GoogleFonts.poppins(fontSize: 12),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        ),
      ),
    );
  }
}
