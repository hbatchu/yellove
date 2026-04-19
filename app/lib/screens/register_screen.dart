import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authProvider.notifier).register(
          _nameCtrl.text.trim(),
          _emailCtrl.text.trim(),
          _passCtrl.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppTheme.primaryDark, AppTheme.primary, Color(0xFFF5F5F5)],
            stops: [0.0, 0.4, 1.0],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Icon(Icons.eco_rounded, size: 64, color: Colors.white),
                  const SizedBox(height: 8),
                  Text('Create Account',
                      style: GoogleFonts.poppins(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
                  const SizedBox(height: 32),
                  Card(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            TextFormField(
                              controller: _nameCtrl,
                              decoration: const InputDecoration(
                                  labelText: 'Full Name',
                                  prefixIcon: Icon(Icons.person_outline)),
                              validator: (v) => v != null && v.trim().length >= 2
                                  ? null
                                  : 'Enter your name',
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _emailCtrl,
                              keyboardType: TextInputType.emailAddress,
                              decoration: const InputDecoration(
                                  labelText: 'Email',
                                  prefixIcon: Icon(Icons.email_outlined)),
                              validator: (v) =>
                                  v != null && v.contains('@') ? null : 'Enter a valid email',
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _passCtrl,
                              obscureText: _obscure,
                              decoration: InputDecoration(
                                labelText: 'Password',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  icon: Icon(_obscure
                                      ? Icons.visibility_off
                                      : Icons.visibility),
                                  onPressed: () =>
                                      setState(() => _obscure = !_obscure),
                                ),
                              ),
                              validator: (v) => v != null && v.length >= 6
                                  ? null
                                  : 'Min 6 characters',
                            ),
                            if (auth.error != null) ...[
                              const SizedBox(height: 12),
                              Text(auth.error!,
                                  style: GoogleFonts.poppins(
                                      color: Colors.red, fontSize: 13)),
                            ],
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: auth.isLoading ? null : _submit,
                              child: auth.isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2, color: Colors.white))
                                  : Text('Create Account',
                                      style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(height: 12),
                            Row(children: [
                              const Expanded(child: Divider()),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                child: Text('or', style: GoogleFonts.poppins(color: Colors.grey)),
                              ),
                              const Expanded(child: Divider()),
                            ]),
                            const SizedBox(height: 12),
                            OutlinedButton.icon(
                              onPressed: auth.isLoading
                                  ? null
                                  : () => ref.read(authProvider.notifier).signInWithGoogle(),
                              icon: Image.network(
                                'https://developers.google.com/identity/images/g-logo.png',
                                height: 18,
                                errorBuilder: (_, __, ___) => const Icon(Icons.login, size: 18),
                              ),
                              label: Text('Continue with Google',
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500)),
                            ),
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: Text('Already have an account? Sign In',
                                  style: GoogleFonts.poppins(
                                      color: AppTheme.primary)),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
