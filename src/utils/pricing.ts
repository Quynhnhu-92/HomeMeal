import { Dish, ServiceType } from '../types';

export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

// Prices from PITCH DESK COPY, pages 26–28. Ingredients are billed separately.
export const HOME_COOK_RATES = [
  { guests: '3–4 người', single: 200000 },
  { guests: '5–9 người', single: 340000 },
] as const;

export interface LaborFeeCalculation {
  baseLaborFee: number;
  guestAdjustment: number;
  complexityAdjustment: number;
  additionalServiceFee: number;
  totalLaborFee: number;
  requiresQuotation: boolean;
  breakdownSummary: string[];
}

export function calculateLaborFee(
  guestCount: number,
  dishes: Dish[],
  serviceType: ServiceType,
  hasSpecialEquipment: boolean = false,
  extraAssistants: number = 0
): LaborFeeCalculation {
  if (!Number.isInteger(guestCount) || guestCount < 3) throw new Error('HomeMeal phục vụ từ 3 người ăn trở lên.');
  if (guestCount >= 10) serviceType = 'party_at_home';
  if (serviceType === 'cook_at_home') {
    const plan = HOME_COOK_RATES[guestCount <= 4 ? 0 : 1];
    // Outside the published range, this is only a reference until a quote is accepted.
    const outsideRange = guestCount < 3 || guestCount > 9;
    return {
      baseLaborFee: plan.single,
      guestAdjustment: 0,
      complexityAdjustment: 0,
      additionalServiceFee: 0,
      totalLaborFee: plan.single,
      requiresQuotation: outsideRange || hasSpecialEquipment || extraAssistants > 0,
      breakdownSummary: [
        `Tiền công ${plan.guests}${outsideRange ? ' (tham khảo, cần báo giá riêng)' : ''}: ${formatVND(plan.single)}/bữa`,
        `Nguyên liệu: Thanh toán riêng theo hóa đơn thực tế`,
        ...(hasSpecialEquipment || extraAssistants > 0 ? ['Phụ bếp/dụng cụ bổ sung: Chờ đầu bếp báo giá và khách xác nhận'] : []),
      ],
    };
  }

  const breakdown: string[] = [];

  // 1. Base fee by service type (Đầu bếp đến tận nhà nấu)
  let baseLaborFee = 150000;
  if (serviceType === 'party_at_home') {
    baseLaborFee = 450000;
    breakdown.push(`Phí cơ bản đầu bếp nấu tiệc tại gia: ${formatVND(baseLaborFee)}`);
  } else {
    baseLaborFee = 150000;
    breakdown.push(`Phí cơ bản đầu bếp tới nhà nấu cơm: ${formatVND(baseLaborFee)}`);
  }


  // 3. Guest count tier
  let guestAdjustment = 0;
  if (guestCount <= 4) {
    guestAdjustment = 20000;
  } else if (guestCount <= 8) {
    guestAdjustment = 60000;
  } else if (guestCount <= 15) {
    guestAdjustment = 160000;
  } else if (guestCount <= 30) {
    guestAdjustment = 380000;
  } else {
    guestAdjustment = 380000 + (guestCount - 30) * 15000;
  }
  breakdown.push(`Quy mô ${guestCount} khách: +${formatVND(guestAdjustment)}`);

  // 4. Complexity & dish count
  let complexityAdjustment = 0;
  let simpleCount = 0;
  let moderateCount = 0;
  let complexCount = 0;

  dishes.forEach((d) => {
    if (d.complexity === 'simple') {
      complexityAdjustment += 15000;
      simpleCount++;
    } else if (d.complexity === 'moderate') {
      complexityAdjustment += 30000;
      moderateCount++;
    } else if (d.complexity === 'complex') {
      complexityAdjustment += 65000;
      complexCount++;
    }
  });

  const dishDetailParts: string[] = [];
  if (simpleCount > 0) dishDetailParts.push(`${simpleCount} món đơn giản`);
  if (moderateCount > 0) dishDetailParts.push(`${moderateCount} món vừa`);
  if (complexCount > 0) dishDetailParts.push(`${complexCount} món kỳ công`);

  if (dishDetailParts.length > 0) {
    breakdown.push(`Độ khó (${dishDetailParts.join(', ')}): +${formatVND(complexityAdjustment)}`);
  }

  // 5. Additional services (assistants, equipment)
  let additionalServiceFee = 0;
  if (extraAssistants > 0) {
    const fee = extraAssistants * 250000;
    additionalServiceFee += fee;
    breakdown.push(`${extraAssistants} phụ bếp hỗ trợ: +${formatVND(fee)}`);
  }
  if (hasSpecialEquipment) {
    additionalServiceFee += 150000;
    breakdown.push(`Dụng cụ tiệc/bếp nướng chuyên dụng: +150.000 đ`);
  }

  // Flag if quotation is advised
  const requiresQuotation = guestCount > 20 || dishes.length > 7 || serviceType === 'party_at_home';

  const totalLaborFee = baseLaborFee + guestAdjustment + complexityAdjustment + additionalServiceFee;

  return {
    baseLaborFee,
    guestAdjustment,
    complexityAdjustment,
    additionalServiceFee,
    totalLaborFee,
    requiresQuotation,
    breakdownSummary: breakdown,
  };
}

export function getStatusMeta(status: string): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'draft':
      return { label: 'Bản nháp', bg: 'bg-surface-alt', text: 'text-ink', dot: 'bg-border-soft' };
    case 'awaiting_cook':
      return { label: 'Chờ đầu bếp nhận', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-accent' };
    case 'awaiting_quotation':
      return { label: 'Chờ báo giá', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'quotation_submitted':
      return { label: 'Đã có báo giá chi tiết', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'confirmed':
      return { label: 'Đã xác nhận', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'shopping_in_progress':
      return { label: 'Đang đi chợ', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'evidence_submitted':
      return { label: 'Đã tải hóa đơn đi chợ', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'awaiting_budget_approval':
      return { label: 'Chờ duyệt tăng ngân sách', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-accent' };
    case 'preparing_meal':
      return { label: 'Đang nấu nướng', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-accent' };
    case 'ready_for_service':
      return { label: 'Món đã sẵn sàng', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'serving_at_home':
      return { label: 'Đầu bếp đang tới nhà / Nấu tại gian bếp', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'service_completed':
      return { label: 'Đã nấu & dọn xong - Chờ kiểm tra & thanh toán', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'awaiting_payment':
      return { label: 'Chờ thanh toán', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'paid':
    case 'completed':
      return { label: 'Hoàn tất & Đã thanh toán', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-brand' };
    case 'disputed':
      return { label: 'Đang khiếu nại hóa đơn', bg: 'bg-surface-alt', text: 'text-accent', dot: 'bg-accent' };
    case 'cancelled':
      return { label: 'Đã hủy', bg: 'bg-surface-alt', text: 'text-ink', dot: 'bg-border-soft' };
    default:
      return { label: status, bg: 'bg-surface-alt', text: 'text-ink', dot: 'bg-border-soft' };
  }
}
