// Connects the page's buttons to the store and the views.
import { MODE, ADMIN_NAME } from "./config.js";
import { cleanName, sameName } from "./assign.js";
import { store, isShared } from "./storage.js";
import { resultHtml, groupsHtml, bannerText, groupById } from "./ui.js";

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
  const list = await store.load();
  el.list.innerHTML = groupsHtml(list, { isAdmin, canReset: isAdmin && isTest });
  document.getElementById("reset")?.addEventListener("click", resetTestData);
}

async function resetTestData() {
  if (!confirm("Delete all test entries?")) return;
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

  const entry = await store.claim(name);
  if (!entry) {
    el.msg.textContent = "All places are taken. Please speak to your teacher.";
    return;
  }
  el.result.style.setProperty("--group-color", groupById(entry.group).color);
  el.result.innerHTML = resultHtml(entry);
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
