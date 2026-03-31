import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Payslip } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAllEmployees } from "../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const LOCATIONS = ["Vadodara", "Delhi", "Ahmedabad", "Mumbai", "Surat"];

const DESIGNATIONS = [
  "Chartered Accountant",
  "Telecaller",
  "IT Developer",
  "Managing Director",
  "Branch Manager",
  "Human Resources (HR)",
  "Back Office",
];

export type PayslipFormData = {
  employeeUsername: string;
  month: string;
  year: string;
  employeeName: string;
  panNo: string;
  employeeId: string;
  aadharNumber: string;
  designation: string;
  location: string;
  businessUnit: string;
  dateOfBirth: string;
  dateOfJoining: string;
  daysPaid: string;
  basicSalary: string;
  mobileAllowance: string;
  incentive: string;
  insurance: string;
  professionTax: string;
  paymentMode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  payableBasicSalary: string;
  payableMobileAllowance: string;
  payableIncentive: string;
  remark: string;
};

const DEFAULT_FORM: PayslipFormData = {
  employeeUsername: "",
  month: "",
  year: new Date().getFullYear().toString(),
  employeeName: "",
  panNo: "",
  employeeId: "",
  aadharNumber: "",
  designation: "",
  location: "",
  businessUnit: "",
  dateOfBirth: "",
  dateOfJoining: "",
  daysPaid: "",
  basicSalary: "7500",
  mobileAllowance: "",
  incentive: "",
  insurance: "",
  professionTax: "",
  paymentMode: "Bank Transfer",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  payableBasicSalary: "7500",
  payableMobileAllowance: "",
  payableIncentive: "",
  remark: "",
};

