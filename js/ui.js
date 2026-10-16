// Builds the HTML for each part of the page. No storage calls here.
import { GROUPS, LEAD_MEMBER } from "./config.js";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const groupById = (id) => GROUPS.find((g) => g.id === id);
const roleLabel = (member) => `Member ${member}${member === LEAD_MEMBER ? " (lead)" : ""}`;

export function resultHtml(entry) {
  const g = groupById(entry.group);
  return `
    <p>Hi <b>${escapeHtml(entry.name)}</b>, you are in</p>
    <p class="result-group" style="color:${g.color}">Group ${g.id}: ${g.name}</p>
    <p>${roleLabel(entry.member)} · your table: <b>${g.tables[entry.member - 1]}</b></p>`;
}

// Students see only filled slots; the admin also sees open ones.
function groupCardHtml(group, list, isAdmin) {
  const rows = group.tables.map((table, i) => {
    const member = i + 1;
    const entry = list.find((a) => a.group === group.id && a.member === member);
    if (!entry && !isAdmin) return "";
    const who = entry ? escapeHtml(entry.name) : `<span class="muted">open</span>`;
    return `<div class="row"><span>${roleLabel(member)} · ${who}</span><span class="muted">${table}</span></div>`;
  }).join("");

  const count = list.filter((a) => a.group === group.id).length;
  return `
    <section class="card group" style="--group-color:${group.color}">
      <h3>Group ${group.id} · ${group.name} <span class="muted">(${count}/${group.tables.length})</span></h3>
      ${rows || `<p class="muted">No students yet</p>`}
    </section>`;
}

export function groupsHtml(list, { isAdmin, canReset }) {
  const total = GROUPS.reduce((n, g) => n + g.tables.length, 0);
  const header = isAdmin ? `<div class="card"><b>Admin view</b> · ${list.length}/${total} assigned</div>` : "";
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
