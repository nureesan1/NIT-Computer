
/**
 * NIT Computer Solution LTD. - Google Sheets Database API (Backend V2)
 * รองรับ: รายรับ-จ่าย, สต๊อกสินค้า, และการจัดการใบงาน (Repair/Installation/System)
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // กำหนดโครงสร้าง Headers ของแต่ละ Sheet ให้ตรงกับ Types ใน App
  const schema = {
    'Transactions': ['id', 'date', 'description', 'category', 'amount', 'type', 'paymentMethod'],
    'Products': ['id', 'code', 'name', 'cost', 'quantity', 'unit', 'minStockThreshold'],
    'Tasks': [
      'id', 
      'type', 
      'title', 
      'description', 
      'startDate', 
      'endDate', 
      'location', 
      'assignee', 
      'status', 
      'estimatedCost', 
      'deposit',  // เพิ่มฟิลด์มัดจำ
      'customer'  // เก็บเป็น JSON string
    ]
  };

  const responseData = {};
  
  // ดึงข้อมูลจากทุก Sheet
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
        // จัดการข้อมูลลูกค้าที่เป็น Object ให้เป็น String ก่อนลง Sheet
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

/**
 * Helper: สร้าง JSON Response พร้อมตั้งค่า CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: ดึงข้อมูลจาก Sheet และแปลงเป็น Array of Objects
 */
function getSheetData(ss, sheetName, defaultHeaders) {
  let sheet = ss.getSheetByName(sheetName);
  
  // ถ้าไม่มี Sheet ให้สร้างใหม่พร้อม Header
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
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // จัดการเรื่องวันที่
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      // ตรวจสอบว่าเป็น JSON String หรือไม่ (สำหรับข้อมูล Customer)
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try { 
          value = JSON.parse(value); 
        } catch(e) {
          // ถ้า parse ไม่ได้ให้ใช้ค่า string เดิม
        }
      }
      
      obj[header] = value;
    });
    return obj;
  });
  
  return data;
}

/**
 * Helper: เพิ่มแถวข้อมูลใหม่
 */
function appendRow(ss, sheetName, dataObj) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = headers.map(header => {
    const val = dataObj[header];
    if (val === undefined || val === null) return '';
    // ถ้าเป็น Object (เช่น customer) ให้แปลงเป็น JSON String
    return (typeof val === 'object') ? JSON.stringify(val) : val;
  });
  
  sheet.appendRow(row);
}

/**
 * Helper: อัปเดตข้อมูลในแถวที่ระบุ
 */
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

/**
 * Helper: ลบแถวข้อมูล
 */
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
