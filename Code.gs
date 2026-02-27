// ================================================================
// TOPEPOP TEA — Google Apps Script Backend
// Paste this entire file into your Google Apps Script editor
// ================================================================

const SHEET_NAME = "Members";
const HISTORY_SHEET = "History";

// ── Called on every HTTP request from the app ──
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    switch (action) {
      case "getAll":       result = getAllMembers();           break;
      case "getMember":    result = getMember(data.phone);    break;
      case "addMember":    result = addMember(data.member);   break;
      case "updateMember": result = updateMember(data.member);break;
      case "addStamp":     result = addStamp(data.phone);     break;
      case "redeemReward": result = redeemReward(data.phone); break;
      case "deleteMember": result = deleteMember(data.phone); break;
      default: result = { ok: false, error: "Unknown action" };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Also handle GET (for testing in browser)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Topepop Tea API is running! 🧋" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Get or create the Members sheet ──
function getMembersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers
    sheet.appendRow(["ID", "Name", "Phone", "Birthday", "Stamps", "JoinDate", "PendingReward", "LastVisit"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#5a7a2e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getHistorySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HISTORY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(HISTORY_SHEET);
    sheet.appendRow(["Timestamp", "Phone", "Name", "Action", "StampsAfter"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#2f2b1e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Row ↔ Object helpers ──
function rowToMember(row) {
  return {
    id:            row[0],
    name:          row[1],
    phone:         row[2],
    birthday:      row[3],
    stamps:        Number(row[4]) || 0,
    joinDate:      row[5],
    pendingReward: row[6] === true || row[6] === "TRUE" || row[6] === "Yes",
    lastVisit:     row[7] || ""
  };
}

function memberToRow(m) {
  return [
    m.id || "",
    m.name || "",
    m.phone || "",
    m.birthday || "",
    m.stamps || 0,
    m.joinDate || "",
    m.pendingReward ? "Yes" : "No",
    m.lastVisit || ""
  ];
}

function cleanPhone(p) {
  return (p || "").replace(/\s/g, "");
}

// Find row index (1-based, returns -1 if not found)
function findRow(phone) {
  const sheet = getMembersSheet();
  const data  = sheet.getDataRange().getValues();
  const clean = cleanPhone(phone);
  for (let i = 1; i < data.length; i++) {
    if (cleanPhone(String(data[i][2])) === clean) return i + 1; // 1-based
  }
  return -1;
}

// ── ACTIONS ──

function getAllMembers() {
  const sheet = getMembersSheet();
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { ok: true, members: [] };
  const members = data.slice(1).map(rowToMember);
  return { ok: true, members };
}

function getMember(phone) {
  const rowIdx = findRow(phone);
  if (rowIdx < 0) return { ok: false, error: "Not found" };
  const sheet = getMembersSheet();
  const row   = sheet.getRange(rowIdx, 1, 1, 8).getValues()[0];
  return { ok: true, member: rowToMember(row) };
}

function addMember(member) {
  // Check duplicate
  if (findRow(member.phone) > 0) return { ok: false, error: "Phone already registered" };
  const sheet = getMembersSheet();
  const id    = Date.now().toString();
  const now   = new Date().toISOString().split("T")[0];
  const newM  = { ...member, id, stamps: 0, joinDate: now, pendingReward: false, lastVisit: now };
  sheet.appendRow(memberToRow(newM));
  logHistory(member.phone, member.name, "signup", 0);
  return { ok: true, member: newM };
}

function updateMember(member) {
  const rowIdx = findRow(member.phone);
  if (rowIdx < 0) return addMember(member); // auto-add if not found
  const sheet = getMembersSheet();
  sheet.getRange(rowIdx, 1, 1, 8).setValues([memberToRow(member)]);
  return { ok: true, member };
}

function addStamp(phone) {
  const rowIdx = findRow(phone);
  if (rowIdx < 0) return { ok: false, error: "Member not found" };
  const sheet  = getMembersSheet();
  const row    = sheet.getRange(rowIdx, 1, 1, 8).getValues()[0];
  const member = rowToMember(row);

  member.stamps++;
  member.lastVisit = new Date().toISOString();

  const STAMPS_FOR_REWARD = 10;
  if (member.stamps % STAMPS_FOR_REWARD === 0) {
    member.pendingReward = true;
  }

  sheet.getRange(rowIdx, 1, 1, 8).setValues([memberToRow(member)]);
  logHistory(phone, member.name, "stamp", member.stamps);
  return { ok: true, member, earnedReward: member.pendingReward };
}

function redeemReward(phone) {
  const rowIdx = findRow(phone);
  if (rowIdx < 0) return { ok: false, error: "Member not found" };
  const sheet  = getMembersSheet();
  const row    = sheet.getRange(rowIdx, 1, 1, 8).getValues()[0];
  const member = rowToMember(row);
  if (!member.pendingReward) return { ok: false, error: "No reward pending" };
  member.pendingReward = false;
  sheet.getRange(rowIdx, 1, 1, 8).setValues([memberToRow(member)]);
  logHistory(phone, member.name, "redeem", member.stamps);
  return { ok: true, member };
}

function deleteMember(phone) {
  const rowIdx = findRow(phone);
  if (rowIdx < 0) return { ok: false, error: "Not found" };
  getMembersSheet().deleteRow(rowIdx);
  return { ok: true };
}

function logHistory(phone, name, action, stampsAfter) {
  const sheet = getHistorySheet();
  sheet.appendRow([new Date().toISOString(), phone, name, action, stampsAfter]);
}
