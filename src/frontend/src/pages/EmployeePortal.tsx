import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, FileText, LogOut } from "lucide-react";
import { useState } from "react";
import type { Payslip } from "../backend";
import { PayslipView } from "../components/PayslipView";
import { useAuth } from "../context/AuthContext";
import { useEmployeePayslips } from "../hooks/useQueries";
import { formatCurrency } from "../utils/numberToWords";

export function EmployeePortal() {
  const { user, logout } = useAuth();
  const { data: payslips, isLoading } = useEmployeePayslips(
    user?.username ?? "",
  );
  const [selected, setSelected] = useState<Payslip | null>(null);

  const netPayable = (p: Payslip) => {
    const earnings =
      p.payableBasicSalary + p.payableMobileAllowance + p.payableIncentive;
    const deductions = p.insurance + p.professionTax;
    return earnings - deductions;
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="no-print flex items-center justify-between px-6 py-4 border-b bg-card shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-1.jpeg"
              alt="Logo"
              className="h-8 w-24 object-contain rounded bg-white p-0.5"
            />
            <span className="font-cabinet font-bold text-lg text-primary">
              INFINEXY FINANCE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2"
              data-ocid="nav.logout.button"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <PayslipView payslip={selected} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-1.jpeg"
            alt="Logo"
            className="h-8 w-24 object-contain rounded bg-white p-0.5"
          />
          <div>
            <div className="font-cabinet font-bold text-lg text-primary">
              INFINEXY FINANCE
            </div>
            <div className="text-xs text-muted-foreground">Employee Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{user?.displayName}</div>
            <div className="text-xs text-muted-foreground">
              @{user?.username}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
            data-ocid="nav.logout.button"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">My Pay Slips</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !payslips || payslips.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="payslips.empty_state"
          >
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No pay slips available yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Your salary slips will appear here once processed
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payslips.map((p, i) => (
              <Card
                key={String(p.id)}
                className="hover:shadow-card transition-shadow cursor-pointer"
                data-ocid={`payslips.item.${i + 1}`}
                onClick={() => setSelected(p)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {p.month} {String(p.year)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Net Payable: {formatCurrency(netPayable(p))}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-ocid={`payslip.view.button.${i + 1}`}
                  >
                    <Download className="h-4 w-4" /> View & Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
