// DEMO ONLY: imported first in index.js so the mock adapter is in place before
// any module creates an axios instance. Inactive unless REACT_APP_DEMO_MODE=true.
import axios from "axios";
import { demoAdapter } from "./demoAdapter";

export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === "true";

if (DEMO_MODE) {
  axios.defaults.adapter = demoAdapter;
}
