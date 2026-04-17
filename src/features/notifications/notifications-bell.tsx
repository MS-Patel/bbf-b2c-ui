import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/relative-time";
import {
  useMarkAllReadMutation,
  useMarkReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/api";
import type { Notification, NotificationCategory } from "@/types/notifications";

const ICON_BY_CATEGORY: Record<NotificationCategory, typeof Bell> = {
  order: CircleCheck,
  kyc: ShieldCheck,
  sip: CircleDollarSign,
  payout: CircleDollarSign,
  system: FileText,
  alert: Sparkles,
};

const TONE: Record<Notification["severity"], string> = {
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/12 text-destructive",
};

const SEVERITY_ICON: Record<Notification["severity"], typeof Bell> = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleAlert,
};

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
  compact?: boolean;
}

export function NotificationRow({ notification, onRead, compact }: NotificationRowProps) {
  const Icon = ICON_BY_CATEGORY[notification.category] ?? SEVERITY_ICON[notification.severity];
  const Body = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 text-left transition-smooth",
        "hover:bg-secondary/70",
        !notification.read && "bg-secondary/40",
      )}
    >
      <div className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg", TONE[notification.severity])}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("truncate text-sm", notification.read ? "font-medium" : "font-semibold")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent shadow-glow" aria-label="Unread" />
          )}
        </div>
        <p className={cn("mt-0.5 text-xs text-muted-foreground", compact ? "line-clamp-2" : "")}>
          {notification.body}
        </p>
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  const handleClick = () => {
    if (!notification.read) onRead(notification.id);
  };

  if (notification.href) {
    return (
      <Link to={notification.href} onClick={handleClick} className="block">
        {Body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={handleClick} className="block w-full">
      {Body}
    </button>
  );
}

export function NotificationsBell() {
  const { data, isLoading } = useNotificationsQuery();
  const markRead = useMarkReadMutation();
  const markAllRead = useMarkAllReadMutation();
  const items = data ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-glow">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] overflow-hidden p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="h-8 gap-1.5 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[420px]">
          <div className="flex flex-col gap-0.5 p-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              : items.length === 0
                ? (
                  <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">You're all caught up</p>
                    <p className="text-xs text-muted-foreground">New alerts will show up here.</p>
                  </div>
                )
                : items.slice(0, 6).map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onRead={(id) => markRead.mutate(id)}
                      compact
                    />
                  ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="h-9 w-full text-xs font-medium">
            <Link to="/app/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
