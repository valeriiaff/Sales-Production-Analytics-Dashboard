import React, { useState } from 'react';
import { SalesItem, LaborItem, Language } from '../types';
import { STRATEGIC_INSIGHTS } from '../data/dashboardData';
import { formatCurrency, formatPercent } from '../lib/utils';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  Zap,
  Target,
  ArrowRight,
} from 'lucide-react';

interface InsightsSectionProps {
  salesData: SalesItem[];
  laborData: LaborItem[];
  language: Language;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  salesData,
  laborData,
  language,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'sales' | 'labor'>('all');
  const insights = STRATEGIC_INSIGHTS[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            {language === 'uk' ? 'Аналітичні висновки та рекомендації менеджменту' : 'Strategic Diagnostics & Executive Action Plan'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Якісний аналіз причин відхилень від плану, ринкове позиціонування та план оптимізації'
              : 'Root-cause qualitative analysis, market positioning diagnostics, and optimization plan'}
          </p>
        </div>

        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterCategory === 'all'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {language === 'uk' ? 'Всі висновки' : 'All Insights'}
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('sales')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterCategory === 'sales'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {language === 'uk' ? 'Продажі' : 'Sales'}
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('labor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterCategory === 'labor'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {language === 'uk' ? 'Виробництво' : 'Labor'}
          </button>
        </div>
      </div>

      {/* Strategic Takeaways Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Strategy Card */}
        {(filterCategory === 'all' || filterCategory === 'sales') && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm border-b border-[#F1F5F9] pb-3">
              <Target className="w-4 h-4" />
              <span className="text-[#0F172A]">{insights.salesTitle}</span>
            </div>

            <ul className="space-y-3">
              {insights.salesPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-[#334155] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 border border-[#BFDBFE]">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Labor Operations Strategy Card */}
        {(filterCategory === 'all' || filterCategory === 'labor') && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#D97706] font-bold text-sm border-b border-[#F1F5F9] pb-3">
              <Zap className="w-4 h-4" />
              <span className="text-[#0F172A]">{insights.laborTitle}</span>
            </div>

            <ul className="space-y-3">
              {insights.laborPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-[#334155] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 border border-[#FDE68A]">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Individual Product & Role Verbatim Dossiers */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">
          {language === 'uk' ? 'Деталізовані картки спостережень з первинного звіту' : 'Itemized Diagnostic Notes from Source Report'}
        </h3>

        {/* Products */}
        {(filterCategory === 'all' || filterCategory === 'sales') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl p-5 shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {language === 'uk' ? item.product : item.productEn}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.varianceTotal >= 0
                        ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                        : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                    }`}
                  >
                    {formatCurrency(item.varianceTotal, language, 0)}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {language === 'uk' ? item.comment : item.commentEn}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Labor Roles */}
        {(filterCategory === 'all' || filterCategory === 'labor') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {laborData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl p-5 shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {language === 'uk' ? item.role : item.roleEn}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.varianceTotal >= 0
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                        : 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                    }`}
                  >
                    {item.varianceTotal >= 0 ? '+' : ''}{item.varianceTotal.toFixed(2)} ₴
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {language === 'uk' ? item.comment : item.commentEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
