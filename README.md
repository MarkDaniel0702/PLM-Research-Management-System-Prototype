# PLM Research Management System — Prototype

> **This is a prototype for demonstration and feedback.** It uses demo data only and stores everything in your own browser. Do not enter real personal or institutional data.

**Live demo:** https://markdaniel0702.github.io/PLM-Research-Management-System-Prototype/
**Leave feedback:** use the **Give feedback** button inside the app, or [open an issue](https://github.com/MarkDaniel0702/PLM-Research-Management-System-Prototype/issues/new).

## What it is

A clickable prototype of a research management and repository system for Pamantasan ng Lungsod ng Maynila (PLM). It replaces research spreadsheets with one system for recording, reporting and searching research output.

## Key features

- **Sign-in with roles:** Administrator, College Coordinator, Faculty, Student, Employee, Auditor. Menus and actions change by role.
- **Dashboard:** totals, charts and recent activity with year, semester and college filters.
- **Five record types:** Faculty Research, Employee Research (by office), Presented Papers, Published Journals, Student Research. Search, filter, sort, add, edit, delete, and a detail page for each record.
- **Review workflow:** submissions from faculty, students and employees wait for a coordinator to verify or return them.
- **Reports:** eleven standard reports plus a custom report builder. Export to Excel (.xlsx) or PDF (use the print dialog and choose "Save as PDF").
- **Repository search:** keyword search with filters, results grouped by type.
- **Maintenance:** manage colleges, courses, faculty, students, employees, offices, semesters, academic years, indexing categories and funding agencies.
- **Administration:** user accounts, read-only audit log, system settings, and a "Reset demo data" button.
- **Works on phones and desktops.**

## Tech stack

Vite, React 18, React Router (hash routing), Chart.js, write-excel-file. No backend: data is saved in the browser's `localStorage`.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
```

To test the production build: `npm run build && npm run preview`.

## Demo logins

Demo data only. These are also shown on the login screen.

| Role | Email | Password |
|---|---|---|
| Research Office Administrator | admin@plm.edu.ph | Admin@123 |
| College Coordinator (CET) | cet.research@plm.edu.ph | Coord@123 |
| College Coordinator (CCSS) | ccss.research@plm.edu.ph | Coord@123 |
| Faculty | msantos@plm.edu.ph | Faculty@123 |
| Student | avaldez@plm.edu.ph | Student@123 |
| Employee | mdelacruz@plm.edu.ph | Employee@123 |
| Viewer / Auditor | audit@plm.edu.ph | Audit@123 |

`former.faculty@plm.edu.ph` / `Faculty@123` is a deactivated account, used to show that sign-in is blocked.

## Project structure

```
index.html            page shell
public/               seal image
src/
  main.jsx, App.jsx   start-up and routes
  schema.js           record types, master-data lists, roles
  seed.js             demo data
  store.js            data storage, sign-in, audit log
  perm.js             who can see and do what
  index.css           responsive styles
  components/         shared UI, layout, record form, export menu
  pages/              Login, Dashboard, Records, RecordDetail, Reports,
                      Repository, Maintenance, Admin
  lib/                data helpers, validation, column definitions, export
deploy.sh             publishes the built site to the gh-pages branch
```

## Deploy it (free)

**GitHub Pages (recommended):**

1. Run `bash deploy.sh` (builds the site and pushes it to the `gh-pages` branch).
2. On GitHub open **Settings → Pages**, set **Source** to **Deploy from a branch**, choose **gh-pages** and **/ (root)**, then **Save**.
3. After a minute the site is live at the link at the top of this README.

**Netlify or Vercel:** import this repository, use build command `npm run build` and publish folder `dist`. No environment variables are needed.

## Notes and limits

- Each visitor's changes stay in their own browser and are not shared. Use **Administration → System Settings → Reset demo data** to start over.
- Passwords are stored in plain text in the browser. This is acceptable for a demo only; a real system needs a secure backend.
- Not built yet: file attachments, and presented-paper modules for students and employees.
