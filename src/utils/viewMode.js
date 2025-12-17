export function getViewMode(profile) {
  if (!profile) return "public";
  if (profile.role === "admin" || profile.role === "user") return "user";
  return "public";
}
