import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  type Employee = {
    username : Text;
    employeeName : Text;
    password : Text;
  };

  module Employee {
    public func compare(employee1 : Employee, employee2 : Employee) : Order.Order {
      Text.compare(employee1.employeeName, employee2.employeeName);
    };
  };

  type Payslip = {
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
    remark : Text;
    payableBasicSalary : Int;
    payableMobileAllowance : Int;
    payableIncentive : Int;
  };

  public type UserProfile = {
    name : Text;
    username : Text;
  };

  let maxIdPayslips = Map.empty<Nat, Payslip>();
  var lastPayslipId = 0;

  let employeesByUsername = Map.empty<Text, Employee>();
  let employeesById = Map.empty<Text, Employee>();
  
  // Map Principal to employee username for authorization
  let principalToUsername = Map.empty<Principal, Text>();
  
  // Map Principal to user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Track admin sessions separately (bypasses AccessControl anonymous limitation)
  let adminSessions = Map.empty<Principal, Bool>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Internal helper: assign user role without admin check
  func grantUserRole(principal : Principal) {
    accessControlState.userRoles.add(principal, #user);
  };

  // Check if caller is an authenticated admin
  func isAdminCaller(caller : Principal) : Bool {
    adminSessions.get(caller) == ?true
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerEmployee(username : Text, employeeName : Text, password : Text) : async () {
    if (employeesByUsername.containsKey(username)) {
      Runtime.trap("Username already exists");
    };

    let newEmployee : Employee = {
      username;
      employeeName;
      password;
    };

    employeesByUsername.add(username, newEmployee);
    employeesById.add(username, newEmployee);
    
    principalToUsername.add(caller, username);
    grantUserRole(caller);
    
    let profile : UserProfile = {
      name = employeeName;
      username = username;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func loginEmployee(username : Text, password : Text) : async () {
    switch (employeesByUsername.get(username)) {
      case (?employee) {
        if (employee.password != password) {
          Runtime.trap("Invalid username or password");
        };
        principalToUsername.add(caller, username);
        grantUserRole(caller);
        
        let profile : UserProfile = {
          name = employee.employeeName;
          username = username;
        };
        userProfiles.add(caller, profile);
      };
      case (null) { Runtime.trap("Invalid username or password") };
    };
  };

  public shared ({ caller }) func loginAdmin(password : Text) : async () {
    if (password != "admin123") {
      Runtime.trap("Invalid admin credentials");
    };
    // Store admin session for this principal
    adminSessions.add(caller, true);
  };

  public query ({ caller }) func listAllEmployees() : async [Employee] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    employeesByUsername.values().toArray().sort();
  };

  public shared ({ caller }) func createPayslip(
    employeeUsername : Text,
    month : Text,
    year : Nat,
    employeeName : Text,
    panNo : Text,
    employeeId : Text,
    aadharNumber : Text,
    designation : Text,
    location : Text,
    businessUnit : Text,
    dateOfBirth : Text,
    dateOfJoining : Text,
    daysPaid : Nat,
    basicSalary : Nat,
    mobileAllowance : Nat,
    incentive : Nat,
    insurance : Nat,
    professionTax : Nat,
    paymentMode : Text,
    bankName : Text,
    accountNumber : Text,
    ifscCode : Text,
    remark: Text,
    payableBasicSalary : Int,
    payableMobileAllowance : Int,
    payableIncentive : Int,
  ) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let payslipId = lastPayslipId + 1;
    lastPayslipId := payslipId;

    let newPayslip : Payslip = {
      id = payslipId;
      employeeUsername;
      month;
      year;
      employeeName;
      panNo;
      employeeId;
      aadharNumber;
      designation;
      location;
      businessUnit;
      dateOfBirth;
      dateOfJoining;
      daysPaid;
      basicSalary;
      mobileAllowance;
      incentive;
      insurance;
      professionTax;
      paymentMode;
      bankName;
      accountNumber;
      ifscCode;
      createdAt = Time.now();
      remark;
      payableBasicSalary;
      payableMobileAllowance;
      payableIncentive;
    };

    maxIdPayslips.add(payslipId, newPayslip);
  };

  public shared ({ caller }) func updatePayslip(
    payslipId : Nat,
    employeeUsername : Text,
    month : Text,
    year : Nat,
    employeeName : Text,
    panNo : Text,
    employeeId : Text,
    aadharNumber : Text,
    designation : Text,
    location : Text,
    businessUnit : Text,
    dateOfBirth : Text,
    dateOfJoining : Text,
    daysPaid : Nat,
    basicSalary : Nat,
    mobileAllowance : Nat,
    incentive : Nat,
    insurance : Nat,
    professionTax : Nat,
    paymentMode : Text,
    bankName : Text,
    accountNumber : Text,
    ifscCode : Text,
    remark: Text,
    payableBasicSalary : Int,
    payableMobileAllowance : Int,
    payableIncentive : Int,
  ) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not maxIdPayslips.containsKey(payslipId)) {
      Runtime.trap("Payslip does not exist");
    };
    let updatedPayslip : Payslip = {
      id = payslipId;
      employeeUsername;
      month;
      year;
      employeeName;
      panNo;
      employeeId;
      aadharNumber;
      designation;
      location;
      businessUnit;
      dateOfBirth;
      dateOfJoining;
      daysPaid;
      basicSalary;
      mobileAllowance;
      incentive;
      insurance;
      professionTax;
      paymentMode;
      bankName;
      accountNumber;
      ifscCode;
      createdAt = Time.now();
      remark;
      payableBasicSalary;
      payableMobileAllowance;
      payableIncentive;
    };

    maxIdPayslips.add(payslipId, updatedPayslip);
  };

  public shared ({ caller }) func deletePayslip(payslipId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not maxIdPayslips.containsKey(payslipId)) {
      Runtime.trap("Payslip does not exist");
    };
    maxIdPayslips.remove(payslipId);
  };

  public query ({ caller }) func listAllPayslips() : async [Payslip] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    maxIdPayslips.values().toArray();
  };

  public query ({ caller }) func getPayslipsByEmployee(username : Text) : async [Payslip] {
    let isAdmin = isAdminCaller(caller);
    
    if (not isAdmin) {
      switch (principalToUsername.get(caller)) {
        case (?callerUsername) {
          if (callerUsername != username) {
            Runtime.trap("Unauthorized: Employees can only view their own payslips");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: User not authenticated");
        };
      };
    };
    
    let payslips = maxIdPayslips.values().toArray();
    if (payslips.isEmpty()) {
      return [];
    };

    let filteredPayslipsList = List.empty<Payslip>();
    payslips.forEach(
      func(payslip) {
        if (payslip.employeeUsername == username) {
          filteredPayslipsList.add(payslip);
        };
      }
    );

    let filteredPayslips = filteredPayslipsList.toArray();
    if (filteredPayslips.isEmpty()) {
      Runtime.trap("No payslips found for employee");
    };
    filteredPayslips;
  };

  public query ({ caller }) func getPayslip(payslipId : Nat) : async Payslip {
    switch (maxIdPayslips.get(payslipId)) {
      case (?payslip) {
        let isAdmin = isAdminCaller(caller);
        
        if (not isAdmin) {
          switch (principalToUsername.get(caller)) {
            case (?callerUsername) {
              if (callerUsername != payslip.employeeUsername) {
                Runtime.trap("Unauthorized: Employees can only view their own payslips");
              };
            };
            case (null) {
              Runtime.trap("Unauthorized: User not authenticated");
            };
          };
        };
        
        payslip;
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };
};
