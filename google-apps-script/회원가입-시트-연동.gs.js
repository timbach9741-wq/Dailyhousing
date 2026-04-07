function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("회원가입");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // 승인 상태 업데이트 액션 처리
    if (data.action === 'updateApproval') {
      var lastRow = sheet.getLastRow();
      for (var i = 2; i <= lastRow; i++) {
        if (sheet.getRange(i, 4).getValue() === data.email) { // 4열 = 이메일
          var statusText = data.approved ? "가입완료" : "승인대기";
          var statusBgColor = data.approved ? "#d1e7dd" : "#fff3cd";
          sheet.getRange(i, 10).setValue(statusText).setBackground(statusBgColor).setFontWeight("bold");
          break;
        }
      }
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, action: 'updateApproval' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "가입일시", "회원유형", "성함", "이메일", "휴대폰",
        "업체명", "사업자등록번호", "국세청인증", "등록증파일", "승인상태"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground("#1a1a2e");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    var roleText = data.role === "business" ? "사업자" : "일반";
    var ntsText = data.ntsVerified ? "인증됨" : "-";
    var statusText = data.approved ? "가입완료" : "승인대기";
    var statusBgColor = data.approved ? "#d1e7dd" : "#fff3cd";
    
    sheet.appendRow([
      data.createdAt || new Date().toLocaleString("ko-KR"),
      roleText,
      data.displayName || "",
      data.email || "",
      data.phoneNumber || "",
      data.companyName || "-",
      data.registrationNumber || "-",
      ntsText,
      data.licenseFileUrl || "-",
      statusText
    ]);
    
    var lastRow = sheet.getLastRow();
    var newRange = sheet.getRange(lastRow, 1, 1, 10);
    newRange.setBorder(true, true, true, true, true, true);
    sheet.getRange(lastRow, 10).setBackground(statusBgColor).setFontWeight("bold");
    
    if (lastRow === 2) {
      sheet.autoResizeColumns(1, 10);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, row: lastRow })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "데일리하우징 회원가입 웹훅 활성" })
  ).setMimeType(ContentService.MimeType.JSON);
}
