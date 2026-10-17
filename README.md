# Group Assignment Site

Students type their name and get a group and a table. Typing `admin` shows every group.

## Files
```
index.html        page layout
css/styles.css    look and feel
js/config.js      ← the only file you normally edit: mode, Firebase config, groups, tables, fill order
js/assign.js      assignment rules (next free slot, repeat names)
js/storage.js     saving: Firebase, or this browser when Firebase isn't set up
js/ui.js          builds the result and group cards
js/main.js        connects buttons to everything else
```

## Updating the site
After editing any file in `css/` or `js/`, raise the `v=` number on every versioned line in `index.html`
(for example `v=3` → `v=4`). Otherwise Safari may keep showing the old version.

## 1. Set up Firebase (free, about 5 minutes)
1. Go to https://console.firebase.google.com, click **Add project**, and turn Analytics off.
2. Open **Build → Realtime Database → Create database**, then pick **Start in test mode**.
   Test mode stops reads and writes after about 30 days; the date is in the **Rules** tab.
3. The list is saved at `/assignments/test` and `/assignments/live`. You can see it in the **Data** tab.
4. Open **Project settings (gear) → Your apps → Web (</>)** and register the app.
5. Copy the `firebaseConfig` object it shows into `js/config.js`:
   ```js
   export const FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", ... };
   ```

## 2. Test
Push to GitHub and turn on Pages (**Settings → Pages → Deploy from branch → main**). Keep `MODE = "test"`.
Type some names, then type `admin` to check. The admin view has a **Clear all test entries** button in test mode.

To run it on your computer instead, use a local server, because double-clicking `index.html` won't load the scripts.
For example, run `npx serve` in this folder, or use the VS Code "Live Server" extension.

## 3. Go live
In `js/config.js` change `MODE` to `"active"` and push. Live entries are stored separately from test entries,
so students start with an empty list.

## 4. Waitlist and extra groups
When every group is full, students who type their name join a waitlist and see their place in the queue.
The list is saved at `/waitlist/live`. Type `admin` to see who is on it and how many are still waiting.

The waitlist closes at `WAITLIST_CLOSES` in `js/config.js`. While anyone is still waiting, open places
go to the waitlist first, so a new name joins the queue instead. After closing time, new names are turned
away, and only names already on the waitlist can take places in new groups.

To place the waitlisted students:
1. Add the new groups to `GROUPS` (one table per member) and add them to `FILL_ORDER`, for example `[7, 8]`.
2. Raise the `v=` numbers in `index.html` and push.
3. Type `admin` and press **Place waitlisted students**. Everyone still waiting gets a place, in waitlist
   order, until the places run out. Pressing it again skips students who already have a place.
4. Students type their name to see their group, just like everyone else.

To take more names after that, move `WAITLIST_CLOSES` later, raise the `v=` numbers and push.
