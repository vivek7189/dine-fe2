# KOT Print Routing — Reference (current state + update-delta fix)

> **Purpose:** Snapshot of how Kitchen Order Ticket (KOT) printing works across the
> DineOpen ecosystem **before** the "update prints only the delta per station" fix
> (2026-07-26). Keep this as the rollback reference if anything regresses after the fix.
>
> **Repos / branches at time of writing**
> - `dine-frontend` — branch `pg-full-migration` (line numbers below)
> - `dine-backend` — branch `main` (line numbers below); must be ported to `pg-full-migration` after
> - `dine-app` — branch `second`
>
> ⚠️ The main POS page is **duplicated**: `src/app/(dashboard)/dashboard/page.js` (V1) and
> `.../dashboard/v2/page.js` (V2, dark theme). V2 line numbers are cited; V1 ≈ V2 − ~110 lines.
> **Any dashboard change must be made in BOTH files.**

---

## 1. The two print paths

| Path | Who prints | How it splits by station | Delta on update? |
|------|-----------|--------------------------|------------------|
| **LOCAL** | The POS device itself (Electron desktop / dine-app native) prints straight to thermal printers | Client loops stations, one print job per station | See §4 |
| **REMOTE** | Backend fires a *slim* RTDB/FCM event → a separate printer app (dine-kot-printer / -android) or the desktop `useAutoPrint` listener fetches the rendered KOT from the backend | Server render endpoint filters by `stationId` | See §4 |

The slim notification carries **no item bodies** — only `orderId`, `itemsCount`, `isReprint`,
`printStationId/Name`. Clients then fetch the full ticket from
`GET /api/kot/render/:restaurantId/:orderId?stationId=…&newOnly=…`.

---

## 2. Category → printer mapping (data model)

- **Print stations** live on the restaurant doc, managed by
  `GET/PUT /api/admin/print-stations/:restaurantId` (`dine-backend/index.js`, admin editor
  `dine-frontend/src/app/(dashboard)/admin/page.js` `PrintStationManager`).
  Each station: `{ id, name, type, categoryIds[], isDefault, enabled }`.
  `categoryIds` is the category→station mapping. `kotPrintingMode ∈ {single, multi}`.
- **Station → physical printer** is stored **per device** in Electron
  (`electron/main.js` `settings.stationPrinters[stationId] = printerName|IP`), set via
  `NativePrinterSettings.js` → `window.electronAPI.setPrinterConfig({ stationPrinters })`.
  The server never knows the hardware; it only knows which *items* belong to a station.
- The **default** station also absorbs items whose category is unassigned to any station.

---

## 3. Delta computation (already correct — do not change)

### Frontend (on `Update & KOT` / `KOT & Print` of an existing order)
`dashboard/v2/page.js` update branch of `placeOrder` (~`4957–5059`):
- Keys items with the composite `getOrderItemKey` (`src/utils/orderItemKey.js`) — `menuItemId | variant | customizations | seat`.
- `newItems` = in cart, not in existing order.
- `updatedItems` = existing but quantity changed; carries `quantityDelta` (+/−) and `previousQuantity`.
- `removedKotItems` = in existing order, not in cart.
- Seat-only moves are guarded (`seatMoveKeys`) so moving a seat never re-fires the kitchen; a pure
  seat move sets `updateData.skipKOT = true`.
- Result → `orderSuccess.kotData = { items: incrementalItems, removedItems, isIncremental: true, … }`.

### Backend (`PATCH /api/orders/:orderId`, `dine-backend/index.js` on `main`)
- Strips stale diff flags first (`13607`).
- Marks each item: `isNew:true`+`addedAt` (`13747`), or `isUpdated:true`+`previousQuantity`+`quantityDelta` (`13751–13757`), else clean.
- Builds `removedItems[]` each `{…, isRemoved:true, quantity: |delta| }` (`13767–13775`), seat-move reconciled (`13808`), saved as `updateData.removedItems` (`13831`).
- **Stores the WHOLE item list with these markers** on the order.

### Print templates (already render the delta — do not change)
`src/utils/printTemplates/kot/*.js` + `helpers.js` render, when `kotData.isIncremental` is true:
- `*** CANCELLED ***` — `removedItems`
- `*** REDUCED ***` — `items` where `isUpdated && quantityDelta < 0` (shows `|quantityDelta|`)
- `*** NEW ITEMS ***` — `items` where `isNew || (isUpdated && quantityDelta > 0)`
- then unmarked items.

So the templates are correct **as long as `kotData` is fed** `isIncremental`, delta-marked `items`,
and `removedItems`.

---

## 4. Where the delta is USED vs LOST (the bug)

### First order (new)
The whole order *is* the delta → every station printing its full category slice is correct.
**Not affected by the fix.**

### Update — path by path

