import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Employee {
    employeeName: string;
    username: string;
    password: string;
}
export type Time = bigint;
export interface UserProfile {
    username: string;
    name: string;
}
export interface Payslip {
    id: bigint;
    month: string;
    professionTax: bigint;
    employeeUsername: string;
    employeeName: string;
    mobileAllowance: bigint;
    ifscCode: string;
    incentive: bigint;
    dateOfBirth: string;
    payableIncentive: bigint;
    designation: string;
    createdAt: Time;
    year: bigint;
    businessUnit: string;
    payableMobileAllowance: bigint;
    bankName: string;
    dateOfJoining: string;
    insurance: bigint;
    employeeId: string;
    aadharNumber: string;
    paymentMode: string;
    accountNumber: string;
    panNo: string;
    basicSalary: bigint;
    payableBasicSalary: bigint;
    location: string;
    daysPaid: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPayslip(employeeUsername: string, month: string, year: bigint, employeeName: string, panNo: string, employeeId: string, aadharNumber: string, designation: string, location: string, businessUnit: string, dateOfBirth: string, dateOfJoining: string, daysPaid: bigint, basicSalary: bigint, mobileAllowance: bigint, incentive: bigint, insurance: bigint, professionTax: bigint, paymentMode: string, bankName: string, accountNumber: string, ifscCode: string, payableBasicSalary: bigint, payableMobileAllowance: bigint, payableIncentive: bigint): Promise<void>;
    deletePayslip(payslipId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPayslip(payslipId: bigint): Promise<Payslip>;
    getPayslipsByEmployee(username: string): Promise<Array<Payslip>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllEmployees(): Promise<Array<Employee>>;
    listAllPayslips(): Promise<Array<Payslip>>;
    loginAdmin(password: string): Promise<void>;
    loginEmployee(username: string, password: string): Promise<void>;
    registerEmployee(username: string, employeeName: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePayslip(payslipId: bigint, employeeUsername: string, month: string, year: bigint, employeeName: string, panNo: string, employeeId: string, aadharNumber: string, designation: string, location: string, businessUnit: string, dateOfBirth: string, dateOfJoining: string, daysPaid: bigint, basicSalary: bigint, mobileAllowance: bigint, incentive: bigint, insurance: bigint, professionTax: bigint, paymentMode: string, bankName: string, accountNumber: string, ifscCode: string, payableBasicSalary: bigint, payableMobileAllowance: bigint, payableIncentive: bigint): Promise<void>;
}
