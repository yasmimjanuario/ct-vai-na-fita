const SPREADSHEET_ID = "19xf2KJNvUVfGs7c3sxOwXHXUjfs-6to3TmxgDZPr7Hs";
const SHEET_NAME = "Aulas";
const MAX_BOOKINGS_PER_SLOT = 4;

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const booking = JSON.parse(event.postData.contents);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (booking.action === "saveTournament") {
      saveTournamentState(spreadsheet, booking.data);
      return jsonResponse({ ok: true });
    }
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

function doGet(event) {
  try {
    if (!event.parameter || event.parameter.action !== "tournament") {
      return jsonResponse({ ok: false, error: "AÇÃO_INVÁLIDA" });
    }
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateTournamentStateSheet(spreadsheet);
    const json = sheet.getRange("B2").getValue();
    return jsonResponse({ ok: true, data: json ? JSON.parse(json) : null });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getOrCreateTournamentStateSheet(spreadsheet) {
  var sheet = spreadsheet.getSheetByName("Torneio_Estado");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Torneio_Estado");
    sheet.getRange("A1:C1").setValues([["Chave", "Estado JSON", "Atualizado em"]]);
    sheet.getRange("A2").setValue("estado-oficial");
    sheet.hideSheet();
  }
  return sheet;
}

function saveTournamentState(spreadsheet, data) {
  var sheet = getOrCreateTournamentStateSheet(spreadsheet);
  sheet.getRange("A2:C2").setValues([["estado-oficial", JSON.stringify(data), new Date()]]);
  syncTournamentTables(spreadsheet, data);
}

function syncTournamentTables(spreadsheet, data) {
  var teamsSheet = spreadsheet.getSheetByName("Torneio_Duplas");
  var matchesSheet = spreadsheet.getSheetByName("Torneio_Jogos");
  if (!teamsSheet || !matchesSheet) return;
  var teamRows = [];
  var matchRows = [];
  Object.keys(data).forEach(function(category) {
    var tournament = data[category];
    (tournament.teams || []).forEach(function(team) {
      teamRows.push([category, team.seed, team.id, team.player1, team.player2, team.losses, team.eliminated ? "ELIMINADA" : "ATIVA", new Date()]);
    });
    (tournament.matches || []).forEach(function(match) {
      matchRows.push([category, match.number, match.round, match.bracket, match.sourceA.type.toUpperCase(), match.sourceA.ref, match.sourceB.type.toUpperCase(), match.sourceB.ref, match.winner || "", match.winner ? "CONCLUÍDO" : "PRÓXIMO", "", "", "", new Date()]);
    });
  });
  if (teamsSheet.getLastRow() > 1) teamsSheet.getRange(2, 1, teamsSheet.getLastRow() - 1, 8).clearContent();
  if (matchesSheet.getLastRow() > 1) matchesSheet.getRange(2, 1, matchesSheet.getLastRow() - 1, 14).clearContent();
  if (teamRows.length) teamsSheet.getRange(2, 1, teamRows.length, 8).setValues(teamRows);
  if (matchRows.length) matchesSheet.getRange(2, 1, matchRows.length, 14).setValues(matchRows);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
