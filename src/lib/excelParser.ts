import * as XLSX from 'xlsx';
import { SalesItem, LaborItem } from '../types';

export interface ParseResult {
  success: boolean;
  sales: SalesItem[];
  labor: LaborItem[];
  fileName: string;
  error?: string;
  warnings?: string[];
  stats: {
    salesCount: number;
    laborCount: number;
    totalPlanSales: number;
    totalFactSales: number;
    totalPlanLabor: number;
    totalFactLabor: number;
  };
}

// Clean string helper for flexible header matching
function cleanKey(key: string): string {
  return String(key || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїє]/gi, '');
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  const str = String(val).replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const warnings: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        sales: [],
        labor: [],
        fileName: file.name,
        error: 'The uploaded file does not contain any sheets.',
        stats: {
          salesCount: 0,
          laborCount: 0,
          totalPlanSales: 0,
          totalFactSales: 0,
          totalPlanLabor: 0,
          totalFactLabor: 0,
        },
      };
    }

    let parsedSales: SalesItem[] = [];
    let parsedLabor: LaborItem[] = [];

    // Identify sheets
    for (const sheetName of workbook.SheetNames) {
      const lowerName = sheetName.toLowerCase();
      const worksheet = workbook.Sheets[sheetName];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) continue;

      // Check column keys of first row
      const firstRow = rawRows[0];
      const keys = Object.keys(firstRow).map(cleanKey);

      const hasProductKey = keys.some((k) =>
        ['product', 'producten', 'товар', 'продукт', 'назва', 'найменування', 'item'].some((pk) =>
          k.includes(pk)
        )
      );
      const hasRoleKey = keys.some((k) =>
        ['role', 'roleen', 'посада', 'роль', 'професія', 'працівник', 'position', 'operation'].some((rk) =>
          k.includes(rk)
        )
      );

      const isSalesSheet =
        lowerName.includes('sale') ||
        lowerName.includes('продаж') ||
        lowerName.includes('виручк') ||
        lowerName.includes('revenue') ||
        (hasProductKey && !hasRoleKey);

      const isLaborSheet =
        lowerName.includes('labor') ||
        lowerName.includes('прац') ||
        lowerName.includes('виробництв') ||
        lowerName.includes('зарплат') ||
        lowerName.includes('cost') ||
        (hasRoleKey && !hasProductKey);

      if (isSalesSheet && parsedSales.length === 0) {
        parsedSales = parseSalesRows(rawRows);
      } else if (isLaborSheet && parsedLabor.length === 0) {
        parsedLabor = parseLaborRows(rawRows);
      }
    }

    // Fallback if sheets were not recognized by name or headers
    if (parsedSales.length === 0 && parsedLabor.length === 0) {
      // Try parsing the first sheet as sales
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      parsedSales = parseSalesRows(rawRows);
      if (parsedSales.length === 0) {
        parsedLabor = parseLaborRows(rawRows);
      }
    }

    if (parsedSales.length === 0 && parsedLabor.length === 0) {
      return {
        success: false,
        sales: [],
        labor: [],
        fileName: file.name,
        error:
          'Could not find valid sales or labor data. Please verify column headers or use our template.',
        stats: {
          salesCount: 0,
          laborCount: 0,
          totalPlanSales: 0,
          totalFactSales: 0,
          totalPlanLabor: 0,
          totalFactLabor: 0,
        },
      };
    }

    const totalPlanSales = parsedSales.reduce((sum, s) => sum + s.planTotal, 0);
    const totalFactSales = parsedSales.reduce((sum, s) => sum + s.factTotal, 0);
    const totalPlanLabor = parsedLabor.reduce((sum, l) => sum + l.planTotal, 0);
    const totalFactLabor = parsedLabor.reduce((sum, l) => sum + l.factTotal, 0);

    return {
      success: true,
      sales: parsedSales,
      labor: parsedLabor,
      fileName: file.name,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats: {
        salesCount: parsedSales.length,
        laborCount: parsedLabor.length,
        totalPlanSales,
        totalFactSales,
        totalPlanLabor,
        totalFactLabor,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown file parsing error';
    return {
      success: false,
      sales: [],
      labor: [],
      fileName: file.name,
      error: `Failed to parse Excel file: ${errorMsg}`,
      stats: {
        salesCount: 0,
        laborCount: 0,
        totalPlanSales: 0,
        totalFactSales: 0,
        totalPlanLabor: 0,
        totalFactLabor: 0,
      },
    };
  }
}

