import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import 'scanner_screen.dart';
import 'history_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppTheme.primaryDark,
              AppTheme.primary,
              AppTheme.primaryLight,
              Color(0xFFF5F5F5),
            ],
            stops: [0.0, 0.3, 0.6, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildTopBar(context, ref, auth),
              const SizedBox(height: 24),
              _buildHeader(),
              const Spacer(),
              _buildScanButton(context),
              const SizedBox(height: 16),
              Text(
                'Tap to scan a product barcode',
                style:
                    GoogleFonts.poppins(color: Colors.white70, fontSize: 13),
              ),
              const Spacer(),
              _buildHowItWorks(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, WidgetRef ref, AuthState auth) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          if (auth.user != null)
            Expanded(
              child: Text(
                'Hi, ${auth.user!.name.split(' ').first}!',
                style: GoogleFonts.poppins(
                    color: Colors.white70, fontSize: 14),
              ),
            )
          else
            const Spacer(),
          IconButton(
            icon: const Icon(Icons.history, color: Colors.white),
            tooltip: 'Scan History',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HistoryScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child:
              const Icon(Icons.eco_rounded, size: 64, color: Colors.white),
        ),
        const SizedBox(height: 16),
        Text(AppConstants.appName,
            style: GoogleFonts.poppins(
                fontSize: 44,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 2)),
        Text(AppConstants.tagline,
            style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.white70,
                letterSpacing: 0.5)),
      ],
    );
  }

  Widget _buildScanButton(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const ScannerScreen()),
      ),
      child: Container(
        width: 180,
        height: 180,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 30,
                spreadRadius: 5),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.qr_code_scanner_rounded,
                size: 72, color: AppTheme.primary),
            const SizedBox(height: 6),
            Text('SCAN',
                style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                    letterSpacing: 3)),
          ],
        ),
      ),
    );
  }

  Widget _buildHowItWorks() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _step(Icons.qr_code_scanner, 'Scan'),
          const Icon(Icons.arrow_forward_ios,
              color: Colors.white54, size: 14),
          _step(Icons.analytics_outlined, 'Analyze'),
          const Icon(Icons.arrow_forward_ios,
              color: Colors.white54, size: 14),
          _step(Icons.thumb_up_outlined, 'Decide'),
        ],
      ),
    );
  }

  Widget _step(IconData icon, String label) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 28),
          const SizedBox(height: 4),
          Text(label,
              style:
                  GoogleFonts.poppins(color: Colors.white, fontSize: 12)),
        ],
      );
}
