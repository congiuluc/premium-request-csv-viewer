# Premium Request Viewer — User Manual

> All screenshots below use dummy data for demonstration purposes.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Accessing the App](#2-accessing-the-app)
3. [Getting Your CSV Report from GitHub](#3-getting-your-csv-report-from-github)
4. [Uploading a CSV File](#4-uploading-a-csv-file)
5. [Dashboard Overview](#5-dashboard-overview)
6. [KPI Cards](#6-kpi-cards)
7. [Filtering Data](#7-filtering-data)
8. [Charts](#8-charts)
9. [Quota Exceedance Chart](#9-quota-exceedance-chart)
10. [Data Table](#10-data-table)
11. [Exceedance Report Page](#11-exceedance-report-page)
12. [User Detail Page](#12-user-detail-page)
13. [GitHub Profile Resolution](#13-github-profile-resolution)
14. [Switching Theme (Dark / Light)](#14-switching-theme-dark--light)
15. [Loading a New File](#15-loading-a-new-file)
16. [Data Privacy](#16-data-privacy)

---

## 1. Introduction

**Premium Request Viewer** is a client-side analytics dashboard for analyzing GitHub Copilot premium request usage data. Upload a CSV usage report exported from GitHub, and the app provides interactive charts, KPI summaries, and drill-down views — with no data ever leaving your browser.

**Key capabilities at a glance:**

| Capability | Description |
|---|---|
| CSV upload | Drag-and-drop or file picker |
| KPI cards | Totals for requests, cost, users, and quota exceedance |
| Interactive charts | Daily trend, top users, model distribution, org breakdown |
| Filtering | Date range, username, models, and organizations |
| Quota exceedance | Identify users who exceeded their monthly quota |
| Data table | Search, sort, paginate, and export filtered data |
| Exceedance report | Dedicated page with full quota overage breakdown |
| User detail | Per-user usage drill-down |
| GitHub profiles | Optional username-to-name/avatar resolution via PAT |
| Themes | Dark and light mode |

---

## 2. Accessing the App

The app is hosted on GitHub Pages and requires no installation:

**[https://congiuluc.github.io/premium-request-csv-viewer/](https://congiuluc.github.io/premium-request-csv-viewer/)**

Open this URL in any modern browser and the app is ready to use.

### Running Locally

If you prefer to run the app yourself:

```bash
# Clone the repository
git clone https://github.com/congiuluc/premium-request-csv-viewer.git
cd premium-request-csv-viewer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 3. Getting Your CSV Report from GitHub

The app expects a **premium request usage report** exported from GitHub's billing system.

### Steps

1. **Navigate to Billing** — go to your organization or enterprise page, then click **Billing & Licensing** in the sidebar (organization) or top tab (enterprise).

2. **Open Premium Request Analytics** — under the **Usage** section, click **Premium request analytics**.

3. **Request the report** — at the top of the page, click **Get usage report**.

4. **Specify report details** — choose your desired date range and any other options.

5. **Send the report** — click **Email me the report**. GitHub will send a download link to your primary email address (the link expires after 24 hours).

6. **Download the CSV** — click the link in the email to download the `.csv` file to your computer.

> 📄 For full details see the official GitHub docs: [Downloading usage reports](https://docs.github.com/en/billing/how-tos/products/view-productlicense-use#downloading-usage-reports)

### Expected CSV Columns

The report will contain the following columns:

`date`, `username`, `product`, `sku`, `model`, `quantity`, `unit_type`, `applied_cost_per_quantity`, `gross_amount`, `discount_amount`, `net_amount`, `exceeds_quota`, `total_monthly_quota`, `organization`, `cost_center_name`

---

## 4. Uploading a CSV File

When you first open the app, you are presented with the upload screen.

![CSV Upload](screenshots/01-csv-upload.png)

### Drag and Drop

1. Open your file manager and locate the downloaded CSV.
2. Drag the file over the upload zone (the dashed bordered area).
3. The zone highlights in blue when a file is detected.
4. Release the file to upload it — parsing starts immediately.

### Click to Browse

1. Click anywhere inside the upload zone.
2. A standard file picker dialog opens.
3. Select the `.csv` file and click **Open**.

### After Upload

Once parsing completes successfully, the app transitions to the main dashboard. Your data is persisted in IndexedDB so it survives page refreshes (up to 2 weeks).

If the file cannot be parsed, an error message appears below the upload zone. Ensure the file is a valid CSV exported from GitHub.

---

## 5. Dashboard Overview

After uploading a CSV, the main dashboard appears with the following sections (from top to bottom):

1. **Header** — navigation, theme toggle, token button, and new file button
2. **KPI Cards** — high-level metrics for the current filtered data
3. **Filter Bar** — controls to narrow down the data
4. **Charts Grid** — four interactive charts side by side
5. **Quota Exceedance Chart** — stacked bar chart for users who exceeded quota
6. **Data Table** — full transaction list with search, sort, pagination, and export

---

## 6. KPI Cards

![KPI Cards](screenshots/02-kpi-cards.png)

The KPI cards at the top of the dashboard display aggregate metrics for the currently filtered dataset:

| Card | Description |
|---|---|
| **Total Requests** | Sum of all `quantity` values across filtered rows |
| **Gross Amount** | Total cost before discounts |
| **Net Amount** | Total cost after discounts |
| **Unique Users** | Number of distinct usernames |
| **Unique Models** | Number of distinct AI models used |
| **Exceeding Users** | Number of users with at least one row where `exceeds_quota = true` |
| **Date Range** | Earliest and latest dates in the filtered dataset |

> All KPI values update in real time as you change the filters.

---

## 7. Filtering Data

![Filter Bar](screenshots/03-filter-bar.png)

The **Filters** panel sits between the KPI cards and the charts. Click the **Filters** header to collapse or expand it.

### Date Range

Use the **From** and **To** date pickers to limit data to a specific time window. You can set one or both bounds independently.

### Username

Type a partial or full GitHub username in the **Username** field. The filter performs a case-insensitive substring match, so entering `john` will match `johnsmith`, `johnny`, etc.

### Models (Multi-Select)

Click the **Models** dropdown to see all AI models present in the data. You can:
- Select **All Models** to include all (default).
- Click individual model names to include only those models.
- Select multiple models simultaneously.
- Use the search box (appears when there are more than six models) to find a model quickly.
- Click **Clear selection** inside the dropdown to deselect all.

### Organizations (Multi-Select)

Works identically to the Models dropdown but filters by GitHub organization.

### Active Filter Chips

When any filter is active, a **badge** appears on the Filters header showing how many filters are active. Inside the panel, **chips** appear for every active filter. Click the **×** on a chip to remove that individual filter, or click **Clear all** to reset everything at once.

---

## 8. Charts

![Interactive Charts](screenshots/04-charts.png)

Four charts are displayed in a two-column grid below the filter bar. All charts respond to the active filters.

### Daily Trend (Area Chart)

Shows the number of requests and net cost per day over the selected time period. Hover over any point on the chart to see the exact values for that day. The gradient-filled area makes it easy to spot spikes in usage.

### Top Users (Horizontal Bar Chart)

Ranks users by total request count. The bar for each user is proportional to their share of total requests. If GitHub Profile Resolution is enabled (see [section 13](#13-github-profile-resolution)), the real name and avatar are displayed next to the username. Click a username to navigate to the [User Detail page](#12-user-detail-page).

### Model Distribution (Donut Chart)

Shows how requests are distributed across AI models. Hover over a segment to see the model name, request count, and percentage. Use this chart to understand which models are used most heavily.

### Org Breakdown (Vertical Bar Chart)

Displays total requests grouped by GitHub organization. Useful for multi-org enterprises to compare usage across teams.

---

## 9. Quota Exceedance Chart

![Quota Exceedance](screenshots/05-quota-exceedance.png)

Below the four main charts is the **Quota Exceedance** section. This stacked bar chart highlights users who exceeded their monthly premium request quota.

- Each bar represents a user.
- The bar is split into two segments: requests **within quota** (blue) and requests **exceeding quota** (orange/red).
- Hover over a segment to see the exact values.
- Click a username label to go to their [User Detail page](#12-user-detail-page).

To see a full report of all users with exceedances, use the **Exceedance Report** link in the navigation bar (see [section 11](#11-exceedance-report-page)).

---

## 10. Data Table

![Data Table](screenshots/06-data-table.png)

The **Data Table** at the bottom of the dashboard shows every transaction row matching the current filters.

### Searching

Use the **Search** input above the table to further narrow rows by any text value (username, model, SKU, etc.).

### Sorting

Click any **column header** to sort the table by that column. Click again to reverse the sort direction. An arrow indicator shows the current sort column and direction.

### Pagination

Use the **chevron buttons** (‹ and ›) at the bottom right of the table to move between pages. The current page and total page count are displayed alongside the buttons.

### Exporting to CSV

Click the **Export CSV** button (top-right of the table) to download the currently filtered and searched data as a `.csv` file. Only the rows visible with the current filters are included in the export.

---

## 11. Exceedance Report Page

![Exceedance Report](screenshots/07-exceedance-report.png)

Click **Exceedance Report** in the top navigation bar to open a dedicated page listing all users who exceeded their monthly quota.

The page includes:

- **KPI summary** — total users exceeding quota, total excess requests, and total excess cost.
- **User list** — a table showing each user's total quota, requests within quota, excess requests, and excess cost.
- Click any username to navigate to their [User Detail page](#12-user-detail-page).

Use the browser **Back** button or click the **Premium Request Viewer** logo in the header to return to the main dashboard.

---

## 12. User Detail Page

![User Detail](screenshots/08-user-detail.png)

Click any username in the Top Users chart, Quota Exceedance chart, Exceedance Report, or Data Table to open that user's detail page.

The page shows:

- **User header** — avatar (if GitHub Profile Resolution is enabled), username, real name, and summary KPIs.
- **Daily usage chart** — area chart of that user's requests over time.
- **Model breakdown** — donut chart showing which models the user employed.
- **SKU table** — totals grouped by SKU.
- **Transaction list** — every row for this user, with sorting and pagination.

Use the browser **Back** button or click the **Premium Request Viewer** logo to return to the main dashboard.

---

## 13. GitHub Profile Resolution

By default, the app displays raw GitHub usernames. You can optionally resolve these to real names and profile avatars by providing a GitHub Personal Access Token (PAT).

### Why a Token Is Needed

The GitHub REST API allows 60 unauthenticated requests per hour. For datasets with many unique users, this limit is quickly reached. With a PAT, the limit increases to 5,000 requests per hour.

### Setting Up a Token

1. Click the **Token** button in the top-right header (it shows a grey dot when no token is set, and a green pulsing dot when active).
2. In the dialog that opens, paste your PAT (format: `ghp_...`).
3. The current API rate limit status is shown (limit, remaining, and reset time).
4. Click **Save & Resolve** to store the token and immediately resolve all usernames in the loaded data.

> The token is stored in your browser's `localStorage` and is only ever sent to `api.github.com`. It is never transmitted to any other server.

### Clearing the Token

Open the Token dialog and click **Clear** to remove the saved token.

---

## 14. Switching Theme (Dark / Light)

Click the **sun/moon icon** in the top-right header to toggle between dark and light mode. Your preference is saved in `localStorage` and restored automatically on your next visit.

---

## 15. Loading a New File

To analyze a different CSV file:

1. Click the **New File** button (folder icon) in the top-right header.
2. The current data is cleared from the session.
3. The app returns to the upload screen where you can upload a new file.

> Clicking **New File** permanently removes the currently loaded data from the session. Make sure you have exported any data you need before doing so.

---

## 16. Data Privacy

All data processing happens **entirely in your browser**:

- The CSV is parsed locally using PapaParse — no file is uploaded to any server.
- Parsed data is stored in your browser's **IndexedDB** with a 2-week expiration; it is never sent anywhere.
- The only external network request made by the app is to `api.github.com` when GitHub Profile Resolution is enabled, and only to fetch public profile information (name and avatar).

You can safely use this app with real usage reports containing usernames and cost data.
