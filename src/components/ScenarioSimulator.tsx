import React, { useState } from 'react';
import { SalesItem, LaborItem, Language } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScenarioSimulatorProps {
  salesData: SalesItem[];
  laborData: LaborItem[];
  language: Language;
  onApplySimulation: (newSales: SalesItem[], newLabor: LaborItem[]) => void;
  onReset: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  salesData,
  laborData,
  language,
  onApplySimulation,
  onReset,
}) => {
  // Simulator state levers
  const [waffleRecovery, setWaffleRecovery] = useState<number>(0); // % additional waffle volume
  const [candyPriceRestore, setCandyPriceRestore] = useState<number>(0); // % candy price restoration
  const [nutsPriceRestore, setNutsPriceRestore] = useState<number>(0); // % nuts price restoration
  const [packagingEfficiency, setPackagingEfficiency] = useState<number>(0); // % reduction in packaging hours
  const [bananaExpansion, setBananaExpansion] = useState<number>(0); // % banana expansion

  // Base metrics
  const baseRevenue = salesData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const baseLabor = laborData.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);

  // Calculate simulated sales items
  const simulatedSales = salesData.map((item) => {
    let newQty = item.factQty ?? 0;
    let newPrice = item.factPrice ?? 0;

    if (item.id === 'vanilla-waffles' || item.id === 's5') {
      // Vanilla Waffles
      newQty = Math.round((item.factQty ?? 0) * (1 + waffleRecovery / 100));
    } else if (item.id === 'choc-candies' || item.id === 's1') {
      // Chocolate Candies
      newPrice = (item.factPrice ?? 0) * (1 + candyPriceRestore / 100);
    } else if (item.id === 'nut-set' || item.id === 's4') {
      // Nut Mix
      newPrice = (item.factPrice ?? 0) * (1 + nutsPriceRestore / 100);
    } else if (item.id === 'dried-bananas' || item.id === 's3') {
      // Dried Bananas
      newQty = Math.round((item.factQty ?? 0) * (1 + bananaExpansion / 100));
    }

    const newFactTotal = newQty * newPrice;
    const newVarianceTotal = newFactTotal - (item.planTotal ?? 0);
    const newVarianceVolume = (newQty - (item.planQty ?? 0)) * (item.planPrice ?? 0);
    const newVariancePrice = newQty * (newPrice - (item.planPrice ?? 0));
    const newVariancePercent = (item.planTotal ?? 0) > 0 ? (newVarianceTotal / item.planTotal) * 100 : 0;

    return {
      ...item,
      factQty: newQty,
      factPrice: Number(newPrice.toFixed(2)),
      factTotal: newFactTotal,
      varianceTotal: newVarianceTotal,
      varianceVolume: newVarianceVolume,
      variancePrice: newVariancePrice,
      variancePercent: newVariancePercent,
      volumeChangePercent: (item.planQty ?? 0) > 0 ? ((newQty - item.planQty) / item.planQty) * 100 : 0,
      priceChangePercent: (item.planPrice ?? 0) > 0 ? ((newPrice - item.planPrice) / item.planPrice) * 100 : 0,
    };
  });

  // Calculate simulated labor items
  const simulatedLabor = laborData.map((item) => {
    let newHours = item.factHoursPerTon ?? 0;
    const itemHourlyRate = item.factHourlyRate ?? item.factRatePerHour ?? 0;
    const itemPlanHourlyRate = item.planHourlyRate ?? item.planRatePerHour ?? 0;

    if (item.id === 'packer' || item.id === 'l2') {
      // Packaging Specialist
      newHours = Math.max(10, (item.factHoursPerTon ?? 0) * (1 - packagingEfficiency / 100));
    }
    const newFactTotal = newHours * itemHourlyRate;
    const newVarianceTotal = newFactTotal - (item.planTotal ?? 0);
    const newVarianceHours = (newHours - (item.planHoursPerTon ?? 0)) * itemPlanHourlyRate;

    return {
      ...item,
      factHoursPerTon: Number(newHours.toFixed(1)),
      factHourlyRate: itemHourlyRate,
      factRatePerHour: itemHourlyRate,
      factTotal: Number(newFactTotal.toFixed(2)),
      varianceTotal: Number(newVarianceTotal.toFixed(2)),
      varianceHours: Number(newVarianceHours.toFixed(2)),
      varianceVolume: Number(newVarianceHours.toFixed(2)),
      variancePercent: (item.planTotal ?? 0) > 0 ? ((newFactTotal - item.planTotal) / item.planTotal) * 100 : 0,
    };
  });

  // Simulated aggregate results
  const simulatedRevenue = simulatedSales.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const simulatedLaborCost = simulatedLabor.reduce((acc, i) => acc + (i.factTotal ?? 0), 0);
  const deltaRevenue = simulatedRevenue - baseRevenue;
  const deltaLaborSavings = baseLabor - simulatedLaborCost;

  const handlePreset = (preset: 'waffles' | 'packaging' | 'all') => {
    if (preset === 'waffles') {
      setWaffleRecovery(100); // restore waffle volume to target
      setCandyPriceRestore(0);
      setNutsPriceRestore(0);
      setPackagingEfficiency(0);
      setBananaExpansion(0);
    } else if (preset === 'packaging') {
      setPackagingEfficiency(28.5); // restore packing hours from 21 down to 15
      setWaffleRecovery(0);
      setCandyPriceRestore(0);
      setNutsPriceRestore(0);
      setBananaExpansion(0);
    } else if (preset === 'all') {
      setWaffleRecovery(100);
      setCandyPriceRestore(5.0);
      setNutsPriceRestore(10.0);
      setPackagingEfficiency(28.5);
      setBananaExpansion(20);
    }
  };

  const handleApply = () => {
    onApplySimulation(simulatedSales, simulatedLabor);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3B82F6', '#10B981', '#60A5FA'],
    });
  };

  const handleLocalReset = () => {
    setWaffleRecovery(0);
    setCandyPriceRestore(0);
    setNutsPriceRestore(0);
    setPackagingEfficiency(0);
    setBananaExpansion(0);
    onReset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#3B82F6]" />
            {language === 'uk' ? 'Симулятор управлінських рішень "Що якщо..."' : 'Executive "What-If" Scenario Simulator'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Моделювання фінансового результату при зміні обсягів, цін та оптимізації трудовитрат'
              : 'Interactive financial modeling of price adjustments, volume recovery, and labor optimization'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePreset('waffles')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] transition-colors shadow-xs cursor-pointer"
          >
            {language === 'uk' ? 'Відновити вафлі (+100%)' : 'Recover Waffles (+100%)'}
          </button>
          <button
            type="button"
            onClick={() => handlePreset('packaging')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] transition-colors shadow-xs cursor-pointer"
          >
            {language === 'uk' ? 'Автоматизація пакування' : 'Automate Packaging'}
          </button>
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            {language === 'uk' ? 'Оптимальний сценарій' : 'Optimal Scenario'}
          </button>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-3">
            {language === 'uk' ? 'Управлінські важелі впливу' : 'Strategic Control Levers'}
          </h3>

          {/* Slider 1: Waffle Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {language === 'uk' ? '1. Відновлення обсягу Ванільних вафель:' : '1. Vanilla Waffles Supply Recovery:'}
              </span>
              <span className="font-mono font-bold text-[#3B82F6]">+{waffleRecovery}% обсягу</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={waffleRecovery}
              onChange={(e) => setWaffleRecovery(Number(e.target.value))}
              className="w-full h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>0% (Факт 4,728 од.)</span>
              <span>+100% (План 9,456 од.)</span>
              <span>+150% (11,820 од.)</span>
            </div>
          </div>

          {/* Slider 2: Packaging Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {language === 'uk' ? '2. Оптимізація часу пакування (автоматизація):' : '2. Packaging Automation (Hours Reduction):'}
              </span>
              <span className="font-mono font-bold text-[#10B981]">-{packagingEfficiency.toFixed(1)}% нормо-годин</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={packagingEfficiency}
              onChange={(e) => setPackagingEfficiency(Number(e.target.value))}
              className="w-full h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>0% (Факт 21.0 год/т)</span>
              <span>-28.5% (План 15.0 год/т)</span>
              <span>-40% (12.6 год/т)</span>
            </div>
          </div>

          {/* Slider 3: Candy Price Restoration */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {language === 'uk' ? '3. Коригування ціни Шоколадних цукерок:' : '3. Chocolate Candies Price Adjustment:'}
              </span>
              <span className="font-mono font-bold text-[#3B82F6]">+{candyPriceRestore}% до ціни</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={candyPriceRestore}
              onChange={(e) => setCandyPriceRestore(Number(e.target.value))}
              className="w-full h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>0% (Факт 56.0 ₴)</span>
              <span>+10% (61.6 ₴)</span>
              <span>+20% (67.2 ₴)</span>
            </div>
          </div>

          {/* Slider 4: Nut Mix Price Restoration */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {language === 'uk' ? '4. Оптимізація ціни Набору горішків:' : '4. Nut Mix Price Optimization:'}
              </span>
              <span className="font-mono font-bold text-[#3B82F6]">+{nutsPriceRestore}% до ціни</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={nutsPriceRestore}
              onChange={(e) => setNutsPriceRestore(Number(e.target.value))}
              className="w-full h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>0% (Факт 170.0 ₴)</span>
              <span>+10% (187.0 ₴)</span>
              <span>+20% (204.0 ₴)</span>
            </div>
          </div>

          {/* Slider 5: Banana Expansion */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {language === 'uk' ? '5. Масштабування ринку Сушених бананів:' : '5. Dried Bananas Market Expansion:'}
              </span>
              <span className="font-mono font-bold text-[#10B981]">+{bananaExpansion}% обсягу</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={bananaExpansion}
              onChange={(e) => setBananaExpansion(Number(e.target.value))}
              className="w-full h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>0% (Факт 2,930 од.)</span>
              <span>+20% (3,516 од.)</span>
              <span>+50% (4,395 од.)</span>
            </div>
          </div>
        </div>

        {/* Projected Outcome Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">
                {language === 'uk' ? 'Прогнозований ефект' : 'Projected Impact'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                {language === 'uk' ? 'Модель розрахунку' : 'Dynamic Model'}
              </span>
            </div>

            {/* Projected Revenue */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs text-[#64748B] block">
                {language === 'uk' ? 'Прогнозований виторг:' : 'Simulated Revenue:'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#0F172A]">
                  {formatCurrency(simulatedRevenue, language, 0)}
                </span>
                <span
                  className={`text-xs font-bold ${
                    deltaRevenue >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {deltaRevenue >= 0 ? '+' : ''}{formatCurrency(deltaRevenue, language, 0)}
                </span>
              </div>
            </div>

            {/* Projected Labor Savings */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs text-[#64748B] block">
                {language === 'uk' ? 'Витрати на працю (на 1т):' : 'Labor Cost per Ton:'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#0F172A]">
                  {simulatedLaborCost.toFixed(1)} ₴
                </span>
                <span
                  className={`text-xs font-bold ${
                    deltaLaborSavings >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {deltaLaborSavings >= 0 ? '-' : '+'}{Math.abs(deltaLaborSavings).toFixed(1)} ₴
                </span>
              </div>
            </div>

            {/* Net Advantage */}
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1 text-xs text-[#1E3A8A]">
              <span className="font-bold text-[#1D4ED8] block">
                {language === 'uk' ? 'Сукупний чистий виграш:' : 'Total Net Financial Gain:'}
              </span>
              <p className="text-[#1E40AF]">
                {language === 'uk'
                  ? `Зростання виручки на +${formatCurrency(deltaRevenue, language, 0)} та скорочення трудовитрат на ${deltaLaborSavings.toFixed(1)} ₴/т оптимізують результати бізнесу.`
                  : `Revenue boost of +${formatCurrency(deltaRevenue, language, 0)} and labor reduction of ${deltaLaborSavings.toFixed(1)} ₴/t optimize business performance.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
            <button
              id="apply-simulation-btn"
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{language === 'uk' ? 'Застосувати до дашборду' : 'Apply to Entire Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={handleLocalReset}
              className="w-full py-2 px-4 bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{language === 'uk' ? 'Скинути параметри' : 'Reset Sliders'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
