// Builds the HTML for each part of the page. No storage calls here.
import { GROUPS, LEAD_MEMBER, WAITLIST_CLOSES } from "./config.js";
import { sameName, stillWaiting } from "./assign.js";

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

// e.g. "Sun 2:00 PM", so it is clear when the closing time is on another day.
const closingTime = () =>
  WAITLIST_CLOSES.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });

export function waitlistResultHtml(name, position, { isClosed }) {
  const next = isClosed
    ? "The waitlist is closed. Your group is being set up. Type your name here again later to see it."
    : `${WAITLIST_CLOSES ? `The waitlist closes at ${closingTime()}. ` : ""}Once your group is set up, type your name here again to see it.`;
  return `
    <p class="result-hi">Hi ${escapeHtml(name)}, all groups are full right now</p>
    <p class="result-group">You are on the waitlist</p>
    <div class="result-details">
      <div class="detail"><span>Your place</span><b>#${position}</b></div>
      <div class="detail"><span>Status</span><b>${isClosed ? "Closed" : "Open"}</b></div>
    </div>
    <p class="result-note">${next}</p>`;
}

// Admin only: everyone on the waitlist, and the group each one ended up in, if any.
// The place button shows while someone is waiting and there are open places.
function waitlistCardHtml(waitlist, list, openPlaces) {
  const rows = waitlist.map((w, i) => {
    const entry = list.find((a) => sameName(a.name, w.name));
    const where = entry ? `Group ${entry.group} · Member ${entry.member}` : "Waiting";
    return `
      <div class="row${entry ? "" : " open"}">
        <span class="num">${i + 1}</span>
        <span class="who">${escapeHtml(w.name)}</span>
        <span class="table">${where}</span>
      </div>`;
  }).join("");

  const waiting = stillWaiting(waitlist, list).length;
  const status = !WAITLIST_CLOSES ? "open"
    : Date.now() >= WAITLIST_CLOSES ? "closed" : `closes ${closingTime()}`;
  const toPlace = Math.min(waiting, openPlaces);
  const place = toPlace
    ? `<button id="placeWaitlist" data-count="${toPlace}">Place ${toPlace} waitlisted student${toPlace === 1 ? "" : "s"}</button>`
    : "";
  return `
    <section class="card group" style="--group-color:var(--accent)">
      <h3>Waitlist · ${status} <span class="count">${waiting} waiting</span></h3>
      ${rows || `<p class="muted">Nobody yet</p>`}
      ${place}
    </section>`;
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

export function groupsHtml(list, { isAdmin, canReset, waitlist = [] }) {
  const total = GROUPS.reduce((n, g) => n + g.tables.length, 0);
  const title = isAdmin ? "Admin view" : "All groups";
  const header = `<div class="card summary">${title} · ${list.length}/${total} students assigned</div>`;
  const wait = isAdmin ? waitlistCardHtml(waitlist, list, total - list.length) : "";
  const cards = GROUPS.map((g) => groupCardHtml(g, list, isAdmin)).join("");
  const reset = canReset ? `<button id="reset" class="danger">Clear all test entries</button>` : "";
  return header + wait + cards + reset;
}

export function bannerText({ isTest, isShared }) {
  return [
    isTest && "TEST MODE: entries here are test data only.",
    !isShared && "Firebase is not set up yet: data is saved on this device only.",
  ].filter(Boolean).join(" ");
}
