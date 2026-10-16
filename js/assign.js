// The assignment rules. Pure functions only, with no storage or page code.
import { GROUPS, FILL_ORDER } from "./config.js";

const membersPerGroup = (groupId) => GROUPS.find((g) => g.id === groupId).tables.length;

// Every slot in the order it gets filled, e.g. [{group:1, member:1}, {group:2, member:1}, …].
export const SLOTS = FILL_ORDER.flatMap((pair) => {
  const size = Math.max(...pair.map(membersPerGroup));
  const slots = [];
  for (let member = 1; member <= size; member++)
    for (const group of pair)
      if (member <= membersPerGroup(group)) slots.push({ group, member });
  return slots;
});

export const cleanName = (name) => name.trim().replace(/\s+/g, " ");
export const sameName = (a, b) => cleanName(a).toLowerCase() === cleanName(b).toLowerCase();

// Returns { list, entry }:
// - a name that already has a slot gets that slot back, and the list is unchanged
// - a new name gets the next free slot, added to the list
// - entry is null when every slot is taken
export function assign(list, name) {
  const existing = list.find((a) => sameName(a.name, name));
  if (existing) return { list, entry: existing };

  const taken = new Set(list.map((a) => `${a.group}-${a.member}`));
  const slot = SLOTS.find((s) => !taken.has(`${s.group}-${s.member}`));
  if (!slot) return { list, entry: null };

  const entry = { name: cleanName(name), group: slot.group, member: slot.member, at: Date.now() };
  return { list: [...list, entry], entry };
}
