class AnalysisResult {
  final String? name;
  final String? brand;
  final String? ingredients;
  final AnalysisNutrition nutrition;
  final int score;
  final String grade;
  final List<String> insights;

  const AnalysisResult({
    this.name,
    this.brand,
    this.ingredients,
    required this.nutrition,
    required this.score,
    required this.grade,
    required this.insights,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      name: json['name'] as String?,
      brand: json['brand'] as String?,
      ingredients: json['ingredients'] as String?,
      nutrition: AnalysisNutrition.fromJson(
        (json['nutrition'] as Map<String, dynamic>?) ?? {},
      ),
      score: (json['score'] as num?)?.toInt() ?? 50,
      grade: json['grade'] as String? ?? 'C',
      insights: (json['insights'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }
}

class AnalysisNutrition {
  final double? calories;
  final double? fat;
  final double? saturatedFat;
  final double? carbs;
  final double? sugar;
  final double? fiber;
  final double? protein;
  final double? sodium;

  const AnalysisNutrition({
    this.calories,
    this.fat,
    this.saturatedFat,
    this.carbs,
    this.sugar,
    this.fiber,
    this.protein,
    this.sodium,
  });

  factory AnalysisNutrition.fromJson(Map<String, dynamic> json) {
    double? num2d(String k) => (json[k] as num?)?.toDouble();
    return AnalysisNutrition(
      calories: num2d('calories'),
      fat: num2d('fat'),
      saturatedFat: num2d('saturated_fat'),
      carbs: num2d('carbs'),
      sugar: num2d('sugar'),
      fiber: num2d('fiber'),
      protein: num2d('protein'),
      sodium: num2d('sodium'),
    );
  }
}