function parseSalesRows(rows: Record<string, unknown>[]): SalesItem[] {
  const result: SalesItem[] = [];

  rows.forEach((row, index) => {
    let product = '';
    let productEn = '';
    let planQty = 0;
    let planPrice = 0;
    let factQty = 0;
    let factPrice = 0;
    let comment = '';
    let commentEn = '';

    for (const [key, rawVal] of Object.entries(row)) {
      const clean = cleanKey(key);
      const valStr = String(rawVal || '').trim();

      if (
        ['product', 'товар', 'продукт', 'найменування', 'назва', 'item', 'productname'].some((k) =>
          clean.includes(k)
        )
      ) {
        if (clean.includes('en') || clean.includes('eng')) {
          productEn = valStr;
        } else {
          product = valStr;
        }
      } else if (clean.includes('planqty') || clean.includes('планкількість') || clean.includes('планобсяг') || clean.includes('planquantity')) {
        planQty = parseNumber(rawVal);
      } else if (clean.includes('planprice') || clean.includes('планціна') || clean.includes('плановаціна')) {
        planPrice = parseNumber(rawVal);
      } else if (clean.includes('factqty') || clean.includes('факткількість') || clean.includes('фактобсяг') || clean.includes('actualqty') || clean.includes('actualquantity')) {
        factQty = parseNumber(rawVal);
      } else if (clean.includes('factprice') || clean.includes('фактціна') || clean.includes('фактичнаціна') || clean.includes('actualprice')) {
        factPrice = parseNumber(rawVal);
      } else if (clean.includes('comment') || clean.includes('коментар') || clean.includes('примітка')) {
        if (clean.includes('en') || clean.includes('eng')) {
          commentEn = valStr;
        } else {
          comment = valStr;
        }
      }
    }

    if (!product && !productEn && planQty === 0 && factQty === 0) {
      return; // Skip empty rows
    }

    const finalProduct = product || productEn || `Item ${index + 1}`;
    const finalProductEn = productEn || product || `Item ${index + 1}`;

    const planTotal = planQty * planPrice;
    const factTotal = factQty * factPrice;
    const varianceTotal = factTotal - planTotal;
    const varianceVolume = (factQty - planQty) * planPrice;
    const variancePrice = factQty * (factPrice - planPrice);
    const variancePercent = planTotal > 0 ? (varianceTotal / planTotal) * 100 : 0;
    const volumeChangePercent = planQty > 0 ? ((factQty - planQty) / planQty) * 100 : 0;
    const priceChangePercent = planPrice > 0 ? ((factPrice - planPrice) / planPrice) * 100 : 0;

    let status: 'positive' | 'negative' | 'critical' = 'positive';
    if (variancePercent < -25) {
      status = 'critical';
    } else if (variancePercent < 0) {
      status = 'negative';
    }

    const autoCommentUk =
      comment ||
      `${varianceTotal >= 0 ? 'Перевиконання' : 'Недовиконання'} плану на ${Math.abs(variancePercent).toFixed(1)}%. Вплив обсягу: ${varianceVolume >= 0 ? '+' : ''}${Math.round(varianceVolume).toLocaleString()} ₴, вплив ціни: ${variancePrice >= 0 ? '+' : ''}${Math.round(variancePrice).toLocaleString()} ₴.`;

    const autoCommentEn =
      commentEn ||
      `Net variance: ${varianceTotal >= 0 ? '+' : ''}${Math.round(varianceTotal).toLocaleString()} (${variancePercent >= 0 ? '+' : ''}${variancePercent.toFixed(1)}%). Volume effect: ${Math.round(varianceVolume).toLocaleString()}, price effect: ${Math.round(variancePrice).toLocaleString()}.`;

    result.push({
      id: `sales-${index + 1}-${Date.now()}`,
      product: finalProduct,
      productEn: finalProductEn,
      planQty,
      planPrice,
      planTotal,
      factQty,
      factPrice,
      factTotal,
      varianceTotal,
      varianceVolume,
      variancePrice,
      variancePercent,
      volumeChangePercent,
      priceChangePercent,
      comment: autoCommentUk,
      commentEn: autoCommentEn,
      status,
    });
  });

  return result;
}

