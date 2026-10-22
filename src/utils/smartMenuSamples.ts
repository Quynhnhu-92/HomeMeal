import type { Preferences, SmartDish, SmartResult } from '../../shared/smartMenu';
import { conflictsWithPreferences, mealBudget, needsExpert, EXPERT_NOTICE } from '../../shared/smartMenu';

// Explicit demonstration data, not an AI response or a verified nutrition database.
const SAMPLES: Omit<SmartDish, 'id'>[] = [
  { name: 'Cơm gạo lứt, đậu hũ và rau hấp', description: 'Bữa cơm thực vật với đậu hũ áp chảo và rau theo mùa.', ingredients: ['Gạo lứt 80 g khô/người', 'Đậu hũ 180 g/người', 'Bông cải xanh 150 g/người', 'Cà rốt 60 g/người', 'Dầu ăn 10 g/người', 'Muối i-ốt'], kcal: 590, protein: 27, carbs: 76, fat: 20, ingredientCost: 35000, minutes: 40, reason: 'Có nguồn tinh bột, đạm thực vật và rau; có thể dùng làm ví dụ bữa ăn cân bằng.', complexity: 'simple', category: 'vegetarian' },
  { name: 'Cơm đậu gà và rau củ nướng', description: 'Đậu gà dùng cùng cơm và rau củ nhiều màu.', ingredients: ['Gạo 75 g khô/người', 'Đậu gà nấu chín 180 g/người', 'Bí đỏ 100 g/người', 'Ớt chuông 80 g/người', 'Dầu ô liu 10 g/người', 'Muối i-ốt'], kcal: 650, protein: 22, carbs: 104, fat: 16, ingredientCost: 42000, minutes: 35, reason: 'Thực phẩm đa dạng, cung cấp chất xơ và đạm thực vật.', complexity: 'moderate', category: 'vegetarian' },
  { name: 'Bún gạo đậu hũ rau nấm', description: 'Bún gạo với đậu hũ và rau nấm, nêm muối và chanh.', ingredients: ['Bún gạo 90 g khô/người', 'Đậu hũ 200 g/người', 'Nấm 100 g/người', 'Cải thìa 150 g/người', 'Dầu ăn 10 g/người', 'Chanh', 'Muối i-ốt'], kcal: 600, protein: 29, carbs: 84, fat: 18, ingredientCost: 38000, minutes: 25, reason: 'Kết hợp đạm thực vật với rau; khẩu phần cần được điều chỉnh theo nhu cầu thực tế.', complexity: 'simple', category: 'vegetarian' },
  { name: 'Cơm cá hấp gừng và rau luộc', description: 'Cá hấp cùng gừng, cơm và rau xanh.', ingredients: ['Gạo 80 g khô/người', 'Cá 180 g/người', 'Rau cải 200 g/người', 'Gừng', 'Dầu ăn 10 g/người', 'Muối i-ốt'], kcal: 610, protein: 41, carbs: 70, fat: 18, ingredientCost: 55000, minutes: 35, reason: 'Có đạm từ cá, tinh bột và rau; cách chế biến hấp giúp hạn chế dầu.', complexity: 'moderate', category: 'fish' },
  { name: 'Cơm ức gà và rau củ', description: 'Ức gà áp chảo, cơm và rau củ theo mùa.', ingredients: ['Gạo 80 g khô/người', 'Ức gà 170 g/người', 'Bông cải xanh 150 g/người', 'Cà rốt 80 g/người', 'Dầu ăn 12 g/người', 'Tiêu', 'Muối i-ốt'], kcal: 640, protein: 46, carbs: 77, fat: 16, ingredientCost: 50000, minutes: 30, reason: 'Cung cấp nguồn protein cùng tinh bột và rau, hỗ trợ bữa ăn sau vận động.', complexity: 'simple', category: 'meat' },
  { name: 'Khoai lang, trứng và đậu trắng', description: 'Khoai lang hấp dùng cùng trứng, đậu trắng và rau.', ingredients: ['Khoai lang 220 g/người', 'Trứng gà 2 quả/người', 'Đậu trắng chín 100 g/người', 'Rau xanh 150 g/người', 'Dầu ăn 8 g/người', 'Muối i-ốt'], kcal: 600, protein: 27, carbs: 79, fat: 19, ingredientCost: 38000, minutes: 25, reason: 'Kết hợp nhiều nguồn thực phẩm, phù hợp tham khảo cho bữa ăn gia đình.', complexity: 'simple', category: 'tofu' },
];

export function createSampleMenus(p: Preferences): SmartResult {
  if (!Number.isInteger(p.guests) || p.guests < 3) throw new Error('HomeMeal phục vụ từ 3 người ăn trở lên.');
  if (needsExpert(p)) throw new Error(EXPERT_NOTICE);
  const available = SAMPLES.filter((dish) => !conflictsWithPreferences(dish, p) && dish.minutes <= p.maxMinutes && dish.ingredientCost * p.guests <= mealBudget(p));
  if (available.length < p.planCount) throw new Error('Chưa có đủ món mẫu đáp ứng ngân sách, thời gian và nguyên liệu cần tránh. Hãy điều chỉnh lựa chọn; hệ thống sẽ không bỏ qua các nguyên liệu bạn đã loại trừ.');
  const mealNames = p.mealsPerDay === 1 ? ['Bữa chính'] : p.mealsPerDay === 2 ? ['Bữa trưa', 'Bữa tối'] : ['Bữa sáng', 'Bữa trưa', 'Bữa tối'];
  return {
    source: 'sample', guests: p.guests,
    plans: Array.from({ length: p.planCount }, (_, index) => ({
      id: `sample-plan-${crypto.randomUUID()}`, title: `Gợi ý mẫu ${index + 1}`,
      days: Array.from({ length: p.days }, (_, day) => ({ day: day + 1, meals: mealNames.map((name, meal) => {
        const dish = available[(index + day + meal) % available.length];
        return { id: `sample-meal-${index}-${day}-${meal}`, name, dishes: [{ ...dish, id: `smart-sample-${crypto.randomUUID()}`, ingredientCost: dish.ingredientCost * p.guests }] };
      }) })),
    })),
  };
}
