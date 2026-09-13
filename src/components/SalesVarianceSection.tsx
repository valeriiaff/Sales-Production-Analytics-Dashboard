import React, { useState } from 'react';
import { SalesItem, Language } from '../types';
import { formatCurrency, formatNumber, formatPercent, getStatusColor } from '../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Info,
  DollarSign,
  Package,
  Layers,
  PieChart as PieIcon,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';

interface SalesVarianceSectionProps {
  salesData: SalesItem[];
  language: Language;
  searchQuery?: string;
}

type ChartViewType = 'revenue' | 'quantity' | 'price' | 'share' | 'variance';

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B'];

export const SalesVarianceSection: React.FC<SalesVarianceSectionProps> = ({
  salesData,
  language,
  searchQuery = '',
}) => {
  const [chartView, setChartView] = useState<ChartViewType>('revenue');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Filter based on search query
  const filteredData = salesData.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.product || '').toLowerCase().includes(q) ||
      (item.productEn || '').toLowerCase().includes(q)
    );
  });

  const selectedProduct =
    salesData.find((item) => item.id === selectedProductId) || salesData[0];

  // Prepare chart dataset
  const chartData = filteredData.map((item) => ({
    name: language === 'uk' ? item.product : item.productEn,
    fullName: language === 'uk' ? item.product : item.productEn,
    planTotal: Math.round(item.planTotal ?? 0),
    factTotal: Math.round(item.factTotal ?? 0),
    planQty: item.planQty ?? 0,
    factQty: item.factQty ?? 0,
    planPrice: item.planPrice ?? 0,
    factPrice: item.factPrice ?? 0,
    varianceTotal: Math.round(item.varianceTotal ?? 0),
    varianceVolume: Math.round(item.varianceVolume ?? 0),
    variancePrice: Math.round(item.variancePrice ?? 0),
    variancePercent: Number((item.variancePercent ?? 0).toFixed(1)),
    status: item.status,
  }));

  // Pie chart data for Fact revenue distribution
  const totalFact = salesData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const pieData = salesData.map((item) => ({
    name: language === 'uk' ? item.product : item.productEn,
    value: Math.round(item.factTotal ?? 0),
    percent: totalFact > 0 ? (((item.factTotal ?? 0) / totalFact) * 100).toFixed(1) : '0.0',
  }));

  return (
    <div className="space-y-6">
      {/* Section Controls & View Switcher */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#3B82F6]" />
            {language === 'uk' ? 'Аналіз доходів від реалізації продукції' : 'Sales Revenue & Volume Performance'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Порівняння планових та фактичних показників, факторний розподіл та частка портфелю'
              : 'Plan vs Fact metrics comparison, factor breakdown, and portfolio mix'}
          </p>
        </div>

        {/* View Switch Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          <button
            id="view-revenue-btn"
            type="button"
            onClick={() => setChartView('revenue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              chartView === 'revenue'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            {language === 'uk' ? 'Виторг (₴)' : 'Revenue (₴)'}
          </button>
          <button
            id="view-qty-btn"
            type="button"
            onClick={() => setChartView('quantity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              chartView === 'quantity'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            {language === 'uk' ? 'Кількість (од)' : 'Quantity (Units)'}
          </button>
          <button
            id="view-price-btn"
            type="button"
            onClick={() => setChartView('price')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              chartView === 'price'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {language === 'uk' ? 'Ціна за од (₴)' : 'Unit Price (₴)'}
          </button>
          <button
            id="view-variance-btn"
            type="button"
            onClick={() => setChartView('variance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              chartView === 'variance'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {language === 'uk' ? 'Відхилення (₴)' : 'Variance (₴)'}
          </button>
          <button
            id="view-share-btn"
            type="button"
            onClick={() => setChartView('share')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              chartView === 'share'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            {language === 'uk' ? 'Частка виторгу' : 'Revenue Share'}
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart Container (2 cols on large) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              {chartView === 'revenue' && (language === 'uk' ? 'Порівняння виручки: План vs Факт (₴)' : 'Revenue Comparison: Plan vs Actual (₴)')}
              {chartView === 'quantity' && (language === 'uk' ? 'Обсяг реалізації: План vs Факт (од.)' : 'Units Sold: Plan vs Actual (Units)')}
              {chartView === 'price' && (language === 'uk' ? 'Ціна одиниці товару: План vs Факт (₴)' : 'Average Selling Price: Plan vs Actual (₴)')}
              {chartView === 'variance' && (language === 'uk' ? 'Факторне відхилення за категоріями (₴)' : 'Variance Factor Decomposition per Product (₴)')}
              {chartView === 'share' && (language === 'uk' ? 'Структура фактичного доходу за товарами' : 'Actual Revenue Share Distribution')}
            </h3>
            <span className="text-xs text-[#94A3B8] font-mono">
              {language === 'uk' ? 'Всього: ' : 'Total items: '} {filteredData.length}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'share' ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${formatNumber(val, language)} ₴`, language === 'uk' ? 'Виторг' : 'Revenue']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend
                    formatter={(val, entry: any) => (
                      <span className="text-[#334155] text-xs font-medium">
                        {val} ({entry?.payload?.percent ?? '0'}%)
                      </span>
                    )}
                  />
                </PieChart>
              ) : chartView === 'variance' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `${((val ?? 0) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${formatCurrency(value, language, 0)}`,
                      name === 'varianceVolume'
                        ? language === 'uk' ? 'Фактор обсягу' : 'Volume Effect'
                        : name === 'variancePrice'
                        ? language === 'uk' ? 'Фактор ціни' : 'Price Effect'
                        : language === 'uk' ? 'Сукупне відхилення' : 'Net Variance',
                    ]}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend
                    formatter={(val) => (
                      <span className="text-[#334155] text-xs font-medium">
                        {val === 'varianceVolume'
                          ? language === 'uk' ? 'Вплив обсягу' : 'Volume Effect'
                          : val === 'variancePrice'
                          ? language === 'uk' ? 'Вплив ціни' : 'Price Effect'
                          : language === 'uk' ? 'Загальне відхилення' : 'Total Variance'}
                      </span>
                    )}
                  />
                  <Bar dataKey="varianceVolume" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="variancePrice" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="varianceTotal" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) =>
                      chartView === 'revenue'
                        ? `${((val ?? 0) / 1000).toFixed(0)}k`
                        : chartView === 'quantity'
                        ? `${((val ?? 0) / 1000).toFixed(0)}k`
                        : `${val}₴`
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      chartView === 'price'
                        ? `${(value ?? 0).toFixed(1)} ₴`
                        : `${formatNumber(value, language)} ${chartView === 'revenue' ? '₴' : 'од.'}`,
                      name === 'planTotal' || name === 'planQty' || name === 'planPrice'
                        ? language === 'uk' ? 'План' : 'Plan'
                        : language === 'uk' ? 'Факт' : 'Actual',
                    ]}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend
                    formatter={(val) => (
                      <span className="text-[#334155] text-xs font-medium">
                        {val.includes('plan')
                          ? language === 'uk' ? 'План' : 'Plan'
                          : language === 'uk' ? 'Факт' : 'Actual'}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey={chartView === 'revenue' ? 'planTotal' : chartView === 'quantity' ? 'planQty' : 'planPrice'}
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={chartView === 'revenue' ? 'factTotal' : chartView === 'quantity' ? 'factQty' : 'factPrice'}
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Product Spotlight Card (1 col on large) */}
        {selectedProduct && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">
                  {language === 'uk' ? 'Деталізація позиції' : 'Product Deep Dive'}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    getStatusColor(selectedProduct.status).badge
                  }`}
                >
                  {(selectedProduct.variancePercent ?? 0) >= 0 ? '+' : ''}
                  {(selectedProduct.variancePercent ?? 0).toFixed(1)}%
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F172A] mb-3">
                {language === 'uk' ? selectedProduct.product : selectedProduct.productEn}
              </h3>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">{language === 'uk' ? 'План виручки' : 'Plan Revenue'}</span>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {formatNumber(selectedProduct.planTotal, language)} ₴
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {formatNumber(selectedProduct.planQty, language)} од. × {selectedProduct.planPrice} ₴
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">{language === 'uk' ? 'Факт виручки' : 'Fact Revenue'}</span>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {formatNumber(selectedProduct.factTotal, language)} ₴
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {formatNumber(selectedProduct.factQty, language)} од. × {selectedProduct.factPrice} ₴
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">{language === 'uk' ? 'Вплив обсягу (ΔQ)' : 'Volume Effect (ΔQ)'}</span>
                  <span
                    className={`text-sm font-bold ${
                      (selectedProduct.varianceVolume ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {formatCurrency(selectedProduct.varianceVolume, language, 0)}
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {formatPercent(selectedProduct.volumeChangePercent)} од.
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">{language === 'uk' ? 'Вплив ціни (ΔP)' : 'Price Effect (ΔP)'}</span>
                  <span
                    className={`text-sm font-bold ${
                      (selectedProduct.variancePrice ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {formatCurrency(selectedProduct.variancePrice, language, 0)}
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {formatPercent(selectedProduct.priceChangePercent)} ціна
                  </span>
                </div>
              </div>

              {/* Verbatim commentary from user's data */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 text-xs text-[#1E3A8A]">
                <div className="flex items-center gap-1.5 font-bold text-[#1D4ED8] mb-1">
                  <Info className="w-3.5 h-3.5" />
                  {language === 'uk' ? 'Аналітичний коментар:' : 'Analytical Commentary:'}
                </div>
                <p className="leading-relaxed text-[#1E40AF]">
                  {language === 'uk' ? selectedProduct.comment : selectedProduct.commentEn}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">
              {language === 'uk' ? 'Оберіть товар нижче для перегляду аналізу' : 'Select any product below to inspect'}
            </div>
          </div>
        )}
      </div>

      {/* Product Selector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredData.map((item) => {
          const isSelected = selectedProductId === item.id || (!selectedProductId && item.id === (selectedProduct?.id));
          return (
            <button
              key={item.id}
              id={`product-card-${item.id}`}
              type="button"
              onClick={() => setSelectedProductId(item.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-[#EFF6FF]/40 border-[#3B82F6] shadow-sm ring-1 ring-[#3B82F6]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <h4 className="text-xs font-bold text-[#0F172A] truncate" title={language === 'uk' ? item.product : item.productEn}>
                  {language === 'uk' ? item.product : item.productEn}
                </h4>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    (item.varianceTotal ?? 0) >= 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {formatPercent(item.variancePercent)}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-[#64748B]">
                  <span>{language === 'uk' ? 'Факт:' : 'Fact:'}</span>
                  <span className="font-semibold text-[#0F172A]">
                    {formatNumber(item.factTotal, language)} ₴
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>{language === 'uk' ? 'Різниця:' : 'Variance:'}</span>
                  <span
                    className={`font-semibold ${
                      (item.varianceTotal ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {formatCurrency(item.varianceTotal, language, 0)}
                  </span>
                </div>
              </div>

              {/* Mini factor indicators */}
              <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px]">
                <span className="text-[#64748B] flex items-center gap-1">
                  ΔQ:
                  <span className={(item.varianceVolume ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {(item.varianceVolume ?? 0) >= 0 ? '+' : ''}{(((item.varianceVolume ?? 0)) / 1000).toFixed(0)}k
                  </span>
                </span>
                <span className="text-[#64748B] flex items-center gap-1">
                  ΔP:
                  <span className={(item.variancePrice ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {(item.variancePrice ?? 0) >= 0 ? '+' : ''}{(((item.variancePrice ?? 0)) / 1000).toFixed(0)}k
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
