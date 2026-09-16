<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project Context & Architecture Reference
This repository is **WASLA (وِصلة)**, a multi-tenant social commerce SaaS platform for Egyptian merchants.

- Core Project Reference & Requirements: [PROJECT.md](file:///e:/computer%20and%20artificial%20intilgance/Waslaa/waslaaApp/docs/PROJECT.md)
- Codebase & Architecture Guide: [PROJECT_STRUCTURE.md](file:///e:/computer%20and%20artificial%20intilgance/Waslaa/waslaaApp/docs/PROJECT_STRUCTURE.md)
- Workspace Agent Skill: Use the `wasla-reference` skill in [.agents/skills/wasla-reference/SKILL.md](file:///e:/computer%20and%20artificial%20intilgance/Waslaa/waslaaApp/.agents/skills/wasla-reference/SKILL.md) for all architectural rules, multi-tenancy enforcement, Meta/WhatsApp Cloud API integrations, order states, and Supabase RLS conventions.
