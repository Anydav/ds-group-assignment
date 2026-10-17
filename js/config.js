// All settings live in this file. Nothing else should need editing.

// "test" while you check the site, "active" when students can use it.
// Test and active entries are stored separately, so test data never reaches students.
export const MODE = "active";

// From Firebase console → Project settings → Your apps (see README.md).
// Set to null to save entries in this browser only, which is handy for a quick try.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDfwdk_4zsYEysILeiODZGczS6HioxRTMU",
  authDomain: "ds-group-assignment.firebaseapp.com",
  databaseURL: "https://ds-group-assignment-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ds-group-assignment",
  storageBucket: "ds-group-assignment.firebasestorage.app",
  messagingSenderId: "993072934134",
  appId: "1:993072934134:web:29355a0c3feefca92150d7",
};

// Typing this as the name opens the admin view.
export const ADMIN_NAME = "admin";

// One entry per group. `tables` is in member order: Member 1 → Member 5.
export const GROUPS = [
  { id: 1, name: "Supermarket",      color: "#2f7d32", tables: ["sales.csv", "products.csv", "inventory.csv", "deliveries.csv", "staff_shifts.csv"] },
  { id: 2, name: "Hospital",         color: "#c62828", tables: ["appointments.csv", "doctors.csv", "patients.csv", "billing.csv", "lab_tests.csv"] },
  { id: 3, name: "Transport",        color: "#1565c0", tables: ["trips.csv", "vehicles.csv", "drivers.csv", "fuel.csv", "maintenance.csv"] },
  { id: 4, name: "University",       color: "#6a1b9a", tables: ["results.csv", "courses.csv", "students.csv", "attendance.csv", "hostel.csv"] },
  { id: 5, name: "Food Delivery",    color: "#ef6c00", tables: ["orders.csv", "restaurants.csv", "riders.csv", "customers.csv", "ratings.csv"] },
  { id: 6, name: "Farm Cooperative", color: "#795548", tables: ["harvests.csv", "crops.csv", "farms.csv", "inputs.csv", "market_sales.csv"] },
  { id: 7, name: "Online Store",         color: "#00838f", tables: ["orders.csv", "products.csv", "customers.csv", "deliveries.csv", "returns_reviews.csv"] },
  { id: 8, name: "POS Agent Banking",    color: "#ad1457", tables: ["transactions.csv", "agents.csv", "customers.csv", "cash_float.csv", "complaints.csv"] },
  { id: 9, name: "Short-let Apartments", color: "#455a64", tables: ["bookings.csv", "apartments.csv", "guests.csv", "payments.csv", "maintenance.csv"] },
];

// Member number of the group lead.
export const LEAD_MEMBER = 2;

// When every group is full, new students join a waitlist instead. It closes at this time, read from
// each student's device clock (so it is local time where they are). While anyone is waiting, open
// places go to the waitlist first; after it closes, only names on the waitlist can take places.
// To place them: add the new groups to GROUPS and to FILL_ORDER (e.g. [7, 8]), bump v= in index.html,
// and push. Then type admin and press "Place waitlisted students" to fill the places in waitlist order.
export const WAITLIST_CLOSES = new Date("2026-10-18T14:00:00");

// Groups fill in pairs, taking turns: G1-M1, G2-M1, G1-M2, G2-M2 … until both are full,
// then the next pair starts.
export const FILL_ORDER = [[1, 2], [3, 4], [5, 6], [7, 8], [9]];
