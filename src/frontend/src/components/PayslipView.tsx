import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { Payslip } from "../backend";
import { formatCurrency, numberToWords } from "../utils/numberToWords";

interface PayslipViewProps {
  payslip: Payslip;
  showActions?: boolean;
}

export function PayslipView({ payslip, showActions = true }: PayslipViewProps) {
  const totalActualEarnings =
    payslip.basicSalary + payslip.mobileAllowance + payslip.incentive;
  const totalPayableEarnings =
    payslip.payableBasicSalary +
    payslip.payableMobileAllowance +
    payslip.payableIncentive;
  const totalDeductions = payslip.insurance + payslip.professionTax;
  const netPayable = totalPayableEarnings - totalDeductions;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB");
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    const printContent = document.querySelector(
      ".payslip-print-area",
    ) as HTMLElement;
    if (!printContent) return;

    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      alert("Please allow popups for this site to print/download payslips.");
      return;
    }

    popup.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Payslip</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${printContent.innerHTML}
</body>
</html>`);
    popup.document.close();
    popup.focus();
    setTimeout(() => {
      popup.print();
    }, 300);
  };

  return (
    <div>
      {showActions && (
        <div className="flex gap-3 mb-4 no-print">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
            data-ocid="payslip.print.button"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
            data-ocid="payslip.download.button"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      )}

      <div
        className="payslip-print-area bg-white border border-gray-300 text-gray-900 text-sm"
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1a2744",
            color: "white",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-1.jpeg"
              alt="Infinexy Finance Logo"
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "4px",
                backgroundColor: "white",
                padding: "2px",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                INFINEXY FINANCE
              </div>
              <div
                style={{
                  fontSize: "10px",
                  opacity: 0.85,
                  marginTop: "2px",
                  maxWidth: "300px",
                  lineHeight: "1.4",
                }}
              >
                401,402 Galav Chamber Dairy Den Sayajigunj Vadodara
                Gujarat-390005
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              SALARY SLIP / PAY SLIP
            </div>
            <div style={{ fontSize: "11px", opacity: 0.85, marginTop: "4px" }}>
              FOR THE MONTH OF
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: "700", marginTop: "2px" }}
            >
              {payslip.month.toUpperCase()} &ndash; {String(payslip.year)}
            </div>
          </div>
        </div>

        {/* Employee Info Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <tbody>
            <InfoRow
              label="Employee Name"
              value={payslip.employeeName}
              label2="PAN No."
              value2={payslip.panNo}
            />
            <InfoRow
              label="Employee ID"
              value={payslip.employeeId}
              label2="Aadhar Number"
              value2={payslip.aadharNumber}
            />
            <InfoRow
              label="Designation"
              value={payslip.designation}
              label2="Location"
              value2={payslip.location}
            />
            <InfoRow
              label="Date of Birth"
              value={payslip.dateOfBirth}
              label2="Date of Joining"
              value2={payslip.dateOfJoining}
            />
            <InfoRow
              label="Days Paid"
              value={String(payslip.daysPaid)}
              label2="Payment Mode"
              value2={payslip.paymentMode}
            />
          </tbody>
        </table>

        {/* Earnings Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            marginTop: "0",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1a2744", color: "white" }}>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Particulars
              </th>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  fontWeight: "600",
                }}
              >
                Actual Amount
              </th>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  fontWeight: "600",
                }}
              >
                Payable Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <EarningRow
              label="Basic Salary"
              actual={payslip.basicSalary}
              payable={payslip.payableBasicSalary}
            />
            <EarningRow
              label="Mobile Allowance"
              actual={payslip.mobileAllowance}
              payable={payslip.payableMobileAllowance}
            />
            <EarningRow
              label="Incentive"
              actual={payslip.incentive}
              payable={payslip.payableIncentive}
            />
            <tr style={{ backgroundColor: "#e8ecf4", fontWeight: "700" }}>
              <td
                style={{ padding: "7px 10px", borderTop: "2px solid #1a2744" }}
              >
                Total Earnings
              </td>
              <td
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  borderTop: "2px solid #1a2744",
                }}
              >
                {formatCurrency(totalActualEarnings)}
              </td>
              <td
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  borderTop: "2px solid #1a2744",
                }}
              >
                {formatCurrency(totalPayableEarnings)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Net Payable */}
        <div
          style={{
            backgroundColor: "#1a2744",
            color: "white",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            <span style={{ fontWeight: "600", fontSize: "13px" }}>
              Net Payable:{" "}
            </span>
            <span style={{ fontSize: "15px", fontWeight: "700" }}>
              {formatCurrency(netPayable)}
            </span>
          </div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>
            <span style={{ fontWeight: "600" }}>Amount in Words: </span>
            INR {numberToWords(Number(netPayable))} Only
          </div>
        </div>

        {/* Deductions Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#c0392b", color: "white" }}>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Deductions - Particulars
              </th>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  fontWeight: "600",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <DeductionRow label="Insurance" amount={payslip.insurance} />
            <DeductionRow
              label="Profession Tax"
              amount={payslip.professionTax}
            />
            <tr style={{ backgroundColor: "#fce8e6", fontWeight: "700" }}>
              <td
                style={{ padding: "7px 10px", borderTop: "2px solid #c0392b" }}
              >
                Total Deductions
              </td>
              <td
                style={{
                  padding: "7px 10px",
                  textAlign: "right",
                  borderTop: "2px solid #c0392b",
                }}
              >
                {formatCurrency(totalDeductions)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Details */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            marginTop: "0",
          }}
        >
          <tbody>
            <InfoRow
              label="Bank Name"
              value={payslip.bankName}
              label2="Account Number"
              value2={payslip.accountNumber}
            />
            <InfoRow
              label="IFSC Code"
              value={payslip.ifscCode}
              label2=""
              value2=""
            />
          </tbody>
        </table>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f5f6fa",
            borderTop: "1px solid #dde0eb",
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#666",
          }}
        >
          <span>
            This is a computerised document and does not require a signature.
          </span>
          <span>
            Date: {dateStr} | Time: {timeStr}
          </span>
        </div>
      </div>

      {/* Remark section — screen only, never printed */}
      {payslip.remark && payslip.remark.trim() !== "" && (
        <div
          className="no-print"
          style={{
            maxWidth: "800px",
            margin: "16px auto 0",
          }}
        >
          <div
            style={{
              border: "1px solid #d0d4e0",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#fffbeb",
            }}
          >
            <div
              style={{
                backgroundColor: "#1a2744",
                color: "white",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              REMARK
            </div>
            <div
              style={{
                padding: "12px 14px",
                fontSize: "13px",
                color: "#333",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
              data-ocid="payslip.remark.panel"
            >
              {payslip.remark}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  label2,
  value2,
}: { label: string; value: string; label2: string; value2: string }) {
  return (
    <tr>
      <td
        style={{
          padding: "6px 10px",
          backgroundColor: "#e8ecf4",
          fontWeight: "600",
          width: "18%",
          borderBottom: "1px solid #d0d4e0",
          fontSize: "11px",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "6px 10px",
          backgroundColor: "#ffffff",
          width: "32%",
          borderBottom: "1px solid #d0d4e0",
          borderRight: "1px solid #d0d4e0",
        }}
      >
        {value || "-"}
      </td>
      <td
        style={{
          padding: "6px 10px",
          backgroundColor: "#e8ecf4",
          fontWeight: "600",
          width: "18%",
          borderBottom: "1px solid #d0d4e0",
          fontSize: "11px",
        }}
      >
        {label2}
      </td>
      <td
        style={{
          padding: "6px 10px",
          backgroundColor: "#ffffff",
          width: "32%",
          borderBottom: "1px solid #d0d4e0",
        }}
      >
        {value2 || "-"}
      </td>
    </tr>
  );
}

function EarningRow({
  label,
  actual,
  payable,
}: { label: string; actual: bigint; payable: bigint }) {
  return (
    <tr style={{ borderBottom: "1px solid #e8ecf4" }}>
      <td style={{ padding: "6px 10px" }}>{label}</td>
      <td style={{ padding: "6px 10px", textAlign: "right" }}>
        {formatCurrency(actual)}
      </td>
      <td style={{ padding: "6px 10px", textAlign: "right" }}>
        {formatCurrency(payable)}
      </td>
    </tr>
  );
}

function DeductionRow({ label, amount }: { label: string; amount: bigint }) {
  return (
    <tr style={{ borderBottom: "1px solid #fce8e6" }}>
      <td style={{ padding: "6px 10px" }}>{label}</td>
      <td style={{ padding: "6px 10px", textAlign: "right" }}>
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}
