import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Leaf, Dumbbell, Heart, Scale, Users, TrendingUp, ChefHat, Clock, RefreshCw, Bookmark, Trash2, ArrowRight, ShieldCheck, LoaderCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateLaborFee, formatVND } from '../../utils/pricing';
import { createSampleMenus } from '../../utils/smartMenuSamples';
import { NUTRITION_GOALS, ESTIMATE_NOTICE, EXPERT_NOTICE, needsExpert, mealCost, mealNutrition, mealBudget, conflictsWithPreferences, smartDishToOrderDish, smartMealToDraft } from '../../../shared/smartMenu';
import type { Preferences, SmartResult, SmartPlan, SmartMeal, SmartDish } from '../../../shared/smartMenu';

const INITIAL: Preferences = { goal: 'healthy', activity: 'moderate', guests: 3, mealsPerDay: 1, days: 1, planCount: 1, budget: 200000, budgetPeriod: 'meal', allergies: [], dislikes: [], diet: 'balanced', cuisine: 'vietnamese', maxMinutes: 45, specialNeeds: 'none' };
const ICONS = [Scale, Dumbbell, TrendingUp, Heart, Leaf, ShieldCheck, Users];
const inputClass = 'mt-2 w-full min-w-0 rounded-xl border border-[#DCE8E0] bg-[#FFFDF7] px-3 py-2.5 text-sm text-[#263B35] outline-none focus:ring-2 focus:ring-[#285E56] disabled:opacity-60';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60';
type Favorite = { plan: SmartPlan; guests: number; source: SmartResult['source'] };

function readFavorites(key: string): Favorite[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) return [];
    // Local storage can be corrupt or edited. Never let it break the existing application.
    return saved.slice(0, 12).filter((entry) => {
      if (!entry || !['ai', 'sample'].includes(entry.source) || !Number.isInteger(entry.guests) || entry.guests < 1 || entry.guests > 12 || typeof entry.plan?.id !== 'string' || typeof entry.plan?.title !== 'string' || !Array.isArray(entry.plan.days) || entry.plan.days.length < 1 || entry.plan.days.length > 7) return false;
      return entry.plan.days.every((day: SmartPlan['days'][number]) => Array.isArray(day.meals) && day.meals.length > 0 && day.meals.length <= 3 && day.meals.every((meal) => typeof meal.name === 'string' && Array.isArray(meal.dishes) && meal.dishes.length > 0 && meal.dishes.length <= 3 && meal.dishes.every((d) => typeof d.name === 'string' && typeof d.description === 'string' && typeof d.reason === 'string' && Array.isArray(d.ingredients) && d.ingredients.every((i) => typeof i === 'string') && ['simple', 'moderate', 'complex'].includes(d.complexity) && [d.kcal, d.protein, d.carbs, d.fat, d.minutes, d.ingredientCost].every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0) && d.ingredientCost > 0)));
    });
  } catch { return []; }
}

function Nutrition({ meal }: { meal: SmartMeal }) {
  const n = mealNutrition(meal);
  return <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[[Math.round(n.kcal), 'kcal'], [Math.round(n.protein), 'g protein'], [Math.round(n.carbs), 'g carb'], [Math.round(n.fat), 'g chất béo']].map(([value, label]) => <div key={label} className="rounded-xl bg-[#E7F5EF] px-3 py-2"><dt className="text-[11px] text-[#526D63]">{label} / người, ước tính</dt><dd className="text-lg font-bold text-[#285E56]">≈ {value}</dd></div>)}</dl>;
}

