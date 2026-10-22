/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to enforce the rule: Orders must be placed at least 4 hours in advance.
 * Quy định bắt buộc: Khách hàng phải đặt trước tối thiểu 4 tiếng để đầu bếp kịp đi chợ nguyên liệu tươi và di chuyển tới nhà bạn nấu trực tiếp.
 */

export const MIN_ADVANCE_HOURS = 4;

export function getNow(): Date {
  return new Date();
}

/**
 * Returns the earliest allowable service Date object (now + 4 hours, rounded to next 15-min mark)
 */
export function getEarliestServiceDate(): Date {
  const date = new Date(Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);
  const minutes = date.getMinutes();
  const remainder = minutes % 15;
  const addMinutes = remainder === 0 ? 0 : 15 - remainder;
  date.setMinutes(minutes + addMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseServiceDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) return null;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export interface ServiceValidationResult {
  isValid: boolean;
  hoursUntilService: number;
  minutesUntilService: number;
  message: string;
  earliestDateStr: string;
  earliestTimeStr: string;
  suggestedFormatted: string;
}

export function validateServiceDateTime(dateStr?: string, timeStr?: string): ServiceValidationResult {
  const earliest = getEarliestServiceDate();
  const earliestDateStr = formatDateForInput(earliest);
  const earliestTimeStr = formatTimeForInput(earliest);
  
  const formattedDay = String(earliest.getDate()).padStart(2, '0');
  const formattedMonth = String(earliest.getMonth() + 1).padStart(2, '0');
  const suggestedFormatted = `${earliestTimeStr} ngày ${formattedDay}/${formattedMonth}/${earliest.getFullYear()}`;

  if (!dateStr || !timeStr) {
    return {
      isValid: false,
      hoursUntilService: 0,
      minutesUntilService: 0,
      message: 'Vui lòng chọn ngày và giờ đầu bếp đến nhà phục vụ.',
      earliestDateStr,
      earliestTimeStr,
      suggestedFormatted,
    };
  }

  const selected = parseServiceDateTime(dateStr, timeStr);
  if (!selected) {
    return {
      isValid: false,
      hoursUntilService: 0,
      minutesUntilService: 0,
      message: 'Định dạng ngày hoặc giờ không hợp lệ.',
      earliestDateStr,
      earliestTimeStr,
      suggestedFormatted,
    };
  }

  const now = Date.now();
  const diffMs = selected.getTime() - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    return {
      isValid: false,
      hoursUntilService: 0,
      minutesUntilService: 0,
      message: `Thời gian đã qua hoặc thuộc quá khứ. Bạn phải chọn giờ phục vụ sớm nhất từ ${suggestedFormatted} (tối thiểu 4 tiếng nữa để đầu bếp chuẩn bị).`,
      earliestDateStr,
      earliestTimeStr,
      suggestedFormatted,
    };
  }

  // Check 4-hour rule (allow 30-second leeway to avoid edge second ticks)
  if (diffHours < MIN_ADVANCE_HOURS - 0.01) {
    const selectedHoursAway = Math.floor(diffHours);
    const selectedMinsAway = Math.round((diffHours - selectedHoursAway) * 60);

    return {
      isValid: false,
      hoursUntilService: diffHours,
      minutesUntilService: Math.round(diffMs / 60000),
      message: `Không được chọn giờ này (chỉ cách hiện tại ${selectedHoursAway > 0 ? `${selectedHoursAway} giờ ` : ''}${selectedMinsAway} phút). HomeMeal yêu cầu đặt trước tối thiểu 4 tiếng để đầu bếp kịp đi chợ chọn nguyên liệu tươi, sắp xếp lịch và di chuyển đến nhà bạn nấu ăn. Giờ phục vụ sớm nhất bạn có thể chọn là ${suggestedFormatted}.`,
      earliestDateStr,
      earliestTimeStr,
      suggestedFormatted,
    };
  }

  const exactHours = Math.floor(diffHours);
  const exactMinutes = Math.round((diffHours - exactHours) * 60);

  return {
    isValid: true,
    hoursUntilService: diffHours,
    minutesUntilService: Math.round(diffMs / 60000),
    message: `Thời gian phục vụ hợp lệ (đặt trước ${exactHours} tiếng ${exactMinutes > 0 ? `${exactMinutes} phút` : ''} - Đủ thời gian tối thiểu 4 tiếng để đầu bếp chuẩn bị và đến nấu).`,
    earliestDateStr,
    earliestTimeStr,
    suggestedFormatted,
  };
}
