export interface CsvRow {
  date: string;
  username: string;
  product: string;
  sku: string;
  model: string;
  quantity: string;
  unit_type: string;
  applied_cost_per_quantity: string;
  gross_amount: string;
  discount_amount: string;
  net_amount: string;
  exceeds_quota: string;
  total_monthly_quota: string;
  organization: string;
  cost_center_name: string;
}

export interface UserAggregate {
  username: string;
  organization: string;
  costCenter: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
  discountAmount: number;
  exceededRequests: number;
  overQuotaCost: number;
  quota: number;
  modelsUsed: number;
  exceededModels: number;
}

export interface DateAggregate {
  date: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
}

export interface ModelAggregate {
  model: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
}

export interface OrgAggregate {
  organization: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
  userCount: number;
}

export interface SkuAggregate {
  sku: string;
  product: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
}

export interface Kpis {
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
  discountAmount: number;
  uniqueUsers: number;
  uniqueModels: number;
  exceedingUsersCount: number;
  dateRange: string;
}

export interface GitHubProfile {
  name: string | null;
  avatarUrl: string | null;
}

export interface Filters {
  dateFrom: string;
  dateTo: string;
  username: string;
  models: string[];
  organizations: string[];
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}
