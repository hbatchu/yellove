import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/constants.dart';
import '../models/analysis_result.dart';
import '../models/product.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  String? _token;

  void setToken(String? token) => _token = token;

  Options get _auth => Options(
        headers: _token != null ? {'Authorization': 'Bearer $_token'} : {},
      );

  Future<Product> getProduct(String barcode) async {
    try {
      final res = await _dio.get('/products/$barcode', options: _auth);
      return Product.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw ProductNotFoundException(
          e.response?.data?['message'] as String? ??
              'Product not found. Help the community by adding it!',
        );
      }
      throw const NetworkException(
          'Could not connect to server. Check your network.');
    }
  }

  Future<Map<String, dynamic>> getHistory({int page = 1}) async {
    final res = await _dio.get(
      '/history',
      queryParameters: {'page': page, 'limit': 20},
      options: _auth,
    );
    return res.data as Map<String, dynamic>;
  }

  Future<void> submitCommunityProduct({
    required String barcode,
    required String name,
    String? brand,
    String? ingredients,
    Map<String, dynamic>? nutrition,
    String? imagePath,
  }) async {
    final fields = <String, dynamic>{
      'barcode': barcode,
      'name': name,
      if (brand != null) 'brand': brand,
      if (ingredients != null) 'ingredients': ingredients,
      if (nutrition != null) 'nutrition': jsonEncode(nutrition),
      if (imagePath != null)
        'image': await MultipartFile.fromFile(imagePath),
    };
    await _dio.post(
      '/community/products',
      data: FormData.fromMap(fields),
      options: _auth,
    );
  }

  Future<AnalysisResult> analyzeProduct({
    required String frontImagePath,
    String? backImagePath,
  }) async {
    final formData = FormData();
    formData.files.add(MapEntry(
      'images',
      await MultipartFile.fromFile(frontImagePath, filename: 'front.jpg'),
    ));
    if (backImagePath != null) {
      formData.files.add(MapEntry(
        'images',
        await MultipartFile.fromFile(backImagePath, filename: 'back.jpg'),
      ));
    }
    final res = await _dio.post(
      '/community/analyze',
      data: formData,
      options: Options(
        receiveTimeout: const Duration(seconds: 60),
        sendTimeout: const Duration(seconds: 30),
        headers: _token != null ? {'Authorization': 'Bearer $_token'} : {},
      ),
    );
    return AnalysisResult.fromJson(res.data as Map<String, dynamic>);
  }
}

class ProductNotFoundException implements Exception {
  final String message;
  const ProductNotFoundException(this.message);
  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);
  @override
  String toString() => message;
}
