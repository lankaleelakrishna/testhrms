// DEMO ONLY: in-memory seed data. Nothing here is real employee data.
// Dates are generated relative to "now" so charts always have recent data.

export const DEMO_PASSWORD = "Demo@123";

export const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@demo.com", empId: "EMP001", role: "Admin", description: "Admin dashboard" },
  { label: "CEO", email: "ceo@demo.com", empId: "EMP002", role: "Admin", description: "CEO dashboard" },
  { label: "HR", email: "hr@demo.com", empId: "EMP003", role: "HR", description: "HR dashboard" },
  { label: "Manager", email: "manager@demo.com", empId: "EMP004", role: "Manager", description: "Manager dashboard" },
  { label: "Employee", email: "employee@demo.com", empId: "EMP010", role: "Employee", description: "Employee dashboard" },
];

const DEPARTMENTS = ["Engineering", "Human Resources", "Sales & Marketing", "Finance & Admin"];

// The five demo accounts occupy fixed slots; the rest are generated below.
const FIXED_EMPLOYEES = [
  { emp_id: "EMP001", first_name: "Anjali", last_name: "Mehta", designation: "System Administrator", department: "Finance & Admin", user_role: "Admin", email: "admin@demo.com" },
  { emp_id: "EMP002", first_name: "Rajesh", last_name: "Kumar", designation: "Chief Executive Officer", department: "Finance & Admin", user_role: "Admin", email: "ceo@demo.com" },
  { emp_id: "EMP003", first_name: "Priya", last_name: "Sharma", designation: "HR Manager", department: "Human Resources", user_role: "HR", email: "hr@demo.com" },
  { emp_id: "EMP004", first_name: "Vikram", last_name: "Singh", designation: "Engineering Manager", department: "Engineering", user_role: "Manager", email: "manager@demo.com" },
  { emp_id: "EMP010", first_name: "Rahul", last_name: "Verma", designation: "Software Engineer", department: "Engineering", user_role: "Employee", email: "employee@demo.com" },
];

// Other managers and staff (fictional names, non-login, .test domain)
const GENERATED_PEOPLE = [
  ["Neha", "Gupta", "Sales Manager", "Sales & Marketing", "Manager"],
  ["Arjun", "Rao", "Finance Manager", "Finance & Admin", "Manager"],
  ["Kavya", "Nair", "Engineering Manager", "Engineering", "Manager"],
  ["Sanjay", "Patel", "Software Engineer", "Engineering", "Employee"],
  ["Meera", "Iyer", "Software Engineer", "Engineering", "Employee"],
  ["Aditya", "Joshi", "QA Engineer", "Engineering", "Employee"],
  ["Pooja", "Reddy", "DevOps Engineer", "Engineering", "Employee"],
  ["Karan", "Malhotra", "Frontend Developer", "Engineering", "Employee"],
  ["Divya", "Menon", "Backend Developer", "Engineering", "Employee"],
  ["Rohit", "Bansal", "Data Analyst", "Engineering", "Employee"],
  ["Ishita", "Kapoor", "HR Executive", "Human Resources", "Employee"],
  ["Manish", "Tiwari", "Recruiter", "Human Resources", "Employee"],
  ["Sneha", "Desai", "Payroll Executive", "Human Resources", "Employee"],
  ["Varun", "Chopra", "Sales Executive", "Sales & Marketing", "Employee"],
  ["Ananya", "Saxena", "Marketing Specialist", "Sales & Marketing", "Employee"],
  ["Rohan", "Agarwal", "Account Executive", "Sales & Marketing", "Employee"],
  ["Shreya", "Pillai", "Accountant", "Finance & Admin", "Employee"],
  ["Nikhil", "Chawla", "Finance Associate", "Finance & Admin", "Employee"],
  ["Tanvi", "Bhatt", "Office Administrator", "Finance & Admin", "Employee"],
  ["Gaurav", "Mishra", "Software Engineer", "Engineering", "Employee"],
  ["Riya", "Sen", "UI/UX Designer", "Engineering", "Employee"],
  ["Abhishek", "Kulkarni", "Support Engineer", "Engineering", "Employee"],
  ["Lakshmi", "Krishnan", "Business Analyst", "Sales & Marketing", "Employee"],
  ["Deepak", "Yadav", "Sales Executive", "Sales & Marketing", "Employee"],
  ["Megha", "Thakur", "HR Executive", "Human Resources", "Employee"],
];

