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
    const saved = json ? JSON.parse(json) : {};
    return jsonResponse({ ok: true, data: mergeTournamentCategoriesFromSheet(spreadsheet, saved) });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function normalizeHeader(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function headerIndex(headers, alternatives) {
  for (var i = 0; i < alternatives.length; i++) {
    var index = headers.indexOf(alternatives[i]);
    if (index >= 0) return index;
  }
  return -1;
}

function slugify(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// A coluna Categoria da aba Torneio_Duplas é a fonte das categorias exibidas no site.
function mergeTournamentCategoriesFromSheet(spreadsheet, saved) {
  var teamsSheet = spreadsheet.getSheetByName("Torneio_Duplas");
  if (!teamsSheet || teamsSheet.getLastRow() < 2) return saved;
  var values = teamsSheet.getDataRange().getDisplayValues();
  var headers = values[0].map(normalizeHeader);
  var categoryCol = headerIndex(headers, ["categoria"]);
  var seedCol = headerIndex(headers, ["ordem", "seed", "posicao", "numero"]);
  var idCol = headerIndex(headers, ["id", "id dupla", "id da dupla"]);
  var player1Col = headerIndex(headers, ["atleta 1", "jogador 1", "player1", "participante 1"]);
  var player2Col = headerIndex(headers, ["atleta 2", "jogador 2", "player2", "participante 2"]);
  var lossesCol = headerIndex(headers, ["derrotas", "losses"]);
  var statusCol = headerIndex(headers, ["status", "situacao"]);
  if (categoryCol < 0 || player1Col < 0 || player2Col < 0) return saved;

  var sheetTeams = {};
  values.slice(1).forEach(function(row, rowIndex) {
    var category = String(row[categoryCol] || "").trim();
    var player1 = String(row[player1Col] || "").trim();
    var player2 = String(row[player2Col] || "").trim();
    if (!category || !player1 || !player2) return;
    if (!sheetTeams[category]) sheetTeams[category] = [];
    var seed = seedCol >= 0 ? Number(row[seedCol]) : sheetTeams[category].length + 1;
    var losses = lossesCol >= 0 ? Number(row[lossesCol]) || 0 : 0;
    var status = statusCol >= 0 ? normalizeHeader(row[statusCol]) : "";
    sheetTeams[category].push({
      id: idCol >= 0 && row[idCol] ? String(row[idCol]) : slugify(category + "-" + player1 + "-" + player2 + "-" + (rowIndex + 2)),
      player1: player1,
      player2: player2,
      seed: seed || sheetTeams[category].length + 1,
      losses: losses,
      eliminated: status === "eliminada" || status === "eliminado" || losses >= 2
    });
  });

  Object.keys(sheetTeams).forEach(function(category) {
    sheetTeams[category].sort(function(a, b) { return a.seed - b.seed; });
    var existingKey = Object.keys(saved).find(function(key) { return slugify(key) === slugify(category); });
    var previous = existingKey ? saved[existingKey] : null;
    if (existingKey && existingKey !== category) delete saved[existingKey];
    saved[category] = {
      teams: sheetTeams[category],
      matches: previous && previous.matches ? previous.matches : [],
      round: previous && previous.round ? previous.round : 0,
      started: previous ? Boolean(previous.started) : false,
      champion: previous ? previous.champion : undefined,
      runnerUp: previous ? previous.runnerUp : undefined
    };
  });

  var matchesSheet = spreadsheet.getSheetByName("Torneio_Jogos");
  if (matchesSheet && matchesSheet.getLastRow() >= 2) {
    var matchValues = matchesSheet.getDataRange().getDisplayValues();
    var matchHeaders = matchValues[0].map(normalizeHeader);
    var matchCategoryCol = headerIndex(matchHeaders, ["categoria"]);
    var numberCol = headerIndex(matchHeaders, ["jogo", "numero do jogo", "numero"]);
    var roundCol = headerIndex(matchHeaders, ["fase", "rodada", "round"]);
    var bracketCol = headerIndex(matchHeaders, ["chave", "bracket"]);
    var typeACol = headerIndex(matchHeaders, ["origem a tipo", "tipo origem a", "tipo a"]);
    var refACol = headerIndex(matchHeaders, ["origem a", "referencia a", "ref a"]);
    var typeBCol = headerIndex(matchHeaders, ["origem b tipo", "tipo origem b", "tipo b"]);
    var refBCol = headerIndex(matchHeaders, ["origem b", "referencia b", "ref b"]);
    var winnerCol = headerIndex(matchHeaders, ["vencedor", "winner"]);

    // Mantém compatibilidade com as colunas criadas pelas versões anteriores.
    if (matchCategoryCol < 0) matchCategoryCol = 0;
    if (numberCol < 0) numberCol = 1;
    if (roundCol < 0) roundCol = 2;
    if (bracketCol < 0) bracketCol = 3;
    if (typeACol < 0) typeACol = 4;
    if (refACol < 0) refACol = 5;
    if (typeBCol < 0) typeBCol = 6;
    if (refBCol < 0) refBCol = 7;
    if (winnerCol < 0) winnerCol = 8;

    var sheetMatches = {};
    matchValues.slice(1).forEach(function(row) {
      var matchCategory = String(row[matchCategoryCol] || "").trim();
      var number = Number(row[numberCol]);
      if (!matchCategory || !number) return;
      if (!sheetMatches[matchCategory]) sheetMatches[matchCategory] = [];
      var typeA = normalizeHeader(row[typeACol]) || "team";
      var typeB = normalizeHeader(row[typeBCol]) || "team";
      sheetMatches[matchCategory].push({
        id: "jogo-" + number,
        number: number,
        round: Number(row[roundCol]) || 1,
        bracket: normalizeHeader(row[bracketCol]) === "repescagem" ? "repescagem" : "principal",
        sourceA: { type: typeA === "winner" || typeA === "vencedor" ? "winner" : typeA === "loser" || typeA === "perdedor" ? "loser" : "team", ref: String(row[refACol] || "") },
        sourceB: { type: typeB === "winner" || typeB === "vencedor" ? "winner" : typeB === "loser" || typeB === "perdedor" ? "loser" : "team", ref: String(row[refBCol] || "") },
        winner: row[winnerCol] ? String(row[winnerCol]) : undefined
      });
    });
    Object.keys(sheetMatches).forEach(function(matchCategory) {
      var dataKey = Object.keys(saved).find(function(key) { return slugify(key) === slugify(matchCategory); });
      if (!dataKey) return;
      saved[dataKey].matches = sheetMatches[matchCategory].sort(function(a, b) { return a.number - b.number; });
      saved[dataKey].started = saved[dataKey].matches.length > 0;
      saved[dataKey].round = saved[dataKey].matches.reduce(function(max, match) { return Math.max(max, match.round); }, 0);
    });
  }
  return saved;
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
