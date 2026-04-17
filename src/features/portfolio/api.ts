import { useQuery } from "@tanstack/react-query";
import { HOLDINGS_FIXTURE, PORTFOLIO_FIXTURE } from "./fixtures";
import type { Holding, PortfolioOverview } from "@/types/portfolio";

/**
 * Mock portfolio API. Real wiring should call:
 *   api.get<PortfolioOverview>('/portfolio/overview/')
 *   api.get<PaginatedResponse<Holding>>('/portfolio/holdings/', { params })
 * The hook contracts here will not change.
 */

const PORTFOLIO_KEY = ["portfolio", "overview"] as const;
const HOLDINGS_KEY = ["portfolio", "holdings"] as const;

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function usePortfolioOverviewQuery() {
  return useQuery<PortfolioOverview>({
    queryKey: PORTFOLIO_KEY,
    queryFn: () => delay(PORTFOLIO_FIXTURE),
    staleTime: 60_000,
  });
}

export function useHoldingsQuery() {
  return useQuery<Holding[]>({
    queryKey: HOLDINGS_KEY,
    queryFn: () => delay(HOLDINGS_FIXTURE, 380),
    staleTime: 60_000,
  });
}