export const SmartMenuPage: React.FC = () => {
  const { authUser, authLoading, updateDraftOrder, navigateTo, showToast } = useApp();
  const [preferences, setPreferences] = useState<Preferences>(INITIAL);
  const [allergyText, setAllergyText] = useState('');
  const [dislikeText, setDislikeText] = useState('');
  const [result, setResult] = useState<SmartResult | null>(null);
  const [submitted, setSubmitted] = useState<Preferences | null>(null);
  const [activePlan, setActivePlan] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmedMeals, setConfirmedMeals] = useState<Set<SmartMeal>>(() => new Set());
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const favoritesKey = authUser ? `homemeal_smart_menus_v1_${authUser.id}` : null;

  useEffect(() => {
    setFavorites(favoritesKey ? readFavorites(favoritesKey) : []);
  }, [favoritesKey]);
  useEffect(() => () => requestRef.current?.abort(), []);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((p) => ({ ...p, [key]: value }));
    setConfirmedMeals(new Set());
  }
  function currentPreferences(): Preferences {
    const split = (s: string) => s.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
    return { ...preferences, allergies: split(allergyText), dislikes: split(dislikeText) };
  }
  function displayResult(data: SmartResult, p: Preferences) {
    setResult(data); setSubmitted(p); setActivePlan(0); setActiveDay(0); setConfirmedMeals(new Set());
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
  async function requestAI(payload: Record<string, unknown>) {
    const controller = new AbortController(); requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch('/api?resource=smart-menu', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      let data;
      try { data = await response.json(); } catch { throw new Error('API chưa phản hồi đúng định dạng. Vui lòng kiểm tra dịch vụ hoặc xem gợi ý mẫu.'); }
      if (!response.ok) throw new Error(data.error || 'Không thể tạo thực đơn lúc này.');
      return data;
    } finally { clearTimeout(timeout); }
  }
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    const p = currentPreferences();
    setError(''); setNotice(''); setConfirmedMeals(new Set());
    if (needsExpert(p)) { setError(EXPERT_NOTICE); return; }
    setBusy('generate');
    try {
      const data = await requestAI({ action: 'generate', preferences: p });
      displayResult(data, p);
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Yêu cầu đã quá thời gian chờ. Vui lòng thử lại hoặc xem gợi ý mẫu.'); }
    finally { setBusy(null); }
  }
  function samples() {
    const p = currentPreferences(); setError(''); setNotice('');
    try { displayResult(createSampleMenus(p), p); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không có mẫu phù hợp.'); }
  }
  async function replaceDish(meal: SmartMeal, dish: SmartDish) {
    if (!submitted || !result) return;
    const p = { ...submitted, allergies: currentPreferences().allergies, dislikes: currentPreferences().dislikes, diet: preferences.diet, goal: preferences.goal, age: preferences.age, specialNeeds: preferences.specialNeeds };
    const remaining = Math.floor(mealBudget(p) - mealCost(meal) + dish.ingredientCost);
    setError(''); setNotice(''); setConfirmedMeals(new Set());
    if (needsExpert(p)) { setError(EXPERT_NOTICE); return; }
    if (remaining < 1000) { setError('Ngân sách còn lại chưa đủ để đổi món. Vui lòng tạo lại thực đơn theo ngân sách mới.'); return; }
    setBusy(dish.id);
    try {
      const data = await requestAI({ action: 'replace', preferences: p, replacement: { dishName: dish.name, otherDishNames: meal.dishes.filter((d) => d.id !== dish.id).map((d) => d.name), maxIngredientCost: remaining } });
      const nextDishes = meal.dishes.map((d) => d.id === dish.id ? data.dish as SmartDish : d);
      const n = mealNutrition({ ...meal, dishes: nextDishes });
      if (n.kcal < 350 || n.kcal > 1600) throw new Error('Món thay thế chưa tạo thành bữa ăn cân bằng. Vui lòng thử lại; món cũ vẫn được giữ.');
      const containingDay = result.plans.flatMap((plan) => plan.days).find((day) => day.meals.includes(meal));
      if (containingDay?.meals.length === 3 && containingDay.meals.reduce((sum, m) => sum + (m === meal ? n.kcal : mealNutrition(m).kcal), 0) < 1500) throw new Error('Món thay thế làm giảm năng lượng cả ngày quá mức. Vui lòng thử lại; món cũ vẫn được giữ.');
      // A sample plan remains labelled sample even if one dish is replaced with AI.
      setResult({ ...result, plans: result.plans.map((plan) => plan.days.some((day) => day.meals.includes(meal)) ? { ...plan, id: `plan-${crypto.randomUUID()}`, days: plan.days.map((day) => ({ ...day, meals: day.meals.map((m) => m === meal ? { ...m, dishes: nextDishes } : m) })) } : plan) });
      setConfirmedMeals(new Set());
      setNotice('Đã đổi món. Hãy kiểm tra lại nguyên liệu trước khi đặt.');
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Đổi món quá thời gian chờ. Món cũ vẫn được giữ.'); }
    finally { setBusy(null); }
  }
  function persistFavorites(next: Favorite[]) {
    if (!favoritesKey) { setError('Vui lòng đăng nhập để lưu thực đơn yêu thích trên thiết bị này.'); return; }
    try { localStorage.setItem(favoritesKey, JSON.stringify(next)); setFavorites(next); }
    catch { setError('Không lưu được trên thiết bị. Bộ nhớ có thể đã đầy hoặc bị chặn.'); }
  }
  function savePlan() {
    if (!result) return;
    if (!favoritesKey) { setError('Vui lòng đăng nhập trước khi lưu thực đơn yêu thích.'); return; }
    const plan = result.plans[activePlan];
    if (favorites.some((f) => f.plan.id === plan.id)) { setNotice('Thực đơn này đã có trong mục yêu thích.'); return; }
    persistFavorites([{ plan, guests: result.guests, source: result.source }, ...favorites].slice(0, 12));
  }
  function bookMeal(meal: SmartMeal) {
    if (!result || !submitted || !confirmedMeals.has(meal) || busy || authLoading) return;
    if (result.guests < 3) { setError('HomeMeal phục vụ từ 3 người ăn trở lên. Vui lòng tạo lại thực đơn cho ít nhất 3 người.'); return; }
    const p = currentPreferences();
    if (needsExpert(p)) { setError(EXPERT_NOTICE); return; }
    if (meal.dishes.some((dish) => conflictsWithPreferences(dish, p))) { setError('Món đang chọn xung đột với nguyên liệu/chế độ ăn hiện tại. Vui lòng tạo lại hoặc đổi món.'); return; }
    if (authUser && authUser.role !== 'customer') { setError('Quy trình đặt dịch vụ hiện dành cho tài khoản Khách hàng. Vui lòng dùng tài khoản Khách hàng để tiếp tục.'); return; }
    updateDraftOrder(smartMealToDraft(meal, result.guests, p.allergies, result.source));
    showToast('Đã điền thực đơn vào bản nháp. Bạn sẽ chọn thời gian, địa chỉ và đầu bếp trước khi xác nhận.');
    navigateTo(authUser ? '/meal-planner' : '/login?next=%2Fmeal-planner');
  }

  const plan = result?.plans[activePlan];
  const day = plan?.days[activeDay];
  const expertRequired = needsExpert(preferences);
  const resultsStale = submitted && JSON.stringify(currentPreferences()) !== JSON.stringify(submitted);

  return <div className="mx-auto max-w-7xl space-y-8 break-words px-4 py-8 text-[#263B35] sm:px-6 lg:px-8">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#285E56] px-6 py-10 text-white sm:px-10 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-[#B8E4D3]/15" />
      <span className="inline-flex items-center gap-2 rounded-full border border-[#B8E4D3]/40 px-3 py-1.5 text-xs font-semibold text-[#B8E4D3]"><Sparkles size={15} /> AI Smart Menu · Trợ lý dinh dưỡng thông minh</span>
      <h1 className="relative mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Ăn đúng nhu cầu –<br className="hidden sm:block" /> Sống khỏe mỗi ngày</h1>
      <p className="relative mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">HomeMeal AI giúp bạn khám phá những thực đơn phù hợp với mục tiêu dinh dưỡng, sở thích và ngân sách. Chọn món yêu thích và để Home Cook chuẩn bị bữa ăn cho bạn.</p>
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#B8E4D3]"><span>01 · Chọn nhu cầu</span><span>02 · Khám phá thực đơn</span><span>03 · Đặt Home Cook</span></div>
    </section>

    <form onSubmit={generate} className="space-y-7">
      <fieldset disabled={Boolean(busy)}>
        <legend className="text-xl font-bold">Bạn muốn chăm sóc bữa ăn theo cách nào?</legend>
        <p className="mb-4 mt-2 text-sm text-[#738078]">Chọn một mục tiêu để bắt đầu. Bạn có thể thay đổi bất cứ lúc nào.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{NUTRITION_GOALS.map((goal, i) => {
          const Icon = ICONS[i]; const selected = preferences.goal === goal.id;
          return <button key={goal.id} type="button" aria-pressed={selected} onClick={() => update('goal', goal.id)} className={`flex gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${selected ? 'border-[#285E56] bg-[#E7F5EF]' : 'border-[#E5ECE7] bg-white hover:border-[#B8E4D3]'}`}><span className="rounded-xl bg-[#E7F5EF] p-2.5 text-[#285E56]"><Icon size={21} /></span><span><span className="block text-sm font-bold">{goal.name}</span><span className="mt-1 block text-xs leading-5 text-[#607369]">{goal.description}</span></span></button>;
        })}</div>
      </fieldset>

      <fieldset disabled={Boolean(busy)} className="min-w-0 rounded-3xl border border-[#E5ECE7] bg-white p-5 sm:p-8">
        <legend className="px-2 text-xl font-bold">Một chút về bữa ăn của bạn</legend>
        <p className="mb-5 text-sm leading-6 text-[#738078]">Không cần cung cấp tuổi, chiều cao hay cân nặng để nhận gợi ý. Các chỉ số này chỉ dùng cho yêu cầu hiện tại và không được lưu vào mục yêu thích.</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold">Độ tuổi (tùy chọn)<input className={inputClass} type="number" min="1" max="110" step="1" value={preferences.age ?? ''} onChange={(e) => update('age', e.target.value ? Number(e.target.value) : undefined)} /></label>
          <label className="text-sm font-semibold">Chiều cao (cm, tùy chọn)<input className={inputClass} type="number" min="80" max="250" step="0.1" value={preferences.height ?? ''} onChange={(e) => update('height', e.target.value ? Number(e.target.value) : undefined)} /></label>
          <label className="text-sm font-semibold">Cân nặng (kg, tùy chọn)<input className={inputClass} type="number" min="15" max="350" step="0.1" value={preferences.weight ?? ''} onChange={(e) => update('weight', e.target.value ? Number(e.target.value) : undefined)} /></label>
          <label className="text-sm font-semibold">Mức độ vận động<select className={inputClass} value={preferences.activity} onChange={(e) => update('activity', e.target.value as Preferences['activity'])}><option value="light">Ít vận động</option><option value="moderate">Vận động vừa phải</option><option value="active">Vận động thường xuyên</option></select></label>
          <label className="text-sm font-semibold">Số người ăn (tối thiểu 3)<input className={inputClass} required type="number" min="3" max="12" step="1" value={preferences.guests} onChange={(e) => update('guests', Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Số bữa mỗi ngày<select className={inputClass} value={preferences.mealsPerDay} onChange={(e) => update('mealsPerDay', Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n} value={n}>{n} bữa</option>)}</select></label>
          <label className="text-sm font-semibold">Lập thực đơn trong<select className={inputClass} value={preferences.days} onChange={(e) => update('days', Number(e.target.value) as Preferences['days'])}>{[1, 3, 7].map((n) => <option key={n} value={n}>{n} ngày</option>)}</select></label>
          <label className="text-sm font-semibold">Số phương án khác nhau<select className={inputClass} value={preferences.planCount} onChange={(e) => update('planCount', Number(e.target.value) as Preferences['planCount'])}><option value="1">1 thực đơn</option><option value="3">3 thực đơn để so sánh</option></select></label>
          <label className="text-sm font-semibold">Thời gian chuẩn bị và nấu tối đa<select className={inputClass} value={preferences.maxMinutes} onChange={(e) => update('maxMinutes', Number(e.target.value))}>{[15, 30, 45, 60, 90, 120, 180].map((n) => <option key={n} value={n}>{n} phút</option>)}</select></label>
          <label className="text-sm font-semibold">Ngân sách nguyên liệu (VNĐ)<input className={inputClass} required type="number" min="30000" max="5000000" step="1000" value={preferences.budget} onChange={(e) => update('budget', Number(e.target.value))} /><span className="mt-1 block text-xs font-normal text-[#738078]">Tổng cho tất cả người ăn, chưa gồm công nấu.</span></label>
          <label className="text-sm font-semibold">Ngân sách tính theo<select className={inputClass} value={preferences.budgetPeriod} onChange={(e) => update('budgetPeriod', e.target.value as Preferences['budgetPeriod'])}><option value="meal">Mỗi bữa</option><option value="day">Mỗi ngày (chia đều số bữa)</option></select></label>
          <label className="text-sm font-semibold">Loại món yêu thích<select className={inputClass} value={preferences.cuisine} onChange={(e) => update('cuisine', e.target.value as Preferences['cuisine'])}><option value="vietnamese">Món Việt</option><option value="western">Món Âu</option><option value="asian">Món Á</option><option value="mixed">Kết hợp</option></select></label>
          <label className="text-sm font-semibold">Dị ứng thực phẩm<input className={inputClass} maxLength={700} placeholder="Ví dụ: đậu phộng, tôm, sữa" value={allergyText} onChange={(e) => { setAllergyText(e.target.value); setConfirmedMeals(new Set()); }} /><span className="mt-1 block text-xs font-normal text-[#738078]">Ngăn cách từng nguyên liệu bằng dấu phẩy.</span></label>
          <label className="text-sm font-semibold">Nguyên liệu không thích<input className={inputClass} maxLength={700} placeholder="Ví dụ: khổ qua, hành" value={dislikeText} onChange={(e) => { setDislikeText(e.target.value); setConfirmedMeals(new Set()); }} /></label>
          <label className="text-sm font-semibold">Chế độ ăn đặc biệt<select className={inputClass} value={preferences.diet} onChange={(e) => update('diet', e.target.value as Preferences['diet'])}><option value="balanced">Cân bằng, không hạn chế</option><option value="vegetarian">Chay có trứng/sữa</option><option value="vegan">Thuần chay</option><option value="gluten-free">Không gluten</option><option value="dairy-free">Không sữa</option></select></label>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Bạn có cần tư vấn chuyên biệt?<select className={inputClass} value={preferences.specialNeeds} onChange={(e) => update('specialNeeds', e.target.value as Preferences['specialNeeds'])}><option value="none">Không có nhu cầu chuyên biệt</option><option value="pregnant">Đang mang thai</option><option value="medical">Có bệnh lý cần chế độ ăn riêng</option></select></label>
        </div>
      </fieldset>

      <div className="rounded-2xl border border-[#DCE8E0] bg-[#E7F5EF]/70 p-4 text-xs leading-6 text-[#526D63]">
        <p className="font-semibold text-[#285E56]">Gợi ý tham khảo, không thay thế chuyên gia dinh dưỡng hoặc bác sĩ.</p>
        <p>{EXPERT_NOTICE}</p><p>Kế hoạch chỉ gồm số bữa bạn chọn, không khuyến nghị bỏ các bữa còn lại.</p><p>Nguyên liệu được gửi đến nhà cung cấp AI để tạo gợi ý. Không nhập tên, số điện thoại hay thông tin chẩn đoán. HomeMeal không lưu chỉ số cơ thể vào bộ nhớ trình duyệt hoặc database. Dị ứng cần được đối chiếu trực tiếp với đầu bếp, đặc biệt nguy cơ nhiễm chéo.</p>
      </div>
      {expertRequired && <p role="alert" className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">{EXPERT_NOTICE}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={Boolean(busy) || expertRequired} className={`${buttonClass} bg-[#285E56] text-white hover:bg-[#1f4b44]`}>{busy === 'generate' ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}{busy === 'generate' ? 'Đang tìm thực đơn phù hợp…' : result ? 'Tạo lại thực đơn với lựa chọn hiện tại' : 'AI Gợi Ý Thực Đơn'}</button>
        <button type="button" disabled={Boolean(busy) || expertRequired} onClick={samples} className={`${buttonClass} border border-[#B8E4D3] bg-white text-[#285E56] hover:bg-[#E7F5EF]`}>Xem gợi ý mẫu (không dùng AI)</button>
      </div>
    </form>

    {busy && <p role="status" className="text-sm text-[#285E56]">{busy === 'generate' ? 'AI đang xử lý; kế hoạch nhiều ngày có thể mất gần một phút. Bạn không cần nhập lại thông tin.' : 'Đang đổi món; các món khác vẫn được giữ.'}</p>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}<p className="mt-1">Các gợi ý trước đó (nếu có) vẫn được giữ.</p></div>}
    {notice && <p role="status" className="rounded-xl bg-[#E7F5EF] p-3 text-sm text-[#285E56]">{notice}</p>}

    {result && plan && day && <section ref={resultRef} aria-label="Kết quả gợi ý thực đơn" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#738078]">Bữa ăn gợi ý cho bạn</p><h2 className="mt-1 text-2xl font-bold">Khám phá thực đơn của bạn</h2></div><button onClick={savePlan} disabled={Boolean(busy) || authLoading} className={`${buttonClass} border border-[#B8E4D3] bg-white text-[#285E56]`}><Bookmark size={16} />{favorites.some((f) => f.plan.id === plan.id) ? 'Đã lưu yêu thích' : 'Lưu thực đơn yêu thích'}</button></div>
      <div className={`rounded-2xl border p-4 text-sm leading-6 ${result.source === 'sample' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#B8E4D3] bg-[#E7F5EF] text-[#285E56]'}`}><strong>{result.source === 'sample' ? 'Gợi ý mẫu — không phải phản hồi AI.' : 'Gợi ý được tạo bởi AI — cần kiểm tra lại.'}</strong><p>{result.source === 'sample' ? 'Các món minh họa được luân phiên theo ngày; không cá nhân hóa đầy đủ theo mục tiêu hay phong cách ẩm thực. Đã lọc theo nguyên liệu cần tránh, thời gian và ngân sách.' : 'Gợi ý có thể sai hoặc bỏ sót thành phần. Vui lòng xác nhận nguyên liệu và khẩu phần với đầu bếp.'}</p><p>{ESTIMATE_NOTICE}</p></div>
      {resultsStale && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Bạn đã thay đổi lựa chọn. Kết quả này vẫn dùng số người/ngân sách lúc tạo; bấm “Tạo lại thực đơn” để áp dụng toàn bộ thay đổi.</p>}
      <div className="flex flex-wrap gap-2" aria-label="Các phương án thực đơn">{result.plans.map((p, i) => <button key={p.id} disabled={Boolean(busy)} aria-pressed={activePlan === i} onClick={() => { setActivePlan(i); setActiveDay(0); setConfirmedMeals(new Set()); }} className={`${buttonClass} ${i === activePlan ? 'bg-[#285E56] text-white' : 'border border-[#E5ECE7] bg-white'}`}>{p.title}</button>)}</div>
      <div className="flex flex-wrap gap-2" aria-label="Chọn ngày">{plan.days.map((d, i) => <button key={i} aria-pressed={activeDay === i} onClick={() => { setActiveDay(i); setConfirmedMeals(new Set()); }} className={`rounded-full px-4 py-2 text-sm ${i === activeDay ? 'bg-[#B8E4D3] font-bold text-[#285E56]' : 'border border-[#E5ECE7] bg-white'}`}>Ngày {d.day}</button>)}</div>
      <p className="text-sm text-[#738078]">{result.guests} người · {plan.days.length} ngày · Ước tính nguyên liệu toàn kế hoạch: <strong className="text-[#285E56]">{formatVND(plan.days.reduce((sum, d) => sum + d.meals.reduce((cost, m) => cost + mealCost(m), 0), 0))}</strong>. Đặt từng bữa để chọn lịch riêng.</p>
      {day.meals.map((meal) => {
        const confirmedIngredients = confirmedMeals.has(meal);
        const cost = mealCost(meal);
        const fees = calculateLaborFee(result.guests, meal.dishes.map((dish) => smartDishToOrderDish(dish, result.guests)), 'cook_at_home');
        return <article key={meal.id} className="overflow-hidden rounded-3xl border border-[#DCE8E0] bg-white">
          <div className="border-b border-[#E5ECE7] bg-[#FFFDF7] p-5 sm:p-6"><h3 className="text-xl font-bold">{meal.name} · Ngày {day.day}</h3></div>
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">{meal.dishes.map((dish) => <div key={dish.id} className="min-w-0 rounded-2xl border border-[#E5ECE7] p-4 sm:p-5"><div className="mb-3 flex items-start justify-between gap-3"><span className="rounded-xl bg-[#E7F5EF] p-2 text-[#285E56]"><Leaf size={22} /></span><button disabled={Boolean(busy)} onClick={() => replaceDish(meal, dish)} className="inline-flex items-center gap-1 rounded-lg p-2 text-xs font-semibold text-[#285E56] hover:bg-[#E7F5EF] disabled:opacity-50"><RefreshCw size={14} className={busy === dish.id ? 'animate-spin' : ''} />Đổi món</button></div><h4 className="text-lg font-bold">{dish.name}</h4><p className="mt-2 text-sm leading-6 text-[#738078]">{dish.description}</p><p className="mt-3 text-xs font-semibold text-[#285E56]">Khẩu phần cho {result.guests} người · ≈ {Math.round(dish.kcal)} kcal/người</p><p className="mt-1 text-xs text-[#738078]">Protein ≈ {dish.protein} g · Carb ≈ {dish.carbs} g · Chất béo ≈ {dish.fat} g / người</p><p className="mt-3 text-xs font-bold">Nguyên liệu chính và gia vị</p><ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-6 text-[#607369]">{dish.ingredients.map((ingredient, i) => <li key={i}>{ingredient}</li>)}</ul><p className="mt-4 rounded-xl bg-[#E7F5EF]/60 p-3 text-sm leading-6 text-[#285E56]">{dish.reason}</p><div className="mt-4 flex flex-wrap justify-between gap-2 text-xs font-semibold"><span className="inline-flex items-center gap-1"><Clock size={14} />≈ {dish.minutes} phút</span><span>Nguyên liệu ≈ {formatVND(dish.ingredientCost)}</span></div></div>)}</div>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6"><Nutrition meal={meal} /></div>
          <div className="border-t border-[#E5ECE7] bg-[#E7F5EF]/50 p-5 sm:p-6"><dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-[#607369]">Nguyên liệu ước tính ({result.guests} người)</dt><dd className="mt-1 font-bold">{formatVND(cost)}</dd></div><div><dt className="text-[#607369]">Công nấu dự kiến</dt><dd className="mt-1 font-bold">{formatVND(fees.totalLaborFee)}</dd></div></dl><p className="mt-4 text-lg font-bold text-[#285E56]">Tổng dự kiến: {formatVND(cost + fees.totalLaborFee)}</p><p className="mb-4 mt-1 text-xs leading-5 text-[#607369]">Chưa phát sinh khoản thu. {fees.requiresQuotation ? 'Quy mô này cần đầu bếp báo giá lại theo quy tắc hiện có.' : 'Phụ phí dịch vụ khác hiện là 0 đ; mọi điều chỉnh cần được xác nhận trong quy trình đặt.'} Đầu bếp đến nhà bạn nấu ăn; bạn chọn thời gian, địa chỉ và đầu bếp ở bước tiếp theo.</p>
            <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#B8E4D3] bg-white p-4 text-sm leading-6">
              <input type="checkbox" disabled={Boolean(busy)} checked={confirmedIngredients} onChange={(e) => {
                const checked = e.target.checked;
                setConfirmedMeals((previous) => {
                  const next = new Set(previous);
                  if (checked) next.add(meal); else next.delete(meal);
                  return next;
                });
              }} className="mt-1 h-4 w-4 shrink-0 accent-[#285E56]" />
              <span>Tôi đã xem danh sách nguyên liệu, ngân sách dự kiến và sẽ xác nhận lại dị ứng, thành phần nước sốt trước khi chốt dịch vụ.</span>
            </label>
            <button disabled={!confirmedIngredients || Boolean(busy) || authLoading || expertRequired} onClick={() => bookMeal(meal)} className={`${buttonClass} w-full bg-[#285E56] text-white hover:bg-[#1f4b44] sm:w-auto`}><ChefHat size={18} />Đặt Home Cook nấu thực đơn này<ArrowRight size={17} /></button>{!confirmedIngredients && <p className="mt-2 text-xs text-[#607369]">Vui lòng xác nhận nguyên liệu, ngân sách và dị ứng của bữa ăn này trước khi đặt.</p>}</div>
        </article>;
      })}
    </section>}

    <section className="rounded-3xl border border-[#E5ECE7] bg-white p-5 sm:p-7" aria-label="Thực đơn yêu thích"><h2 className="flex items-center gap-2 text-xl font-bold"><Bookmark size={20} className="text-[#285E56]" />Thực đơn yêu thích</h2><p className="mt-2 text-sm leading-6 text-[#738078]">Lưu tối đa 12 thực đơn theo tài khoản trên trình duyệt này, không đồng bộ sang thiết bị khác. Không lưu tuổi, chiều cao, cân nặng hoặc hồ sơ dị ứng.</p>{!authUser ? <button onClick={() => navigateTo('/login?next=%2Fsmart-menu')} className="mt-3 text-sm font-semibold text-[#285E56] underline">Đăng nhập để sử dụng mục yêu thích</button> : favorites.length === 0 ? <p className="mt-4 text-sm text-[#738078]">Bạn chưa lưu thực đơn nào.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{favorites.map((favorite) => <div key={favorite.plan.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#E5ECE7] p-4"><div className="min-w-0"><p className="break-words text-sm font-bold">{favorite.plan.title}</p><p className="mt-1 text-xs text-[#738078]">{favorite.guests} người · {favorite.plan.days.length} ngày · {favorite.source === 'sample' ? 'Gợi ý mẫu' : 'AI'}</p><button disabled={Boolean(busy)} onClick={() => { setError(''); setNotice('Hãy đối chiếu nguyên liệu với nhu cầu hiện tại trước khi đặt thực đơn đã lưu.'); displayResult({ source: favorite.source, plans: [favorite.plan], guests: favorite.guests }, { ...currentPreferences(), guests: favorite.guests, days: favorite.plan.days.length as Preferences['days'], mealsPerDay: favorite.plan.days[0].meals.length }); }} className="mt-2 text-xs font-semibold text-[#285E56] underline">Xem thực đơn đã lưu</button></div><button aria-label={`Xóa ${favorite.plan.title}`} onClick={() => persistFavorites(favorites.filter((f) => f.plan.id !== favorite.plan.id))} className="rounded-lg p-2 text-[#738078] hover:bg-red-50 hover:text-red-700"><Trash2 size={17} /></button></div>)}</div>}</section>
  </div>;
};
