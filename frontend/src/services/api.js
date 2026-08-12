import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function normalizeError(error) {
  if (error?.code === "ECONNABORTED") {
    return { message: "Request timed out. Please try again.", status: 408 };
  }

  if (!error?.response) {
    return {
      message: "Network error. Check that the backend is running.",
      status: 0,
    };
  }

  const detail = error.response.data?.detail;
  const message =
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
        : error.response.data?.message || "Something went wrong.";

  return { message, status: error.response.status };
}

export async function uploadRtl(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await client.post("/upload", formData);
  return response.data;
}

export async function fetchAnalysis(rtl) {
  const { data } = await client.post("/analysis", { rtl });
  return data;
}

export async function fetchMetrics(rtl) {
  const { data } = await client.post("/metrics", { rtl });
  return data;
}

export async function fetchBugs(rtl) {
  const { data } = await client.post("/bugs", { rtl });
  return data;
}

export async function fetchDiagram(rtl) {
  const { data } = await client.post("/diagram", { rtl });
  return data;
}

export async function fetchTestbench(rtl) {
  const { data } = await client.post("/testbench", { rtl });
  return data;
}

export async function optimizeRtl(rtl) {
  const { data } = await client.post("/optimize", { rtl });
  return data;
}

export async function fetchSchematic(rtl) {
  const { data } = await client.post("/schematic", { rtl });
  return data;
}

export async function chatRtl(rtl, question, history = []) {
  const { data } = await client.post("/chat", { rtl, question, history });
  return data;
}

export async function createReport(rtl) {
  const { data } = await client.post("/report", { rtl });
  return data;
}

export function downloadReportUrl(reportId) {
  return `${API_BASE}/download-report/${reportId}`;
}

export default client;
