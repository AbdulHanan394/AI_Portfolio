// lib/api.js
//
// Client-side data layer for the portfolio.
// Every call goes through the Next.js proxy:
// /api/backend/*
//
// Secrets stay server-side. The browser never sees BACKEND_API_KEY.

async function request(path, init = {}) {
  const res = await fetch(`/api/backend/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }

  return res.json();
}


export function getHealth() {
  return request("health");
}


export function listActivities(params) {
  const qs = new URLSearchParams();

  if (params?.source && params.source !== "all") {
    qs.set("source", params.source);
  }

  if (params?.limit) {
    qs.set("limit", String(params.limit));
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return request(`activities${suffix}`);
}


export function getActivity(activityId) {
  return request(`activities/${activityId}`);
}


export function listProjects() {
  return request("projects");
}


export function getProject(projectId) {
  return request(`projects/${projectId}`);
}


export function listSources() {
  return request("sources");
}


export function search(query) {
  const qs = new URLSearchParams({
    query,
  });

  return request(`search?${qs.toString()}`);
}


// =======================================================
// AI ASSISTANT
// =======================================================

export async function askAssistant(question, history = []) {
  const data = await request("assistant/query", {
    method: "POST",
    body: JSON.stringify({
      question,
      history,
    }),
  });


  console.log("========== ASSISTANT API RESPONSE ==========");
  console.log(data);


  let content = "";


  if (typeof data?.answer?.answer === "string") {
    content = data.answer.answer;
  }

  else if (typeof data?.answer === "string") {
    content = data.answer;
  }

  else if (typeof data?.content === "string") {
    content = data.content;
  }

  else if (typeof data?.response === "string") {
    content = data.response;
  }

  else {
    content = "Sorry, I couldn't generate a response.";
  }


  return {
    content,
    activities: data?.answer?.activities || [],
    raw: data,
  };
}


// =======================================================
// LIST NORMALIZER
// =======================================================

export function unwrapList(data) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}