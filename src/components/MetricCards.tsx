import React from 'react';
import { SalesItem, LaborItem, Language } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../lib/utils';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  Percent,
} from 'lucide-react';

interface MetricCardsProps {
  salesData: SalesItem[];
  laborData: LaborItem[];
  language: Language;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  salesData,
  laborData,
  language,
}) => {
  // Aggregate sales
  const totalPlanSales = salesData.reduce((acc, item) => acc + (item.planTotal ?? 0), 0);
  const totalFactSales = salesData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const totalSalesVariance = totalFactSales - totalPlanSales;
  const totalSalesVariancePercent = totalPlanSales > 0 ? (totalSalesVariance / totalPlanSales) * 100 : 0;

  const totalVolumeEffect = salesData.reduce((acc, item) => acc + (item.varianceVolume ?? 0), 0);
  const totalPriceEffect = salesData.reduce((acc, item) => acc + (item.variancePrice ?? 0), 0);

  // Aggregate labor
  const totalPlanLabor = laborData.reduce((acc, item) => acc + (item.planTotal ?? 0), 0);
  const totalFactLabor = laborData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const totalLaborVariance = totalFactLabor - totalPlanLabor;
  const totalLaborVariancePercent = totalPlanLabor > 0 ? (totalLaborVariance / totalPlanLabor) * 100 : 0;

  const totalPlanHours = laborData.reduce((acc, item) => acc + (item.planHoursPerTon ?? 0), 0);
  const totalFactHours = laborData.reduce((acc, item) => acc + (item.factHoursPerTon ?? 0), 0);

  // Best and worst performers
  const sortedSales = [...salesData].sort((a, b) => (b.variancePercent ?? 0) - (a.variancePercent ?? 0));
  const bestProduct = sortedSales[0];
  const worstProduct = sortedSales[sortedSales.length - 1];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {/* 1. Total Revenue Performance */}
      <div
        id="metric-revenue-card"
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {language === 'uk' ? 'Фактичний виторг' : 'Actual Revenue'}
          </p>
          <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
          {formatCurrency(totalFactSales, language, 0)}
        </p>

        <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#F1F5F9]">
          <span className="text-[#64748B]">
            {language === 'uk' ? 'План:' : 'Plan:'} {formatNumber(Math.round(totalPlanSales), language)} ₴
          </span>
          <span
            className={`font-semibold flex items-center gap-0.5 ${
              totalSalesVariance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            {totalSalesVariance >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {formatPercent(totalSalesVariancePercent)} ({formatCurrency(totalSalesVariance, language, 0)})
          </span>
        </div>
      </div>

      {/* 2. Factor Breakdown: Volume vs Price */}
      <div
        id="metric-factor-card"
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {language === 'uk' ? 'Вплив факторів (Обсяг / Ціна)' : 'Factor Effects (Vol / Price)'}
          </p>
          <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1.5 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-[#10B981]" />
              {language === 'uk' ? 'Фактор обсягу:' : 'Volume Effect:'}
            </span>
            <span
              className={`font-semibold ${
                totalVolumeEffect >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {formatCurrency(totalVolumeEffect, language, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#EF4444]" />
              {language === 'uk' ? 'Фактор ціни:' : 'Price Effect:'}
            </span>
            <span
              className={`font-semibold ${
                totalPriceEffect >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {formatCurrency(totalPriceEffect, language, 0)}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#94A3B8] pt-2.5 border-t border-[#F1F5F9] truncate">
          {language === 'uk'
            ? 'Знижки стимулювали обсяг (+74 тис), але знизили маржу (-421 тис)'
            : 'Volume gained (+74k), but price erosion impacted net revenue (-421k)'}
        </div>
      </div>

      {/* 3. Labor Cost Performance */}
      <div
        id="metric-labor-card"
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {language === 'uk' ? 'Витрати на оплату праці' : 'Labor Cost'}
          </p>
          <div className="w-7 h-7 rounded-md bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatNumber(Math.round(totalFactLabor), language)} ₴
          </p>
          <span className="text-xs text-[#EF4444] font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +{formatPercent(totalLaborVariancePercent, false)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#F1F5F9]">
          <span className="text-[#64748B]">
            {language === 'uk' ? 'План:' : 'Plan:'} {formatNumber(Math.round(totalPlanLabor), language)} ₴
          </span>
          <span className="text-[#334155] font-medium">
            {(totalFactHours ?? 0).toFixed(1)} {language === 'uk' ? 'год/т' : 'hrs/t'} ({language === 'uk' ? 'план' : 'plan'}{' '}
            {(totalPlanHours ?? 0).toFixed(1)})
          </span>
        </div>
      </div>

      {/* 4. Extremes: Star vs Risk Product */}
      <div
        id="metric-extremes-card"
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {language === 'uk' ? 'Лідери та Зони ризику' : 'Top Gain & Top Risk'}
          </p>
          <div className="w-7 h-7 rounded-md bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1.5 mb-2">
          {bestProduct && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#334155] font-medium flex items-center gap-1.5 truncate max-w-[130px]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                {language === 'uk' ? bestProduct.product : bestProduct.productEn}
              </span>
              <span className="font-semibold text-[#10B981]">
                +{formatPercent(bestProduct.variancePercent, false)}
              </span>
            </div>
          )}
          {worstProduct && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#334155] font-medium flex items-center gap-1.5 truncate max-w-[130px]">
                <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                {language === 'uk' ? worstProduct.product : worstProduct.productEn}
              </span>
              <span className="font-semibold text-[#EF4444]">
                {formatPercent(worstProduct.variancePercent)}
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#94A3B8] pt-2.5 border-t border-[#F1F5F9] truncate">
          {language === 'uk'
            ? 'Банани перевершили план, Вафлі просіли на -54%'
            : 'Dried Bananas beat budget; Waffles dropped by -54%'}
        </div>
      </div>
    </div>
  );
};
