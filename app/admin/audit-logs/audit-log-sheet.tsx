"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Clock,
  User,
  Shield,
  Database,
  Hash,
  Globe,
  AlertCircle,
  FileText,
  GitCompare,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import { AuditLogRow } from "@/app/data/admin/admin-get-audit-logs";
import { cn } from "@/lib/utils";

function JsonDiff({
  oldValues,
  newValues,
}: {
  oldValues: unknown;
  newValues: unknown;
}) {
  if (!oldValues && !newValues)
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Info className="h-4 w-4 mr-2" />
        <span className="text-sm">هیچ داتایەک نییە</span>
      </div>
    );

  const old = oldValues ? JSON.parse(JSON.stringify(oldValues)) : {};
  const next = newValues ? JSON.parse(JSON.stringify(newValues)) : {};
  const keys = Array.from(new Set([...Object.keys(old), ...Object.keys(next)]));

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <span>کلیل</span>
            <span className="text-destructive">کۆن</span>
            <span className="text-emerald-600 dark:text-emerald-400">نوێ</span>
          </div>

          {/* Vertical scroll for rows */}
          <ScrollArea className="h-[280px]">
            <div className="divide-y">
              {keys.map((key) => {
                const oldVal =
                  old[key] !== undefined ? JSON.stringify(old[key]) : null;
                const newVal =
                  next[key] !== undefined ? JSON.stringify(next[key]) : null;
                const changed = oldVal !== newVal;
                const isAdded = oldVal === null && newVal !== null;
                const isRemoved = oldVal !== null && newVal === null;

                return (
                  <div
                    key={key}
                    className={cn(
                      "grid grid-cols-3 px-4 py-3 text-sm items-start gap-2",
                      changed && "bg-amber-50/60 dark:bg-amber-900/10",
                      !changed && "hover:bg-muted/30",
                    )}
                  >
                    {/* Key */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isAdded && (
                        <Plus className="h-3 w-3 text-emerald-500 shrink-0" />
                      )}
                      {isRemoved && (
                        <Minus className="h-3 w-3 text-destructive shrink-0" />
                      )}
                      {!isAdded && !isRemoved && changed && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                      <span
                        className="font-mono text-xs text-muted-foreground truncate"
                        title={key}
                      >
                        {key}
                      </span>
                    </div>

                    {/* Old value */}
                    <div className="min-w-0">
                      {oldVal !== null ? (
                        <span
                          className={cn(
                            "font-mono text-xs block px-2 py-1 rounded break-all whitespace-pre-wrap",
                            changed
                              ? "text-destructive bg-destructive/8 line-through decoration-destructive/50"
                              : "text-muted-foreground",
                          )}
                          title={oldVal}
                        >
                          {oldVal}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic px-2">
                          —
                        </span>
                      )}
                    </div>

                    {/* New value */}
                    <div className="min-w-0">
                      {newVal !== null ? (
                        <span
                          className={cn(
                            "font-mono text-xs block px-2 py-1 rounded break-all whitespace-pre-wrap",
                            changed
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 font-medium"
                              : "text-muted-foreground",
                          )}
                          title={newVal}
                        >
                          {newVal}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic px-2">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Summary footer */}
      <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {
            keys.filter(
              (k) =>
                JSON.stringify(old[k] ?? null) !==
                JSON.stringify(next[k] ?? null),
            ).length
          }{" "}
          گۆڕانکاری
        </span>
        <span className="flex items-center gap-1">
          <Plus className="h-3 w-3 text-emerald-500" />
          {
            keys.filter((k) => old[k] === undefined && next[k] !== undefined)
              .length
          }{" "}
          زیادکراو
        </span>
        <span className="flex items-center gap-1">
          <Minus className="h-3 w-3 text-destructive" />
          {
            keys.filter((k) => old[k] !== undefined && next[k] === undefined)
              .length
          }{" "}
          سڕاوەتەوە
        </span>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  icon: Icon,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", fullWidth && "col-span-2")}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  LOGIN:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  LOGOUT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  APPROVE: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  REJECT:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  ASSIGN_ROLE:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  REVOKE_ROLE:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const SEVERITY_COLORS: Record<string, string> = {
  DEBUG: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  WARNING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CRITICAL:
    "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200 font-bold",
};

export function AuditLogSheet({ log }: { log: AuditLogRow }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">وردەکاری تۆمار</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {log.id}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable body — full height, y-scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-6 space-y-8">
            {/* Meta */}
            <section>
              <SectionHeader icon={Info} title="زانیاری سەرەکی" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <MetaItem
                  icon={AlertCircle}
                  label="کردار"
                  value={
                    <Badge
                      className={cn(
                        "border-0 font-medium",
                        ACTION_COLORS[log.action] ?? "bg-muted",
                      )}
                    >
                      {log.action}
                    </Badge>
                  }
                />
                <MetaItem
                  icon={Shield}
                  label="ئاست"
                  value={
                    <Badge
                      className={cn(
                        "border-0",
                        SEVERITY_COLORS[log.severity] ?? "bg-muted",
                      )}
                    >
                      {log.severity}
                    </Badge>
                  }
                />
                <MetaItem
                  icon={Database}
                  label="جۆری تۆمار"
                  value={<span className="capitalize">{log.entityType}</span>}
                />
                <MetaItem
                  icon={Hash}
                  label="ID تۆمار"
                  value={
                    <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-muted-foreground break-all">
                      {log.entityId ?? "—"}
                    </code>
                  }
                />
                <MetaItem
                  icon={User}
                  label="بەکارهێنەر"
                  value={
                    log.userEmail ?? (
                      <span className="text-muted-foreground italic text-xs">
                        نەناسراو
                      </span>
                    )
                  }
                />
                <MetaItem
                  icon={Shield}
                  label="ڕۆڵ"
                  value={
                    log.userRole ?? (
                      <span className="text-muted-foreground italic text-xs">
                        —
                      </span>
                    )
                  }
                />
                <MetaItem
                  icon={Globe}
                  label="IP ناونیشان"
                  value={
                    <code className="text-xs font-mono text-muted-foreground">
                      {log.ipAddress ?? "—"}
                    </code>
                  }
                />
                <MetaItem
                  icon={Clock}
                  label="ڕێکەوت"
                  value={
                    <span className="tabular-nums text-xs">
                      {new Date(log.createdAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  }
                />
              </div>
            </section>

            {/* Description */}
            {log.description && (
              <>
                <Separator />
                <section>
                  <SectionHeader icon={FileText} title="وەسف" />
                  <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed text-foreground/90 border">
                    {log.description}
                  </div>
                </section>
              </>
            )}

            {/* Diff */}
            {(log.oldValues || log.newValues) && (
              <>
                <Separator />
                <section>
                  <SectionHeader icon={GitCompare} title="گۆڕانکاریەکان" />
                  {/* x-scrollable diff */}
                  <JsonDiff
                    oldValues={log.oldValues}
                    newValues={log.newValues}
                  />
                </section>
              </>
            )}

            {/* Metadata */}
            {log.metadata && (
              <>
                <Separator />
                <section>
                  <SectionHeader icon={Database} title="مێتاداتا" />
                  {/* x-scrollable pre */}
                  <div className="overflow-x-auto rounded-lg border bg-muted/50">
                    <pre className="text-xs p-4 font-mono leading-relaxed text-muted-foreground min-w-max">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground text-center shrink-0">
          Request ID:{" "}
          <code className="font-mono text-foreground">
            {log.requestId ?? "—"}
          </code>
        </div>
      </SheetContent>
    </Sheet>
  );
}