function parseLaborRows(rows: Record<string, unknown>[]): LaborItem[] {
  const result: LaborItem[] = [];

  rows.forEach((row, index) => {
    let role = '';
    let roleEn = '';
    let planHours = 0;
    let planRate = 0;
    let factHours = 0;
    let factRate = 0;
    let comment = '';
    let commentEn = '';

    for (const [key, rawVal] of Object.entries(row)) {
      const clean = cleanKey(key);
      const valStr = String(rawVal || '').trim();

      if (
        ['role', 'посада', 'роль', 'професія', 'працівник', 'position', 'operation', 'labor'].some((k) =>
          clean.includes(k)
        )
      ) {
        if (clean.includes('en') || clean.includes('eng')) {
          roleEn = valStr;
        } else {
          role = valStr;
        }
      } else if (clean.includes('planhours') || clean.includes('плангодини') || clean.includes('планнорм') || clean.includes('плангод')) {
        planHours = parseNumber(rawVal);
      } else if (clean.includes('planrate') || clean.includes('плантариф') || clean.includes('планставка') || clean.includes('planwage')) {
        planRate = parseNumber(rawVal);
      } else if (clean.includes('facthours') || clean.includes('фактгодини') || clean.includes('фактнорм') || clean.includes('actualhours') || clean.includes('фактгод')) {
        factHours = parseNumber(rawVal);
      } else if (clean.includes('factrate') || clean.includes('факттариф') || clean.includes('фактставка') || clean.includes('actualrate')) {
        factRate = parseNumber(rawVal);
      } else if (clean.includes('comment') || clean.includes('коментар') || clean.includes('примітка')) {
        if (clean.includes('en') || clean.includes('eng')) {
          commentEn = valStr;
        } else {
          comment = valStr;
        }
      }
    }

    if (!role && !roleEn && planHours === 0 && factHours === 0) {
      return; // Skip empty rows
    }

    const finalRole = role || roleEn || `Role ${index + 1}`;
    const finalRoleEn = roleEn || role || `Role ${index + 1}`;

    const planTotal = planHours * planRate;
    const factTotal = factHours * factRate;
    // Labor cost overrun is positive in cost, so variance in total expense:
    const varianceTotal = planTotal - factTotal;
    const varianceHours = (planHours - factHours) * planRate;
    const varianceRate = factHours * (planRate - factRate);
    const variancePercent = planTotal > 0 ? (varianceTotal / planTotal) * 100 : 0;
    const hoursChangePercent = planHours > 0 ? ((factHours - planHours) / planHours) * 100 : 0;
    const rateChangePercent = planRate > 0 ? ((factRate - planRate) / planRate) * 100 : 0;

    let status: 'positive' | 'negative' | 'critical' = 'positive';
    if (varianceTotal < -200 || variancePercent < -25) {
      status = 'critical';
    } else if (varianceTotal < 0) {
      status = 'negative';
    }

    const autoCommentUk =
      comment ||
      `${varianceTotal >= 0 ? 'Економія трудовитрат' : 'Перевитрати на оплату праці'}: ${Math.abs(varianceTotal).toFixed(1)} ₴/т. Вплив годин: ${varianceHours >= 0 ? '+' : ''}${varianceHours.toFixed(1)} ₴, вплив тарифу: ${varianceRate >= 0 ? '+' : ''}${varianceRate.toFixed(1)} ₴.`;

    const autoCommentEn =
      commentEn ||
      `Labor variance: ${varianceTotal >= 0 ? '+' : ''}${varianceTotal.toFixed(1)} UAH/t. Hours deviation: ${hoursChangePercent >= 0 ? '+' : ''}${hoursChangePercent.toFixed(1)}%, Wage rate deviation: ${rateChangePercent >= 0 ? '+' : ''}${rateChangePercent.toFixed(1)}%.`;

    result.push({
      id: `labor-${index + 1}-${Date.now()}`,
      role: finalRole,
      roleEn: finalRoleEn,
      planHoursPerTon: planHours,
      planHourlyRate: planRate,
      planRatePerHour: planRate,
      planTotal,
      factHoursPerTon: factHours,
      factHourlyRate: factRate,
      factRatePerHour: factRate,
      factTotal,
      varianceTotal,
      varianceVolume: varianceHours,
      varianceHours,
      varianceRate,
      variancePercent,
      hoursChangePercent,
      rateChangePercent,
      comment: autoCommentUk,
      commentEn: autoCommentEn,
      status,
    });
  });

  return result;
}

/**
 * Generates and downloads a clean, beautifully formatted Excel template
 * with two sheets: "Sales Data" and "Labor Data".
 */
