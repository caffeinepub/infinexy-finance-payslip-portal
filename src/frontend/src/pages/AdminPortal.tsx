import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Eye,
  FilePlus,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend";
import { PayslipForm, type PayslipFormData } from "../components/PayslipForm";
import { PayslipView } from "../components/PayslipView";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import {
  useAllEmployees,
  useAllPayslips,
  useCreatePayslip,
  useDeletePayslip,
  useUpdatePayslip,
} from "../hooks/useQueries";
import { formatCurrency } from "../utils/numberToWords";

type AdminView =
  | "payslips"
  | "create"
  | "employees"
  | "view"
  | "edit"
  | "settings";

function getStoredAdminCredentials(): { username: string; password: string } {
  try {
    const raw = localStorage.getItem("admin_credentials");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.password) return parsed;
    }
  } catch {
    // ignore
  }
  return { username: "admin", password: "admin123" };
}

export function AdminPortal() {
  const { user, logout } = useAuth();
  const { actor } = useActor();
  const [activeView, setActiveView] = useState<AdminView>("payslips");
  const [search, setSearch] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payslip | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings state
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState("");
  const [settingsNewUsername, setSettingsNewUsername] = useState("");
  const [settingsNewPassword, setSettingsNewPassword] = useState("");
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Re-establish admin session using stored credentials
  useEffect(() => {
    if (!actor) return;
    const creds = getStoredAdminCredentials();
    actor.loginAdmin(creds.username, creds.password).catch(() => {
      // ignore silently
    });
  }, [actor]);

  const { data: payslips, isLoading: payslipsLoading } = useAllPayslips();
  const { data: employees, isLoading: empLoading } = useAllEmployees();
  const deletePayslip = useDeletePayslip();
  const createPayslip = useCreatePayslip();
  const updatePayslip = useUpdatePayslip();

  const filtered = (payslips ?? []).filter(
    (p) =>
      search === "" ||
      p.employeeName.toLowerCase().includes(search.toLowerCase()),
  );

  const netPayable = (p: Payslip) => {
    return (
      p.payableBasicSalary +
      p.payableMobileAllowance +
      p.payableIncentive -
      p.insurance -
      p.professionTax
    );
  };

  const handleCreate = async (data: PayslipFormData) => {
    const args: Parameters<typeof createPayslip.mutateAsync>[0] = [
      data.employeeUsername,
      data.month,
      BigInt(data.year || 0),
      data.employeeName,
      data.panNo,
      data.employeeId,
      data.aadharNumber,
      data.designation,
      data.location,
      data.businessUnit,
      data.dateOfBirth,
      data.dateOfJoining,
      BigInt(data.daysPaid || 0),
      BigInt(data.basicSalary || 0),
      BigInt(data.mobileAllowance || 0),
      BigInt(data.incentive || 0),
      BigInt(data.insurance || 0),
      BigInt(data.professionTax || 0),
      data.paymentMode,
      data.bankName,
      data.accountNumber,
      data.ifscCode,
      data.remark,
      BigInt(data.payableBasicSalary || 0),
      BigInt(data.payableMobileAllowance || 0),
      BigInt(data.payableIncentive || 0),
    ];
    try {
      await createPayslip.mutateAsync(args);
      toast.success("Payslip created successfully!");
      setActiveView("payslips");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create payslip",
      );
    }
  };

  const handleUpdate = async (data: PayslipFormData) => {
    if (!selectedPayslip) return;
    const args: Parameters<typeof updatePayslip.mutateAsync>[0] = [
      selectedPayslip.id,
      data.employeeUsername,
      data.month,
      BigInt(data.year || 0),
      data.employeeName,
      data.panNo,
      data.employeeId,
      data.aadharNumber,
      data.designation,
      data.location,
      data.businessUnit,
      data.dateOfBirth,
      data.dateOfJoining,
      BigInt(data.daysPaid || 0),
      BigInt(data.basicSalary || 0),
      BigInt(data.mobileAllowance || 0),
      BigInt(data.incentive || 0),
      BigInt(data.insurance || 0),
      BigInt(data.professionTax || 0),
      data.paymentMode,
      data.bankName,
      data.accountNumber,
      data.ifscCode,
      data.remark,
      BigInt(data.payableBasicSalary || 0),
      BigInt(data.payableMobileAllowance || 0),
      BigInt(data.payableIncentive || 0),
    ];
    try {
      await updatePayslip.mutateAsync(args);
      toast.success("Payslip updated successfully!");
      setActiveView("payslips");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update payslip",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePayslip.mutateAsync(deleteTarget.id);
      toast.success("Payslip deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleteTarget(null);
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    if (settingsNewPassword !== settingsConfirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!settingsNewUsername.trim() || !settingsNewPassword.trim()) {
      toast.error("Username and password cannot be empty");
      return;
    }
    setSettingsLoading(true);
    try {
      await actor.changeAdminCredentials(
        settingsCurrentPassword,
        settingsNewUsername,
        settingsNewPassword,
      );
      localStorage.setItem(
        "admin_credentials",
        JSON.stringify({
          username: settingsNewUsername,
          password: settingsNewPassword,
        }),
      );
      toast.success("Admin credentials updated successfully!");
      setSettingsCurrentPassword("");
      setSettingsNewUsername("");
      setSettingsNewPassword("");
      setSettingsConfirmPassword("");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update credentials",
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const navItem = (
    view: AdminView,
    icon: React.ReactNode,
    label: string,
    ocid: string,
  ) => (
    <button
      type="button"
      onClick={() => {
        setActiveView(view);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        activeView === view
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
      data-ocid={ocid}
    >
      {icon}
      {label}
    </button>
  );

  const goBack = () => {
    setActiveView("payslips");
    setSelectedPayslip(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full w-64 bg-sidebar flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img
            src="/assets/screenshot_2026-03-13_121927-019d42cf-27da-73a9-8a59-1cd2655ffbf8.png"
            alt="Logo"
            className="h-16 w-48 object-contain"
          />
          <div>
            <div className="text-sm font-cabinet font-bold text-sidebar-foreground tracking-wide">
              INFINEXY
            </div>
            <div className="text-xs text-white">Admin Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItem(
            "payslips",
            <LayoutDashboard className="h-4 w-4" />,
            "All Payslips",
            "nav.all_payslips.link",
          )}
          {navItem(
            "create",
            <FilePlus className="h-4 w-4" />,
            "Create Payslip",
            "nav.create_payslip.link",
          )}
          {navItem(
            "employees",
            <Users className="h-4 w-4" />,
            "Manage Employees",
            "nav.manage_employees.link",
          )}
          {navItem(
            "settings",
            <Settings className="h-4 w-4" />,
            "Settings",
            "nav.settings.link",
          )}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-4 py-2 mb-1">
            <div className="text-xs font-medium text-sidebar-foreground">
              {user?.displayName}
            </div>
            <div className="text-xs text-sidebar-foreground/50">
              Administrator
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-red-300 transition-all"
            data-ocid="nav.logout.button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-card shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">
              {activeView === "payslips" && "All Payslips"}
              {activeView === "create" && "Create Payslip"}
              {activeView === "employees" && "Manage Employees"}
              {activeView === "view" && "Payslip Details"}
              {activeView === "edit" && "Edit Payslip"}
              {activeView === "settings" && "Settings"}
            </h1>
          </div>
          {(activeView === "view" || activeView === "edit") && (
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* All Payslips */}
          {activeView === "payslips" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by employee name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-ocid="payslips.search.input"
                  />
                </div>
                <Button
                  onClick={() => setActiveView("create")}
                  className="gap-2"
                  data-ocid="payslips.new.button"
                >
                  <FilePlus className="h-4 w-4" /> New Payslip
                </Button>
              </div>

              {payslipsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  data-ocid="payslips.empty_state"
                >
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No payslips found
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Create the first payslip to get started
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Period
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Net Payable
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr
                          key={String(p.id)}
                          className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                          data-ocid={`payslips.item.${i + 1}`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{p.employeeName}</div>
                            <div className="text-xs text-muted-foreground">
                              @{p.employeeUsername}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {p.month} {String(p.year)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-primary">
                            {formatCurrency(netPayable(p))}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedPayslip(p);
                                  setActiveView("view");
                                }}
                                data-ocid={`payslip.view.button.${i + 1}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedPayslip(p);
                                  setActiveView("edit");
                                }}
                                data-ocid={`payslip.edit.button.${i + 1}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-destructive"
                                onClick={() => setDeleteTarget(p)}
                                data-ocid={`payslip.delete.button.${i + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create Payslip */}
          {activeView === "create" && (
            <PayslipForm
              onSubmit={handleCreate}
              isLoading={createPayslip.isPending}
              submitLabel="Create Payslip"
            />
          )}

          {/* Edit Payslip */}
          {activeView === "edit" && selectedPayslip && (
            <PayslipForm
              initial={selectedPayslip}
              onSubmit={handleUpdate}
              isLoading={updatePayslip.isPending}
              submitLabel="Save Changes"
            />
          )}

          {/* View Payslip */}
          {activeView === "view" && selectedPayslip && (
            <PayslipView payslip={selectedPayslip} />
          )}

          {/* Manage Employees */}
          {activeView === "employees" && (
            <div className="space-y-4">
              {empLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !employees || employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No employees registered
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Username
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr
                          key={emp.username}
                          className="border-b last:border-0 hover:bg-muted/20"
                        >
                          <td className="py-3 px-4 font-medium">
                            {emp.employeeName}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            @{emp.username}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeView === "settings" && (
            <div className="max-w-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Change Admin Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleChangeCredentials}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={settingsCurrentPassword}
                        onChange={(e) =>
                          setSettingsCurrentPassword(e.target.value)
                        }
                        placeholder="Enter current password"
                        required
                        data-ocid="settings.current_password.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-username">New Username</Label>
                      <Input
                        id="new-username"
                        type="text"
                        value={settingsNewUsername}
                        onChange={(e) => setSettingsNewUsername(e.target.value)}
                        placeholder="Enter new username"
                        required
                        data-ocid="settings.new_username.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={settingsNewPassword}
                        onChange={(e) => setSettingsNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        data-ocid="settings.new_password.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={settingsConfirmPassword}
                        onChange={(e) =>
                          setSettingsConfirmPassword(e.target.value)
                        }
                        placeholder="Confirm new password"
                        required
                        data-ocid="settings.confirm_password.input"
                      />
                    </div>
                    {settingsNewPassword &&
                      settingsConfirmPassword &&
                      settingsNewPassword !== settingsConfirmPassword && (
                        <p
                          className="text-sm text-destructive"
                          data-ocid="settings.error_state"
                        >
                          Passwords do not match
                        </p>
                      )}
                    <Button
                      type="submit"
                      disabled={settingsLoading}
                      className="w-full"
                      data-ocid="settings.submit.button"
                    >
                      {settingsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {settingsLoading ? "Updating..." : "Update Credentials"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t py-3 text-center text-xs text-muted-foreground">
          {String.fromCharCode(169)} {new Date().getFullYear()}. Built with love
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </footer>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="payslip.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payslip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payslip for{" "}
              <strong>{deleteTarget?.employeeName}</strong> (
              {deleteTarget?.month} {String(deleteTarget?.year ?? "")}). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="payslip.cancel.button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="payslip.confirm.button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
