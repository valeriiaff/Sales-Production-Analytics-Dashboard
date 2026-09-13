import React, { useState } from 'react';
import { LaborItem, Language } from '../types';
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
} from 'recharts';
import {
  Users,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface LaborAnalysisSectionProps {
  laborData: LaborItem[];
  language: Language;
  searchQuery?: string;
}

export const LaborAnalysisSection: React.FC<LaborAnalysisSectionProps> = ({
  laborData,
  language,
  searchQuery = '',
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Filter based on search query
  const filteredData = laborData.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.role || '').toLowerCase().includes(q) ||
      (item.roleEn || '').toLowerCase().includes(q)
    );
  });

  const selectedRole =
    laborData.find((item) => item.id === selectedRoleId) ||
    laborData.find((item) => item.id === 'packer') ||
    laborData[0];

  // Chart data
  const chartData = filteredData.map((item) => ({
    name: language === 'uk' ? item.role : item.roleEn,
    planTotal: item.planTotal ?? 0,
    factTotal: item.factTotal ?? 0,
    planHours: item.planHoursPerTon ?? 0,
    factHours: item.factHoursPerTon ?? 0,
    planRate: item.planRatePerHour ?? item.planHourlyRate ?? 0,
    factRate: item.factRatePerHour ?? item.factHourlyRate ?? 0,
    varianceTotal: item.varianceTotal ?? 0,
    varianceHours: item.varianceHours ?? item.varianceVolume ?? 0,
    varianceRate: item.varianceRate ?? 0,
  }));

  // Totals
  const totalPlan = laborData.reduce((acc, item) => acc + (item.planTotal ?? 0), 0);
  const totalFact = laborData.reduce((acc, item) => acc + (item.factTotal ?? 0), 0);
  const totalVariance = totalFact - totalPlan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            {language === 'uk' ? 'Аналіз витрат на оплату праці та продуктивності' : 'Manufacturing Labor & Efficiency Analysis'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Факторний аналіз трудовитрат: вплив трудомісткості (год/т) та вартості години (грн/год)'
              : 'Labor factor decomposition: hours intensity (hrs/t) vs hourly wage rate inflation (UAH/hr)'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] px-3.5 py-2 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="text-[#92400E]">
              {language === 'uk' ? 'Сукупні перевитрати:' : 'Total Overrun:'}{' '}
              <strong className="text-[#B45309]">+{totalVariance.toFixed(2)} ₴ (+30.6%)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost & Factor Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">
              {language === 'uk'
                ? 'Витрати на оплату праці за посадами: План vs Факт (₴/т)'
                : 'Labor Cost per Ton by Role: Plan vs Actual (UAH/t)'}
            </h3>
            <span className="text-xs text-[#94A3B8]">
              {language === 'uk' ? 'База: на 1 тонну продукції' : 'Base: per 1 ton of production'}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
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
                  tickFormatter={(val) => `${val}₴`}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `${(val ?? 0).toFixed(2)} ₴`,
                    name === 'planTotal'
                      ? language === 'uk' ? 'План' : 'Plan'
                      : language === 'uk' ? 'Факт' : 'Actual',
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend
                  formatter={(val) => (
                    <span className="text-[#334155] text-xs font-medium">
                      {val === 'planTotal'
                        ? language === 'uk' ? 'План витрат' : 'Plan Labor Cost'
                        : language === 'uk' ? 'Факт витрат' : 'Actual Labor Cost'}
                    </span>
                  )}
                />
                <Bar dataKey="planTotal" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="factTotal" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Role Deep-Dive Card */}
        {selectedRole && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">
                  {language === 'uk' ? 'Аналіз посади' : 'Role Diagnostics'}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    getStatusColor(selectedRole.status).badge
                  }`}
                >
                  {(selectedRole.variancePercent ?? 0) >= 0 ? '+' : ''}
                  {(selectedRole.variancePercent ?? 0).toFixed(1)}%
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F172A] mb-3">
                {language === 'uk' ? selectedRole.role : selectedRole.roleEn}
              </h3>

              {/* Metrics Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                      {language === 'uk' ? 'Трудомісткість (год/т)' : 'Labor Intensity (hrs/t)'}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {language === 'uk' ? 'План:' : 'Plan:'} {selectedRole.planHoursPerTon} год → {language === 'uk' ? 'Факт:' : 'Fact:'}{' '}
                      <strong className="text-[#0F172A]">{selectedRole.factHoursPerTon} год</strong>
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      (selectedRole.factHoursPerTon ?? 0) <= (selectedRole.planHoursPerTon ?? 0)
                        ? 'text-[#10B981]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {(selectedRole.factHoursPerTon ?? 0) > (selectedRole.planHoursPerTon ?? 0) ? '+' : ''}
                    {((selectedRole.factHoursPerTon ?? 0) - (selectedRole.planHoursPerTon ?? 0)).toFixed(1)} год
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                      {language === 'uk' ? 'Годинна ставка (грн/год)' : 'Hourly Rate (UAH/hr)'}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {language === 'uk' ? 'План:' : 'Plan:'} {selectedRole.planHourlyRate ?? selectedRole.planRatePerHour ?? 0} ₴ → {language === 'uk' ? 'Факт:' : 'Fact:'}{' '}
                      <strong className="text-[#0F172A]">{selectedRole.factHourlyRate ?? selectedRole.factRatePerHour ?? 0} ₴</strong>
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      (selectedRole.factHourlyRate ?? selectedRole.factRatePerHour ?? 0) <= (selectedRole.planHourlyRate ?? selectedRole.planRatePerHour ?? 0)
                        ? 'text-[#10B981]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {(selectedRole.factHourlyRate ?? selectedRole.factRatePerHour ?? 0) > (selectedRole.planHourlyRate ?? selectedRole.planRatePerHour ?? 0) ? '+' : ''}
                    {((selectedRole.factHourlyRate ?? selectedRole.factRatePerHour ?? 0) - (selectedRole.planHourlyRate ?? selectedRole.planRatePerHour ?? 0)).toFixed(1)} ₴
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                      {language === 'uk' ? 'Вплив факторів' : 'Factor Decomposition'}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Δ Норми: <strong className="text-[#EF4444]">{((selectedRole.varianceHours ?? selectedRole.varianceVolume ?? 0)).toFixed(1)} ₴</strong> | Δ Ставки:{' '}
                      <strong className="text-[#EF4444]">{((selectedRole.varianceRate ?? 0)).toFixed(1)} ₴</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Verbatim commentary */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 text-xs text-[#1E3A8A]">
                <div className="flex items-center gap-1.5 font-bold text-[#1D4ED8] mb-1">
                  <Info className="w-3.5 h-3.5" />
                  {language === 'uk' ? 'Коментар до відхилення:' : 'Variance Analysis:'}
                </div>
                <p className="leading-relaxed text-[#1E40AF]">
                  {language === 'uk' ? selectedRole.comment : selectedRole.commentEn}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">
              {language === 'uk' ? 'Оберіть посаду для детального аналізу' : 'Select role below to inspect'}
            </div>
          </div>
        )}
      </div>

      {/* Role Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredData.map((item) => {
          const isSelected = selectedRoleId === item.id || (!selectedRoleId && item.id === (selectedRole?.id));
          return (
            <button
              key={item.id}
              id={`role-card-${item.id}`}
              type="button"
              onClick={() => setSelectedRoleId(item.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-[#EFF6FF]/40 border-[#3B82F6] shadow-sm ring-1 ring-[#3B82F6]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <h4 className="text-xs font-bold text-[#0F172A] truncate" title={language === 'uk' ? item.role : item.roleEn}>
                  {language === 'uk' ? item.role : item.roleEn}
                </h4>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    (item.varianceTotal ?? 0) >= 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  +{formatPercent(item.variancePercent, false)}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-[#64748B]">
                  <span>{language === 'uk' ? 'Факт:' : 'Fact:'}</span>
                  <span className="font-semibold text-[#0F172A]">{(item.factTotal ?? 0).toFixed(1)} ₴</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>{language === 'uk' ? 'Перевитрата:' : 'Overrun:'}</span>
                  <span className="font-semibold text-[#EF4444]">
                    +{(item.varianceTotal ?? 0).toFixed(1)} ₴
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#64748B]">
                <span>{item.factHoursPerTon} {language === 'uk' ? 'год/т' : 'hrs/t'}</span>
                <span>{item.factHourlyRate ?? item.factRatePerHour ?? 0} ₴/год</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
