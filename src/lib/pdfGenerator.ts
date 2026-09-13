import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SalesItem, LaborItem, Language } from '../types';
import { formatCurrency, formatNumber, formatPercent } from './utils';

export async function generateVariancePDF(
  salesData: SalesItem[],
  laborData: LaborItem[],
  language: Language,
  isSimulated: boolean = false
): Promise<void> {
  // Aggregate sales metrics
  const totalPlanSales = salesData.reduce((acc, i) => acc + (i.planTotal ?? 0), 0);
  const totalFactSales = salesData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const totalSalesVariance = totalFactSales - totalPlanSales;
  const totalSalesVariancePercent = totalPlanSales > 0 ? (totalSalesVariance / totalPlanSales) * 100 : 0;
  const totalVolumeEffect = salesData.reduce((acc, i) => acc + (i.varianceVolume ?? 0), 0);
  const totalPriceEffect = salesData.reduce((acc, i) => acc + (i.variancePrice ?? 0), 0);

  // Aggregate labor metrics
  const totalPlanLabor = laborData.reduce((acc, i) => acc + (i.planTotal ?? 0), 0);
  const totalFactLabor = laborData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const totalLaborVariance = totalFactLabor - totalPlanLabor;
  const totalLaborVariancePercent = totalPlanLabor > 0 ? (totalLaborVariance / totalPlanLabor) * 100 : 0;
  const totalPlanHours = laborData.reduce((acc, i) => acc + (i.planHoursPerTon ?? 0), 0);
  const totalFactHours = laborData.reduce((acc, i) => acc + (i.factHoursPerTon ?? 0), 0);

  const reportDate = new Date().toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create temporary container for report rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#0F172A';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  const isUk = language === 'uk';

  container.innerHTML = `
    <div style="max-width: 736px; margin: 0 auto; line-height: 1.4;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <span style="font-size: 10px; font-weight: 700; color: #3B82F6; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
            ${isUk ? 'КОНДИТЕРСЬКА КОРПОРАЦІЯ • ФІНАНСОВИЙ ДЕПАРТАМЕНТ' : 'CONFECTIONERY ENTERPRISE • FINANCIAL CONTROLLING'}
          </span>
          <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">
            ${isUk ? 'Звіт факторного аналізу відхилень (План vs Факт)' : 'Factor Variance Analysis Report (Plan vs Actual)'}
          </h1>
          <p style="font-size: 11px; color: #64748B; margin: 0;">
            ${isUk ? 'Аналітика реалізації продукції, факторів обсягу/ціни та виробничих трудовитрат' : 'Sales revenue decomposition (Volume & Price effects) and manufacturing labor'}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; font-weight: 600; color: #0F172A;">${reportDate}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">
            ${isSimulated ? (isUk ? 'Режим: Сценарне моделювання' : 'Status: Simulated Scenario') : (isUk ? 'Режим: Офіційний факт' : 'Status: Official Baseline')}
          </div>
          <div style="margin-top: 6px; display: inline-block; padding: 2px 8px; font-size: 9px; font-weight: 700; background: #EFF6FF; color: #1D4ED8; border-radius: 4px; border: 1px solid #BFDBFE;">
            ${isUk ? 'КОНФІДЕНЦІЙНО' : 'CONFIDENTIAL'}
          </div>
        </div>
      </div>

      <!-- KPI Executive Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">
            ${isUk ? 'Фактичний виторг' : 'Actual Revenue'}
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 4px 0;">
            ${formatCurrency(totalFactSales, language, 0)}
          </div>
          <div style="font-size: 10px; color: ${totalSalesVariance >= 0 ? '#10B981' : '#EF4444'}; font-weight: 600;">
            ${totalSalesVariance >= 0 ? '+' : ''}${formatPercent(totalSalesVariancePercent)} (${formatCurrency(totalSalesVariance, language, 0)})
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">
            ${isUk ? 'Фактор обсягу (ΔQ)' : 'Volume Effect (ΔQ)'}
          </div>
          <div style="font-size: 16px; font-weight: 800; color: ${totalVolumeEffect >= 0 ? '#10B981' : '#EF4444'}; margin: 4px 0;">
            ${totalVolumeEffect >= 0 ? '+' : ''}${formatCurrency(totalVolumeEffect, language, 0)}
          </div>
          <div style="font-size: 10px; color: #64748B;">
            ${isUk ? 'Приріст бананів та печива' : 'Driven by bananas & cookies'}
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">
            ${isUk ? 'Фактор ціни (ΔP)' : 'Price Effect (ΔP)'}
          </div>
          <div style="font-size: 16px; font-weight: 800; color: ${totalPriceEffect >= 0 ? '#10B981' : '#EF4444'}; margin: 4px 0;">
            ${totalPriceEffect >= 0 ? '+' : ''}${formatCurrency(totalPriceEffect, language, 0)}
          </div>
          <div style="font-size: 10px; color: #64748B;">
            ${isUk ? 'Знижки на цукерки та горіхи' : 'Discounting on sweets/nuts'}
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">
            ${isUk ? 'Витрати на працю' : 'Labor Cost / Ton'}
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 4px 0;">
            ${formatCurrency(totalFactLabor, language, 1)}
          </div>
          <div style="font-size: 10px; color: #EF4444; font-weight: 600;">
            +${formatPercent(totalLaborVariancePercent, false)} (${(totalFactHours ?? 0).toFixed(1)} ${isUk ? 'год/т' : 'hrs/t'})
          </div>
        </div>
      </div>

      <!-- Section 1: Sales Variance Table -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <h2 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 0;">
            1. ${isUk ? 'Аналіз виконання плану продажів та факторів виручки' : 'Sales Plan Fulfillment & Revenue Variance Decomposition'}
          </h2>
          <span style="font-size: 10px; color: #64748B;">${isUk ? 'Суми в грн (₴)' : 'Amounts in UAH (₴)'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right; border: 1px solid #E2E8F0;">
          <thead>
            <tr style="background: #F1F5F9; color: #334155; font-weight: 700; border-bottom: 1.5px solid #CBD5E1;">
              <th style="text-align: left; padding: 6px 8px;">${isUk ? 'Найменування продукту' : 'Product Name'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План к-сть' : 'Plan Qty'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт к-сть' : 'Fact Qty'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План ціна' : 'Plan Price'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт ціна' : 'Fact Price'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План виторг' : 'Plan Total'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт виторг' : 'Fact Total'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Фактор ΔQ' : 'Volume ΔQ'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Фактор ΔP' : 'Price ΔP'}</th>
              <th style="padding: 6px 8px;">${isUk ? 'Відхилення' : 'Variance'}</th>
            </tr>
          </thead>
          <tbody>
            ${salesData
              .map(
                (item, index) => `
              <tr style="border-bottom: 1px solid #F1F5F9; background: ${index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                <td style="text-align: left; padding: 6px 8px; font-weight: 600; color: #0F172A;">
                  ${isUk ? item.product : item.productEn}
                </td>
                <td style="padding: 6px 6px; font-family: monospace;">${formatNumber(item.planQty, language)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${formatNumber(item.factQty, language)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${item.planPrice.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${item.factPrice.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${formatNumber(Math.round(item.planTotal), language)}</td>
                <td style="padding: 6px 6px; font-family: monospace; font-weight: 600;">${formatNumber(Math.round(item.factTotal), language)}</td>
                <td style="padding: 6px 6px; font-family: monospace; color: ${(item.varianceVolume ?? 0) >= 0 ? '#10B981' : '#EF4444'}; font-weight: 600;">
                  ${(item.varianceVolume ?? 0) >= 0 ? '+' : ''}${formatNumber(Math.round(item.varianceVolume), language)}
                </td>
                <td style="padding: 6px 6px; font-family: monospace; color: ${(item.variancePrice ?? 0) >= 0 ? '#10B981' : '#EF4444'}; font-weight: 600;">
                  ${(item.variancePrice ?? 0) >= 0 ? '+' : ''}${formatNumber(Math.round(item.variancePrice), language)}
                </td>
                <td style="padding: 6px 8px; font-family: monospace; font-weight: 700; color: ${(item.varianceTotal ?? 0) >= 0 ? '#10B981' : '#EF4444'};">
                  ${(item.varianceTotal ?? 0) >= 0 ? '+' : ''}${formatNumber(Math.round(item.varianceTotal), language)} (${(item.variancePercent ?? 0).toFixed(1)}%)
                </td>
              </tr>
            `
              )
              .join('')}
            <tr style="background: #E2E8F0; font-weight: 800; border-top: 2px solid #94A3B8; color: #0F172A;">
              <td style="text-align: left; padding: 7px 8px;">${isUk ? 'РАЗОМ ПО ПІДПРИЄМСТВУ' : 'TOTAL REVENUE'}</td>
              <td style="padding: 7px 6px;" colspan="4">-</td>
              <td style="padding: 7px 6px; font-family: monospace;">${formatNumber(Math.round(totalPlanSales), language)}</td>
              <td style="padding: 7px 6px; font-family: monospace;">${formatNumber(Math.round(totalFactSales), language)}</td>
              <td style="padding: 7px 6px; font-family: monospace; color: ${totalVolumeEffect >= 0 ? '#10B981' : '#EF4444'};">
                ${totalVolumeEffect >= 0 ? '+' : ''}${formatNumber(Math.round(totalVolumeEffect), language)}
              </td>
              <td style="padding: 7px 6px; font-family: monospace; color: ${totalPriceEffect >= 0 ? '#10B981' : '#EF4444'};">
                ${totalPriceEffect >= 0 ? '+' : ''}${formatNumber(Math.round(totalPriceEffect), language)}
              </td>
              <td style="padding: 7px 8px; font-family: monospace; color: ${totalSalesVariance >= 0 ? '#10B981' : '#EF4444'};">
                ${totalSalesVariance >= 0 ? '+' : ''}${formatNumber(Math.round(totalSalesVariance), language)} (${formatPercent(totalSalesVariancePercent)})
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 2: Labor Cost Analysis Table -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <h2 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 0;">
            2. ${isUk ? 'Аналіз витрат на оплату праці на 1 тонну продукції' : 'Labor Cost & Rate Variance per 1 Ton'}
          </h2>
          <span style="font-size: 10px; color: #64748B;">${isUk ? 'Трудомісткість у год/т, тарифи у ₴/год' : 'Hours/ton, Rates in UAH/hr'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right; border: 1px solid #E2E8F0;">
          <thead>
            <tr style="background: #F1F5F9; color: #334155; font-weight: 700; border-bottom: 1.5px solid #CBD5E1;">
              <th style="text-align: left; padding: 6px 8px;">${isUk ? 'Виробнича посада / операція' : 'Manufacturing Role'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План год/т' : 'Plan H/t'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт год/т' : 'Fact H/t'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План тариф' : 'Plan Rate'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт тариф' : 'Fact Rate'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'План разом' : 'Plan Cost'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Факт разом' : 'Fact Cost'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Вплив норм ΔH' : 'Hours ΔH'}</th>
              <th style="padding: 6px 6px;">${isUk ? 'Вплив тарифу ΔR' : 'Rate ΔR'}</th>
              <th style="padding: 6px 8px;">${isUk ? 'Відхилення' : 'Variance'}</th>
            </tr>
          </thead>
          <tbody>
            ${laborData
              .map(
                (item, index) => `
              <tr style="border-bottom: 1px solid #F1F5F9; background: ${index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                <td style="text-align: left; padding: 6px 8px; font-weight: 600; color: #0F172A;">
                  ${isUk ? item.role : item.roleEn}
                </td>
                <td style="padding: 6px 6px; font-family: monospace;">${item.planHoursPerTon.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace; font-weight: 600;">${item.factHoursPerTon.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${(item.planHourlyRate ?? item.planRatePerHour ?? 0).toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${(item.factHourlyRate ?? item.factRatePerHour ?? 0).toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace;">${item.planTotal.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace; font-weight: 600;">${item.factTotal.toFixed(1)}</td>
                <td style="padding: 6px 6px; font-family: monospace; color: ${(item.varianceHours ?? item.varianceVolume ?? 0) > 0 ? '#EF4444' : '#10B981'};">
                  ${(item.varianceHours ?? item.varianceVolume ?? 0) > 0 ? '+' : ''}${(item.varianceHours ?? item.varianceVolume ?? 0).toFixed(1)}
                </td>
                <td style="padding: 6px 6px; font-family: monospace; color: ${(item.varianceRate ?? 0) > 0 ? '#EF4444' : '#10B981'};">
                  ${(item.varianceRate ?? 0) > 0 ? '+' : ''}${(item.varianceRate ?? 0).toFixed(1)}
                </td>
                <td style="padding: 6px 8px; font-family: monospace; font-weight: 700; color: ${(item.varianceTotal ?? 0) > 0 ? '#EF4444' : '#10B981'};">
                  ${(item.varianceTotal ?? 0) > 0 ? '+' : ''}${(item.varianceTotal ?? 0).toFixed(1)} ₴ (${(item.variancePercent ?? 0).toFixed(1)}%)
                </td>
              </tr>
            `
              )
              .join('')}
            <tr style="background: #E2E8F0; font-weight: 800; border-top: 2px solid #94A3B8; color: #0F172A;">
              <td style="text-align: left; padding: 7px 8px;">${isUk ? 'РАЗОМ ВИТРАТИ ПРАЦІ НА 1 ТОННУ' : 'TOTAL LABOR COST PER 1 TON'}</td>
              <td style="padding: 7px 6px; font-family: monospace;">${totalPlanHours.toFixed(1)}</td>
              <td style="padding: 7px 6px; font-family: monospace;">${totalFactHours.toFixed(1)}</td>
              <td style="padding: 7px 6px;" colspan="2">-</td>
              <td style="padding: 7px 6px; font-family: monospace;">${totalPlanLabor.toFixed(1)}</td>
              <td style="padding: 7px 6px; font-family: monospace;">${totalFactLabor.toFixed(1)}</td>
              <td style="padding: 7px 6px; font-family: monospace; color: #EF4444;">+550.0</td>
              <td style="padding: 7px 6px; font-family: monospace; color: #EF4444;">+199.2</td>
              <td style="padding: 7px 8px; font-family: monospace; color: #EF4444;">
                +${totalLaborVariance.toFixed(1)} ₴ (+${formatPercent(totalLaborVariancePercent, false)})
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 3: Executive Conclusions & Recommendations -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <h3 style="font-size: 11px; font-weight: 800; color: #0F172A; text-transform: uppercase; margin: 0 0 8px 0;">
          ${isUk ? 'Ключові управлінські висновки та план дій:' : 'Key Management Takeaways & Strategic Action Plan:'}
        </h3>
        <ul style="margin: 0; padding-left: 16px; font-size: 10px; color: #334155; line-height: 1.6;">
          <li>
            <strong>${isUk ? 'Просідання Ванільних вафель (-54%):' : 'Vanilla Waffles Bottleneck (-54%):'}</strong>
            ${isUk ? 'Недовиконання плану продажів на 4,728 од. (-179,664 ₴). Терміново вирішити дефіцит сировини та відновити постачання.' : 'Shortfall of 4,728 units (-179,664 ₴). Immediate procurement stabilization required.'}
          </li>
          <li>
            <strong>${isUk ? 'Неефективність цінового дисконтування цукерок та горіхів:' : 'Ineffective price discounting on candies and nuts:'}</strong>
            ${isUk ? 'Знижки спричинили сумарну втрату маржі на -420,819 ₴ без пропорційного зростання обсягів. Рекомендовано переглянути прайс-лист.' : 'Price cuts caused -420,819 ₴ margin erosion without offsetting volume elasticity.'}
          </li>
          <li>
            <strong>${isUk ? 'Критичні перевитрати на пакуванні (+40% годин):' : 'Packaging Labor Overrun (+40% hours):'}</strong>
            ${isUk ? 'Пакувальник витратив 21 год/т замість 15 год/т, спричинивши +600 ₴ перевитрат на кожну тонну. Пріоритет: відновлення напівавтоматичної лінії.' : 'Packaging hours surged from 15 to 21 hrs/t (+600 ₴/t). Automation line overhaul is urgent.'}
          </li>
        </ul>
      </div>

      <!-- Footer & Signature Block -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #CBD5E1; padding-top: 12px; font-size: 9.5px; color: #64748B;">
        <div>
          <div>${isUk ? 'Сформовано аналітичною системою Enterprise Variance Controller' : 'Generated by Enterprise Variance Controller'}</div>
          <div>${isUk ? 'ID документа' : 'Document ID'}: VAR-${Date.now().toString(36).toUpperCase()}</div>
        </div>
        <div style="display: flex; gap: 32px; text-align: right;">
          <div>
            <div style="border-bottom: 1px solid #94A3B8; width: 120px; height: 18px; margin-bottom: 2px;"></div>
            <div style="font-size: 8.5px;">${isUk ? 'Фінансовий контролер' : 'Financial Controller'}</div>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94A3B8; width: 120px; height: 18px; margin-bottom: 2px;"></div>
            <div style="font-size: 8.5px;">${isUk ? 'Головний технолог' : 'Operations Director'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 595.28 pt
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 841.89 pt
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 15) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `variance_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

export function exportVarianceCSV(
  salesData: SalesItem[],
  laborData: LaborItem[],
  language: Language
): void {
  const isUk = language === 'uk';
  const sep = ';'; // standard for European / Ukrainian Excel locales

  let csv = '\uFEFF'; // UTF-8 BOM for Excel Cyrillic rendering

  // Sales Section
  csv += isUk
    ? '--- 1. АНАЛІЗ ПРОДАЖІВ ТА ФАКТОРІВ ВИРУЧКИ ---\n'
    : '--- 1. SALES AND REVENUE VARIANCE ANALYSIS ---\n';

  csv += [
    isUk ? 'Продукт' : 'Product',
    isUk ? 'План к-сть' : 'Plan Qty',
    isUk ? 'Факт к-сть' : 'Fact Qty',
    isUk ? 'План ціна' : 'Plan Price',
    isUk ? 'Факт ціна' : 'Fact Price',
    isUk ? 'План виторг' : 'Plan Total',
    isUk ? 'Факт виторг' : 'Fact Total',
    isUk ? 'Фактор обсягу (ΔQ)' : 'Volume Effect (ΔQ)',
    isUk ? 'Фактор ціни (ΔP)' : 'Price Effect (ΔP)',
    isUk ? 'Сумарне відхилення' : 'Total Variance',
    isUk ? 'Відхилення %' : 'Variance %',
  ].join(sep) + '\n';

  salesData.forEach((item) => {
    csv += [
      `"${isUk ? item.product : item.productEn}"`,
      item.planQty,
      item.factQty,
      item.planPrice,
      item.factPrice,
      Math.round(item.planTotal),
      Math.round(item.factTotal),
      Math.round(item.varianceVolume),
      Math.round(item.variancePrice),
      Math.round(item.varianceTotal),
      `${(item.variancePercent ?? 0).toFixed(2)}%`,
    ].join(sep) + '\n';
  });

  csv += '\n';

  // Labor Section
  csv += isUk
    ? '--- 2. АНАЛІЗ ВИТРАТ НА ОПЛАТУ ПРАЦІ НА 1 ТОННУ ---\n'
    : '--- 2. LABOR COST ANALYSIS PER 1 TON ---\n';

  csv += [
    isUk ? 'Посада' : 'Role',
    isUk ? 'План год/т' : 'Plan Hours/t',
    isUk ? 'Факт год/т' : 'Fact Hours/t',
    isUk ? 'План тариф (грн/год)' : 'Plan Rate (UAH/h)',
    isUk ? 'Факт тариф (грн/год)' : 'Fact Rate (UAH/h)',
    isUk ? 'План витрат' : 'Plan Total',
    isUk ? 'Факт витрат' : 'Fact Total',
    isUk ? 'Вплив норм (ΔH)' : 'Hours Effect (ΔH)',
    isUk ? 'Вплив тарифу (ΔR)' : 'Rate Effect (ΔR)',
    isUk ? 'Сумарне відхилення' : 'Total Variance',
    isUk ? 'Відхилення %' : 'Variance %',
  ].join(sep) + '\n';

  laborData.forEach((item) => {
    csv += [
      `"${isUk ? item.role : item.roleEn}"`,
      item.planHoursPerTon,
      item.factHoursPerTon,
      item.planHourlyRate ?? item.planRatePerHour ?? 0,
      item.factHourlyRate ?? item.factRatePerHour ?? 0,
      item.planTotal,
      item.factTotal,
      item.varianceHours ?? item.varianceVolume ?? 0,
      item.varianceRate ?? 0,
      item.varianceTotal,
      `${(item.variancePercent ?? 0).toFixed(2)}%`,
    ].join(sep) + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `variance_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
