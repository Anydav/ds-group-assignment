// Connects the page's buttons to the store and the views.
import { MODE, ADMIN_NAME, WAITLIST_CLOSES } from "./config.js";
import { cleanName, sameName, stillWaiting } from "./assign.js";
import { store, isShared } from "./storage.js";
import { resultHtml, waitlistResultHtml, groupsHtml, bannerText, groupById } from "./ui.js";

const isTest = MODE !== "active";
const el = {
  banner: document.getElementById("banner"),
  name: document.getElementById("name"),
  go: document.getElementById("go"),
  msg: document.getElementById("msg"),
  result: document.getElementById("result"),
  showAll: document.getElementById("showAll"),
  list: document.getElementById("list"),
};

function showBanner() {
  const text = bannerText({ isTest, isShared });
  el.banner.textContent = text;
  el.banner.hidden = !text;
}

async function showGroups(isAdmin) {
  const [list, waitlist] = await Promise.all([store.load(), isAdmin ? store.loadWaitlist() : []]);
  el.list.innerHTML = groupsHtml(list, { isAdmin, canReset: isAdmin && isTest, waitlist });
  document.getElementById("reset")?.addEventListener("click", resetTestData);
  const place = document.getElementById("placeWaitlist");
  if (place) onClick(place, () => placeWaitlisted(place.dataset.count));
}

async function placeWaitlisted(count) {
  if (!confirm(`Place ${count} waitlisted students into the open places, in waitlist order?`)) return;
  await store.placeWaitlist();
  await showGroups(true);
}

async function resetTestData() {
  if (!confirm("Delete all test entries and the test waitlist?")) return;
  await store.reset();
  await showGroups(true);
}

async function getMyGroup() {
  const name = el.name.value;
  el.msg.textContent = "";
  el.result.hidden = true;

  if (sameName(name, ADMIN_NAME)) return showGroups(true);
  if (cleanName(name).length < 3) {
    el.msg.textContent = "Please type your full name.";
    return;
  }

  const [list, waitlist] = await Promise.all([store.load(), store.loadWaitlist()]);
  const isAssigned = list.some((a) => sameName(a.name, name));
  const waitIndex = waitlist.findIndex((w) => sameName(w.name, name));
  const isClosed = Date.now() >= WAITLIST_CLOSES;
  const isNew = !isAssigned && waitIndex < 0;

  // After closing time, new places are kept for the students on the waitlist.
  if (isNew && isClosed) {
    el.msg.textContent = "The waitlist is closed. Please speak to your teacher.";
    return;
  }

  // While anyone is still waiting, open places go to them first and a new name joins the queue.
  const entry = isNew && stillWaiting(waitlist, list).length ? null : await store.claim(name);
  if (entry) {
    showResult(groupById(entry.group).color, resultHtml(entry));
  } else {
    if (!isClosed) await store.joinWaitlist(name);
    // The place counts only students still waiting, not those already given a group.
    const queue = stillWaiting(await store.loadWaitlist(), list);
    const position = queue.findIndex((w) => sameName(w.name, name)) + 1;
    showResult("var(--accent)", waitlistResultHtml(cleanName(name), position, { isClosed }));
  }
}

function showResult(color, html) {
  el.result.style.setProperty("--group-color", color);
  el.result.innerHTML = html;
  el.result.hidden = false;
  el.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Disables the button while it works and shows a friendly message on failure.
function onClick(button, action) {
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await action();
    } catch (err) {
      console.error(err);
      el.msg.textContent = "Something went wrong. Check your connection and try again.";
    } finally {
      button.disabled = false;
    }
  });
}

showBanner();
onClick(el.go, getMyGroup);
onClick(el.showAll, () => showGroups(false));
el.name.addEventListener("keydown", (e) => { if (e.key === "Enter") el.go.click(); });
