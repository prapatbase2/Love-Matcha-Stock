/**
 * Love Matcha Stock Backup Web App v1.0.0
 * Deploy: Apps Script > Deploy > New deployment > Web app
 * Execute as: Me
 * Who has access: Anyone with the link
 */
const FOLDER_NAME = 'LoveMatcha_Stock_Backups';

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const folder = getOrCreateFolder_(FOLDER_NAME);
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    const baseName = `LoveMatcha_Stock_Backup_${stamp}`;

    const jsonFile = folder.createFile(`${baseName}.json`, JSON.stringify(payload, null, 2), MimeType.JSON);
    const ss = SpreadsheetApp.create(baseName);
    const ssFile = DriveApp.getFileById(ss.getId());
    folder.addFile(ssFile);
    try { DriveApp.getRootFolder().removeFile(ssFile); } catch (err) {}

    writeSheet_(ss, 'Meta', [
      ['app', payload.app || 'Love Matcha Stock'],
      ['version', payload.version || ''],
      ['exportedAt', payload.exportedAt || ''],
      ['exportedBy', payload.exportedBy ? JSON.stringify(payload.exportedBy) : '']
    ]);
    writeObjects_(ss, 'Stock', (payload.data && payload.data.stockByBranch) || []);
    writeObjects_(ss, 'Transactions', (payload.data && payload.data.transactions) || []);
    writeObjects_(ss, 'Transfers', (payload.data && payload.data.transferRequests) || []);
    writeObjects_(ss, 'Users', sanitizeUsers_((payload.data && payload.data.users) || []));
    writeObjects_(ss, 'Branches', (payload.data && payload.data.branches) || []);
    writeObjects_(ss, 'Teas', (payload.data && payload.data.teas) || []);
    writeObjects_(ss, 'Sizes', (payload.data && payload.data.sizes) || []);

    return jsonOutput_({
      ok: true,
      app: 'Love Matcha Stock Backup v1.0.0',
      folderName: FOLDER_NAME,
      jsonFileId: jsonFile.getId(),
      sheetFileId: ss.getId(),
      time: new Date().toISOString()
    });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return jsonOutput_({ ok: true, message: 'Love Matcha Stock Backup Web App พร้อมใช้งาน: ส่ง POST เพื่อสร้าง JSON และ Google Sheet ใน Drive', folderName: FOLDER_NAME });
}

function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function writeSheet_(ss, name, values) {
  let sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  if (values && values.length) sh.getRange(1, 1, values.length, values[0].length).setValues(values);
  sh.autoResizeColumns(1, Math.max(1, values[0] ? values[0].length : 1));
}

function writeObjects_(ss, name, objects) {
  if (!objects || !objects.length) return writeSheet_(ss, name, [['empty']]);
  const headers = Array.from(objects.reduce((set, obj) => {
    Object.keys(flatten_(obj)).forEach(k => set.add(k));
    return set;
  }, new Set()));
  const rows = [headers].concat(objects.map(obj => {
    const flat = flatten_(obj);
    return headers.map(h => flat[h] === undefined ? '' : flat[h]);
  }));
  writeSheet_(ss, name, rows);
}

function flatten_(obj, prefix, out) {
  out = out || {};
  Object.keys(obj || {}).forEach(k => {
    const key = prefix ? prefix + '.' + k : k;
    const v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten_(v, key, out);
    else out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
  });
  return out;
}

function sanitizeUsers_(users) {
  // เก็บ PIN ตาม requirement เจ้าของเห็น/backup ได้ แต่ถ้าต้องการตัด PIN ออกจาก sheet ให้แก้ตรงนี้
  return users;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
