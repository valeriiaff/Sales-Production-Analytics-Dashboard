import React, { useState, useRef } from 'react';
import { Language, SalesItem, LaborItem } from '../types';
import { parseExcelFile, downloadExcelTemplate, ParseResult } from '../lib/excelParser';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApplyData: (sales: SalesItem[], labor: LaborItem[], fileName: string) => void;
  onResetToDefault: () => void;
  isCustomDataLoaded?: boolean;
  activeFileName?: string | null;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyData,
  onResetToDefault,
  isCustomDataLoaded,
  activeFileName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'sales' | 'labor'>('sales');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isUk = language === 'uk';

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setParseResult(null);

    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
      if (result.sales.length > 0) {
        setPreviewTab('sales');
      } else if (result.labor.length > 0) {
        setPreviewTab('labor');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setParseResult({
        success: false,
        sales: [],
        labor: [],
        fileName: file.name,
        error: `Could not parse file: ${msg}`,
        stats: {
          salesCount: 0,
          laborCount: 0,
          totalPlanSales: 0,
          totalFactSales: 0,
          totalPlanLabor: 0,
          totalFactLabor: 0,
        },
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleApply = () => {
    if (!parseResult || !parseResult.success) return;
    onApplyData(parseResult.sales, parseResult.labor, parseResult.fileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="excel-import-title"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#A7F3D0]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 id="excel-import-title" className="text-base font-bold text-[#0F172A]">
                {isUk ? 'Імпорт даних з Excel (.xlsx, .xls, .csv)' : 'Import Data from Excel (.xlsx, .xls, .csv)'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {isUk
                  ? 'Завантажте власну таблицю продажів чи витрат на оплату праці для миттєвого факторного аналізу'
                  : 'Upload your own sales or labor variance spreadsheet for instant interactive analysis'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Data Status Banner */}
        {isCustomDataLoaded && (
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#1E40AF]">
              <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>
                {isUk
                  ? `Зараз активні дані з файлу: `
                  : `Currently active custom dataset: `}
                <strong className="font-mono">{activeFileName || 'custom.xlsx'}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                onClose();
              }}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isUk ? 'Повернути вихідні' : 'Restore Demo'}</span>
            </button>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#2563EB] bg-[#EFF6FF]'
              : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8] hover:bg-[#F1F5F9]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center text-[#2563EB]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {isUk
                  ? 'Перетягніть Excel-файл сюди або натисніть для вибору'
                  : 'Drag & drop your Excel file here, or click to browse'}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isUk
                  ? 'Підтримуються формати .xlsx, .xls та .csv'
                  : 'Supports .xlsx, .xls, and .csv formats'}
              </p>
            </div>
          </div>
        </div>

        {/* Template Helper Download Row */}
        <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs">
          <div className="flex items-center gap-2 text-[#475569]">
            <Download className="w-4 h-4 text-[#059669]" />
            <span>
              {isUk
                ? 'Потрібен зразок структури таблиці?'
                : 'Need a reference spreadsheet structure?'}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadExcelTemplate();
            }}
            className="px-3 py-1.5 font-semibold text-[#059669] hover:bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isUk ? 'Завантажити шаблон (.xlsx)' : 'Download Template (.xlsx)'}</span>
          </button>
        </div>

        {/* Parsing State */}
        {isParsing && (
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            <span>{isUk ? 'Аналізуємо аркуші та розраховуємо фактори...' : 'Reading workbook and computing factor variances...'}</span>
          </div>
        )}

        {/* Parse Results Preview */}
        {parseResult && (
          <div className="space-y-4">
            {parseResult.success ? (
              <div className="space-y-3">
                {/* File Success Header */}
                <div className="p-3.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#166534]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <div>
                      <span className="font-bold">{parseResult.fileName}</span>
                      <span className="text-[#15803D] block text-[11px]">
                        {isUk
                          ? `Розпізнано: ${parseResult.stats.salesCount} позицій продажів, ${parseResult.stats.laborCount} виробничих ролей`
                          : `Successfully detected: ${parseResult.stats.salesCount} sales items, ${parseResult.stats.laborCount} labor roles`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#166534]">
                    {parseResult.stats.salesCount > 0 && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-[#BBF7D0]">
                        Факт: {formatNumber(Math.round(parseResult.stats.totalFactSales), language)} ₴
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs to inspect parsed rows */}
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  {parseResult.sales.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('sales')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        previewTab === 'sales'
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A] bg-[#F1F5F9]'
                      }`}
                    >
                      {isUk ? `Продажі (${parseResult.sales.length})` : `Sales Data (${parseResult.sales.length})`}
                    </button>
                  )}
                  {parseResult.labor.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('labor')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        previewTab === 'labor'
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A] bg-[#F1F5F9]'
                      }`}
                    >
                      {isUk ? `Праця та норми (${parseResult.labor.length})` : `Labor & Roles (${parseResult.labor.length})`}
                    </button>
                  )}
                </div>

                {/* Table Preview */}
                <div className="max-h-48 overflow-y-auto border border-[#E2E8F0] rounded-xl text-xs bg-white">
                  {previewTab === 'sales' && parseResult.sales.length > 0 && (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0 text-[11px] font-bold text-[#475569]">
                        <tr>
                          <th className="p-2.5">{isUk ? 'Товар' : 'Product'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'План к-сть' : 'Plan Qty'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'План ціна' : 'Plan Price'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Факт к-сть' : 'Fact Qty'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Факт ціна' : 'Fact Price'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Чисте відхилення' : 'Net Variance'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {parseResult.sales.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="p-2.5 font-medium text-[#0F172A]">{item.product}</td>
                            <td className="p-2.5 text-right font-mono">{formatNumber(item.planQty, language)}</td>
                            <td className="p-2.5 text-right font-mono">{item.planPrice.toFixed(1)} ₴</td>
                            <td className="p-2.5 text-right font-mono">{formatNumber(item.factQty, language)}</td>
                            <td className="p-2.5 text-right font-mono">{item.factPrice.toFixed(1)} ₴</td>
                            <td
                              className={`p-2.5 text-right font-mono font-bold ${
                                item.varianceTotal >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {item.varianceTotal >= 0 ? '+' : ''}
                              {formatCurrency(item.varianceTotal, language, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {previewTab === 'labor' && parseResult.labor.length > 0 && (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0 text-[11px] font-bold text-[#475569]">
                        <tr>
                          <th className="p-2.5">{isUk ? 'Посада' : 'Role'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'План год' : 'Plan H'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'План тариф' : 'Plan Rate'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Факт год' : 'Fact H'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Факт тариф' : 'Fact Rate'}</th>
                          <th className="p-2.5 text-right">{isUk ? 'Відхилення' : 'Variance'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {parseResult.labor.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="p-2.5 font-medium text-[#0F172A]">{item.role}</td>
                            <td className="p-2.5 text-right font-mono">{item.planHoursPerTon.toFixed(1)}</td>
                            <td className="p-2.5 text-right font-mono">{item.planHourlyRate.toFixed(1)} ₴</td>
                            <td className="p-2.5 text-right font-mono">{item.factHoursPerTon.toFixed(1)}</td>
                            <td className="p-2.5 text-right font-mono">{item.factHourlyRate.toFixed(1)} ₴</td>
                            <td
                              className={`p-2.5 text-right font-mono font-bold ${
                                item.varianceTotal >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {item.varianceTotal >= 0 ? '+' : ''}
                              {item.varianceTotal.toFixed(1)} ₴
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{isUk ? 'Помилка розпізнавання файлу' : 'File Parsing Error'}</p>
                  <p className="mt-0.5 leading-relaxed">{parseResult.error}</p>
                  <p className="mt-1 text-[11px] text-[#B91C1C]">
                    {isUk
                      ? 'Спробуйте завантажити наш шаблон, заповнити власні цифри та імпортувати повторно.'
                      : 'Please download our template, copy your numbers into it, and re-upload.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {isUk ? 'Закрити' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            {isCustomDataLoaded && (
              <button
                type="button"
                onClick={() => {
                  onResetToDefault();
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-[#F8FAFC] text-[#DC2626] border border-[#FECACA] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isUk ? 'Скинути до вихідних' : 'Reset to Default'}</span>
              </button>
            )}

            <button
              type="button"
              disabled={!parseResult || !parseResult.success}
              onClick={handleApply}
              className={`px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                parseResult && parseResult.success
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isUk ? 'Застосувати до дашборду' : 'Apply to Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
