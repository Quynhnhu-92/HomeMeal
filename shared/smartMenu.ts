import type { Dish, Order } from '../src/types/index';

export const NUTRITION_GOALS = [
  { id: 'weight-loss', name: 'Giảm cân', description: 'Bữa ăn cân bằng, kiểm soát năng lượng.' },
  { id: 'muscle', name: 'Tăng cơ / Tập gym', description: 'Ưu tiên protein, hỗ trợ vận động.' },
  { id: 'weight-gain', name: 'Tăng cân lành mạnh', description: 'Đa dạng thực phẩm, đủ chất và năng lượng.' },
  { id: 'healthy', name: 'Ăn uống lành mạnh', description: 'Nhiều rau, nguyên liệu tươi, ít chế biến.' },
  { id: 'vegetarian', name: 'Ăn chay', description: 'Khám phá nguồn đạm và thực phẩm thực vật.' },
  { id: 'maintain', name: 'Duy trì cân nặng', description: 'Ăn uống điều độ, phù hợp nhịp sống.' },
  { id: 'family', name: 'Thực đơn gia đình', description: 'Bữa cơm đa dạng, cân bằng cho cả nhà.' },
] as const;

export type Goal = typeof NUTRITION_GOALS[number]['id'];
export type Preferences = {
  goal: Goal;
  age?: number;
  height?: number;
  weight?: number;
  activity: 'light' | 'moderate' | 'active';
  guests: number;
  mealsPerDay: number;
  days: 1 | 3 | 7;
  planCount: 1 | 3;
  budget: number;
  budgetPeriod: 'meal' | 'day';
  allergies: string[];
  dislikes: string[];
  diet: 'balanced' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
  cuisine: 'vietnamese' | 'western' | 'asian' | 'mixed';
  maxMinutes: number;
  specialNeeds: 'none' | 'pregnant' | 'medical';
};

export interface SmartDish {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientCost: number; // Whole dish for all guests, not per person.
  minutes: number;
  reason: string;
  complexity: Dish['complexity'];
  category: Dish['category'];
}
export interface SmartMeal { id: string; name: string; dishes: SmartDish[] }
export interface SmartPlan { id: string; title: string; days: { day: number; meals: SmartMeal[] }[] }
export type SmartResult = { source: 'ai' | 'sample'; plans: SmartPlan[]; guests: number };
export type Replacement = { dishName: string; otherDishNames: string[]; maxIngredientCost: number };

export const ESTIMATE_NOTICE = 'Calories và macro tính trên mỗi người; chi phí nguyên liệu tính cho cả bữa. Tất cả đều là ước tính, chưa được kiểm chứng bằng cơ sở dữ liệu dinh dưỡng chuyên ngành.';
export const EXPERT_NOTICE = 'Người dưới 18 tuổi, phụ nữ mang thai hoặc người cần chế độ ăn do bệnh lý nên trao đổi với bác sĩ/chuyên gia dinh dưỡng. HomeMeal không tạo chế độ ăn điều trị hoặc kế hoạch giảm cân cho các trường hợp này.';

