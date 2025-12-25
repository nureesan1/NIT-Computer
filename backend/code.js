/**
 * NIT Computer Solution LTD. - Google Sheets Database API (Backend)
 * 
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheet ที่คุณสร้างไว้
 * 2. ไปที่เมนู Extensions > Apps Script
 * 3. ลบโค้ดเก่าใน editor ออกให้หมด และวางโค้ดชุดนี้ลงไป
 * 4. กดบันทึก (แผ่นดิสก์)
 * 5. กด Deploy > New deployment
 * 6. เลือก Type เป็น "Web app"
 * 7. ตั้งค่า Execute as: "Me" และ Who has access: "Anyone"
 * 8. กด Deploy และคัดลอก Web App URL (ซึ่งควรจะเป็น URL เดียวกับที่คุณได้รับมา)
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // กำหนดโครงสร้าง Headers ของแต่ละ Sheet
  const schema = {
    'Transactions': ['id', 'date', 'description', 'category', 'amount', 'type', 'paymentMethod'],
    'Products': ['id', 'code', 'name', 'cost', 'quantity', 'unit', 'minStockThreshold'],
    'Tasks': ['id', 'type', 'title', 'description', 'startDate', 'endDate', 'location', 'assignee', 'status', 'estimatedCost', 'customer']
  };

  const responseData = {};
  
  // ดึงข้อมูลจากทุก Sheet ตาม Schema
  Object.keys(schema).forEach(sheetName => {
    responseData[sheetName.toLowerCase()] = getSheetData(ss, sheetName, schema[sheetName]);
  });
  
  return createJsonResponse({
    status: 'success',
    data: responseData
  });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, data } = body;
    
    switch (action) {
      case 'ADD_TRANSACTION':
        appendRow(ss, 'Transactions', data);
        break;
      case 'ADD_PRODUCT':
        appendRow(ss, 'Products', data);
        break;
      case 'UPDATE_PRODUCT':
        updateRow(ss, 'Products', 'id', data.id, data);
        break;
      case 'DELETE_PRODUCT':
        deleteRow(ss, 'Products', 'id', data.id);
        break;
      case 'ADD_TASK':
        // จัดการข้อมูลลูกค้าที่เป็น Object
        if (data.customer && typeof data.customer === 'object') {
          data.customer = JSON.stringify(data.customer);
        }
        appendRow(ss, 'Tasks', data);
        break;
      case 'UPDATE_TASK_STATUS':
        updateRow(ss, 'Tasks', 'id', data.id, { status: data.status });
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return createJsonResponse({ status: 'success' });
      
  } catch (error) {
    return createJsonResponse({ 
      status: 'error', 
      message: error.toString() 
    });
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
    return [];
  }
  
  const range = sheet.getDataRange();
  const rows = range.getValues();
  
  if (rows.length < 2) return [];
  
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try { 
          value = JSON.parse(value); 
        } catch(e) {}
      }
      
      obj[header] = value;
    });
    return obj;
  });
  
  return data;
}

function appendRow(ss, sheetName, dataObj) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = headers.map(header => {
    const val = dataObj[header];
    if (val === undefined || val === null) return '';
    return (typeof val === 'object') ? JSON.stringify(val) : val;
  });
  
  sheet.appendRow(row);
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
           if (typeof val === 'object' && val !== null) {
             val = JSON.stringify(val);
           }
           sheet.getRange(i + 1, colIndex + 1).setValue(val);
        }
      });
      break;
    }
  }
}

function deleteRow(ss, sheetName, keyField, keyValue) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyField);
  
  if (keyIndex === -1) return;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIndex]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}