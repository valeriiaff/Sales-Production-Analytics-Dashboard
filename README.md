# Sales & Operations FP&A Dashboard
*Interactive Plan vs. Actual Performance & Factor Analysis*

DEMO: https://sales-production-analytics-dashboar.vercel.app/

**Author:** Valeriia F

---

## 📌 Overview

This dashboard is an interactive financial and operational analytics application designed to evaluate and explain variances between planned budget targets and actual business performance.

Using standard FP&A factor decomposition methodologies, the system isolates key performance drivers across commercial revenue and manufacturing operations:
- **Revenue Drivers**: Disaggregates top-line deviations into sales volume changes ($\Delta Q$) and unit price variances ($\Delta P$).
- **Labor Efficiency**: Separates operational productivity and labor intensity ($\Delta H$) from hourly wage rates and overtime premiums ($\Delta R$).
- **Decision Support**: Provides price elasticity mapping, dynamic what-if scenario modeling, and client-side PDF/CSV report generation.

---

## ✨ Key Features

1. **Executive KPI Summary**
   - High-level metric cards for Gross Revenue, Output Volumes, Average Realization Price, and Unit Labor Costs.
   - Status indicators highlighting favorable variances and target shortfalls.

2. **Commercial Variance Analysis**
   - Detailed product-level variance analysis comparing planned vs. actual volumes, unit prices, and total revenues.
   - Contextual commentary explaining commercial headwinds and growth drivers.

3. **Operational & Labor Efficiency**
   - Tracking planned standard hours per unit of output versus actual hours across key production roles.
   - Isolation of operational bottlenecks, process downtime, and hourly wage deviations.

4. **Interactive Factor Waterfall Bridge**
   - **Smart Focused Zoom**: Dynamic axis scaling for clear visibility of small and large factor movements.
   - **Visual Bridge Connectors**: Dashed continuity lines with callout badges indicating exact variance values and percentage contributions.
   - **Dual Views**: Instant toggle between the progressive Waterfall Bridge and Diverging Factor Impact bars.
   - **Factor Drill-Down**: Interactive breakdown of line-item contributions for each variance driver.

5. **Price Elasticity Matrix**
   - Strategic 2x2 scatter matrix evaluating demand sensitivity and pricing power across product lines.

6. **Interactive Scenario Simulator**
   - Real-time sliders to test "what-if" scenarios by adjusting sales volumes, prices, labor hours, and wage rates.
   - Instant calculation of projected revenue, net variance, and operating margin impact.

7. **Excel Upload & Flexible Data Analysis**
   - Direct import of custom user spreadsheets (`.xlsx`, `.xls`, `.csv`) via drag-and-drop or file picker.
   - Automatic factor decomposition, volume/price/rate calculations, and data preview.
   - Built-in downloadable reference Excel template (`FPnA_Analytics_Template.xlsx`).
   - Seamless switching between custom datasets and demo baseline.

8. **Reporting & Data Export**
   - One-click executive PDF report generation.
   - Direct export to Microsoft Excel (`.xlsx`) and structured CSV formats.

9. **Bilingual Support**
   - Complete localized interface in Ukrainian (UK) and English (EN).

---

## 🛠 Tech Stack

- **Framework**: React 19 with TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Spreadsheets & Data**: SheetJS (xlsx)
- **Exporting**: jsPDF, html2canvas

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd <repository-folder>

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the development server
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Building for Production
```bash
# Compile and build production assets
npm run build

# Preview the production build locally
npm run preview
```

---

## 👤 Author

**Valeriia F**
