function doPost(e) {
  // Your code here
}

function doGet(e) {
  // Your code here
}

function getMembersSheet() {
  // Your code here
}

function getHistorySheet() {
  // Your code here
}

function rowToMember(row) {
  // Your code here
}

function memberToRow(member) {
  // Your code here
}

function cleanPhone(phone) {
  // Your code here
}

function findRow(sheet, criteria) {
  // Your code here
}

function getAllMembers() {
  // Your code here
}

function getMember(id) {
  // Your code here
}

function addMember(member) {
  // Your code here
}

function updateMember(member) {
  // Your code here
}

function addStamp(id) {
  const member = getMember(id);
  if (member) {
    member.lastVisit = new Date().toISOString().split("T")[0];  // Update to store date in YYYY-MM-DD format
    updateMember(member);
  }
}

function redeemReward(id, reward) {
  // Your code here
}

function deleteMember(id) {
  // Your code here
}

function logHistory(entry) {
  // Your code here
}