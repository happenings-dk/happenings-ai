---
name: happenings
description: >-
  Use when the person runs a club, student organisation, Friday bar or venue on
  Happenings and asks about their page: events, tickets, sales, orders,
  members and memberships, deals, posts, posters, photos or analytics. Works
  through the Happenings connector's typed tools (create_event_draft,
  event_sales, media_upload_widget and more), which reach only the pages the
  person granted when they connected.
---

# Running a Happenings page

Happenings is where students and clubs run their events, tickets, members
and deals. The Happenings connector (the Happenings MCP server,
`https://api.happenings.social/page/mcp`) gives you one tool per job. Tools
that read are marked read-only; tools that change the page are not.

The connection reaches only the pages the person picked when they connected,
and only what their role on each page allows. If something is refused, say so
plainly. Do not look for a way around it.

## Start every session the same way

1. `list_pages` to get the pages and their ids.
2. If there is more than one page and the person did not say which, ask.
3. Read before you change anything.

## Read first

| The person asks | Tool |
|---|---|
| What's coming up? | `list_upcoming_events` |
| One event in detail | `get_event_overview` (shows an event card) |
| How is this event selling? | `event_sales` (shows a sales dashboard) |
| How are sales going overall? | `get_sales_summary` |
| Who bought what? | `list_recent_orders` |
| Who are our members? / find a member | `search_members` (shows a member list) |
| A poster, QR code or link to share | `get_share_kit` (shows the poster preview) |

In Claude and ChatGPT these tools show a card, dashboard or poster in the
chat. Other apps get the same data as text. Either way, still say the answer in
a sentence.

## Photos, posters and logos

Remote tools cannot read files attached to the chat. So:

- When the person has an image on their device or attached one, call
  `media_upload_widget` as the only tool in that turn. It shows an upload box;
  they pick the file, and you get back an `asset_id`.
- For an image on the web, call `media_import_url` with the https link.
- Then pass the `asset_id` to `set_event_cover`, `set_page_logo`,
  `set_page_cover` or `add_album_photo`.

Only images are accepted, up to 10 MB each.

## Changing things

Every tool that creates, edits, sends or publishes runs for real on the live
page, for real members and buyers. So:

1. Say exactly what you will change, in plain words.
2. Run it only after they say yes. One change at a time.
3. Show the result, for example with `get_event_overview`.

A new event:

1. `create_event_draft` with the title and times. Times are local Danish time,
   `YYYY-MM-DDTHH:MM`, for example `2026-10-09T16:00`.
2. `create_ticket_type` for each ticket. `price_minor` is in øre: 60 kr is
   `6000`.
3. A cover: `media_upload_widget` or `media_import_url`, then
   `set_event_cover`.
4. `get_event_overview` to show it, then `publish_event` after a yes.

`send_announcement` emails the page's members and cannot be undone. Always
show the subject and text first and wait for an explicit yes.

## When no tool fits

`hap_help`, `hap_read` and `hap_run` run the Happenings CLI directly, for the
few jobs without their own tool. Read the command's help first. Use `hap_read`
for a read, since it changes nothing and refuses anything that would, and
`hap_run` for a change. Times passed to `hap_run` are UTC, not Danish time.

## How to answer

- Lead with the answer, then the numbers. Organisers want "You've sold 212 of
  300 tickets, most in the last two days", not a JSON dump.
- Name events, pages and people. Never show raw ids unless asked.
- Money comes back in minor units (øre, cents). Divide by 100 and show the
  currency.
- Write in the person's language. Many organisers write Danish: answer in
  Danish when they do.
- If a tool fails, read the error, fix the call once, and otherwise tell the
  person what went wrong and what they can do in Connect
  (https://connect.happenings.social).