function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDDMMYYYY(str: string): Date | undefined {
  if (!str) return undefined;
  const parts = str.split("/");
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function payslipToForm(p: Payslip): PayslipFormData {
  return {
    employeeUsername: p.employeeUsername,
    month: p.month,
    year: String(p.year),
    employeeName: p.employeeName,
    panNo: p.panNo,
    employeeId: p.employeeId,
    aadharNumber: p.aadharNumber,
    designation: p.designation,
    location: p.location,
    businessUnit: p.businessUnit,
    dateOfBirth: p.dateOfBirth,
    dateOfJoining: p.dateOfJoining,
    daysPaid: String(p.daysPaid),
    basicSalary: "7500",
    mobileAllowance: String(p.mobileAllowance),
    incentive: String(p.incentive),
    insurance: String(p.insurance),
    professionTax: String(p.professionTax),
    paymentMode: p.paymentMode,
    bankName: p.bankName,
    accountNumber: p.accountNumber,
    ifscCode: p.ifscCode,
    payableBasicSalary: "7500",
    payableMobileAllowance: String(p.payableMobileAllowance),
    payableIncentive: String(p.payableIncentive),
    remark: p.remark ?? "",
  };
}

interface PayslipFormProps {
  initial?: Payslip;
  onSubmit: (data: PayslipFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PayslipForm({
  initial,
  onSubmit,
  isLoading,
  submitLabel = "Create Payslip",
}: PayslipFormProps) {
  const { actor } = useActor();
  const { data: employees, isFetching: employeesFetching } = useAllEmployees();
  const [form, setForm] = useState<PayslipFormData>(
    initial ? payslipToForm(initial) : DEFAULT_FORM,
  );
  const [dobOpen, setDobOpen] = useState(false);
  const [dojOpen, setDojOpen] = useState(false);
  const [idLoading, setIdLoading] = useState(false);

  const isEditing = !!initial;

  const set =
    (key: keyof PayslipFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleEmployeeSelect = (username: string) => {
    const emp = employees?.find((e) => e.username === username);
    setForm((prev) => ({
      ...prev,
      employeeUsername: username,
      employeeName: emp ? emp.employeeName : prev.employeeName,
    }));
  };

  const generateEmployeeId = async (month: string, year: string) => {
    if (!actor || !month || !year || isEditing) return;
    setIdLoading(true);
    try {
      const id = await (actor as any).getNextEmployeeId(month, BigInt(year));
      setForm((prev) => ({ ...prev, employeeId: id }));
    } catch {
      // ignore silently
    } finally {
      setIdLoading(false);
    }
  };

  // Auto-generate employee ID when month or year changes (new payslip only)
  useEffect(() => {
    if (isEditing || !form.month || !form.year || !actor) return;
    let cancelled = false;
    setIdLoading(true);
    (actor as any)
      .getNextEmployeeId(form.month, BigInt(form.year))
      .then((id: string) => {
        if (!cancelled) setForm((prev) => ({ ...prev, employeeId: id }));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIdLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.month, form.year, actor, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      basicSalary: "7500",
      payableBasicSalary: "7500",
    });
  };

  const dobDate = parseDDMMYYYY(form.dateOfBirth);
  const dojDate = parseDDMMYYYY(form.dateOfJoining);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Employee Username" required>
            <Select
              value={form.employeeUsername}
              onValueChange={handleEmployeeSelect}
              disabled={employeesFetching}
            >
              <SelectTrigger data-ocid="create_payslip.employee_username.select">
                <SelectValue
                  placeholder={
                    employeesFetching
                      ? "Loading employees..."
                      : "Select employee"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {employees && employees.length > 0 ? (
                  employees.map((emp) => (
                    <SelectItem key={emp.username} value={emp.username}>
                      @{emp.username} – {emp.employeeName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>
                    {employeesFetching
                      ? "Loading..."
                      : "No employees registered"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employee Name" required>
            <Input
              value={form.employeeName}
              onChange={set("employeeName")}
              placeholder="Full Name"
              required
            />
          </Field>
          <Field label="Employee ID" required>
            <div className="flex gap-2">
              <Input
                value={form.employeeId}
                readOnly
                placeholder={idLoading ? "Generating..." : "INF001"}
                required
                className="bg-muted/50 flex-1"
                data-ocid="create_payslip.employee_id.input"
              />
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => generateEmployeeId(form.month, form.year)}
                  disabled={idLoading || !form.month || !form.year}
                  title="Generate Employee ID"
                  data-ocid="create_payslip.generate_id.button"
                >
                  {idLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </Field>
          <Field label="PAN No.">
            <Input
              value={form.panNo}
              onChange={set("panNo")}
              placeholder="ABCDE1234F"
            />
          </Field>
          <Field label="Aadhar Number">
            <Input
              value={form.aadharNumber}
              onChange={set("aadharNumber")}
              placeholder="1234 5678 9012"
            />
          </Field>
          <Field label="Designation" required>
            <Select
              value={form.designation}
              onValueChange={(v) => setForm((p) => ({ ...p, designation: v }))}
            >
              <SelectTrigger data-ocid="create_payslip.designation.select">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location">
            <Select
              value={form.location}
              onValueChange={(v) => setForm((p) => ({ ...p, location: v }))}
            >
              <SelectTrigger data-ocid="create_payslip.location.select">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Date of Birth - Calendar Picker */}
          <Field label="Date of Birth">
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-start text-left font-normal"
                  data-ocid="create_payslip.dob.button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                  {form.dateOfBirth ? (
                    form.dateOfBirth
                  ) : (
                    <span className="text-muted-foreground">DD/MM/YYYY</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  onSelect={(date) => {
                    if (date) {
                      setForm((prev) => ({
                        ...prev,
                        dateOfBirth: formatDateDDMMYYYY(date),
                      }));
                    }
                    setDobOpen(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Field>

          {/* Date of Joining - Calendar Picker */}
          <Field label="Date of Joining">
            <Popover open={dojOpen} onOpenChange={setDojOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-start text-left font-normal"
                  data-ocid="create_payslip.doj.button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                  {form.dateOfJoining ? (
                    form.dateOfJoining
                  ) : (
                    <span className="text-muted-foreground">DD/MM/YYYY</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dojDate}
                  onSelect={(date) => {
                    if (date) {
                      setForm((prev) => ({
                        ...prev,
                        dateOfJoining: formatDateDDMMYYYY(date),
                      }));
                    }
                    setDojOpen(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={1990}
                  toYear={new Date().getFullYear() + 1}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Field>
        </CardContent>
      </Card>

      {/* Pay Period */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pay Period
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Month" required>
            <Select
              value={form.month}
              onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Year" required>
            <Input
              value={form.year}
              onChange={set("year")}
              placeholder="2026"
              required
            />
          </Field>
          <Field label="Days Paid" required>
            <Input
              value={form.daysPaid}
              onChange={set("daysPaid")}
              placeholder="30"
              required
              type="number"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Earnings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Earnings (₹)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Basic Salary (Actual)" required>
            <Input
              value="7500"
              readOnly
              className="bg-muted/50"
              type="number"
              data-ocid="create_payslip.basic_salary_actual.input"
            />
          </Field>
          <Field label="Basic Salary (Payable)" required>
            <Input
              value="7500"
              readOnly
              className="bg-muted/50"
              type="number"
              data-ocid="create_payslip.basic_salary_payable.input"
            />
          </Field>
          <Field label="Mobile Allowance (Actual)">
            <Input
              value={form.mobileAllowance}
              onChange={set("mobileAllowance")}
              placeholder="500"
              type="number"
            />
          </Field>
          <Field label="Mobile Allowance (Payable)">
            <Input
              value={form.payableMobileAllowance}
              onChange={set("payableMobileAllowance")}
              placeholder="500"
              type="number"
            />
          </Field>
          <Field label="Incentive (Actual)">
            <Input
              value={form.incentive}
              onChange={set("incentive")}
              placeholder="0"
              type="number"
            />
          </Field>
          <Field label="Incentive (Payable)">
            <Input
              value={form.payableIncentive}
              onChange={set("payableIncentive")}
              placeholder="0"
              type="number"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Deductions (₹)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Insurance">
            <Input
              value={form.insurance}
              onChange={set("insurance")}
              placeholder="500"
              type="number"
            />
          </Field>
          <Field label="Profession Tax">
            <Input
              value={form.professionTax}
              onChange={set("professionTax")}
              placeholder="200"
              type="number"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Payment Mode">
            <Select
              value={form.paymentMode}
              onValueChange={(v) => setForm((p) => ({ ...p, paymentMode: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Bank Name">
            <Input
              value={form.bankName}
              onChange={set("bankName")}
              placeholder="SBI"
            />
          </Field>
          <Field label="Account Number">
            <Input
              value={form.accountNumber}
              onChange={set("accountNumber")}
              placeholder="1234567890"
            />
          </Field>
          <Field label="IFSC Code">
            <Input
              value={form.ifscCode}
              onChange={set("ifscCode")}
              placeholder="SBIN0001234"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
            Remarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Remark / Note for Employee">
            <Textarea
              value={form.remark}
              onChange={set("remark")}
              placeholder="Add any note or remark for this employee (visible to employee on screen only, not printed)"
              rows={3}
              data-ocid="create_payslip.remark.textarea"
            />
          </Field>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground font-semibold py-3"
        data-ocid="create_payslip.submit.button"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}