| Path | Code | Behaviour on update |
|------|------|---------------------|
| Single printer / web | `OrderSummary.js:919–972` | Uses `kotData.items` = **delta** + `removedItems` + `isIncremental`. ✅ correct |
| Remote real-time (desktop listener) | `src/hooks/useAutoPrint.js:~295` | Renders with `newOnly: data.isIncremental`. ✅ correct |
| **Electron multi-station (LOCAL)** | `OrderSummary.js:882–912` | **Ignores `kotData`**, re-fetches each station via `getKOTRender(restaurantId, orderId, { stationId })` **without `newOnly`** → server returns the station's **whole** category slice. ❌ **reprints entire order per station** |
| Order-history explicit "Print KOT" | `orderhistory/page.js` `browserPrintKOT` | Whole order, by design (manual reprint). Not a bug. |

**Smoking gun:** `src/components/OrderSummary.js:890`
```js
const rd = await apiClient.getKOTRender(restaurantId, thisOrderId, { stationId: station.id });
//                                                              ^^ no newOnly → full station slice
```

### Backend `newOnly` is also incomplete
`GET /api/kot/render` (`dine-backend/index.js:22987`, `newOnly` filter at `23022–23024`):
- Filters `items` to `isNew || isUpdated` only.
- **Does NOT return `removedItems`** → a pure removal ("remove 1 wine") would print nothing on the bar.
- Returns `isUpdated` items at their **full** `quantity` (e.g. 3), not `quantityDelta` (e.g. +1).

---

## 5. The fix (2026-07-26)

Goal: on **update**, each station prints **only its changed items** (new / +qty / reduced / cancelled),
and stations with no changes print nothing. First-order printing is untouched.

1. **Backend `GET /api/kot/render` (`index.js:22987`)** — in the `newOnly === 'true'` branch:
   - also gather `orderData.removedItems`, filter them by the same station-category rule,
   - remap `isUpdated` items so the printed `quantity = quantityDelta` (positive),
   - set `isIncremental: true` and return `removedItems` in the `kot` payload,
   - treat "no items **and** no removed items" as the empty/skip case.
   → Fixes **both** the local Electron path and the remote/dine-app path at once.

2. **Frontend `OrderSummary.js` Electron station branch (`:890` and default-station fallback `:903`)** —
   pass `newOnly: !!orderSuccess.kotData?.isIncremental`; carry `removedItems` from the render into
   `kotData`; keep the empty-station skip. First order → `isIncremental` false → `newOnly` false →
   whole order (unchanged). Mirror into V1 `dashboard/page.js` + V2 `dashboard/v2/page.js` if touched.

3. **Console logging** — per station on update:
   `[KOT][station:<name>] update → NEW:n REDUCED:n CANCELLED:n (skipped:<bool>)`.

4. **Remote/BE routing** — the enhanced render endpoint (step 1) is what the remote printer app and
   `useAutoPrint` already hit with `newOnly`; verify the remote printer requests `newOnly` on reprints.

### Explicit non-goals (must NOT change)
- New-order (first) print behaviour.
- Delta computation in dashboard / backend PATCH (already correct).
- KOT templates (already render CANCELLED/REDUCED/NEW).
- Seat-move suppression.

---

## 6. Quick file index

| Concern | File | Key lines |
|---|---|---|
| KOT auto-print effect (frontend) | `dine-frontend/src/components/OrderSummary.js` | 802–975 (Electron station branch 882–912; bug at 890) |
| Update delta (frontend) | `dine-frontend/src/app/(dashboard)/dashboard/v2/page.js` | ~4957–5059 |
| Print abstraction | `dine-frontend/src/utils/printBridge.js` | `printViaElectron` 226 |
| KOT HTML + templates | `dine-frontend/src/utils/printHtmlGenerator.js`, `printTemplates/kot/*`, `printTemplates/helpers.js` | helpers 92–129 |
| Electron print IPC | `dine-frontend/electron/main.js` | `electron:print` 616; station→printer 619–632 |
| Real-time remote print | `dine-frontend/src/hooks/useAutoPrint.js` | ~293–296 (`newOnly`) |
| Render endpoint | `dine-backend/index.js` (main) | 22987–23095 (`newOnly` 23022) |
| Update PATCH + markers | `dine-backend/index.js` (main) | 13607/13747/13751/13767/13831 |
| Update KOT dispatch | `dine-backend/index.js` (main) | 14932–14951 |
| Station split fn | `dine-backend/index.js` (main) | `splitOrderByPrintStation` 21787 |
| App local routing | `dine-app/services/multiPrinterService.js` | `printKOTsByStation` 181–281 |
| App delta at create/update | `dine-app/components/WaiterOrderModal.js`, `screens/MenuNative.js` | 533–642 / 1433–1534 |
