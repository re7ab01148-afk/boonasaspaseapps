import { createServerFn } from "@tanstack/react-start";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-constants";

/**
 * Makes sure the shared demo account (Rehab) exists and still has the public demo password.
 * Public by design: it only ever touches that one fixed account and returns nothing private.
 */
export const ensureDemoAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const attrs = {
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { demo: true },
    user_metadata: { display_name: "Rehab" },
  };
  const created = await supabaseAdmin.auth.admin.createUser({ email: DEMO_EMAIL, ...attrs });
  if (!created.error) return { ok: true };

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("Could not prepare the demo account");
    const found = data.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
    if (found) {
      const upd = await supabaseAdmin.auth.admin.updateUserById(found.id, attrs);
      if (upd.error) throw new Error("Could not prepare the demo account");
      return { ok: true };
    }
    if (data.users.length < 200) break;
  }
  throw new Error("Could not prepare the demo account");
});
