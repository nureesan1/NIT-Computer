
/**
 * NIT Consulting Solution LTD. - Google Sheets Database API (Backend V4.1)
 * ระบบออกใบเสร็จรับเงินสดและบันทึกรายรับลงตาราง Sheets อัตโนมัติ
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schema = {
    'Transactions': ['id', 'date', 'description', 'category', 'amount', 'type', 'paymentMethod'],
    // ลำดับหัวตารางตามที่ผู้ใช้กำหนด: วันที่ | เลขที่ใบเสร็จ | ชื่อผู้ชำระ | ยอดเงิน | วิธีชำระ
    'Receipts': ['date', 'receiptId', 'payerName', 'amount', 'paymentMethod', 'notes'],
    'Products': ['id', 'code', 'name', 'cost', 'quantity', 'unit', 'minStockThreshold'],
    'Tasks': ['id', 'type', 'title', 'description', 'startDate', 'endDate', 'location', 'assignee', 'status', 'estimatedCost', 'deposit', 'customer'],
    'CompanyProfile': ['name', 'address', 'phone', 'email', 'taxId', 'website', 'logo', 'bankName', 'accountName', 'accountNumber', 'qrCode']
  };

  const responseData = {};
  Object.keys(schema).forEach(sheetName => {
    responseData[sheetName.toLowerCase()] = getSheetData(ss, sheetName, schema[sheetName]);
  });
  
  return createJsonResponse({ status: 'success', data: responseData });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received');
    }

    const contents = e.postData.contents;
    const body = JSON.parse(contents);
    const { action, data } = body;
    
    if (!action) throw new Error('No action specified');

    switch (action) {
      case 'ADD_RECEIPT': appendRow(ss, 'Receipts', data); break;
      case 'ADD_TRANSACTION': appendRow(ss, 'Transactions', data); break;
      case 'ADD_PRODUCT': appendRow(ss, 'Products', data); break;
      case 'UPDATE_PRODUCT': updateRow(ss, 'Products', 'id', data.id, data); break;
      case 'DELETE_PRODUCT': deleteRow(ss, 'Products', 'id', data.id); break;
      case 'ADD_TASK':
        if (data.customer && typeof data.customer === 'object') data.customer = JSON.stringify(data.customer);
        appendRow(ss, 'Tasks', data); 
        break;
      case 'UPDATE_TASK_STATUS': updateRow(ss, 'Tasks', 'id', data.id, { status: data.status }); break;
      case 'DELETE_TASK': deleteRow(ss, 'Tasks', 'id', data.id); break;
      case 'UPDATE_COMPANY_PROFILE': saveCompanyProfile(ss, data); break;
      default: throw new Error('Unknown action: ' + action);
    }
    
    return createJsonResponse({ status: 'success', action: action });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, sheetName, defaultHeaders) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
    sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
    return [];
  }
  const range = sheet.getDataRange();
  const rows = range.getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if (value instanceof Date) value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try { value = JSON.parse(value); } catch(e) {}
      }
      obj[header] = value;
    });
    return obj;
  });
}

function appendRow(ss, sheetName, dataObj) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    const val = dataObj[header];
    return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val || '';
  });
  sheet.appendRow(row);
  SpreadsheetApp.flush();
}

function updateRow(ss, sheetName, keyField, keyValue, newData) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyField);
  if (keyIndex === -1) return;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIndex]) === String(keyValue)) {
      headers.forEach((header, colIndex) => {
        if (newData[header] !== undefined) {
           let val = newData[header];
           sheet.getRange(i + 1, colIndex + 1).setValue(typeof val === 'object' ? JSON.stringify(val) : val);
        }
      });
      break;
    }
  }
  SpreadsheetApp.flush();
}

function deleteRow(ss, sheetName, keyField, keyValue) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyField);
  if (keyIndex === -1) return;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIndex]) === String(keyValue)) {
      sheet.deleteRow(i + 1); break;
    }
  }
  SpreadsheetApp.flush();
}

function saveCompanyProfile(ss, dataObj) {
  const sheetName = 'CompanyProfile';
  let sheet = ss.getSheetByName(sheetName);
  const headers = ['name', 'address', 'phone', 'email', 'taxId', 'website', 'logo', 'bankName', 'accountName', 'accountNumber', 'qrCode'];
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); 
    sheet.clear();
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    const row = headers.map(h => dataObj[h] || '');
    sheet.appendRow(row);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}
