import { Projeto } from '../types';

export const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DIAS_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Parses YYYY-MM-DD or ISO string into Date object at end of day or specific hour
 */
export function parseDateString(str: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    // Use end of day for deadline (23:59:59)
    return new Date(year, month, day, 23, 59, 59);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY
 */
export function formatBRDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Calculates hours difference between current simulated time and deadline.
 * Reference date: 2026-10-07T08:07:00 (or current real date)
 */
export function getHoursRemaining(deadlineStr: string, referenceDate: Date = new Date(2026, 9, 7, 8, 7)): number {
  const deadline = parseDateString(deadlineStr);
  if (!deadline) return 999;
  const diffMs = deadline.getTime() - referenceDate.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Regra de Previsibilidade Ativa:
 * Se status for 'Ideia' e faltarem <= 24 horas para a Data Limite de Produção,
 * o projeto entra em RISCO ATIVO DE PRODUÇÃO.
 */
export function isProjetoInRisk(projeto: Projeto, referenceDate: Date = new Date(2026, 9, 7, 8, 7)): boolean {
  if (projeto.status !== 'Ideia') return false;
  if (!projeto.dataLimiteProducao) return false;
  const hours = getHoursRemaining(projeto.dataLimiteProducao, referenceDate);
  return hours <= 24; // Less than or equal to 24h, including already past due
}

// Compat alias
export const isPautaInRisk = isProjetoInRisk;

/**
 * Generates month grid for calendar display (weeks of 7 days)
 */
export interface CalendarDayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getCalendarGrid(year: number, monthIndex: number, referenceDate: Date = new Date(2026, 9, 7)): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const date = new Date(prevYear, prevMonth, day);
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      date,
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday =
      referenceDate.getFullYear() === year &&
      referenceDate.getMonth() === monthIndex &&
      referenceDate.getDate() === day;

    cells.push({
      date,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date,
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
      });
    }
  }

  return cells;
}
