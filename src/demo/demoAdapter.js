// DEMO ONLY: replaces axios's network adapter so every request is answered
// from in-memory data. No request ever leaves the browser in demo mode.
import { AxiosError } from "axios";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, buildDemoState } from "./demoData";

// Fresh state on every page load (in-memory only, so a reload resets demo data)
const state = buildDemoState();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const httpError = (status, message) => Object.assign(new Error(message), { status });

const base64UrlEncode = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const base64UrlDecode = (str) => {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
};

// Fake JWT (unsigned). The app only decodes it to read sub/role/exp.
const makeToken = (payload) => {
  const now = Math.floor(Date.now() / 1000);
  return `${base64UrlEncode({ alg: "HS256", typ: "JWT" })}.${base64UrlEncode({
    ...payload,
    iat: now,
    exp: now + 8 * 60 * 60,
  })}.demo-signature`;
};

const decodeCaller = (config) => {
  const raw = config.headers?.get?.("Authorization") ?? config.headers?.Authorization;
  if (!raw) return null;
  try {
    const payload = base64UrlDecode(String(raw).split(".")[1]);
    return payload && payload.sub ? payload : null;
  } catch (err) {
    return null;
  }
};

const parseBody = (data) => {
  if (data == null) return {};
  if (typeof data === "object") return data;
  try {
    return JSON.parse(data);
  } catch (err) {
    return Object.fromEntries(new URLSearchParams(data));
  }
};

const employeeOf = (caller) => {
  const emp = state.employeeById[caller.sub];
  if (!emp) throw httpError(404, "Employee not found (DEMO)");
  return emp;
};

const requireCaller = (caller) => {
  if (!caller) throw httpError(401, "Unauthorized (DEMO)");
  return caller;
};

const fullName = (emp) => `${emp.first_name} ${emp.last_name}`;

const activeEmployees = () => state.employees.filter((e) => e.employee_status === "active");

const ROUTES = [
  // ---- Auth ----
  {
    method: "POST",
    path: "/login",
    handler: ({ body }) => {
      const username = String(body.username || "").trim().toLowerCase();
      const account = DEMO_ACCOUNTS.find((a) => a.email === username);
      if (!account || body.password !== DEMO_PASSWORD) {
        throw httpError(401, "Invalid User Name or password");
      }
      return {
        status: "success",
        token: makeToken({ sub: account.empId, emp_id: account.empId, role: account.role }),
        role: account.role,
      };
    },
  },
  {
    method: "POST",
    path: "/verify_otp",
    handler: ({ caller, body }) => {
      requireCaller(caller);
      if (!/^\d{6}$/.test(String(body.otp || ""))) {
        throw httpError(400, "Enter any 6-digit code (DEMO)");
      }
      return { message: "OTP verified successfully", role: caller.role, require_password_reset: false };
    },
  },
  {
    method: "POST",
    path: "/login_resend_otp",
    handler: () => ({ message: "OTP resent (DEMO)" }),
  },

  // ---- Employee profile ----
  {
    method: "GET",
    path: "/self_employee_details",
    handler: ({ caller }) => {
      const e = employeeOf(requireCaller(caller));
      return {
        message: "Employee details retrieved successfully",
        employee: {
          emp_id: e.emp_id,
          first_name: e.first_name,
          last_name: e.last_name,
          designation: e.designation,
          department: e.department,
          email: e.email,
          date_of_joining: e.date_of_joining,
          employee_status: e.employee_status,
        },
      };
    },
  },
  {
    method: "GET",
    path: "/get_employee_photo/:id",
    handler: ({ params }) => {
      const e = state.employeeById[params.id];
      if (!e) throw httpError(404, "Employee not found (DEMO)");
      return { first_name: e.first_name, last_name: e.last_name, photo_base64: null };
    },
  },

  // ---- Organisation: employees and projects ----
  {
    method: "GET",
    path: "/active_employees_with_count",
    handler: () => {
      const list = activeEmployees();
      return {
        status: "success",
        active_employee_count: list.length,
        employees: list.map((e) => ({
          emp_id: e.emp_id,
          first_name: e.first_name,
          last_name: e.last_name,
          email: e.email,
          phone: e.phone,
          user_role: e.user_role,
          work_from: e.work_from,
        })),
      };
    },
  },
  {
    method: "GET",
    path: "/active_projects",
    handler: () => ({
      status: "success",
      active_project_count: state.projects.filter((p) => p.is_active).length,
    }),
  },
  {
    method: "GET",
    path: "/view_projects",
    handler: () => ({ status: "success", projects: state.projects }),
  },

  // ---- Leave ----
  {
    method: "GET",
    path: "/pending_leave_requests/:id",
    handler: () => {
      const year = new Date().getFullYear();
      const pending = state.leaveRequests.filter((r) => r.status === "Pending");
      return {
        message: "Pending leave requests retrieved successfully",
        current_year_requests: pending.filter((r) => r.start_date.startsWith(String(year))),
        future_year_requests: pending.filter((r) => !r.start_date.startsWith(String(year))),
      };
    },
  },
  {
    method: "PUT",
    path: "/update_leave_status/:id",
    handler: ({ params, body }) => {
      const leave = state.leaveRequests.find((r) => String(r.id) === params.id);
      if (!leave) throw httpError(404, "Leave request not found (DEMO)");
      leave.status = body.status === "Rejected" ? "Rejected" : "Approved";
      return { message: `Leave ${leave.status.toLowerCase()} successfully (DEMO)` };
    },
  },
  {
    method: "GET",
    path: "/leave_balance/:id",
    handler: ({ params }) => ({
      message: "Leave balances retrieved successfully",
      balances: state.leaveBalances[params.id] || { annual_leaves: [], monthly_leaves: [], loss_of_pay: 0 },
    }),
  },
  {
    method: "GET",
    path: "/loss_of_pay_count/:id",
    handler: () => ({ message: "Loss of pay count retrieved successfully", loss_of_pay_days: 0 }),
  },

  // ---- Holidays ----
  {
    method: "GET",
    path: "/get_holidays",
    handler: () => ({
      message: "Holidays retrieved successfully",
      holidays: [...state.holidays].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)),
    }),
  },
  {
    method: "POST",
    path: "/add_holiday",
    handler: ({ body }) => {
      if (!body.holiday_date || !body.holiday_name) throw httpError(400, "Date and name are required");
      state.holidays.push({ holiday_date: body.holiday_date, holiday_name: `${body.holiday_name} (DEMO)` });
      return { message: "Holiday added (DEMO)", holidays: state.holidays };
    },
  },

  // ---- Attendance and punches ----
  {
    method: "GET",
    path: "/employee_first_punchin",
    handler: () => ({
      message: "First punch-ins retrieved successfully",
      data: Object.entries(state.firstPunchToday).map(([id, ts]) => ({
        employee_id: id,
        employee_name: fullName(state.employeeById[id]),
        first_punchin: ts,
      })),
    }),
  },
  {
    method: "GET",
    path: "/employee-status/:date",
    handler: () =>
      // Array response: EmployeeCheckin expects a bare list of employees who have not punched in
      activeEmployees()
        .filter((e) => !state.firstPunchToday[e.emp_id])
        .map((e) => ({ emp_id: e.emp_id, name: fullName(e), status: "Not Punched In" })),
  },
  {
    method: "GET",
    path: "/punch-status",
    handler: ({ caller }) => {
      const id = requireCaller(caller).sub;
      const isIn = state.checkedIn.has(id);
      return {
        status: isIn ? "punched_in" : "punched_out",
        punch_in_time: state.firstPunchToday[id] || null,
        work_duration: "0hrs 0min",
      };
    },
  },
  {
    method: "POST",
    path: "/punch",
    handler: ({ caller, body }) => {
      const id = requireCaller(caller).sub;
      const action = String(body.action || "");
      if (action.includes("out")) {
        state.checkedIn.delete(id);
        return { message: "Punched out successfully (DEMO)" };
      }
      state.checkedIn.add(id);
      if (!state.firstPunchToday[id]) {
        const now = new Date();
        state.firstPunchToday[id] = now.toISOString();
      }
      return { message: "Punched in successfully (DEMO)" };
    },
  },
  {
    method: "GET",
    path: "/work_mode/:id",
    handler: ({ params }) => ({ work_mode: state.workModes[params.id] || "office" }),
  },
  {
    method: "GET",
    path: "/employee_total_duration",
    handler: ({ caller }) => ({
      message: "Employee total duration retrieved successfully",
      data: state.attendance[requireCaller(caller).sub] || [],
    }),
  },

  // ---- Events and misc ----
  {
    method: "GET",
    path: "/todays_birthdays",
    handler: () => ({ message: "Birthdays retrieved successfully", birthdays: state.birthdayNames }),
  },
  {
    method: "GET",
    path: "/todays_anniversaries",
    handler: () => ({ message: "Anniversaries retrieved successfully", anniversaries: state.anniversaryNames }),
  },
  {
    method: "GET",
    path: "/unread_counts",
    handler: () => ({ counts: {} }),
  },
  {
    method: "GET",
    path: "/wfh_requests",
    handler: () => state.wfhRequests,
  },
];

