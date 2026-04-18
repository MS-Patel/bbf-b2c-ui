import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import { usePayoutsQuery } from "@/features/admin/api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { formatDate, formatINR } from "@/lib/format";
import type { PayoutRun, PayoutStatus } from "@/types/admin";

export const Route = createFileRoute("/app/admin/payouts")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "admin") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Payouts — Admin" }] }),
  component: AdminPayoutsPage,
});

const STATUS_TONE: Record<PayoutStatus, StatusTone> = {
  processed: "success",
  pending: "warning",
  scheduled: "info",
  failed: "destructive",
};

function AdminPayoutsPage() {
  const { data } = usePayoutsQuery();
  const [status, setStatus] = useState<PayoutStatus | "all">("all");
  const rows = useMemo(() => (data ?? []).filter((r) => status === "all" || r.status === status), [data, status]);

  const columns: DataTableColumn<PayoutRun>[] = [
    { id: "id", header: "Run ID", sortValue: (r) => r.id, accessor: (r) => <span className="font-mono text-xs">{r.id.toUpperCase()}</span> },
    { id: "cycle", header: "Cycle", sortValue: (r) => r.cycle, accessor: (r) => r.cycle },
    {
      id: "ben", header: "Beneficiary", sortValue: (r) => r.beneficiary,
      accessor: (r) => (
        <div>
          <p className="font-semibold">{r.beneficiary}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.beneficiaryRole === "rm" ? "RM" : "Distributor"}</p>
        </div>
      ),
    },
    { id: "amt", header: "Amount", align: "right", sortValue: (r) => r.amount, accessor: (r) => <span className="font-semibold">{formatINR(r.amount)}</span> },
    { id: "status", header: "Status", sortValue: (r) => r.status, accessor: (r) => <StatusBadge tone={STATUS_TONE[r.status]} label={r.status} /> },
    { id: "created", header: "Created", sortValue: (r) => r.createdAt, accessor: (r) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
    { id: "processed", header: "Processed", sortValue: (r) => r.processedAt ?? "", accessor: (r) => r.processedAt ? <span className="text-sm text-muted-foreground">{formatDate(r.processedAt)}</span> : <span className="text-muted-foreground">—</span> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin · Finance"
        title="Payouts"
        description="Track payout runs across cycles. Re-trigger failed runs or export to CSV."
        actions={
          <>
            <Button variant="outline" className="gap-1.5" onClick={() => toast("Triggered re-run for failed payouts")}>
              <RefreshCw className="h-4 w-4" /> Re-run failed
            </Button>
            <Button className="gap-1.5" onClick={() => toast.success("Payout report queued")}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />
      <div className="space-y-5 px-6 py-6 sm:px-8">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-3 p-4">
            <Select value={status} onValueChange={(v) => setStatus(v as PayoutStatus | "all")}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{rows.length} runs</p>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={rows}
          initialSortId="created"
          initialSortDir="desc"
          pageSize={12}
          mobileCard={(r) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{r.beneficiary}</p>
                  <p className="text-xs text-muted-foreground">{r.cycle} · {r.beneficiaryRole === "rm" ? "RM" : "Distributor"}</p>
                </div>
                <StatusBadge tone={STATUS_TONE[r.status]} label={r.status} />
              </div>
              <p className="font-semibold tabular-nums">{formatINR(r.amount)}</p>
            </div>
          )}
        />
      </div>
    </>
  );
}
