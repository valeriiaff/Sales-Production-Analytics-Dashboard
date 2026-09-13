import React from 'react';
import { SalesItem, Language } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ScatterChart as ScatterIcon } from 'lucide-react';

interface ElasticityMatrixChartProps {
  salesData: SalesItem[];
  language: Language;
}

export const ElasticityMatrixChart: React.FC<ElasticityMatrixChartProps> = ({
  salesData,
  language,
}) => {
  // Scatter dataset
  const scatterData = salesData.map((item) => ({
    name: language === 'uk' ? item.product : item.productEn,
    x: Number((item.priceChangePercent ?? 0).toFixed(1)), // Price change %
    y: Number((item.volumeChangePercent ?? 0).toFixed(1)), // Volume change %
    z: item.factTotal ?? 0, // Bubble size = revenue
    varianceTotal: item.varianceTotal ?? 0,
    status: item.status,
    product: item,
  }));

  const getColor = (x: number, y: number) => {
    if (x >= 0 && y >= 0) return '#10B981'; // Win-Win / Stars (Price UP, Volume UP)
    if (x < 0 && y > 0) return '#3B82F6'; // Price Discounted, Volume Up (Elastic response)
    if (x < 0 && y <= 0) return '#EF4444'; // Crisis (Price Down AND Volume Down/Flat)
    return '#F59E0B'; // Price Up, Volume Down
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <ScatterIcon className="w-5 h-5 text-[#3B82F6]" />
            {language === 'uk'
              ? 'Матриця цінової еластичності та реакції ринку (2×2)'
              : 'Price Elasticity & Market Response Matrix (2×2)'}
          </h2>
          <p className="text-xs text-[#64748B]">
            {language === 'uk'
              ? 'Аналіз взаємозв’язку між зміною ціни реалізації (ΔP%) та динамікою попиту (ΔQ%)'
              : 'Diagnostics of price variation (ΔP%) versus demand elasticity response (ΔQ%)'}
          </p>
        </div>
      </div>

      {/* Main Scatter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Plot */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">
              {language === 'uk'
                ? 'Координатна площина: Зміна ціни (Вісь X) vs Зміна обсягу (Вісь Y)'
                : 'Coordinate Plane: Price Change % (X-Axis) vs Volume Change % (Y-Axis)'}
            </h3>
            <span className="text-xs text-[#94A3B8]">
              {language === 'uk' ? 'Розмір бульбашки = Фактичний виторг' : 'Bubble size = Actual Revenue'}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 20 }}>
                {/* Quadrant Axis Lines */}
                <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" />
                <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  dataKey="x"
                  name="Price Change"
                  unit="%"
                  domain={[-15, 15]}
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  label={{
                    value: language === 'uk' ? 'Зміна ціни (ΔP %)' : 'Price Change (ΔP %)',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#64748B',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Volume Change"
                  unit="%"
                  domain={[-70, 30]}
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  label={{
                    value: language === 'uk' ? 'Зміна обсягу (ΔQ %)' : 'Volume Change (ΔQ %)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748B',
                    fontSize: 11,
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[120, 600]} name="Revenue" />

                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg shadow-md text-xs space-y-1">
                          <p className="font-bold text-[#0F172A]">{data.name}</p>
                          <p className="text-[#64748B]">
                            {language === 'uk' ? 'Зміна ціни (ΔP):' : 'Price Change:'}{' '}
                            <span className="font-semibold text-[#0F172A]">{data.x}%</span>
                          </p>
                          <p className="text-[#64748B]">
                            {language === 'uk' ? 'Зміна обсягу (ΔQ):' : 'Volume Change:'}{' '}
                            <span className="font-semibold text-[#0F172A]">{data.y}%</span>
                          </p>
                          <p className="text-[#64748B]">
                            {language === 'uk' ? 'Виторг:' : 'Revenue:'}{' '}
                            <span className="font-semibold text-[#0F172A]">
                              {formatCurrency(data.z, language, 0)}
                            </span>
                          </p>
                          <p
                            className={`font-semibold ${
                              data.varianceTotal >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {language === 'uk' ? 'Відхилення:' : 'Variance:'}{' '}
                            {formatCurrency(data.varianceTotal, language, 0)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Scatter name="Products" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.x, entry.y)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4-Quadrant Strategic Interpretation Guide */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">
              {language === 'uk' ? 'Інтерпретація 4-х квадрантів' : 'Quadrant Strategic Matrix'}
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Q1: Stars */}
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-lg">
                <span className="font-bold text-[#065F46] flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  {language === 'uk' ? 'Квадрант 1: "Зірки" (ΔP > 0, ΔQ > 0)' : 'Quadrant 1: Stars (ΔP > 0, ΔQ > 0)'}
                </span>
                <p className="text-[#047857] text-[11px] leading-relaxed">
                  {language === 'uk'
                    ? 'Сушені банани: зростання ціни (+1.1%) не зменшило попит (+15% обсягу). Продукт преміального сегменту з високою лояльністю.'
                    : 'Dried Bananas: price increase (+1.1%) met with +15% volume surging. Highly resilient product.'}
                </p>
              </div>

              {/* Q2: Discount Drivers */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-lg">
                <span className="font-bold text-[#1E40AF] flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  {language === 'uk' ? 'Квадрант 2: Еластичний попит (ΔP < 0, ΔQ > 0)' : 'Quadrant 2: Elastic (ΔP < 0, ΔQ > 0)'}
                </span>
                <p className="text-[#1D4ED8] text-[11px] leading-relaxed">
                  {language === 'uk'
                    ? 'Кокосове печиво: дисконт -8.7% стимулював +10% продажу, збільшивши загальний чистий прибуток (+19,302 ₴).'
                    : 'Coconut Cookies: -8.7% discount sparked +10% volume growth, creating a positive net payoff (+19,302 ₴).'}
                </p>
              </div>

              {/* Q3: Inelastic Losses */}
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-lg">
                <span className="font-bold text-[#92400E] flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  {language === 'uk' ? 'Квадрант 3: Неефективний дисконт (ΔP < 0, ΔQ < 0)' : 'Quadrant 3: Inelastic (ΔP < 0, ΔQ < 0)'}
                </span>
                <p className="text-[#B45309] text-[11px] leading-relaxed">
                  {language === 'uk'
                    ? 'Ванільні вафлі: зниження ціни (-8.6%) не допомогло врятувати продажі (-50% обсягу).'
                    : 'Vanilla Waffles: price discounts (-8.6%) failed to recover volume (-50%), yielding deep deficit.'}
                </p>
              </div>

              {/* Q4: Crisis Collapse */}
              <div className="bg-[#FEF2F2] border border-[#FECACA] p-3 rounded-lg">
                <span className="font-bold text-[#991B1B] flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  {language === 'uk' ? 'Квадрант 4: Зростання ціни та падіння попиту (ΔP > 0, ΔQ < 0)' : 'Quadrant 4: Price Up, Volume Down'}
                </span>
                <p className="text-[#B91C1C] text-[11px] leading-relaxed">
                  {language === 'uk'
                    ? 'Цукерки та Набір горішків: підвищення ціни супроводжувалось обвальним падінням продажів (-22.6% та -66.7%).'
                    : 'Chocolate Candies & Nut Set: higher prices caused customer churn (-22.6% and -66.7% unit drop).'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