export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Sales
  const salesHeaders = [
    ['Product (Назва товару)', 'Product (EN)', 'Plan Qty (План к-сть)', 'Plan Price (План ціна ₴)', 'Fact Qty (Факт к-сть)', 'Fact Price (Факт ціна ₴)', 'Notes (Коментар)'],
    ['Шоколадні цукерки', 'Chocolate Candies', 14785, 55.0, 11441, 56.0, 'Підвищення ціни частково компенсувало спад попиту'],
    ['Кокосове печиво', 'Coconut Cookies', 96512, 46.0, 106163, 42.0, 'Знижка стимулювала зростання натурального обсягу'],
    ['Ванільні вафлі', 'Vanilla Waffles', 9456, 35.0, 4728, 32.0, 'Зниження обсягів реалізації'],
    ['Сушені банани', 'Dried Bananas', 2548, 90.0, 2930, 91.0, 'Перевиконання плану за ціною та обсягом'],
    ['Набір горішків', 'Nut Set', 547, 150.0, 182, 170.0, 'Висока ціна стримала купівельну спроможність'],
  ];
  const wsSales = XLSX.utils.aoa_to_sheet(salesHeaders);
  // Column widths
  wsSales['!cols'] = [
    { wch: 26 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Data (Продажі)');

  // Sheet 2: Labor
  const laborHeaders = [
    ['Role (Посада)', 'Role (EN)', 'Plan Hours (План год/т)', 'Plan Rate (План тариф ₴/год)', 'Fact Hours (Факт год/т)', 'Fact Rate (Факт тариф ₴/год)', 'Notes (Коментар)'],
    ['Оператор лінії', 'Machine Operator', 5.0, 110.0, 4.5, 111.0, 'Підвищення продуктивності праці'],
    ['Пакувальник', 'Packer', 15.0, 93.0, 21.0, 95.0, 'Перевитрати через ручне допаковування'],
    ['Електрик', 'Electrician', 1.0, 154.0, 0.8, 155.0, 'Оптимізація планових чергувань'],
    ['Контролер якості', 'Quality Inspector', 2.0, 120.0, 2.2, 120.0, 'Додатковий контроль партій'],
    ['Вантажник', 'Loader', 4.0, 85.0, 4.2, 88.0, 'Нічні зміни на складі сировини'],
  ];
  const wsLabor = XLSX.utils.aoa_to_sheet(laborHeaders);
  wsLabor['!cols'] = [
    { wch: 24 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLabor, 'Labor Data (Витрати на працю)');

  XLSX.writeFile(wb, 'FPnA_Analytics_Template.xlsx');
}

/**
 * Exports current dashboard state to an Excel file (.xlsx)
 */
export function exportCurrentDataToExcel(
  salesData: SalesItem[],
  laborData: LaborItem[],
  filename = 'Analytics_Dashboard_Export.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  // Export Sales
  const salesRows = salesData.map((s) => ({
    Product: s.product,
    'Product (EN)': s.productEn,
    'Plan Qty': s.planQty,
    'Plan Price (UAH)': s.planPrice,
    'Plan Revenue (UAH)': s.planTotal,
    'Fact Qty': s.factQty,
    'Fact Price (UAH)': s.factPrice,
    'Fact Revenue (UAH)': s.factTotal,
    'Net Variance (UAH)': s.varianceTotal,
    'Volume Effect (UAH)': s.varianceVolume,
    'Price Effect (UAH)': s.variancePrice,
    'Variance %': s.variancePercent,
    Notes: s.comment,
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Analysis');

  // Export Labor
  const laborRows = laborData.map((l) => ({
    Role: l.role,
    'Role (EN)': l.roleEn,
    'Plan Hours/t': l.planHoursPerTon,
    'Plan Wage Rate (UAH/h)': l.planHourlyRate,
    'Plan Total (UAH/t)': l.planTotal,
    'Fact Hours/t': l.factHoursPerTon,
    'Fact Wage Rate (UAH/h)': l.factHourlyRate,
    'Fact Total (UAH/t)': l.factTotal,
    'Variance (UAH/t)': l.varianceTotal,
    'Hours Effect (UAH/t)': l.varianceHours,
    'Rate Effect (UAH/t)': l.varianceRate,
    'Variance %': l.variancePercent,
    Notes: l.comment,
  }));
  const wsLabor = XLSX.utils.json_to_sheet(laborRows);
  XLSX.utils.book_append_sheet(wb, wsLabor, 'Labor Analysis');

  XLSX.writeFile(wb, filename);
}
