import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  type Employee = {
    username : Text;
    employeeName : Text;
    password : Text;
  };

  type OldPayslip = {
    id : Nat;
    employeeUsername : Text;
    month : Text;
    year : Nat;
    employeeName : Text;
    panNo : Text;
    employeeId : Text;
    aadharNumber : Text;
    designation : Text;
    location : Text;
    businessUnit : Text;
    dateOfBirth : Text;
    dateOfJoining : Text;
    daysPaid : Nat;
    basicSalary : Nat;
    mobileAllowance : Nat;
    incentive : Nat;
    insurance : Nat;
    professionTax : Nat;
    paymentMode : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    createdAt : Time.Time;
    payableBasicSalary : Int;
    payableMobileAllowance : Int;
    payableIncentive : Int;
  };

  type OldActor = {
    maxIdPayslips : Map.Map<Nat, OldPayslip>;
    lastPayslipId : Nat;
    employeesByUsername : Map.Map<Text, Employee>;
    employeesById : Map.Map<Text, Employee>;
    principalToUsername : Map.Map<Principal, Text>;
  };

  type NewActor = {
    maxIdPayslips : Map.Map<Nat, NewPayslip>;
    lastPayslipId : Nat;
    employeesByUsername : Map.Map<Text, Employee>;
    employeesById : Map.Map<Text, Employee>;
    principalToUsername : Map.Map<Principal, Text>;
  };

  type NewPayslip = {
    id : Nat;
    employeeUsername : Text;
    month : Text;
    year : Nat;
    employeeName : Text;
    panNo : Text;
    employeeId : Text;
    aadharNumber : Text;
    designation : Text;
    location : Text;
    businessUnit : Text;
    dateOfBirth : Text;
    dateOfJoining : Text;
    daysPaid : Nat;
    basicSalary : Nat;
    mobileAllowance : Nat;
    incentive : Nat;
    insurance : Nat;
    professionTax : Nat;
    paymentMode : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    createdAt : Time.Time;
    payableBasicSalary : Int;
    payableMobileAllowance : Int;
    payableIncentive : Int;
    remark : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newMaxIdPayslips = old.maxIdPayslips.map<Nat, OldPayslip, NewPayslip>(
      func(_id, oldPayslip) {
        { oldPayslip with remark = "" };
      }
    );
    { old with maxIdPayslips = newMaxIdPayslips };
  };
};
