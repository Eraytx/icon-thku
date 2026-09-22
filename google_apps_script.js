/**
 * iCON - Türk Hava Kurumu Üniversitesi
 * Google Sheets / Excel Otomatik Başvuru Kayıt Scripti
 *
 * Kurulum:
 * 1. Google Drive'da yeni bir Google E-Tablo (Excel) oluşturun (örn: "iCON 2026 Başvuruları").
 * 2. Üst menüden: Uzantılar (Extensions) > Apps Script yolunu izleyin.
 * 3. Açılan editördeki mevcut kodu silip aşağıdaki kodu yapıştırın ve kaydedin (Ctrl+S).
 * 4. Sağ üstteki "Dağıt" (Deploy) > "Yeni Dağıtım" (New Deployment) seçeneğine tıklayın.
 * 5. Sol taraftaki çark simgesinden "Web Uygulaması" (Web App) seçin.
 * 6. "Açıklama": "iCON Form API" yazın.
 * 7. "Erişimi olanlar" (Who has access) kısmını mutlaka "Herkes" (Anyone) olarak seçin.
 * 8. "Dağıt" butonuna basın, Google hesabınızla izinleri onaylayın.
 * 9. Oluşturulan "Web Uygulaması URL'si"ni kopyalayın ve main.js içerisindeki GOOGLE_APPS_SCRIPT_URL değişkenine yapıştırın.
 */

const SPREADSHEET_ID = "1HgIk1uXtuNLqN99XEvV5co7pvmG39xAxlgWuk8cc4DM";

function doPost(e) {
  try {
    var ss = SPREADSHEET_ID 
      ? SpreadsheetApp.openById(SPREADSHEET_ID) 
      : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet() || ss.getSheets()[0];
    
    // İlk satır başlıkları yoksa otomatik oluştur
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Kayıt No",
        "Tarih & Saat",
        "Ad Soyad",
        "Öğrenci Numarası",
        "Bölüm / Program",
        "E-Posta Adresi",
        "Motivasyon"
      ]);
      
      // Başlık formatı
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0284c7");
      headerRange.setFontColor("#ffffff");
    }

    var data = JSON.parse(e.postData.contents);
    var nextRowId = Math.max(1, sheet.getLastRow());

    // Yeni satır olarak ekle
    sheet.appendRow([
      nextRowId,
      new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
      data.fullName || "",
      data.studentId || "",
      data.department || "",
      data.email || "",
      data.motivation || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("iCON Apps Script API Aktif.")
    .setMimeType(ContentService.MimeType.TEXT);
}
