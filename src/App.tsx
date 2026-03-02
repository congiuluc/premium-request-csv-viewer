import { useState, useMemo } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { BarChart3, AlertTriangle, FolderOpen } from 'lucide-react';
import type { Filters } from './types';
import { useSessionData } from './hooks/useSessionData';
import { useFilteredData } from './hooks/useFilteredData';
import { useGitHubProfiles } from './hooks/useGitHubProfiles';
import CsvUpload from './components/CsvUpload';
import KpiCards from './components/KpiCards';
import FilterBar from './components/FilterBar';
import DailyTrendChart from './components/charts/DailyTrendChart';
import TopUsersChart from './components/charts/TopUsersChart';
import ModelDistributionChart from './components/charts/ModelDistributionChart';
import OrgBreakdownChart from './components/charts/OrgBreakdownChart';
import QuotaExceedance from './components/QuotaExceedance';
import DataTable from './components/DataTable';
import GitHubTokenInput from './components/GitHubTokenInput';
import ThemeToggle from './components/ThemeToggle';
import UserDetail from './pages/UserDetail';
import ExceedanceReport from './pages/ExceedanceReport';

const defaultFilters: Filters = {
  dateFrom: '',
  dateTo: '',
  username: '',
  models: [],
  organizations: [],
};

function AppHeader({
  clearData,
  profiles,
  profilesLoading,
  resolveProfiles,
}: {
  clearData: () => void;
  profiles: Record<string, import('./types').GitHubProfile>;
  profilesLoading: boolean;
  resolveProfiles: () => Promise<void>;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-lg">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
                            flex items-center justify-center shadow-sm
                            group-hover:shadow-indigo-500/25 group-hover:shadow-md transition-shadow">
              <BarChart3 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold gradient-text hidden sm:inline">
              Premium Request Viewer
            </span>
          </Link>
          <nav className="hidden md:flex items-center ml-4 gap-1">
            <Link
              to="/report/exceedance"
              className="btn btn-ghost text-xs gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Exceedance Report
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <GitHubTokenInput onResolve={resolveProfiles} loading={profilesLoading} />
          <button
            onClick={clearData}
            className="btn btn-secondary text-xs gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New File</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({
  data,
  clearData,
  profiles,
  profilesLoading,
  resolveProfiles,
}: {
  data: import('./types').CsvRow[];
  clearData: () => void;
  profiles: Record<string, import('./types').GitHubProfile>;
  profilesLoading: boolean;
  resolveProfiles: () => Promise<void>;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const filteredData = useFilteredData(data, filters);

  const allModels = useMemo(() => [...new Set(data.map((r) => r.model))].sort(), [data]);
  const allOrgs = useMemo(() => [...new Set(data.map((r) => r.organization))].sort(), [data]);

  return (
    <>
      <AppHeader
        clearData={clearData}
        profiles={profiles}
        profilesLoading={profilesLoading}
        resolveProfiles={resolveProfiles}
      />
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 animate-fade-in">
        <KpiCards data={filteredData} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          allModels={allModels}
          allOrgs={allOrgs}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <DailyTrendChart data={filteredData} />
          <TopUsersChart data={filteredData} profiles={profiles} />
          <ModelDistributionChart data={filteredData} />
          <OrgBreakdownChart data={filteredData} />
        </div>

        <QuotaExceedance data={filteredData} profiles={profiles} />

        <DataTable data={filteredData} profiles={profiles} />
      </main>
    </>
  );
}

export default function App() {
  const { data, saveData, clearData, loading } = useSessionData();

  const usernames = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((r) => r.username))];
  }, [data]);

  const { profiles, loading: profilesLoading, resolve } = useGitHubProfiles(usernames);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse-soft text-muted-foreground text-sm">Loading data…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CsvUpload onData={saveData} />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            data={data}
            clearData={clearData}
            profiles={profiles}
            profilesLoading={profilesLoading}
            resolveProfiles={resolve}
          />
        }
      />
      <Route
        path="/user/:username"
        element={<UserDetail data={data} profiles={profiles} />}
      />
      <Route
        path="/report/exceedance"
        element={<ExceedanceReport data={data} profiles={profiles} />}
      />
    </Routes>
  );
}
