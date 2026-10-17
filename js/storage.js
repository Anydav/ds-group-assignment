// Where the list of assignments and the waitlist are saved: Firebase when configured, otherwise this browser.
// Both stores have the same methods: load(), claim(name), loadWaitlist(), joinWaitlist(name), reset().
import { MODE, FIREBASE_CONFIG } from "./config.js";
import { assign, joinWaitlist } from "./assign.js";

const FIREBASE_URL = "https://www.gstatic.com/firebasejs/10.12.2";
const STORE_KEY = MODE === "active" ? "live" : "test";

export const isShared = FIREBASE_CONFIG !== null;

// Firebase Realtime Database: the lists are saved at /assignments/<key> and /waitlist/<key>,
// where <key> is test or live.
async function firebaseStore() {
  const { initializeApp } = await import(`${FIREBASE_URL}/firebase-app.js`);
  const rtdb = await import(`${FIREBASE_URL}/firebase-database.js`);
  const db = rtdb.getDatabase(initializeApp(FIREBASE_CONFIG));
  const ref = rtdb.ref(db, `assignments/${STORE_KEY}`);
  const waitRef = rtdb.ref(db, `waitlist/${STORE_KEY}`);

  // A transaction, so two students tapping at the same moment never get the same place.
  // Firebase may run the update more than once; the result from the last run is the one returned.
  async function update(target, change) {
    let result = null;
    await rtdb.runTransaction(target, (current) => {
      result = change(current || []);
      return result.list;
    });
    return result;
  }

  return {
    async load() {
      return (await rtdb.get(ref)).val() || [];
    },
    async claim(name) {
      return (await update(ref, (list) => assign(list, name))).entry;
    },
    async loadWaitlist() {
      return (await rtdb.get(waitRef)).val() || [];
    },
    async joinWaitlist(name) {
      return (await update(waitRef, (list) => joinWaitlist(list, name))).position;
    },
    async reset() {
      await Promise.all([rtdb.remove(ref), rtdb.remove(waitRef)]);
    },
  };
}

function browserStore() {
  const key = `assignments-${STORE_KEY}`;
  const waitKey = `waitlist-${STORE_KEY}`;
  const read = (k) => {
    try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; }
  };

  return {
    async load() {
      return read(key);
    },
    async claim(name) {
      const { list, entry } = assign(read(key), name);
      localStorage.setItem(key, JSON.stringify(list));
      return entry;
    },
    async loadWaitlist() {
      return read(waitKey);
    },
    async joinWaitlist(name) {
      const { list, position } = joinWaitlist(read(waitKey), name);
      localStorage.setItem(waitKey, JSON.stringify(list));
      return position;
    },
    async reset() {
      localStorage.removeItem(key);
      localStorage.removeItem(waitKey);
    },
  };
}

export const store = isShared ? await firebaseStore() : browserStore();