export function mealCost(meal: SmartMeal) {
  return meal.dishes.reduce((sum, dish) => sum + dish.ingredientCost, 0);
}
export function mealNutrition(meal: SmartMeal) {
  return meal.dishes.reduce((sum, dish) => ({ kcal: sum.kcal + dish.kcal, protein: sum.protein + dish.protein, carbs: sum.carbs + dish.carbs, fat: sum.fat + dish.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
export function mealBudget(preferences: Preferences) {
  return preferences.budgetPeriod === 'day' ? preferences.budget / preferences.mealsPerDay : preferences.budget;
}

export function needsExpert(preferences: Pick<Preferences, 'age' | 'specialNeeds'>) {
  return (preferences.age !== undefined && preferences.age < 18) || preferences.specialNeeds !== 'none';
}

export function normalizeFood(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
const FOOD_GROUPS = [
  ['hai san', 'seafood', 'tom', 'cua', 'muc', 'so', 'ngheu', 'hau', 'tep', 'shrimp', 'crab', 'squid', 'oyster', 'nuoc mam', 'mam tom'],
  ['ca', 'fish', 'salmon', 'tuna', 'nuoc mam'],
  ['dau phong', 'lac', 'peanut'],
  ['hat', 'nuts', 'hanh nhan', 'hat dieu', 'oc cho', 'almond', 'cashew', 'walnut'],
  ['sua', 'dairy', 'milk', 'pho mai', 'bo sua', 'cheese', 'cream', 'yogurt', 'whey'],
  ['trung', 'egg', 'mayonnaise'],
  ['dau nanh', 'soy', 'dau hu', 'dau phu', 'tofu', 'nuoc tuong', 'xi dau', 'miso'],
  ['gluten', 'lua mi', 'wheat', 'banh mi', 'pasta', 'mi', 'nuoc tuong', 'xi dau'],
  ['me', 'vung', 'sesame', 'tahini'],
];
const contains = (text: string, term: string) => (` ${text} `).includes(` ${term} `);

// Conservative text screening supplements the model instruction; it is not an allergen certification.
export function conflictsWithPreferences(dish: Pick<SmartDish, 'name' | 'description' | 'ingredients'>, p: Pick<Preferences, 'goal' | 'allergies' | 'dislikes' | 'diet'>) {
  const text = normalizeFood([dish.name, dish.description, ...dish.ingredients].join(' '));
  // Removing accents merges cá/cà and gà in đậu gà. Keep known plant phrases out
  // of animal-word checks without removing them from direct dislike checks.
  const animalText = text.replace(/\b(ca rot|ca chua|ca tim|dau ga)\b/g, ' ');
  const excluded = [...p.allergies, ...p.dislikes].map(normalizeFood).filter(Boolean);
  for (const term of excluded) {
    const group = FOOD_GROUPS.find((g) => g.includes(term));
    if ((group || [term]).some((word) => contains(word === 'ca' || word === 'ga' ? animalText : text, word))) return true;
  }
  const vegetarian = p.goal === 'vegetarian' || p.diet === 'vegetarian' || p.diet === 'vegan';
  if (vegetarian && ['thit', 'ga', 'bo', 'heo', 'lon', 'vit', 'ca', 'tom', 'cua', 'hai san', 'nuoc mam', 'mam tom', 'beef', 'pork', 'chicken', 'fish', 'seafood', 'bacon', 'gelatin'].some((x) => contains(animalText, x))) return true;
  if ((p.diet === 'vegan' || p.diet === 'dairy-free') && FOOD_GROUPS[4].some((x) => contains(text, x))) return true;
  if (p.diet === 'vegan' && [...FOOD_GROUPS[5], 'mat ong', 'honey'].some((x) => contains(text, x))) return true;
  if (p.diet === 'gluten-free' && FOOD_GROUPS[7].some((x) => contains(text, x))) return true;
  return false;
}

export function smartDishToOrderDish(dish: SmartDish, guests: number): Dish {
  return {
    id: dish.id, name: dish.name, vietnameseName: dish.name, category: dish.category,
    description: dish.description, suggestedPortion: `${guests} người`, complexity: dish.complexity,
    estimatedCost: dish.ingredientCost, prepTimeMinutes: dish.minutes, dietaryTags: ['Thực đơn thông minh • Ước tính'],
    ingredients: dish.ingredients.map((name, index) => ({ id: `${dish.id}-ing-${index}`, name, estimatedQuantity: 'Theo khẩu phần', unit: '', estimatedPrice: 0 })),
    imageUrl: '',
  };
}

export function smartMealToDraft(meal: SmartMeal, guests: number, allergies: string[], source: SmartResult['source']): Partial<Order> {
  if (!Number.isInteger(guests) || guests < 3) throw new Error('HomeMeal phục vụ từ 3 người ăn trở lên.');
  return {
    serviceType: guests >= 10 ? 'party_at_home' : 'cook_at_home', guestCount: guests,
    items: meal.dishes.map((dish) => ({ dish: smartDishToOrderDish(dish, guests), quantity: 1 })),
    estimatedGroceryBudget: mealCost(meal), allergies,
    mealOccasion: `${meal.name} • ${source === 'ai' ? 'AI Smart Menu' : 'Gợi ý mẫu Smart Menu'}`,
    generalPreferences: 'Thực đơn tham khảo; vui lòng đối chiếu nguyên liệu và dị ứng với đầu bếp trước khi xác nhận. Số lượng x1 của mỗi món đã bao gồm toàn bộ số người ăn.',
  };
}
