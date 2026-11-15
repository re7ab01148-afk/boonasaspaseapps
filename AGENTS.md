<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

<!-- AGENT-MEMORY:BEGIN -->
## Project rules
- BOO is a demo-crew astronaut health app; all readings come from the deterministic generator in `src/lib/health/data.ts` (fixed NOW) so SSR and client render identically — never use Date.now()/Math.random() during render.
- Health ranges, status classification and advice live only in `src/lib/health/metrics.ts`; every page reads thresholds from there so screens never disagree.
- Shared, user-changeable demo state (selected astronaut, Mars Mode, alert states) lives in `src/lib/app-state.tsx` and persists to localStorage after hydration.
- The app shell (sidebar, header, footer) is rendered once in `src/routes/__root.tsx` via `AppShell`; pages render only their content.
- Reusable page pieces live in `src/components/boo/`; page-only helpers go in `src/components/boo/<page>/`.
<!-- AGENT-MEMORY:END -->