// Simple seeded PRNG so the demo looks the same on every reload
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function buildDemoState(now = new Date()) {
  const rnd = mulberry32(20260101);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = fmtDate(today);
  const year = today.getFullYear();

  // ---- Employees (30) ----
  const employees = FIXED_EMPLOYEES.map((e, i) => ({
    ...e,
    phone: `+91 98${String(10000000 + i * 7919).slice(-8)}`,
    work_from: i % 3 === 0 ? "Office" : "Hybrid",
    employee_status: "active",
    date_of_joining: fmtDate(addDays(today, -(200 + i * 97))),
  }));
  // Free IDs: EMP005–EMP009 and EMP011–EMP030 (25 IDs, matching GENERATED_PEOPLE)
  const freeIds = [5, 6, 7, 8, 9, ...Array.from({ length: 20 }, (_, k) => 11 + k)];
  GENERATED_PEOPLE.forEach(([first, last, designation, department, role], i) => {
    employees.push({
      emp_id: `EMP${String(freeIds[i]).padStart(3, "0")}`,
      first_name: first,
      last_name: last,
      designation,
      department,
      user_role: role,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@cofomo-demo.test`,
      phone: `+91 97${String(20000000 + i * 104729).slice(-8)}`,
      work_from: i % 2 ? "Office" : "Hybrid",
      employee_status: "active",
      date_of_joining: fmtDate(addDays(today, -(120 + i * 61))),
    });
  });
  const employeeById = Object.fromEntries(employees.map((e) => [e.emp_id, e]));

  // ---- Projects (8) ----
  const projectNames = [
    "HRMS Portal Revamp",
    "Payroll Automation",
    "Mobile Attendance App",
    "Recruitment Tracker",
    "Client Onboarding Portal",
    "Data Warehouse Migration",
    "Internal Knowledge Wiki",
    "Leave Policy Engine",
  ];
  const projects = projectNames.map((name, i) => ({
    project_id: `PRJ-${String(i + 1).padStart(3, "0")}`,
    project_name: `[DEMO] ${name}`,
    start_date: fmtDate(addDays(today, -(60 + i * 20))),
    end_date: fmtDate(addDays(today, 90 + i * 15)),
    is_active: i !== 7, // one inactive project
    created_at: fmtDate(addDays(today, -(60 + i * 20))),
  }));

  // ---- Holidays (10, current year) ----
  const holidays = [
    ["01-26", "Republic Day"],
    ["03-04", "Holi"],
    ["04-03", "Good Friday"],
    ["05-01", "May Day"],
    ["08-15", "Independence Day"],
    ["09-14", "Ganesh Chaturthi"],
    ["10-02", "Gandhi Jayanti"],
    ["10-20", "Dussehra"],
    ["11-08", "Diwali"],
    ["12-25", "Christmas"],
  ].map(([md, name]) => ({ holiday_date: `${year}-${md}`, holiday_name: `${name} (DEMO)` }));

  // ---- Leave requests (15, mixed statuses) ----
  const leaveTypes = ["annual", "sick", "casual"];
  const leaveStatuses = [
    "Pending", "Pending", "Pending", "Pending", "Pending",
    "Approved", "Approved", "Approved", "Approved", "Approved", "Approved",
    "Rejected", "Rejected",
    "Withdrawn", "Withdrawn",
  ];
  const leaveRequests = leaveStatuses.map((status, i) => {
    const emp = employees[(i * 7 + 3) % employees.length];
    const offset = status === "Pending" ? 3 + i * 4 : -10 - i * 6;
    const start = addDays(today, offset);
    const days = 1 + Math.floor(rnd() * 3);
    return {
      id: i + 1,
      emp_id: emp.emp_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      leave_type: leaveTypes[i % leaveTypes.length],
      start_date: fmtDate(start),
      end_date: fmtDate(addDays(start, days - 1)),
      applied_date: fmtDate(addDays(start, -3)),
      reason: "[DEMO] Personal leave",
      document_type: null,
      used_leave_type: null,
      status,
    };
  });

  // ---- Attendance (30 days back) and today's punches ----
  const attendance = {}; // emp_id -> [{punch_date, total_daily_duration}]
  employees.forEach((emp) => {
    const rows = [];
    for (let back = 1; back <= 30; back++) {
      const d = addDays(today, -back);
      if (d.getDay() === 0) continue; // Sunday off
      if (rnd() < 0.08) continue; // occasional absence
      const minutes = 470 + Math.floor(rnd() * 110); // ~7.8h to ~9.6h
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const s = Math.floor(rnd() * 60);
      rows.push({
        punch_date: fmtDate(d),
        total_daily_duration: `${h}hrs ${m}min ${s}sec`,
      });
    }
    attendance[emp.emp_id] = rows;
  });

  const firstPunchToday = {};
  employees.forEach((emp) => {
    if (rnd() < 0.8) {
      const hour = 8 + Math.floor(rnd() * 3); // 08:00–10:59 IST
      const minute = Math.floor(rnd() * 60);
      firstPunchToday[emp.emp_id] = `${todayStr}T${pad(hour)}:${pad(minute)}:00+05:30`;
    }
  });
  firstPunchToday.EMP010 = firstPunchToday.EMP010 || `${todayStr}T09:05:00+05:30`;

  // Employees currently punched in (for the punch button state)
  const checkedIn = new Set(["EMP010"]);

  const workModes = {};
  employees.forEach((emp, i) => {
    workModes[emp.emp_id] = ["office", "home", "hybrid"][i % 3];
  });

  const leaveBalances = {};
  employees.forEach((emp) => {
    const annualTotal = 18;
    const sickTotal = 8;
    const casualTotal = 6;
    const annualUsed = Math.floor(rnd() * 8);
    const sickUsed = Math.floor(rnd() * 4);
    const casualUsed = Math.floor(rnd() * 3);
    leaveBalances[emp.emp_id] = {
      annual_leaves: [
        { leave_type: "annual", total: annualTotal, used: annualUsed, remaining: annualTotal - annualUsed },
      ],
      monthly_leaves: [
        { leave_type: "sick", total: sickTotal, used: sickUsed, remaining: sickTotal - sickUsed },
        { leave_type: "casual", total: casualTotal, used: casualUsed, remaining: casualTotal - casualUsed },
      ],
      loss_of_pay: 0,
    };
  });

  const wfhRequests = [
    {
      request_id: 1,
      employee_id: "EMP011",
      employee_name: `${employeeById.EMP011.first_name} ${employeeById.EMP011.last_name}`,
      start_date: fmtDate(addDays(today, 2)),
      end_date: fmtDate(addDays(today, 3)),
      reason: "[DEMO] Home internet maintenance",
      status: "Pending",
    },
    {
      request_id: 2,
      employee_id: "EMP016",
      employee_name: `${employeeById.EMP016.first_name} ${employeeById.EMP016.last_name}`,
      start_date: fmtDate(addDays(today, 5)),
      end_date: fmtDate(addDays(today, 5)),
      reason: "[DEMO] Client visit planning",
      status: "Pending",
    },
  ];

  return {
    todayStr,
    employees,
    employeeById,
    departments: DEPARTMENTS,
    projects,
    holidays,
    leaveRequests,
    attendance,
    firstPunchToday,
    checkedIn,
    workModes,
    leaveBalances,
    wfhRequests,
    birthdayNames: [`${employeeById.EMP011.first_name} ${employeeById.EMP011.last_name}`],
    anniversaryNames: [`${employeeById.EMP012.first_name} ${employeeById.EMP012.last_name}`],
  };
}
