/* utils.js — shared utility helpers */

/**
 * Format an order ID for display.
 * Input: any UUID or numeric id string.
 * Output: "DF" + 4-digit zero-padded number.
 * Example: formatOrderId("abc-123") → "DF0042"
 */
function formatOrderId(id) {
  if (!id) return 'DF0000';
  var numeric = parseInt(String(id).replace(/[^0-9]/g, '').slice(-6), 10);
  if (isNaN(numeric)) numeric = 0;
  return 'DF' + String(numeric % 10000).padStart(4, '0');
}
