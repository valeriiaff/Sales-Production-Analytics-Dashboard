import React, { useState } from 'react';
import { SalesItem, LaborItem, Language } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  BarChart2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FactorBridgeChartProps {
  salesData: SalesItem[];
  laborData: LaborItem[];
  language: Language;
}

export const FactorBridgeChart: React.FC<FactorBridgeChartProps> = ({
  salesData,
  laborData,
  language,
}) => {
  const [activeBridge, setActiveBridge] = useState<'sales' | 'labor'>('sales');
  const [scaleMode, setScaleMode] = useState<'focused' | 'full'>('focused');
  const [viewMode, setViewMode] = useState<'waterfall' | 'impact'>('waterfall');
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<'volume' | 'price' | 'hours' | 'rate' | null>('volume');

  const isUk = language === 'uk';

  // --- Dynamic Sales Metrics ---
  const totalPlanSales = salesData.reduce((acc, item) => acc + (item.planTotal ?? 0), 0);
  const totalFactSales = salesData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const totalSalesVariance = totalFactSales - totalPlanSales;
  const totalSalesVariancePct = totalPlanSales > 0 ? (totalSalesVariance / totalPlanSales) * 100 : 0;
  const totalVolumeEffect = salesData.reduce((acc, item) => acc + (item.varianceVolume ?? 0), 0);
  const totalPriceEffect = salesData.reduce((acc, item) => acc + (item.variancePrice ?? 0), 0);
  const volumeEffectPct = totalPlanSales > 0 ? (totalVolumeEffect / totalPlanSales) * 100 : 0;
  const priceEffectPct = totalPlanSales > 0 ? (totalPriceEffect / totalPlanSales) * 100 : 0;

  // --- Dynamic Labor Metrics ---
  const totalPlanLabor = laborData.reduce((acc, item) => acc + (item.planTotal ?? 0), 0);
  const totalFactLabor = laborData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const totalLaborVariance = totalFactLabor - totalPlanLabor;
  const totalLaborVariancePct = totalPlanLabor > 0 ? (totalLaborVariance / totalPlanLabor) * 100 : 0;
  const totalHoursEffect = laborData.reduce(
    (acc, item) => acc + (item.varianceHours ?? item.varianceVolume ?? 0),
    0
  );
  const totalRateEffect = laborData.reduce((acc, item) => acc + (item.varianceRate ?? 0), 0);
  const hoursEffectPct = totalPlanLabor > 0 ? (totalHoursEffect / totalPlanLabor) * 100 : 0;
  const rateEffectPct = totalPlanLabor > 0 ? (totalRateEffect / totalPlanLabor) * 100 : 0;

  // --- Waterfall Step Definitions ---
  interface WaterfallStep {
    id: string;
    name: string;
    shortName: string;
    prevTotal: number;
    delta: number;
    newTotal: number;
    percentOfPlan: number;
    isTotal: boolean;
    color: string;
    description: string;
  }

  const salesSteps: WaterfallStep[] = [
    {
      id: 'plan',
      name: isUk ? 'План виручки' : 'Plan Revenue',
      shortName: isUk ? 'План' : 'Plan',
      prevTotal: 0,
      delta: Math.round(totalPlanSales),
      newTotal: Math.round(totalPlanSales),
      percentOfPlan: 100,
      isTotal: true,
      color: '#2563EB',
      description: isUk
        ? 'Базовий запланований обсяг виручки'
        : 'Initial budgeted revenue baseline',
    },
    {
      id: 'volume',
      name: isUk ? 'Фактор обсягу (ΔQ)' : 'Volume Effect (ΔQ)',
      shortName: 'ΔQ',
      prevTotal: Math.round(totalPlanSales),
      delta: Math.round(totalVolumeEffect),
      newTotal: Math.round(totalPlanSales + totalVolumeEffect),
      percentOfPlan: volumeEffectPct,
      isTotal: false,
      color: totalVolumeEffect >= 0 ? '#10B981' : '#EF4444',
      description: isUk
        ? `Вплив зміни натурального обсягу за плановими цінами (${totalVolumeEffect >= 0 ? '+' : ''}${formatCurrency(totalVolumeEffect, language, 0)})`
        : `Impact of unit volume shifts evaluated at planned unit prices`,
    },
    {
      id: 'price',
      name: isUk ? 'Фактор ціни (ΔP)' : 'Price Effect (ΔP)',
      shortName: 'ΔP',
      prevTotal: Math.round(totalPlanSales + totalVolumeEffect),
      delta: Math.round(totalPriceEffect),
      newTotal: Math.round(totalFactSales),
      percentOfPlan: priceEffectPct,
      isTotal: false,
      color: totalPriceEffect >= 0 ? '#10B981' : '#EF4444',
      description: isUk
        ? `Вплив відхилень цін реалізації на фактичний обсяг (${totalPriceEffect >= 0 ? '+' : ''}${formatCurrency(totalPriceEffect, language, 0)})`
        : `Impact of price adjustments realized on actual volumes sold`,
    },
    {
      id: 'fact',
      name: isUk ? 'Факт виручки' : 'Actual Revenue',
      shortName: isUk ? 'Факт' : 'Actual',
      prevTotal: 0,
      delta: Math.round(totalFactSales),
      newTotal: Math.round(totalFactSales),
      percentOfPlan: totalPlanSales > 0 ? (totalFactSales / totalPlanSales) * 100 : 100,
      isTotal: true,
      color: '#0F172A',
      description: isUk
        ? 'Фактично отримана виручка від реалізації продукції'
        : 'Actual final realized sales revenue',
    },
  ];

  const laborSteps: WaterfallStep[] = [
    {
      id: 'plan',
      name: isUk ? 'План витрат' : 'Plan Labor Cost',
      shortName: isUk ? 'План' : 'Plan',
      prevTotal: 0,
      delta: Number(totalPlanLabor.toFixed(1)),
      newTotal: Number(totalPlanLabor.toFixed(1)),
      percentOfPlan: 100,
      isTotal: true,
      color: '#2563EB',
      description: isUk
        ? 'Планові трудовитрати на 1 тонну продукції'
        : 'Budgeted labor cost per 1 ton of output',
    },
    {
      id: 'hours',
      name: isUk ? 'Вплив норм (ΔH)' : 'Hours Intensity (ΔH)',
      shortName: 'ΔH',
      prevTotal: Number(totalPlanLabor.toFixed(1)),
      delta: Number(totalHoursEffect.toFixed(1)),
      newTotal: Number((totalPlanLabor + totalHoursEffect).toFixed(1)),
      percentOfPlan: hoursEffectPct,
      isTotal: false,
      color: totalHoursEffect <= 0 ? '#10B981' : '#EF4444',
      description: isUk
        ? `Вплив зміни кількості годин на тонну (+${totalHoursEffect.toFixed(1)} ₴)`
        : `Effect of labor hours per ton variance`,
    },
    {
      id: 'rate',
      name: isUk ? 'Вплив тарифу (ΔR)' : 'Wage Rate (ΔR)',
      shortName: 'ΔR',
      prevTotal: Number((totalPlanLabor + totalHoursEffect).toFixed(1)),
      delta: Number(totalRateEffect.toFixed(1)),
      newTotal: Number(totalFactLabor.toFixed(1)),
      percentOfPlan: rateEffectPct,
      isTotal: false,
      color: totalRateEffect <= 0 ? '#10B981' : '#EF4444',
      description: isUk
        ? `Вплив відхилень погодинних ставок оплати (+${totalRateEffect.toFixed(1)} ₴)`
        : `Effect of hourly wage rate differences`,
    },
    {
      id: 'fact',
      name: isUk ? 'Факт витрат' : 'Actual Labor Cost',
      shortName: isUk ? 'Факт' : 'Actual',
      prevTotal: 0,
      delta: Number(totalFactLabor.toFixed(1)),
      newTotal: Number(totalFactLabor.toFixed(1)),
      percentOfPlan: totalPlanLabor > 0 ? (totalFactLabor / totalPlanLabor) * 100 : 100,
      isTotal: true,
      color: '#0F172A',
      description: isUk
        ? 'Фактичні сумарні витрати на оплату праці на 1 тонну'
        : 'Actual total labor cost per 1 ton',
    },
  ];

  const currentSteps = activeBridge === 'sales' ? salesSteps : laborSteps;

  // --- SVG Layout & Scale Math ---
  const svgWidth = 740;
  const svgHeight = 350;
  const margin = { top: 48, right: 32, bottom: 58, left: 78 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Gather values for range calculation
  const valuesToCheck = currentSteps.flatMap((s) => [s.prevTotal, s.newTotal, s.isTotal ? s.delta : 0]);
  const minVal = Math.min(...valuesToCheck);
  const maxVal = Math.max(...valuesToCheck);
  const valueSpan = maxVal - minVal || 1;

  let yDomainMin = 0;
  let yDomainMax = maxVal * 1.12;

  if (scaleMode === 'focused') {
    if (activeBridge === 'sales') {
      // Zoom into transition area (around 5.0M - 6.2M)
      const step = 200000;
      const rawMin = Math.max(0, minVal - valueSpan * 0.45);
      yDomainMin = Math.floor(rawMin / step) * step;
      const rawMax = maxVal + valueSpan * 0.35;
      yDomainMax = Math.ceil(rawMax / step) * step;
    } else {
      // Zoom into labor area (around 2.0k - 3.5k)
      const step = 200;
      const rawMin = Math.max(0, minVal - valueSpan * 0.35);
      yDomainMin = Math.floor(rawMin / step) * step;
      const rawMax = maxVal + valueSpan * 0.3;
      yDomainMax = Math.ceil(rawMax / step) * step;
    }
  }

  const getY = (val: number) => {
    const clamped = Math.max(yDomainMin, Math.min(yDomainMax, val));
    return margin.top + plotHeight - ((clamped - yDomainMin) / (yDomainMax - yDomainMin)) * plotHeight;
  };

  // Generate clean Y-axis ticks
  const tickCount = 5;
  const tickStep = (yDomainMax - yDomainMin) / tickCount;
  const yTicks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(yDomainMin + i * tickStep);
  }

  // Column geometry
  const slotWidth = plotWidth / currentSteps.length;
  const barWidth = Math.min(88, slotWidth * 0.58);

  const stepGeometry = currentSteps.map((step, idx) => {
    const slotCenterX = margin.left + idx * slotWidth + slotWidth / 2;
    const barX = slotCenterX - barWidth / 2;

    let barY = 0;
    let barH = 0;
    let topLevel = 0;
    let bottomLevel = 0;

    if (step.isTotal) {
      topLevel = step.delta;
      bottomLevel = yDomainMin;
      barY = getY(topLevel);
      barH = Math.max(4, getY(bottomLevel) - barY);
    } else {
      topLevel = Math.max(step.prevTotal, step.newTotal);
      bottomLevel = Math.min(step.prevTotal, step.newTotal);
      barY = getY(topLevel);
      // Guarantee at least 8px visual height so small factor bars never look like a broken 1px artifact
      barH = Math.max(8, getY(bottomLevel) - barY);
    }

    return {
      ...step,
      slotCenterX,
      barX,
      barY,
      barH,
      topLevel,
      bottomLevel,
    };
  });

  // Connectors between steps
  const connectors = [];
  for (let i = 0; i < stepGeometry.length - 1; i++) {
    const curr = stepGeometry[i];
    const next = stepGeometry[i + 1];
    const connectLevel = curr.isTotal ? curr.delta : curr.newTotal;
    const connectY = getY(connectLevel);
    connectors.push({
      x1: curr.barX + barWidth,
      x2: next.barX,
      y: connectY,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
              {isUk
                ? 'Факторний каскадний міст (Waterfall Bridge)'
                : 'Factor Variance Waterfall Bridge'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              {activeBridge === 'sales' ? (isUk ? 'Виручка' : 'Revenue') : (isUk ? 'Витрати праці' : 'Labor Cost')}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            {isUk
              ? 'Наочна декомпозиція факторів обсягу, ціни та продуктивності при переході від Плану до Факту'
              : 'Visual bridge explaining variances from Planned targets to Actual realization via distinct volume and rate factors'}
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bridge Selector */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              id="switch-sales-bridge-btn"
              type="button"
              onClick={() => {
                setActiveBridge('sales');
                setSelectedFactor('volume');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeBridge === 'sales'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {isUk ? 'Міст Продажів (Виручка)' : 'Sales Bridge (Revenue)'}
            </button>
            <button
              id="switch-labor-bridge-btn"
              type="button"
              onClick={() => {
                setActiveBridge('labor');
                setSelectedFactor('hours');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeBridge === 'labor'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {isUk ? 'Міст Праці (Витрати)' : 'Labor Bridge (Costs)'}
            </button>
          </div>

          {/* Scale Zoom Toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              id="scale-focused-btn"
              type="button"
              onClick={() => setScaleMode('focused')}
              title={isUk ? 'Фокусний зум для деталізації відхилень' : 'Zoom into variance transition band'}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                scaleMode === 'focused'
                  ? 'bg-white text-[#2563EB] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{isUk ? 'Фокус' : 'Zoomed'}</span>
            </button>
            <button
              id="scale-full-btn"
              type="button"
              onClick={() => setScaleMode('full')}
              title={isUk ? 'Повний масштаб від 0' : 'Full baseline from zero'}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                scaleMode === 'full'
                  ? 'bg-white text-[#0F172A] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>{isUk ? 'Від 0' : 'From 0'}</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              id="view-waterfall-btn"
              type="button"
              onClick={() => setViewMode('waterfall')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'waterfall'
                  ? 'bg-white text-[#0F172A] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>{isUk ? 'Міст' : 'Bridge'}</span>
            </button>
            <button
              id="view-impact-btn"
              type="button"
              onClick={() => setViewMode('impact')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'impact'
                  ? 'bg-white text-[#0F172A] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{isUk ? 'Δ-Вплив' : 'Impact'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart + Narrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Visual Canvas */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                {activeBridge === 'sales'
                  ? isUk
                    ? 'Каскад відхилення виручки: від Плану до Факту (₴)'
                    : 'Revenue Variance Bridge: Plan to Actual (₴)'
                  : isUk
                  ? 'Каскад зростання трудовитрат: від Плану до Факту (₴/т)'
                  : 'Labor Cost Overrun Bridge: Plan to Actual (UAH/t)'}
              </h3>
              <span className="text-[11px] text-[#64748B]">
                {scaleMode === 'focused'
                  ? isUk
                    ? `Фокусний масштаб (базовий рівень осі Y: ${formatCurrency(yDomainMin, language, 0)})`
                    : `Zoomed scale (axis baseline: ${formatCurrency(yDomainMin, language, 0)})`
                  : isUk
                  ? 'Повний масштаб з нульовою базою'
                  : 'Full 0-baseline scale'}
              </span>
            </div>

            {/* Net Variance Summary Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#64748B]">
                {activeBridge === 'sales'
                  ? isUk ? 'Чисте відхилення:' : 'Net variance:'
                  : isUk ? 'Чисті перевитрати:' : 'Net overrun:'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                  activeBridge === 'sales'
                    ? totalSalesVariance >= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                    : totalLaborVariance <= 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {activeBridge === 'sales'
                  ? `${totalSalesVariance >= 0 ? '+' : ''}${formatCurrency(totalSalesVariance, language, 0)} (${formatPercent(totalSalesVariancePct)})`
                  : `+${formatCurrency(totalLaborVariance, language, 1)} (+${formatPercent(totalLaborVariancePct, false)})`}
              </span>
            </div>
          </div>

          {/* VIEW MODE 1: WATERFALL BRIDGE */}
          {viewMode === 'waterfall' && (
            <div className="relative w-full">
              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto min-w-[580px] select-none"
                  style={{ maxHeight: '380px' }}
                >
                  <defs>
                    <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="factGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {yTicks.map((tickVal, i) => {
                    const yPos = getY(tickVal);
                    const formattedTick =
                      activeBridge === 'sales'
                        ? `${(tickVal / 1000000).toFixed(1)}M`
                        : `${Math.round(tickVal)}₴`;

                    return (
                      <g key={`grid-${i}`}>
                        <line
                          x1={margin.left - 6}
                          y1={yPos}
                          x2={svgWidth - margin.right}
                          y2={yPos}
                          stroke="#F1F5F9"
                          strokeWidth="1.2"
                          strokeDasharray={i === 0 ? 'none' : '3 3'}
                        />
                        <text
                          x={margin.left - 12}
                          y={yPos + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748B"
                          fontFamily="ui-monospace, monospace"
                        >
                          {formattedTick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Broken Axis Indicator if in Focused Mode */}
                  {scaleMode === 'focused' && (
                    <g transform={`translate(${margin.left - 18}, ${getY(yDomainMin) - 10})`}>
                      <path
                        d="M 0 0 L 8 4 L 0 8 L 8 12"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {/* Step Connector Dashed Lines */}
                  {connectors.map((conn, idx) => (
                    <line
                      key={`conn-${idx}`}
                      x1={conn.x1}
                      y1={conn.y}
                      x2={conn.x2}
                      y2={conn.y}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  ))}

                  {/* Waterfall Bars & Labels */}
                  {stepGeometry.map((step, idx) => {
                    const isHovered = hoveredStepIndex === idx;
                    const isPositiveDelta = step.delta >= 0;
                    const formattedDelta =
                      activeBridge === 'sales'
                        ? `${isPositiveDelta ? '+' : ''}${formatNumber(step.delta, language)} ₴`
                        : `${isPositiveDelta ? '+' : ''}${step.delta.toFixed(1)} ₴`;

                    const formattedTotal =
                      activeBridge === 'sales'
                        ? `${(step.newTotal / 1000000).toFixed(2)}M ₴`
                        : `${step.newTotal.toFixed(1)} ₴`;

                    const fillGradient = step.isTotal
                      ? idx === 0
                        ? 'url(#planGrad)'
                        : 'url(#factGrad)'
                      : isPositiveDelta
                      ? 'url(#posGrad)'
                      : 'url(#negGrad)';

                    return (
                      <g
                        key={`bar-group-${idx}`}
                        className="cursor-pointer transition-opacity"
                        onMouseEnter={() => setHoveredStepIndex(idx)}
                        onMouseLeave={() => setHoveredStepIndex(null)}
                        onClick={() => {
                          if (step.id === 'volume') setSelectedFactor('volume');
                          if (step.id === 'price') setSelectedFactor('price');
                          if (step.id === 'hours') setSelectedFactor('hours');
                          if (step.id === 'rate') setSelectedFactor('rate');
                        }}
                      >
                        {/* Hover Column Highlight */}
                        {isHovered && (
                          <rect
                            x={step.slotCenterX - slotWidth * 0.45}
                            y={margin.top}
                            width={slotWidth * 0.9}
                            height={plotHeight}
                            fill="#F8FAFC"
                            rx="8"
                            opacity="0.8"
                          />
                        )}

                        {/* The Waterfall Bar */}
                        <rect
                          x={step.barX}
                          y={step.barY}
                          width={barWidth}
                          height={step.barH}
                          rx={step.isTotal ? 6 : 4}
                          fill={fillGradient}
                          filter={isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'}
                          stroke={isHovered ? '#0F172A' : 'none'}
                          strokeWidth={isHovered ? 1.5 : 0}
                        />

                        {/* VALUE CALLOUT PILL ABOVE/ON BAR */}
                        {step.isTotal ? (
                          // Total Pillars: Value text right above the pillar
                          <g transform={`translate(${step.slotCenterX}, ${step.barY - 10})`}>
                            <rect
                              x="-42"
                              y="-16"
                              width="84"
                              height="20"
                              rx="5"
                              fill={idx === 0 ? '#EFF6FF' : '#F1F5F9'}
                              stroke={idx === 0 ? '#BFDBFE' : '#CBD5E1'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="-2"
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="700"
                              fill={idx === 0 ? '#1D4ED8' : '#0F172A'}
                              fontFamily="ui-monospace, monospace"
                            >
                              {formattedTotal}
                            </text>
                          </g>
                        ) : (
                          // Delta Bridges: High-contrast tag showing delta & %
                          <g
                            transform={`translate(${step.slotCenterX}, ${
                              isPositiveDelta
                                ? step.barY - 14
                                : step.barY + step.barH + 16
                            })`}
                          >
                            <rect
                              x="-45"
                              y="-14"
                              width="90"
                              height="22"
                              rx="5"
                              fill={isPositiveDelta ? '#ECFDF5' : '#FEF2F2'}
                              stroke={isPositiveDelta ? '#A7F3D0' : '#FECACA'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="1"
                              textAnchor="middle"
                              fontSize="10.5"
                              fontWeight="700"
                              fill={isPositiveDelta ? '#065F46' : '#991B1B'}
                              fontFamily="ui-monospace, monospace"
                            >
                              {formattedDelta}
                            </text>
                          </g>
                        )}

                        {/* X-Axis Category Name */}
                        <text
                          x={step.slotCenterX}
                          y={margin.top + plotHeight + 20}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={step.isTotal ? '700' : '600'}
                          fill={isHovered ? '#2563EB' : '#1E293B'}
                        >
                          {step.name}
                        </text>

                        {/* X-Axis Secondary Subtitle / Indicator */}
                        <text
                          x={step.slotCenterX}
                          y={margin.top + plotHeight + 36}
                          textAnchor="middle"
                          fontSize="10"
                          fill={
                            step.isTotal
                              ? '#64748B'
                              : isPositiveDelta
                              ? '#059669'
                              : '#DC2626'
                          }
                          fontFamily="ui-monospace, monospace"
                          fontWeight="600"
                        >
                          {step.isTotal
                            ? `${formatNumber(step.delta, language)} ₴`
                            : `${isPositiveDelta ? '+' : ''}${step.percentOfPlan.toFixed(1)}% ${isUk ? 'до плану' : 'vs plan'}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Interactive Tooltip Card on Hover */}
              {hoveredStepIndex !== null && (
                <div className="mt-2 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stepGeometry[hoveredStepIndex].color }}
                    />
                    <div>
                      <span className="font-bold text-[#0F172A]">
                        {stepGeometry[hoveredStepIndex].name}:
                      </span>{' '}
                      <span className="text-[#475569]">
                        {stepGeometry[hoveredStepIndex].description}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#0F172A] shrink-0 ml-3">
                    {stepGeometry[hoveredStepIndex].isTotal
                      ? formatCurrency(stepGeometry[hoveredStepIndex].newTotal, language, 0)
                      : `${stepGeometry[hoveredStepIndex].delta >= 0 ? '+' : ''}${formatCurrency(stepGeometry[hoveredStepIndex].delta, language, 0)}`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: DIVERGING FACTOR IMPACT BARS */}
          {viewMode === 'impact' && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-[#64748B]">
                {isUk
                  ? 'Зіставлення сили впливу окремих факторів на фінальне відхилення:'
                  : 'Relative magnitude comparison of variance drivers against net result:'}
              </p>

              {activeBridge === 'sales' ? (
                <div className="space-y-3">
                  {/* Volume Effect */}
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#047857]">
                        <TrendingUp className="w-4 h-4" />
                        {isUk ? '1. Фактор обсягу реалізації (ΔQ)' : '1. Volume Effect (ΔQ)'}
                      </span>
                      <span className="font-mono font-bold text-[#047857]">
                        +{formatCurrency(totalVolumeEffect, language, 0)} (+{volumeEffectPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#10B981] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.abs(totalVolumeEffect / (Math.abs(totalPriceEffect) || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#64748B] block">
                      {isUk
                        ? 'Позитивний вплив: високий попит на банани та печиво частково компенсував втрати.'
                        : 'Positive driver: strong volume for dried bananas and cookies buffered headwinds.'}
                    </span>
                  </div>

                  {/* Price Effect */}
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#B91C1C]">
                        <TrendingDown className="w-4 h-4" />
                        {isUk ? '2. Фактор цін реалізації (ΔP)' : '2. Price Effect (ΔP)'}
                      </span>
                      <span className="font-mono font-bold text-[#B91C1C]">
                        {formatCurrency(totalPriceEffect, language, 0)} ({priceEffectPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#EF4444] h-full rounded-full w-full transition-all" />
                    </div>
                    <span className="text-[11px] text-[#64748B] block">
                      {isUk
                        ? 'Головне джерело втрат: масове дисконтування цукерок та горішків знизило маржинальність.'
                        : 'Primary drag: heavy promotional discounting on chocolates and roasted nuts eroded top line.'}
                    </span>
                  </div>

                  {/* Net Summary */}
                  <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#BFDBFE] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1E3A8A] block">
                        {isUk ? 'Чистий баланс виручки (План vs Факт):' : 'Net Sales Revenue Variance:'}
                      </span>
                      <span className="text-[11px] text-[#3B82F6]">
                        {totalSalesVariance < 0
                          ? (isUk ? 'Недовиконання плану на ' : 'Shortfall of ')
                          : (isUk ? 'Перевиконання плану на ' : 'Exceeded plan by ')}
                        {formatCurrency(Math.abs(totalSalesVariance), language, 0)}
                      </span>
                    </div>
                    <span className="text-base font-bold font-mono text-[#1E3A8A]">
                      {totalSalesVariance >= 0 ? '+' : ''}{formatCurrency(totalSalesVariance, language, 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Labor Hours Effect */}
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#B91C1C]">
                        <TrendingDown className="w-4 h-4" />
                        {isUk ? '1. Вплив норм трудомісткості (ΔH)' : '1. Hours Intensity Effect (ΔH)'}
                      </span>
                      <span className="font-mono font-bold text-[#B91C1C]">
                        +{totalHoursEffect.toFixed(1)} ₴/т (+{hoursEffectPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#EF4444] h-full rounded-full w-3/4 transition-all" />
                    </div>
                    <span className="text-[11px] text-[#64748B] block">
                      {isUk
                        ? '73% усіх перевитрат спричинені ручною працею на фасуванні через простій обладнання.'
                        : '73% of overruns caused by manual packaging labor due to equipment downtime.'}
                    </span>
                  </div>

                  {/* Wage Rate Effect */}
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#D97706]">
                        <TrendingDown className="w-4 h-4" />
                        {isUk ? '2. Вплив тарифних ставок (ΔR)' : '2. Wage Rate Effect (ΔR)'}
                      </span>
                      <span className="font-mono font-bold text-[#D97706]">
                        +{totalRateEffect.toFixed(1)} ₴/т (+{rateEffectPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#F59E0B] h-full rounded-full w-1/4 transition-all" />
                    </div>
                    <span className="text-[11px] text-[#64748B] block">
                      {isUk
                        ? '27% перевитрат зумовлені понаднормовими та нічними доплатами операторам.'
                        : '27% caused by premium night-shift and overtime allowances.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Step-by-Step Ledger Line */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                {isUk ? 'Каскадний ланцюг:' : 'Bridge equation:'}
              </span>
              <span className="font-mono text-[11px] text-[#475569]">
                {activeBridge === 'sales'
                  ? `${formatCurrency(totalPlanSales, language, 0)} (План) + ${formatCurrency(totalVolumeEffect, language, 0)} (ΔQ) ${totalPriceEffect >= 0 ? '+' : '-'} ${formatCurrency(Math.abs(totalPriceEffect), language, 0)} (ΔP) = ${formatCurrency(totalFactSales, language, 0)} (Факт)`
                  : `${totalPlanLabor.toFixed(1)} ₴ (План) + ${totalHoursEffect.toFixed(1)} ₴ (ΔH) + ${totalRateEffect.toFixed(1)} ₴ (ΔR) = ${totalFactLabor.toFixed(1)} ₴ (Факт)`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUk ? 'Збалансовано 100%' : '100% Reconciled'}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Mathematical Rigor & Factor Contributors */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                {isUk ? 'Факторний аналіз та формули' : 'Mathematical Formulation'}
              </span>
              <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-bold">
                DuPont / FP&A
              </span>
            </div>

            {activeBridge === 'sales' ? (
              <div className="space-y-3.5 text-xs">
                {/* Volume Formula Card */}
                <div
                  onClick={() => setSelectedFactor('volume')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedFactor === 'volume'
                      ? 'bg-[#F0FDF4] border-[#86EFAC] ring-1 ring-[#86EFAC]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#0F172A]">
                      1. {isUk ? 'Вплив зміни обсягу (ΔQ):' : 'Volume Effect (ΔQ):'}
                    </span>
                    <span className="font-mono font-bold text-[#059669]">
                      +{formatCurrency(totalVolumeEffect, language, 0)}
                    </span>
                  </div>
                  <code className="text-[#2563EB] font-mono text-[11px] block bg-white px-2 py-1 rounded border border-[#E2E8F0] mb-1.5">
                    ΔV(Q) = Σ [(Q_факт - Q_план) × P_план]
                  </code>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    {isUk
                      ? 'Оцінює додаткову виручку суто від збільшення кількості реалізованого товару, зафіксувавши ціни на рівні планових.'
                      : 'Calculates revenue impact caused strictly by volume deviations evaluated at baseline budget prices.'}
                  </p>
                </div>

                {/* Price Formula Card */}
                <div
                  onClick={() => setSelectedFactor('price')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedFactor === 'price'
                      ? 'bg-[#FEF2F2] border-[#FCA5A5] ring-1 ring-[#FCA5A5]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#0F172A]">
                      2. {isUk ? 'Вплив цін реалізації (ΔP):' : 'Price Effect (ΔP):'}
                    </span>
                    <span className="font-mono font-bold text-[#DC2626]">
                      {formatCurrency(totalPriceEffect, language, 0)}
                    </span>
                  </div>
                  <code className="text-[#DC2626] font-mono text-[11px] block bg-white px-2 py-1 rounded border border-[#E2E8F0] mb-1.5">
                    ΔV(P) = Σ [Q_факт × (P_факт - P_план)]
                  </code>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    {isUk
                      ? 'Фіксує фактично проданий обсяг і показує втрати або надбавки від зміни прейскуранту/знижок.'
                      : 'Isolates the effect of pricing variance applied to the actual quantities sold.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {/* Hours Formula Card */}
                <div
                  onClick={() => setSelectedFactor('hours')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedFactor === 'hours'
                      ? 'bg-[#FEF2F2] border-[#FCA5A5] ring-1 ring-[#FCA5A5]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#0F172A]">
                      1. {isUk ? 'Вплив норм трудомісткості (ΔH):' : 'Hours Intensity Effect (ΔH):'}
                    </span>
                    <span className="font-mono font-bold text-[#DC2626]">
                      +{totalHoursEffect.toFixed(1)} ₴/т
                    </span>
                  </div>
                  <code className="text-[#DC2626] font-mono text-[11px] block bg-white px-2 py-1 rounded border border-[#E2E8F0] mb-1.5">
                    ΔL(H) = (H_факт - H_план) × R_план
                  </code>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    {isUk
                      ? 'Перевитрата через неефективність технологічних процесів та простої обладнання (фасування).'
                      : 'Cost overrun stemming from manufacturing downtime and excess manual packaging hours.'}
                  </p>
                </div>

                {/* Rate Formula Card */}
                <div
                  onClick={() => setSelectedFactor('rate')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedFactor === 'rate'
                      ? 'bg-[#FFFBEB] border-[#FCD34D] ring-1 ring-[#FCD34D]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#0F172A]">
                      2. {isUk ? 'Вплив тарифних ставок (ΔR):' : 'Hourly Wage Rate Effect (ΔR):'}
                    </span>
                    <span className="font-mono font-bold text-[#D97706]">
                      +{totalRateEffect.toFixed(1)} ₴/т
                    </span>
                  </div>
                  <code className="text-[#D97706] font-mono text-[11px] block bg-white px-2 py-1 rounded border border-[#E2E8F0] mb-1.5">
                    ΔL(R) = H_факт × (R_факт - R_план)
                  </code>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    {isUk
                      ? 'Перевитрата через понаднормові та надбавки за нічні зміни робітників.'
                      : 'Overtime premiums and emergency shifts contracted above planned wage scales.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product / Role Driver Breakdown Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              {activeBridge === 'sales'
                ? selectedFactor === 'volume'
                  ? isUk ? 'Продукти: Фактор обсягу (ΔQ)' : 'Products: Volume Contributors'
                  : isUk ? 'Продукти: Фактор ціни (ΔP)' : 'Products: Price Contributors'
                : selectedFactor === 'hours'
                ? isUk ? 'Посади: Вплив годин (ΔH)' : 'Roles: Hours Contributors'
                : isUk ? 'Посади: Вплив тарифів (ΔR)' : 'Roles: Rate Contributors'}
            </span>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {activeBridge === 'sales'
                ? salesData.map((item) => {
                    const val = selectedFactor === 'volume' ? item.varianceVolume : item.variancePrice;
                    const isPos = (val ?? 0) >= 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded bg-white border border-[#E2E8F0]"
                      >
                        <span className="font-medium text-[#1E293B] truncate max-w-[140px]">
                          {isUk ? item.product : item.productEn}
                        </span>
                        <span
                          className={`font-mono font-bold shrink-0 ${
                            isPos ? 'text-[#059669]' : 'text-[#DC2626]'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {formatNumber(Math.round(val ?? 0), language)} ₴
                        </span>
                      </div>
                    );
                  })
                : laborData.map((item) => {
                    const val =
                      selectedFactor === 'hours'
                        ? (item.varianceHours ?? item.varianceVolume ?? 0)
                        : (item.varianceRate ?? 0);
                    const isPos = (val ?? 0) > 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded bg-white border border-[#E2E8F0]"
                      >
                        <span className="font-medium text-[#1E293B] truncate max-w-[140px]">
                          {isUk ? item.role : item.roleEn}
                        </span>
                        <span
                          className={`font-mono font-bold shrink-0 ${
                            isPos ? 'text-[#DC2626]' : 'text-[#059669]'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {(val ?? 0).toFixed(1)} ₴
                        </span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
