// Builds the HTML for each part of the page. No storage calls here.
import { GROUPS, LEAD_MEMBER } from "./config.js";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const groupById = (id) => GROUPS.find((g) => g.id === id);
const leadBadge = (member) => (member === LEAD_MEMBER ? `<span class="lead">LEAD</span>` : "");

export function resultHtml(entry) {
  const g = groupById(entry.group);
  const role = `Member ${entry.member}${entry.member === LEAD_MEMBER ? " · Lead" : ""}`;
  return `
    <p class="result-hi">Hi ${escapeHtml(entry.name)}, you are in</p>
    <p class="result-group">Group ${g.id} · ${g.name}</p>
    <div class="result-details">
      <div class="detail"><span>Your role</span><b>${role}</b></div>
      <div class="detail"><span>Your table</span><b>${g.tables[entry.member - 1]}</b></div>
    </div>`;
}

// Students see only filled slots; the admin also sees open ones.
function groupCardHtml(group, list, isAdmin) {
  const rows = group.tables.map((table, i) => {
    const member = i + 1;
    const entry = list.find((a) => a.group === group.id && a.member === member);
    if (!entry && !isAdmin) return "";
    const who = entry ? escapeHtml(entry.name) : `<span class="muted">Open</span>`;
    return `
      <div class="row${entry ? "" : " open"}">
        <span class="num">${member}</span>
        <span class="who">${who}${leadBadge(member)}</span>
        <span class="table">${table}</span>
      </div>`;
  }).join("");

  const count = list.filter((a) => a.group === group.id).length;
  return `
    <section class="card group" style="--group-color:${group.color}">
      <h3>Group ${group.id} · ${group.name} <span class="count">${count}/${group.tables.length}</span></h3>
      ${rows || `<p class="muted">No students yet</p>`}
    </section>`;
}

export function groupsHtml(list, { isAdmin, canReset }) {
  const total = GROUPS.reduce((n, g) => n + g.tables.length, 0);
  const title = isAdmin ? "Admin view" : "All groups";
  const header = `<div class="card summary">${title} · ${list.length}/${total} students assigned</div>`;
  const cards = GROUPS.map((g) => groupCardHtml(g, list, isAdmin)).join("");
  const reset = canReset ? `<button id="reset" class="danger">Clear all test entries</button>` : "";
  return header + cards + reset;
}

export function bannerText({ isTest, isShared }) {
  return [
    isTest && "TEST MODE: entries here are test data only.",
    !isShared && "Firebase is not set up yet: data is saved on this device only.",
  ].filter(Boolean).join(" ");
}
