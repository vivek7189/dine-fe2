/**
 * Resolve inventory permissions from pageAccess.
 * Handles both legacy boolean format and new granular object format.
 *
 * @param {Object} pageAccess - Staff member's pageAccess object
 * @returns {{ read: boolean, add: boolean, update: boolean, delete: boolean }}
 */
export function resolveInventoryPermissions(pageAccess) {
  const inv = pageAccess?.inventory;
  if (typeof inv === 'object' && inv !== null) {
    return { read: !!inv.read, add: !!inv.add, update: !!inv.update, delete: !!inv.delete };
  }
  const val = !!inv;
  return { read: val, add: val, update: val, delete: val };
}
