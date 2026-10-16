// Where the list of assignments is saved: Firebase when configured, otherwise this browser.
// Both stores have the same three methods: load(), claim(name), reset().
import { MODE, FIREBASE_CONFIG } from "./config.js";
import { assign } from "./assign.js";

const FIREBASE_URL = "https://www.gstatic.com/firebasejs/10.12.2";
const STORE_KEY = MODE === "active" ? "live" : "test";

export const isShared = FIREBASE_CONFIG !== null;

// Firebase Realtime Database: the list is saved at /assignments/test or /assignments/live.
async function firebaseStore() {
  const { initializeApp } = await import(`${FIREBASE_URL}/firebase-app.js`);
  const rtdb = await import(`${FIREBASE_URL}/firebase-database.js`);
  const ref = rtdb.ref(rtdb.getDatabase(initializeApp(FIREBASE_CONFIG)), `assignments/${STORE_KEY}`);

  return {
    async load() {
      return (await rtdb.get(ref)).val() || [];
    },
    // A transaction, so two students tapping at the same moment never get the same table.
    // Firebase may run the update more than once; the entry from the last run is the one saved.
    async claim(name) {
      let entry = null;
      await rtdb.runTransaction(ref, (current) => {
        const result = assign(current || [], name);
        entry = result.entry;
        return result.list;
      });
      return entry;
    },
    async reset() {
      await rtdb.remove(ref);
    },
  };
}

function browserStore() {
  const key = `assignments-${STORE_KEY}`;
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  };

  return {
    async load() {
      return read();
    },
    async claim(name) {
      const { list, entry } = assign(read(), name);
      localStorage.setItem(key, JSON.stringify(list));
      return entry;
    },
    async reset() {
      localStorage.removeItem(key);
    },
  };
}

export const store = isShared ? await firebaseStore() : browserStore();
