import React from 'react';
import { ActiveTab, Language } from '../types';
import {
  BarChart3,
  TrendingDown,
  Users,
  GitFork,
  ScatterChart as ScatterIcon,
  Sliders,
  Table as TableIcon,
  Lightbulb,
  Download,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReset: () => void;
  onExport: () => void;
  isSimulated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  searchQuery,
  setSearchQuery,
  onReset,
  onExport,
  isSimulated,
}) => {
  const tabs: { id: ActiveTab; labelUk: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', labelUk: 'Загальний огляд', labelEn: 'Overview', icon: BarChart3 },
    { id: 'sales', labelUk: 'Аналіз продажів', labelEn: 'Sales Analysis', icon: TrendingDown },
    { id: 'labor', labelUk: 'Виробництво та праця', labelEn: 'Labor & Production', icon: Users },
    { id: 'factor-bridge', labelUk: 'Факторний міст (Waterfall)', labelEn: 'Factor Bridge', icon: GitFork },
    { id: 'matrix', labelUk: 'Матриця еластичності', labelEn: 'Elasticity Matrix', icon: ScatterIcon },
    { id: 'simulator', labelUk: 'Симулятор "Що якщо"', labelEn: 'What-If Simulator', icon: Sliders },
    { id: 'table', labelUk: 'Таблиця даних', labelEn: 'Data Tables', icon: TableIcon },
    { id: 'insights', labelUk: 'Висновки та коментарі', labelEn: 'Insights & Notes', icon: Lightbulb },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] text-[#334155] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
                  {language === 'uk' ? 'Аналітичний дашборд: Продажі та Виробництво' : 'Sales & Production Analytics Dashboard'}
                </h1>
                {isSimulated && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {language === 'uk' ? 'Симуляція активна' : 'Simulation Mode'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                {language === 'uk'
                  ? 'Факторний аналіз відхилень (План vs Факт), обсяг/ціна та трудовитрати'
                  : 'Factor decomposition of plan vs actual variance, price/volume effects & labor'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="dashboard-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'uk' ? 'Пошук позиції / ролі...' : 'Search product / role...'}
                className="pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent w-44 sm:w-56 transition-all"
              />
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
              <button
                id="lang-toggle-uk"
                type="button"
                onClick={() => setLanguage('uk')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'uk'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                UA
              </button>
              <button
                id="lang-toggle-en"
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Reset Button if modified */}
            {isSimulated && (
              <button
                id="header-reset-btn"
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-[#334155] hover:bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-1.5 transition-colors shadow-xs"
                title={language === 'uk' ? 'Скинути симуляцію до оригіналу' : 'Reset simulation to actual baseline'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="hidden sm:inline">{language === 'uk' ? 'Скинути' : 'Reset'}</span>
              </button>
            )}

            {/* Export Button */}
            <button
              id="header-export-btn"
              type="button"
              onClick={onExport}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'uk' ? 'Завантажити / PDF' : 'Download / PDF'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-[#F1F5F9] pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#3B82F6] font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3B82F6]' : 'text-[#64748B]'}`} />
                {language === 'uk' ? tab.labelUk : tab.labelEn}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
