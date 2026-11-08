# PLM Research Management System — Prototype

> **This is a prototype for demonstration and feedback.** It uses demo data only and stores everything in your own browser. Do not enter real personal or institutional data.

**Live demo:** https://markdaniel0702.github.io/PLM-Research-Management-System-Prototype/
**Leave feedback:** use the **Give feedback** button inside the app, or [open an issue](https://github.com/MarkDaniel0702/PLM-Research-Management-System-Prototype/issues/new).

## What it is

A clickable prototype of a research management and repository system for Pamantasan ng Lungsod ng Maynila (PLM). It replaces research spreadsheets with one system for recording, reporting and searching research output.

## Key features

- **Sign-in with roles:** Administrator, College Coordinator, Faculty, Student, Employee, Auditor. Menus and actions change by role.
- **Simple accounts for Faculty, Student and Employee:** a **My Submissions** page (status tiles and a list of their own research), tabs for their own Research, Presented Papers and Published Journals, a submission form, and notifications when a reviewer acts. No reports, search or admin screens, and they only ever see their own records.
- **Dashboard:** totals, charts and recent activity with year, semester and college filters.
- **Five record types:** Faculty Research, Employee Research (by office), Presented Papers, Published Journals, Student Research. Presented Papers and Published Journals are shared by faculty, students and employees (an *Author type* on each record). Search, filter, sort, add, edit, delete, and a detail page for each record.
- **Review workflow:** every submission moves **Pending → Under Review → Approved or Rejected**. Coordinators and the administrator start the review, approve, or reject with a reason; the author edits and resubmits a rejected entry. Each record page shows a progress tracker.
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
| Faculty (Dr. Maria Santos, CET) | msantos@plm.edu.ph | Faculty@123 |
| Faculty (Dr. Jose Reyes, CS) | jreyes@plm.edu.ph | Faculty@123 |
| Student (Aira Valdez, CCSS) | avaldez@plm.edu.ph | Student@123 |
| Student (Andrei Reyes, CET) | areyes@plm.edu.ph | Student@123 |
| Employee (Accounting Office) | mdelacruz@plm.edu.ph | Employee@123 |
| Employee (Security Office) | esantos@plm.edu.ph | Employee@123 |
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
  pages/              Login, Dashboard, MySubmissions, Records, RecordDetail,
                      Reports, Repository, Maintenance, Admin
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
- The sample data has 100 demo research entries across all roles, with a mix of Pending, Under Review, Approved and Rejected.
- Not built yet: file attachments.
