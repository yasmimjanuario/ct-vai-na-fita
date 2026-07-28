const SPREADSHEET_ID = "19xf2KJNvUVfGs7c3sxOwXHXUjfs-6to3TmxgDZPr7Hs";
const SHEET_NAME = "Aulas";
const MAX_BOOKINGS_PER_SLOT = 4;

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const booking = JSON.parse(event.postData.contents);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("A aba Aulas não foi encontrada.");
    }

    const rows = sheet.getDataRange().getDisplayValues();
    const bookingsInSlot = rows.slice(1).filter(function (row) {
      return row[5] === booking.date &&
        row[6] === booking.time &&
        row[8] !== "Cancelado";
    }).length;

    if (bookingsInSlot >= MAX_BOOKINGS_PER_SLOT) {
      return jsonResponse({ ok: false, error: "HORARIO_ESGOTADO" });
    }

    const bookingId = Utilities.getUuid();

    sheet.appendRow([
      new Date(),
      booking.name,
      booking.phone,
      booking.age,
      booking.practiced,
      booking.date,
      booking.time,
      booking.partner || "acesso direto",
      "Agendado",
      bookingId,
    ]);

    return jsonResponse({
      ok: true,
      bookingId: bookingId,
      remaining: MAX_BOOKINGS_PER_SLOT - bookingsInSlot - 1,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
