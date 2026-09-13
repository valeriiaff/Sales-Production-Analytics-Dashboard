import React, { useState } from 'react';
import { SalesItem, LaborItem, Language } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import { generateVariancePDF, exportVarianceCSV } from '../lib/pdfGenerator';
import {
  Table as TableIcon,
  FileSpreadsheet,
  FileText,
  Loader2,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

interface DataTableSectionProps {
  salesData: SalesItem[];
  laborData: LaborItem[];
  language: Language;
  searchQuery?: string;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  salesData,
  laborData,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'labor'>('sales');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Sales totals
  const totalSalesPlan = salesData.reduce((acc, i) => acc + (i.planTotal ?? 0), 0);
  const totalSalesFact = salesData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const totalSalesVariance = totalSalesFact - totalSalesPlan;
  const totalVolumeVariance = salesData.reduce((acc, i) => acc + (i.varianceVolume ?? 0), 0);
  const totalPriceVariance = salesData.reduce((acc, i) => acc + (i.variancePrice ?? 0), 0);

  // Labor totals
  const totalLaborPlan = laborData.reduce((acc, i) => acc + (i.planTotal ?? 0), 0);
  const totalLaborFact = laborData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const totalLaborVariance = totalLaborFact - totalLaborPlan;
  const totalHoursVariance = laborData.reduce((acc, i) => acc + (i.varianceHours ?? i.varianceVolume ?? 0), 0);
  const totalRateVariance = laborData.reduce((acc, i) => acc + (i.varianceRate ?? 0), 0);

  // Export to CSV using robust generator
  const handleExportCSV = () => {
    exportVarianceCSV(salesData, laborData, language);
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateVariancePDF(salesData, laborData, language);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-[#3B82F6]" />
            {language === 'uk' ? 'Деталізовані зведені таблиці показників' : 'Itemized Variance Master Tables'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Первинні цифри звіту з розкриттям якісних коментарів та факторами відхилень'
              : 'Granular tabular datasets, verbatim observations, and mathematical variance factors'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-tab toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveSubTab('sales')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'sales'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {language === 'uk' ? '1. Продажі (Доходи)' : '1. Sales (Revenue)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('labor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'labor'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {language === 'uk' ? '2. Виробництво (Праця)' : '2. Labor (Costs)'}
            </button>
          </div>

          {/* Export to PDF */}
          <button
            id="table-download-pdf-btn"
            type="button"
            disabled={isGeneratingPDF}
            onClick={handleExportPDF}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPDF ? (language === 'uk' ? 'Генерація...' : 'Generating...') : (language === 'uk' ? 'Завантажити PDF' : 'Download PDF')}</span>
          </button>

          {/* Export to CSV */}
          <button
            id="table-download-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{language === 'uk' ? 'Експорт в CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Sales Table View */}
      {activeSubTab === 'sales' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">{language === 'uk' ? 'Товарна позиція' : 'Product'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План (од)' : 'Plan Qty'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План ціна' : 'Plan Price'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План разом (₴)' : 'Plan Total'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт (од)' : 'Fact Qty'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт ціна' : 'Fact Price'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт разом (₴)' : 'Fact Total'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Δ Обсягу (₴)' : 'Δ Volume (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Δ Ціни (₴)' : 'Δ Price (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Відхилення (₴)' : 'Variance (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {salesData.map((row) => {
                  const isExpanded = expandedRowId === row.id;
                  const varianceVol = row.varianceVolume ?? 0;
                  const variancePrc = row.variancePrice ?? 0;
                  const varianceTot = row.varianceTotal ?? 0;
                  const variancePct = row.variancePercent ?? 0;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        onClick={() => toggleRow(row.id)}
                        className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A] flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#3B82F6]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                          )}
                          <span>{language === 'uk' ? row.product : row.productEn}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{formatNumber(row.planQty, language)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{(row.planPrice ?? 0).toFixed(2)} ₴</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#0F172A] font-semibold">{formatNumber(row.planTotal, language)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{formatNumber(row.factQty, language)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{(row.factPrice ?? 0).toFixed(2)} ₴</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#0F172A] font-semibold">{formatNumber(row.factTotal, language)}</td>
                        <td className={`py-3.5 px-3 text-right font-mono font-medium ${varianceVol >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {varianceVol >= 0 ? '+' : ''}{formatNumber(Math.round(varianceVol), language)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-medium ${variancePrc >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {variancePrc >= 0 ? '+' : ''}{formatNumber(Math.round(variancePrc), language)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-bold ${varianceTot >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {varianceTot >= 0 ? '+' : ''}{formatNumber(Math.round(varianceTot), language)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-bold ${variancePct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Expanded Verbatim Note Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#EFF6FF]/30">
                          <td colSpan={11} className="p-4 text-xs border-y border-[#BFDBFE]">
                            <div className="flex items-start gap-2 text-[#1E40AF]">
                              <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[#1D4ED8] mb-0.5">
                                  {language === 'uk' ? 'Причина відхилення (коментар аналітика):' : 'Root Cause Commentary:'}
                                </span>
                                <p className="leading-relaxed">
                                  {language === 'uk' ? row.comment : row.commentEn}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0] font-bold text-[#0F172A]">
                  <td className="py-4 px-4">{language === 'uk' ? 'РАЗОМ (Всього)' : 'TOTAL'}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#0F172A]">{formatCurrency(totalSalesPlan, language, 0)}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#0F172A]">{formatCurrency(totalSalesFact, language, 0)}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#10B981]">+{formatCurrency(totalVolumeVariance, language, 0)}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">{formatCurrency(totalPriceVariance, language, 0)}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">{formatCurrency(totalSalesVariance, language, 0)}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">{totalSalesPlan > 0 ? formatPercent((totalSalesVariance / totalSalesPlan) * 100) : '0.0%'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Labor Table View */}
      {activeSubTab === 'labor' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">{language === 'uk' ? 'Посада / Професія' : 'Role'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План (год/т)' : 'Plan Hrs/t'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План ставка' : 'Plan Rate'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'План разом (₴)' : 'Plan Total'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт (год/т)' : 'Fact Hrs/t'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт ставка' : 'Fact Rate'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Факт разом (₴)' : 'Fact Total'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Δ Норми (₴)' : 'Δ Hours (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Δ Ставки (₴)' : 'Δ Rate (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'uk' ? 'Перевитрата (₴)' : 'Overrun (₴)'}</th>
                  <th className="py-3.5 px-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {laborData.map((row) => {
                  const isExpanded = expandedRowId === row.id;
                  const planRate = row.planHourlyRate ?? row.planRatePerHour ?? 0;
                  const factRate = row.factHourlyRate ?? row.factRatePerHour ?? 0;
                  const varianceHrs = row.varianceHours ?? row.varianceVolume ?? 0;
                  const varianceRate = row.varianceRate ?? 0;
                  const varianceTot = row.varianceTotal ?? 0;
                  const variancePct = row.variancePercent ?? 0;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        onClick={() => toggleRow(row.id)}
                        className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A] flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#3B82F6]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                          )}
                          <span>{language === 'uk' ? row.role : row.roleEn}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{(row.planHoursPerTon ?? 0).toFixed(1)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{planRate.toFixed(2)} ₴</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#0F172A] font-semibold">{(row.planTotal ?? 0).toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{(row.factHoursPerTon ?? 0).toFixed(1)}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">{factRate.toFixed(2)} ₴</td>
                        <td className="py-3.5 px-3 text-right font-mono text-[#0F172A] font-semibold">{(row.factTotal ?? 0).toFixed(2)}</td>
                        <td className={`py-3.5 px-3 text-right font-mono font-medium ${varianceHrs <= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {varianceHrs >= 0 ? '+' : ''}{varianceHrs.toFixed(2)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-medium ${varianceRate <= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {varianceRate >= 0 ? '+' : ''}{varianceRate.toFixed(2)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-bold ${varianceTot <= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {varianceTot >= 0 ? '+' : ''}{varianceTot.toFixed(2)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-mono font-bold ${variancePct <= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          +{variancePct.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Expanded Verbatim Note Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#EFF6FF]/30">
                          <td colSpan={11} className="p-4 text-xs border-y border-[#BFDBFE]">
                            <div className="flex items-start gap-2 text-[#1E40AF]">
                              <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[#1D4ED8] mb-0.5">
                                  {language === 'uk' ? 'Причина перевитрат (коментар начальника виробництва):' : 'Labor Overrun Rationale:'}
                                </span>
                                <p className="leading-relaxed">
                                  {language === 'uk' ? row.comment : row.commentEn}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0] font-bold text-[#0F172A]">
                  <td className="py-4 px-4">{language === 'uk' ? 'РАЗОМ (Всього)' : 'TOTAL'}</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">
                    {laborData.reduce((acc, i) => acc + (i.planHoursPerTon ?? 0), 0).toFixed(1)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#0F172A]">{totalLaborPlan.toFixed(2)} ₴</td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">
                    {laborData.reduce((acc, i) => acc + (i.factHoursPerTon ?? 0), 0).toFixed(1)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-[#64748B]">-</td>
                  <td className="py-4 px-3 text-right font-mono text-[#0F172A]">{totalLaborFact.toFixed(2)} ₴</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">+{totalHoursVariance.toFixed(2)} ₴</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">+{totalRateVariance.toFixed(2)} ₴</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">+{totalLaborVariance.toFixed(2)} ₴</td>
                  <td className="py-4 px-3 text-right font-mono text-[#EF4444]">+{totalLaborPlan > 0 ? formatPercent((totalLaborVariance / totalLaborPlan) * 100, false) : '0.0%'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