const compileRoute = (route) => {
  const names = [];
  const pattern = route.path.replace(/:([a-zA-Z_]+)/g, (_, name) => {
    names.push(name);
    return "([^/]+)";
  });
  return { ...route, regex: new RegExp(`^${pattern}$`), names };
};

const COMPILED = ROUTES.map(compileRoute);

const matchRoute = (method, path) => {
  for (const route of COMPILED) {
    if (route.method !== method) continue;
    const m = route.regex.exec(path);
    if (m) {
      const params = Object.fromEntries(route.names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
      return { route, params };
    }
  }
  return null;
};

export async function demoAdapter(config) {
  const method = (config.method || "get").toUpperCase();
  const rawUrl = config.url || "";
  const fullUrl = /^https?:\/\//.test(rawUrl)
    ? rawUrl
    : `${(config.baseURL || "").replace(/\/+$/, "")}/${rawUrl.replace(/^\/+/, "")}`;
  // Strip origin, query string and the optional /api prefix the backend uses
  const pathname = new URL(fullUrl, "http://demo.local").pathname
    .replace(/\/+$/, "")
    .replace(/^\/api(?=\/|$)/, "");

  const match = matchRoute(method, pathname);
  await delay(120);

  if (!match) {
    console.warn(`[DEMO] No mock for ${method} ${pathname}`);
    throw new AxiosError(
      `Not available in demo mode: ${method} ${pathname}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      { data: { message: "Not available in demo mode" }, status: 404, statusText: "Not Found", headers: {}, config }
    );
  }

  try {
    const data = match.route.handler({
      params: match.params,
      body: parseBody(config.data),
      caller: decodeCaller(config),
    });
    return { data, status: 200, statusText: "OK", headers: {}, config, request: {} };
  } catch (err) {
    const status = err.status || 500;
    throw new AxiosError(
      err.message,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      { data: { message: err.message }, status, statusText: "", headers: {}, config }
    );
  }
}
