import { NUTRITION_GOALS, conflictsWithPreferences, mealBudget, needsExpert, EXPERT_NOTICE } from '../../shared/smartMenu.js';
import type { Preferences, Replacement, SmartDish, SmartPlan } from '../../shared/smartMenu.js';

export class SmartMenuError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
function invalid(message = 'Thông tin thực đơn không hợp lệ. Vui lòng kiểm tra lại.'): never {
  throw new SmartMenuError(400, 'INVALID_INPUT', message);
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 300) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) invalid();
  return value.trim();
}
function number(value: unknown, min: number, max: number, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) invalid();
  return value;
}
function choice<T extends string | number>(value: unknown, values: readonly T[]): T {
  if (!values.includes(value as T)) invalid();
  return value as T;
}
function words(value: unknown) {
  if (!Array.isArray(value) || value.length > 15) invalid('Mỗi danh sách dị ứng/không thích tối đa 15 nguyên liệu.');
  return [...new Set(value.map((item) => text(item, 60)))];
}

export function parseRequest(value: unknown) {
  const body = object(value);
  const raw = object(body.preferences);
  const p: Preferences = {
    goal: choice(raw.goal, NUTRITION_GOALS.map((g) => g.id)),
    activity: choice(raw.activity, ['light', 'moderate', 'active']),
    guests: number(raw.guests, 3, 12, true), mealsPerDay: number(raw.mealsPerDay, 1, 3, true),
    days: choice(raw.days, [1, 3, 7]), planCount: choice(raw.planCount, [1, 3]),
    budget: number(raw.budget, 30000, 5000000, true), budgetPeriod: choice(raw.budgetPeriod, ['meal', 'day']),
    allergies: words(raw.allergies), dislikes: words(raw.dislikes),
    diet: choice(raw.diet, ['balanced', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free']),
    cuisine: choice(raw.cuisine, ['vietnamese', 'western', 'asian', 'mixed']),
    maxMinutes: number(raw.maxMinutes, 15, 180, true), specialNeeds: choice(raw.specialNeeds, ['none', 'pregnant', 'medical']),
  };
  for (const [key, min, max] of [['age', 1, 110], ['height', 80, 250], ['weight', 15, 350]] as const) {
    if (raw[key] !== undefined) p[key] = number(raw[key], min, max, key === 'age');
  }
  if (needsExpert(p)) throw new SmartMenuError(422, 'EXPERT_REQUIRED', EXPERT_NOTICE);
  const action = choice(body.action, ['generate', 'replace']);
  let replacement: Replacement | undefined;
  if (action === 'replace') {
    const rawReplacement = object(body.replacement);
    replacement = {
      dishName: text(rawReplacement.dishName, 120),
      otherDishNames: words(rawReplacement.otherDishNames),
      maxIngredientCost: number(rawReplacement.maxIngredientCost, 1000, mealBudget(p), true),
    };
  }
  return { preferences: p, action, replacement };
}

export function parseDish(value: unknown, p: Preferences, id: string, budget = mealBudget(p)): SmartDish {
  const raw = object(value);
  if (!Array.isArray(raw.ingredients) || raw.ingredients.length < 1 || raw.ingredients.length > 15) invalid();
  const dish: SmartDish = {
    id, name: text(raw.name, 120), description: text(raw.description), ingredients: raw.ingredients.map((i) => text(i, 100)),
    kcal: number(raw.kcal, 20, 1800), protein: number(raw.protein, 0, 180), carbs: number(raw.carbs, 0, 250), fat: number(raw.fat, 0, 100),
    ingredientCost: number(raw.ingredientCost, 1000, Math.floor(budget), true), minutes: number(raw.minutes, 1, p.maxMinutes, true),
    reason: text(raw.reason), complexity: choice(raw.complexity, ['simple', 'moderate', 'complex']),
    category: choice(raw.category, ['meat', 'fish', 'seafood', 'vegetable', 'soup', 'tofu', 'vegetarian', 'dessert', 'banquet']),
  };
  if (conflictsWithPreferences(dish, p)) invalid('Gợi ý chứa nguyên liệu xung đột với lựa chọn của bạn.');
  return dish;
}

export function parsePlans(value: unknown, p: Preferences): SmartPlan[] {
  const raw = object(value);
  if (!Array.isArray(raw.plans) || raw.plans.length !== p.planCount) invalid();
  return raw.plans.map((planValue, planIndex) => {
    const plan = object(planValue);
    if (!Array.isArray(plan.days) || plan.days.length !== p.days) invalid();
    return {
      id: `plan-${crypto.randomUUID()}`, title: text(plan.title, 120),
      days: plan.days.map((dayValue, dayIndex) => {
        const day = object(dayValue);
        if (!Array.isArray(day.meals) || day.meals.length !== p.mealsPerDay) invalid();
        const meals = day.meals.map((mealValue, mealIndex) => {
          const meal = object(mealValue);
          if (!Array.isArray(meal.dishes) || meal.dishes.length < 1 || meal.dishes.length > 3) invalid();
          const dishes = meal.dishes.map((dish, index) => parseDish(dish, p, `smart-${crypto.randomUUID()}-${index}`));
          if (dishes.reduce((sum, d) => sum + d.ingredientCost, 0) > mealBudget(p)) invalid('Thực đơn vượt ngân sách bạn chọn.');
          const kcal = dishes.reduce((sum, d) => sum + d.kcal, 0);
          // A full planned meal should not be a tiny snack marketed as weight loss.
          if (kcal < 350 || kcal > 1600) invalid('Thực đơn có mức năng lượng không phù hợp.');
          return { id: `meal-${planIndex}-${dayIndex}-${mealIndex}`, name: text(meal.name, 80), dishes };
        });
        if (p.mealsPerDay === 3 && meals.reduce((sum, meal) => sum + meal.dishes.reduce((kcal, dish) => kcal + dish.kcal, 0), 0) < 1500) invalid('Thực đơn cả ngày hạn chế năng lượng quá mức.');
        return { day: dayIndex + 1, meals };
      }),
    };
  });
}
