import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import 'auth_provider.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  final svc = ApiService();
  svc.setToken(ref.read(authProvider).token);
  ref.listen<AuthState>(authProvider, (_, state) => svc.setToken(state.token));
  return svc;
});

class ProductState {
  final Product? product;
  final bool isLoading;
  final String? error;
  final String? lastBarcode;
  final bool isNotFound;

  const ProductState({
    this.product,
    this.isLoading = false,
    this.error,
    this.lastBarcode,
    this.isNotFound = false,
  });
}

class ProductNotifier extends StateNotifier<ProductState> {
  ProductNotifier(this._api) : super(const ProductState());

  final ApiService _api;

  Future<void> fetch(String barcode) async {
    state = ProductState(isLoading: true, lastBarcode: barcode);
    try {
      final product = await _api.getProduct(barcode);
      state = ProductState(product: product, lastBarcode: barcode);
    } catch (e) {
      state = ProductState(
        error: e.toString(),
        lastBarcode: barcode,
        isNotFound: e is ProductNotFoundException,
      );
    }
  }

  void reset() => state = const ProductState();
}

final productProvider =
    StateNotifierProvider<ProductNotifier, ProductState>(
  (ref) => ProductNotifier(ref.read(apiServiceProvider)),
);
