/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, Language, SalesItem, LaborItem } from './types';
import { INITIAL_SALES_DATA, INITIAL_LABOR_DATA } from './data/dashboardData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { SalesVarianceSection } from './components/SalesVarianceSection';
import { LaborAnalysisSection } from './components/LaborAnalysisSection';
import { FactorBridgeChart } from './components/FactorBridgeChart';
import { ElasticityMatrixChart } from './components/ElasticityMatrixChart';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { DataTableSection } from './components/DataTableSection';
import { InsightsSection } from './components/InsightsSection';
import { ExportModal } from './components/ExportModal';
import { formatCurrency, formatPercent } from './lib/utils';
import {
  BarChart3,
  Users,
  GitFork,
  Sliders,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [language, setLanguage] = useState<Language>('uk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Active data state (can be simulated or original)
  const [salesData, setSalesData] = useState<SalesItem[]>(INITIAL_SALES_DATA);
  const [laborData, setLaborData] = useState<LaborItem[]>(INITIAL_LABOR_DATA);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const handleApplySimulation = (newSales: SalesItem[], newLabor: LaborItem[]) => {
    setSalesData(newSales);
    setLaborData(newLabor);
    setIsSimulated(true);
    setActiveTab('overview');
  };

  const handleResetToBaseline = () => {
    setSalesData(INITIAL_SALES_DATA);
    setLaborData(INITIAL_LABOR_DATA);
    setIsSimulated(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans antialiased selection:bg-[#3B82F6] selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetToBaseline}
        onExport={() => setIsExportOpen(true)}
        isSimulated={isSimulated}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Top Row */}
        <MetricCards salesData={salesData} laborData={laborData} language={language} />

        {/* Tab 1: Comprehensive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Navigation Banner */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {language === 'uk' ? 'Аналітичний звіт підприємства' : 'Enterprise Variance Report'}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {language === 'uk' ? '5 товарів • 5 виробничих посад' : '5 products • 5 manufacturing roles'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  {language === 'uk'
                    ? 'Факторний аналіз відхилень: Продажі (План vs Факт) та Трудовитрати'
                    : 'Plan vs Actual Factor Variance: Sales Revenue & Manufacturing Labor'}
                </h2>
                <p className="text-xs text-[#64748B] max-w-3xl leading-relaxed">
                  {language === 'uk'
                    ? 'Загальний виторг склав 5,548,486 ₴ проти планових 5,895,057 ₴ (-346,571 ₴ / -5.9%). Позитивний ефект зростання обсягу (+74,248 ₴) було перекрито негативним ефектом дисконтування та зниження цін (-420,819 ₴). Витрати на оплату праці зросли на 30.6% через пакування.'
                    : 'Actual revenue reached 5,548,486 ₴ against 5,895,057 ₴ plan (-346,571 ₴ / -5.9%). Volume gains (+74,248 ₴) were outweighed by price discounting effects (-420,819 ₴). Labor costs rose 30.6% driven by packaging overtime.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('factor-bridge')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>{language === 'uk' ? 'Факторний міст' : 'Factor Bridge'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{language === 'uk' ? 'Симулятор сценаріїв' : 'What-If Simulator'}</span>
                </button>
              </div>
            </div>

            {/* Side-by-side Quick Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Quick View */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
                    {language === 'uk' ? 'Структура відхилень у продажах' : 'Sales Variance Summary'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {language === 'uk' ? 'Більше' : 'Details'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {salesData.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#0F172A]">
                          {language === 'uk' ? item.product : item.productEn}
                        </span>
                        <span className={`font-mono font-semibold ${(item.varianceTotal ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {(item.varianceTotal ?? 0) >= 0 ? '+' : ''}{formatCurrency(item.varianceTotal, language, 0)} ({(item.variancePercent ?? 0).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-[#CBD5E1]"
                          style={{ width: `${Math.min(100, ((item.planTotal ?? 0) / 4450000) * 100)}%` }}
                          title={`Plan: ${item.planTotal}`}
                        />
                        <div
                          className={`h-full ${(item.factTotal ?? 0) >= (item.planTotal ?? 0) ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                          style={{ width: `${Math.min(100, ((item.factTotal ?? 0) / 4450000) * 100)}%` }}
                          title={`Fact: ${item.factTotal}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor Quick View */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D97706]" />
                    {language === 'uk' ? 'Виробнича праця: Перевитрати' : 'Labor Overrun Breakdown'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('labor')}
                    className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {language === 'uk' ? 'Більше' : 'Details'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {laborData.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#0F172A]">
                          {language === 'uk' ? item.role : item.roleEn}
                        </span>
                        <span className={`font-mono font-semibold ${(item.varianceTotal ?? 0) <= 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                          {(item.varianceTotal ?? 0) >= 0 ? '+' : ''}{(item.varianceTotal ?? 0).toFixed(1)} ₴ ({item.factHoursPerTon} год/т)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-[#CBD5E1]"
                          style={{ width: `${((item.planTotal ?? 0) / 2000) * 100}%` }}
                        />
                        <div
                          className={`h-full ${(item.factTotal ?? 0) <= (item.planTotal ?? 0) ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                          style={{ width: `${((item.factTotal ?? 0) / 2000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Strategic Notes Grid */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                  {language === 'uk' ? 'Ключові аналітичні спостереження' : 'Core Management Takeaways'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('insights')}
                  className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1 cursor-pointer"
                >
                  {language === 'uk' ? 'Всі коментарі' : 'Full Notes'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
                  <span className="font-bold text-[#047857] block">
                    {language === 'uk' ? '1. Успіх Сушених бананів' : '1. Dried Bananas Outperformed'}
                  </span>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    {language === 'uk'
                      ? 'Найприбутковіша позиція (+37,328 ₴). Одночасне зростання обсягу на 15% та ціни реалізації.'
                      : 'Star performer (+37,328 ₴). Volume climbed 15% along with higher unit price realization.'}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
                  <span className="font-bold text-[#1D4ED8] block">
                    {language === 'uk' ? '2. Баланс дисконту Кокосового печива' : '2. Coconut Cookies Elasticity'}
                  </span>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    {language === 'uk'
                      ? 'Знижка на печиво спрацювала: +10% проданих одиниць повністю компенсували зниження ціни (+19,302 ₴).'
                      : 'Discount strategy worked: +10% volume growth fully balanced the 42 ₴ price point (+19,302 ₴).'}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
                  <span className="font-bold text-[#B91C1C] block">
                    {language === 'uk' ? '3. Критичний дефіцит Вафель та Пакування' : '3. Vanilla Waffles & Packing Deficits'}
                  </span>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    {language === 'uk'
                      ? 'Вафлі втратили 54% виторгу (-179,664 ₴), а трудовитрати пакувальника зросли на 40% (-600 ₴).'
                      : 'Waffles lost 54% target (-179,664 ₴), and packaging hours surged 40% causing -600 ₴ overrun.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sales Deep Dive */}
        {activeTab === 'sales' && (
          <SalesVarianceSection salesData={salesData} language={language} searchQuery={searchQuery} />
        )}

        {/* Tab 3: Manufacturing Labor */}
        {activeTab === 'labor' && (
          <LaborAnalysisSection laborData={laborData} language={language} searchQuery={searchQuery} />
        )}

        {/* Tab 4: Factor Bridge (Waterfall) */}
        {activeTab === 'factor-bridge' && (
          <FactorBridgeChart salesData={salesData} laborData={laborData} language={language} />
        )}

        {/* Tab 5: Elasticity Matrix */}
        {activeTab === 'matrix' && (
          <ElasticityMatrixChart salesData={salesData} language={language} />
        )}

        {/* Tab 6: Scenario Simulator */}
        {activeTab === 'simulator' && (
          <ScenarioSimulator
            salesData={salesData}
            laborData={laborData}
            language={language}
            onApplySimulation={handleApplySimulation}
            onReset={handleResetToBaseline}
          />
        )}

        {/* Tab 7: Structured Data Tables */}
        {activeTab === 'table' && (
          <DataTableSection salesData={salesData} laborData={laborData} language={language} searchQuery={searchQuery} />
        )}

        {/* Tab 8: Qualitative Insights & Notes */}
        {activeTab === 'insights' && (
          <InsightsSection salesData={salesData} laborData={laborData} language={language} />
        )}
      </main>

      {/* Export & Print Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        salesData={salesData}
        laborData={laborData}
        language={language}
        isSimulated={isSimulated}
      />
    </div>
  );
}
