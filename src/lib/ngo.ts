import { supabase } from "@/integrations/supabase/client";

export async function loadNgoAccess(userId: string) {
  const role = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (role.error) throw role.error;
  const isAdmin = role.data === true;
  let query = supabase.from("bookings").select("organization").order("created_at", { ascending: false });
  // RLS remains the authority; also scope ordinary users explicitly.
  if (!isAdmin) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  const names = [...new Set((data ?? []).map((row) => row.organization.trim()).filter(Boolean))];
  return { isAdmin, names: isAdmin ? names.sort((a, b) => a.localeCompare(b, "pl")) : names.slice(0, 1) };
}

export function filterNgoNames(names: string[], search: string) {
  const term = search.trim().toLocaleLowerCase("pl");
  return names.filter((name) => name.toLocaleLowerCase("pl").includes(term));
}