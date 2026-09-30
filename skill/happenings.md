---
name: happenings
description: >-
  Use when the person runs a club, student organisation, Friday bar or venue on
  Happenings and asks about their page: events, tickets, sales, orders,
  members and memberships, deals, bundles, posts or analytics. Works through
  the Happenings connector's hap_run and hap_help tools, which reach only the
  pages the person granted when they connected.
---

# Running a Happenings page

Happenings is where students and clubs run their events, tickets, members
and deals. The Happenings connector (the Happenings MCP server, `https://api.happenings.social/page/mcp`) gives you two tools:

- `hap_help`: shows the page-level commands, or the help for one command.
  Read-only.
- `hap_run`: runs one page-level Happenings command. Pass the arguments as an
  array without the leading `hap`. JSON output is added for you.

The connection reaches only the pages the person picked when they connected,
and only what their role on each page allows. If something is refused, say so
plainly. Do not look for a way around it.

## Start every session the same way

1. `hap_run ["access","pages","list"]` to get the pages and their ids.
2. If there is more than one page and the person did not say which, ask.
3. Read before you change anything.

## Read first

| The person asks | Run |
|---|---|
| What's coming up? | `["events","list","--page","<page-id>"]` |
| One event in detail | `["events","get","<event-id-or-slug>"]` |
| How are sales going? | `["analytics","page","--page","<page-id>","--days","30"]` |
| Who bought what? | `["orders","list","--page","<page-id>","--page-size","50"]` |
| Tickets for an event | `["tickets","list","--event","<event-id>"]` |
| Who are our members? | `["members","list","--page","<page-id>","--limit","100"]` |
| Find a member | `["members","list","--page","<page-id>","--query","<name or email>"]` |

Flags differ between commands (`--page`, `--event`, `--page-size`,
`--limit`). When unsure, call `hap_help` with the command, for example
`{"command": "events create"}`, instead of guessing.

## Changing things

Every command that creates, edits, sends or deletes runs for real on the live
page, for real members and buyers. So:

1. Work out the exact command with `hap_help`.
2. If the help lists `--dry-run`, run it with `dry_run: true` and show the
   person what would change.
3. If it has no `--dry-run`, show the person the exact command and what it
   will do, in plain words.
4. Run it only after they say yes. One change at a time.

Creating an event, for example:

```
hap_help {"command": "events create"}
hap_run ["events","create","--page","<page-id>","--title","Fredagsbar",
         "--start","2026-10-09T16:00","--end","2026-10-10T00:00",
         "--venue","Kantinen","--registration-mode","rsvp"]
```

Times are `YYYY-MM-DDTHH:MM` in the page's local time. Events are public
unless you pass `--visibility members` or `invite`.

## How to answer

- Lead with the answer, then the numbers. Organisers want "You've sold 212 of
  300 tickets, most in the last two days", not a JSON dump.
- Name events, pages and people. Never show raw ids unless asked.
- Money comes back in minor units (øre, cents). Divide by 100 and show the
  currency.
- Write in the person's language. Many organisers write Danish: answer in
  Danish when they do.
- If a command fails, read the error, fix the command once, and otherwise tell
  the person what went wrong and what they can do in Connect
  (https://connect.happenings.social).
