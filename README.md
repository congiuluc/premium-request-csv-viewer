# Premium Request Viewer

A modern, dark-themed dashboard for analyzing GitHub Copilot premium request usage data. Upload a CSV report to explore KPIs, interactive charts, and drill into per-user or quota-exceedance details — all client-side with data stored in `sessionStorage`.

## Features

- **CSV Upload** — drag-and-drop or file picker with animated upload zone; parsed with PapaParse
- **KPI Cards** — color-accented cards displaying total requests, gross/net costs, unique users & models, exceeding users, and date range
- **Interactive Charts** — daily trend (area chart with gradient fill), top users (horizontal bar), model distribution (donut pie), org breakdown (vertical bar), quota exceedance (stacked bar)
- **Data Table** — full transaction table with inline search, column sorting, pagination with chevron navigation, and CSV export
- **Quota Exceedance Report** — dedicated page listing users who exceeded quota with cost breakdown and KPI summary
- **User Detail** — per-user view with daily usage chart, model breakdown, SKU table, and full transaction list
- **GitHub Profile Resolution** — optional: resolve GitHub usernames to real names and avatars via Personal Access Token
- **Dark-First Theming** — dark mode by default; built on Tailwind v4 with a custom design system using semantic CSS variables, glass effects, gradient accents, and smooth animations (fade-in, scale-in, slide-down)
- **Enhanced Filtering** — filter by date range, username, date, and multiple selections for models and organizations with "Select All" capabilities
- **Responsive Layout** — sticky header with backdrop blur, mobile-friendly grid layouts, and smooth transitions

## Installation

```bash
npm install
```

## Usage

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Open the app and upload a CSV file with the expected columns:

`date`, `username`, `product`, `sku`, `model`, `quantity`, `unit_type`, `applied_cost_per_quantity`, `gross_amount`, `discount_amount`, `net_amount`, `exceeds_quota`, `total_monthly_quota`, `organization`, `cost_center_name`

## Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys to GitHub Pages on every push to `main`.

Enable GitHub Pages in your repository settings → **Pages** → Source: **GitHub Actions**.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (custom design system with CSS variables)
- Recharts 2
- TanStack React Table v8
- Lucide React (icons)
- PapaParse
- React Router v7 (HashRouter)

## License

MIT
