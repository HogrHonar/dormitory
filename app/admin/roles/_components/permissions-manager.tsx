"use client";

import { useState, useTransition, useMemo, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { setRolePermissionsAction } from "@/app/admin/roles/actions/admin/role-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Permission = {
  id: string;
  name: string; // e.g. "students:create", "students:read", "students:delete"
  description: string | null;
};

type RoleWithPermissions = {
  id: string;
  name: string;
  description: string | null;
  permissions: { permission: Permission }[];
};

interface PermissionsManagerProps {
  currentRole: RoleWithPermissions;
  allRoles: RoleWithPermissions[];
  allPermissions: Permission[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Groups permissions by resource prefix.
 * e.g. "students:create" → group "students", action "create"
 * Permissions without ":" are grouped under "general".
 */
function groupPermissions(permissions: Permission[]) {
  const groups: Record<string, { permission: Permission; action: string }[]> =
    {};

  for (const perm of permissions) {
    const colonIdx = perm.name.indexOf(":");
    const group = colonIdx !== -1 ? perm.name.slice(0, colonIdx) : "general";
    const action = colonIdx !== -1 ? perm.name.slice(colonIdx + 1) : perm.name;

    if (!groups[group]) groups[group] = [];
    groups[group].push({ permission: perm, action });
  }

  return groups;
}

const ACTION_ORDER = ["create", "read", "update", "delete"];

function sortedActions(actions: { permission: Permission; action: string }[]) {
  return [...actions].sort((a, b) => {
    const ai = ACTION_ORDER.indexOf(a.action);
    const bi = ACTION_ORDER.indexOf(b.action);
    if (ai === -1 && bi === -1) return a.action.localeCompare(b.action);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

const ACTION_COLORS: Record<string, string> = {
  create:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  read: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  update: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionsManager({
  currentRole,
  allRoles,
  allPermissions,
}: PermissionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selected role (defaults to currentRole)
  const [selectedRoleId, setSelectedRoleId] = useState(currentRole.id);

  // Derive which role object is currently selected
  const selectedRole =
    allRoles.find((r) => r.id === selectedRoleId) ?? currentRole;

  // Checked permission IDs – initialised from the selected role
  const initialChecked = useMemo(
    () => new Set(selectedRole.permissions.map((rp) => rp.permission.id)),
    [selectedRole],
  );
  const [checkedIds, setCheckedIds] = useState<Set<string>>(initialChecked);

  // Reset checkboxes when role changes
  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId);
    const role = allRoles.find((r) => r.id === roleId);
    if (role) {
      setCheckedIds(new Set(role.permissions.map((rp) => rp.permission.id)));
    }
  }

  // Toggle a single permission
  function togglePermission(permId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  }

  // Toggle all permissions in a group
  function toggleGroup(groupPerms: Permission[]) {
    const allChecked = groupPerms.every((p) => checkedIds.has(p.id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        groupPerms.forEach((p) => next.delete(p.id));
      } else {
        groupPerms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  // Save to server
  function handleSave() {
    startTransition(async () => {
      const result = await setRolePermissionsAction(
        selectedRoleId,
        Array.from(checkedIds),
      );
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Permissions updated successfully");
        router.refresh();
      }
    });
  }

  const grouped = useMemo(
    () => groupPermissions(allPermissions),
    [allPermissions],
  );
  const groupKeys = Object.keys(grouped).sort();

  const totalChecked = checkedIds.size;
  const isDirty =
    checkedIds.size !== initialChecked.size ||
    [...checkedIds].some((id) => !initialChecked.has(id));

  return (
    <div className="space-y-6">
      {/* Role selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Select Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedRoleId} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.name}</span>
                      {role.description && (
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {totalChecked} permissions selected
              </Badge>
              {isDirty && (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-400"
                >
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission groups */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupKeys.map((group) => {
          const actions = sortedActions(grouped[group]);
          const groupPerms = actions.map((a) => a.permission);
          const allGroupChecked = groupPerms.every((p) => checkedIds.has(p.id));
          const someGroupChecked = groupPerms.some((p) => checkedIds.has(p.id));

          return (
            <Card key={group} className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4 bg-muted/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold capitalize flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {group}
                  </CardTitle>
                  {/* Select all in group */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">All</span>
                    <Checkbox
                      checked={
                        allGroupChecked
                          ? true
                          : someGroupChecked
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={() => toggleGroup(groupPerms)}
                      aria-label={`Toggle all ${group} permissions`}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 py-3 space-y-2">
                {actions.map(({ permission, action }) => {
                  const colorClass =
                    ACTION_COLORS[action] ??
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

                  return (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={checkedIds.has(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                        id={permission.id}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold capitalize ${colorClass}`}
                        >
                          {action}
                        </span>
                        {permission.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {permission.description}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Save button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Changes apply immediately after saving.
        </p>
        <Button onClick={handleSave} disabled={isPending || !isDirty}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Permissions
        </Button>
      </div>
    </div>
  );
}
