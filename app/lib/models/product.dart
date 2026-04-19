class Nutrition {
  final double calories;
  final double fat;
  final double saturatedFat;
  final double carbs;
  final double sugar;
  final double fiber;
  final double protein;
  final double sodium;

  const Nutrition({
    required this.calories,
    required this.fat,
    required this.saturatedFat,
    required this.carbs,
    required this.sugar,
    required this.fiber,
    required this.protein,
    required this.sodium,
  });

  factory Nutrition.fromJson(Map<String, dynamic> j) => Nutrition(
        calories: (j['calories'] as num).toDouble(),
        fat: (j['fat'] as num).toDouble(),
        saturatedFat: (j['saturatedFat'] as num).toDouble(),
        carbs: (j['carbs'] as num).toDouble(),
        sugar: (j['sugar'] as num).toDouble(),
        fiber: (j['fiber'] as num).toDouble(),
        protein: (j['protein'] as num).toDouble(),
        sodium: (j['sodium'] as num).toDouble(),
      );
}

class Product {
  final String barcode;
  final String name;
  final String brand;
  final String? image;
  final String quantity;
  final String categories;
  final String nutriScore;
  final int healthScore;
  final String grade;
  final List<String> insights;
  final Nutrition nutrition;
  final String ingredients;

  const Product({
    required this.barcode,
    required this.name,
    required this.brand,
    this.image,
    required this.quantity,
    required this.categories,
    required this.nutriScore,
    required this.healthScore,
    required this.grade,
    required this.insights,
    required this.nutrition,
    required this.ingredients,
  });

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        barcode: j['barcode'] ?? '',
        name: j['name'] ?? 'Unknown Product',
        brand: j['brand'] ?? '',
        image: j['image'],
        quantity: j['quantity'] ?? '',
        categories: j['categories'] ?? '',
        nutriScore: j['nutriScore'] ?? '',
        healthScore: (j['healthScore'] as num).toInt(),
        grade: j['grade'] ?? 'E',
        insights: List<String>.from(j['insights'] ?? []),
        nutrition: Nutrition.fromJson(j['nutrition']),
        ingredients: j['ingredients'] ?? '',
      );
}
