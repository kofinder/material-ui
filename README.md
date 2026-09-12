# Material Flow — factory store prototype

React + Material UI prototype for DM/IDM factory materials management, based on the supplied Store DM-IDM V1.3.xlsb workbook.

## Run locally

Requires Node.js 22.13 or newer and pnpm 11.25.0 (the package manager recorded in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:5173. A clean checkout uses the portable runtime automatically. Source edits refresh the page during development.

```sh
pnpm build
```

## Included workflows

- Operations overview with shortage attention and recent movements.
- Searchable, sortable DM/IDM catalog with process and stock filters.
- Material creation and editing; existing codes and units are fixed to preserve transaction references.
- Receiving and issuing with a review/confirmation step and source-lot validation.
- Physical stock adjustments on a receipt lot, requiring a responsible person and reason.
- Reorder suggestions from configured minimum and maximum levels; no purchase order is created.
- Searchable receipt, issue, and adjustment history with date filters.
- Session activity log and context-aware CSV export.
- Reports for category and process stock value and availability.

## Data and scope

`app/data/store.json` contains 806 materials, 222 receipt lots, and 5 issue records extracted from the workbook. Opening balances use RCOrder.Balance as recorded; historical issue quantities are not deducted again. Value is remaining lot balance multiplied by that lot's unit price. No currency conversion or unit conversion is performed.

All edits and transactions are in memory. Refreshing or resetting restores the original snapshot. The activity log is a prototype session log, not a durable or tamper-resistant audit trail. This version has no Kotlin backend, shared database, business authentication, purchase orders, approval roles, or production concurrency controls.

The source includes the user's factory material data. Handle it as internal business data.

## Main source

- `app/page.tsx`: application state, workflows, validation, and React UI.
- `app/globals.css`: responsive visual system.
- `app/data/store.json`: original workbook snapshot.
- `app/layout.tsx`: page metadata.

A later Kotlin/Spring implementation should move validation, transactions, lot balances, authorization, and audit storage behind API endpoints with database transactions. Do not use browser-only stock operations as the production system of record.

## Version 3 — team, procurement, and costing

New modules:

- Users: add/edit local user records, assign roles, activate/deactivate users, preserve at least one active administrator.
- Roles: editable action permissions and protected Administrator role. Preview the active demo user in the top bar. All demo roles can read all records; this is not server-side access control.
- Suppliers: local supplier directory with contacts, terms, and active status. Initial suppliers and user accounts are explicitly fictional examples.
- Purchasing: multi-line request → review and submit → a different approver → full receipt. Reject with a reason, cancel a submitted request, and prevent repeat receiving.
- Costing: line discounts, allocated freight, configurable tax, landed receipt cost, and weighted remaining-stock reporting.

Price convention for this prototype: round line extensions and discounts to two decimals; distribute freight proportionally to discounted line values (equally when all are zero), assigning rounding residue to the last line. Tax is calculated on net material value plus freight. Tax defaults to 0%, is user-configurable, and is excluded from inventory cost. These are demo accounting conventions, not jurisdiction-specific tax rules. Received purchase lines use landed unit cost (net value plus allocated freight divided by quantity); selected-lot issues continue to use the selected lot price.

New source: `app/features/operations.ts` contains pure pricing and approval rules; `app/features/Enterprise.tsx` contains the shared demo administration state and new module UI.

No invitations are sent. No actual accounts or role grants are created on the private hosted site. No suppliers are contacted. All records remain session-only. Partial receiving, supplier invoicing, currency conversion, and permanent authentication/authorization require a later backend implementation.

## Dark theme edition

The entire interface now uses a dark Material UI palette, including navigation, inventory tables, dialogs, material drawers, pricing calculators, approval screens, and administration. All version 3 workflows remain included.
