# Infinexy Finance Payslip Portal

## Current State
- PayslipForm uses plain text Input for Date of Birth and Date of Joining fields.
- No remark field exists on payslips.
- PayslipView renders print/download via window.print().

## Requested Changes (Diff)

### Add
- Calendar date picker for Date of Birth and Date of Joining in PayslipForm.
- remark string field on Payslip backend model.
- Remark textarea in PayslipForm for admin.
- Remark section in PayslipView visible on screen but hidden on print.

### Modify
- Backend Payslip type: add remark field.
- createPayslip and updatePayslip: accept remark parameter.
- PayslipForm: date pickers for DOB/DOJ, remark textarea.
- AdminPortal: pass remark in create/update calls.

### Remove
- Nothing.

## Implementation Plan
1. Regenerate Motoko backend with remark field.
2. Update PayslipForm with date pickers and remark field.
3. Update AdminPortal to pass remark.
4. Update PayslipView with no-print remark section.
