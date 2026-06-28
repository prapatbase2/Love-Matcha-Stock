# Love Matcha Stock PWA v1.0.0

ระบบ PWA สำหรับจดบันทึก stock มัทฉะ เข้า/ออก/นับใหม่/รีแพค/โอนระหว่างสาขา รองรับมือถือจอแคบ ใช้ Firebase Firestore เป็นฐานข้อมูล realtime และมี Google Drive Backup ผ่าน Apps Script

## 1) โครงสร้างไฟล์

```text
love-matcha-stock-v1.0.0/
├─ index.html
├─ styles.css
├─ app.js
├─ seed-data.js
├─ firebase-config.js
├─ firebase-config.example.js
├─ manifest.json
├─ service-worker.js
├─ firestore.rules
├─ README.md
├─ assets/
│  ├─ logo.jpg
│  └─ icons/
│     ├─ icon-192.png
│     ├─ icon-512.png
│     └─ maskable-512.png
└─ google-apps-script/
   └─ Code.gs
```

## 2) ข้อมูลเริ่มต้นที่ใส่มาแล้ว

ระบบสร้าง seed จากไฟล์ `Stock Matcha(4).xlsx` โดยอ่านชีต:

- Stock รวม
- หนองคาย
- อุดรธานี
- ศรีราชา
- นครพนม
- ออกบูธ
- ตัวอย่างการกรอกข้อมูล

ข้อมูล seed ใช้ stock ปัจจุบันจากชีตสาขา และมีสาขาเริ่มต้น 5 สาขา:

1. หนองคาย
2. อุดรธานี
3. ศรีราชา
4. นครพนม
5. ออกบูธ

รายการชาใน seed มี 20 รายการ ได้แก่รายการที่กำหนด และรายการที่พบเพิ่มใน Excel คือ `มัทฉะ 19`, `มัทฉะ 20` เพื่อเก็บข้อมูลจากไฟล์เดิมให้ครบที่สุด

ขนาดเริ่มต้น:

- 40 gm
- 100 gm
- 500 gm
- 1000 gm

owner เริ่มต้น:

- ชื่อ: เจ้าของ
- บทบาท: owner
- PIN: 1234

หลังเข้าใช้ครั้งแรกให้เปลี่ยน PIN ทันที

## 3) ตั้งค่า Firebase แบบละเอียด

### 3.1 สร้าง Firebase Project

1. เข้า Firebase Console
2. Add project
3. ตั้งชื่อ เช่น `love-matcha-stock`
4. ปิดหรือเปิด Google Analytics ได้ตามต้องการ
5. Create project

### 3.2 เปิด Firestore

1. Build > Firestore Database
2. Create database
3. เลือก Production mode ได้
4. เลือก region ที่ใกล้ไทย เช่น asia-southeast1 ถ้ามีให้เลือก
5. Create

### 3.3 เปิด Authentication แบบ Anonymous

1. Build > Authentication
2. Get started
3. Sign-in method
4. เปิด Anonymous
5. Save

ระบบนี้ใช้ Anonymous Auth เพื่อให้ Firestore rules รู้ว่าเป็นผู้ใช้ที่ sign-in แล้ว ส่วน PIN/role เป็นระบบภายในแอป

### 3.4 เอา Firebase config มาใส่

1. Project settings > General
2. ในหัวข้อ Your apps กด Web app `</>`
3. ตั้งชื่อ app เช่น `Love Matcha Stock Web`
4. คัดลอก `firebaseConfig`
5. เปิดไฟล์ `firebase-config.js`
6. แทนค่าตัวอย่าง เช่น

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "love-matcha-stock.firebaseapp.com",
  projectId: "love-matcha-stock",
  storageBucket: "love-matcha-stock.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

ถ้าไม่ใส่ config ระบบจะเปิดได้เป็นโหมดทดลองในเครื่อง แต่ไม่ realtime ข้ามเครื่อง

## 4) Firebase Security Rules เบื้องต้น

เปิด Firestore Database > Rules แล้ววางไฟล์ `firestore.rules`

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /{document=**} {
      allow read, write: if signedIn();
    }
  }
}
```

หมายเหตุสำคัญ: rules นี้เหมาะเป็นระดับเริ่มต้นสำหรับระบบภายในร้านที่ใช้ PIN ในแอป หากต้องการความปลอดภัยสูงมาก ควรย้ายการตรวจสิทธิ์สำคัญ เช่น owner/manager/employee, restore, reset PIN ไป Cloud Functions หรือใช้ Firebase Auth account + Custom Claims

## 5) ติดตั้งข้อมูลเริ่มต้นใน Firebase

1. อัปโหลดขึ้น GitHub Pages หรือเปิดผ่าน local web server
2. เปิดเว็บ
3. ถ้า Firebase config ถูกต้องและยังไม่มี user ระบบจะแสดงปุ่ม `ติดตั้งข้อมูลเริ่มต้น v1.0.0`
4. กดปุ่มนี้
5. Login ด้วย `เจ้าของ` / PIN `1234`
6. เข้า Settings > ข้อมูลของฉัน > เปลี่ยน PIN

## 6) Google Drive Auto Backup ด้วย Apps Script

### 6.1 สร้าง Apps Script

1. เข้า Google Drive
2. New > More > Google Apps Script
3. ตั้งชื่อ `LoveMatcha Stock Backup`
4. ลบ code เดิม แล้ววางไฟล์ `google-apps-script/Code.gs`
5. Save

### 6.2 Deploy เป็น Web App

1. กด Deploy > New deployment
2. Select type > Web app
3. Description: `Love Matcha Stock Backup v1.0.0`
4. Execute as: `Me`
5. Who has access: `Anyone with the link`
6. Deploy
7. กดยืนยันสิทธิ์ Google Drive
8. คัดลอก Web App URL ที่ลงท้าย `/exec`

### 6.3 ใส่ URL ในแอป

1. Login ด้วย owner
2. Settings > สำรองข้อมูล
3. วาง Google Apps Script Web App URL
4. เลือก Auto Backup เช่น ทุก 30 นาที / 1 ชั่วโมง / ทุกวัน / เมื่อมีรายการใหม่
5. กดบันทึก
6. กด Backup ไป Google Drive ตอนนี้ เพื่อทดสอบ

ระบบจะสร้างโฟลเดอร์ `LoveMatcha_Stock_Backups` ใน Google Drive และสร้างทั้ง JSON + Google Sheet

## 7) อัปโหลดขึ้น GitHub Pages

1. สร้าง repository ใหม่ เช่น `Love-Matcha-Stock`
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repo
3. ไปที่ Settings > Pages
4. Source: Deploy from a branch
5. Branch: `main` / root
6. Save
7. รอ GitHub แสดง URL เช่น `https://username.github.io/Love-Matcha-Stock/`

หลังแก้ไฟล์ `firebase-config.js` แล้ว commit/push ใหม่ รอ GitHub Pages deploy แล้วค่อยเปิดใช้งาน

## 8) ติดตั้ง PWA บนมือถือ

### Android / Chrome

1. เปิด URL GitHub Pages ด้วย Chrome
2. กดเมนูจุดสามจุด
3. เลือก `Add to Home screen` หรือ `Install app`
4. กด Install
5. เปิดจากไอคอน Love Matcha Stock บนหน้าจอมือถือ

### iPhone / Safari

1. เปิด URL ด้วย Safari
2. กดปุ่ม Share
3. เลือก `Add to Home Screen`
4. กด Add
5. เปิดจากไอคอนบนหน้าจอ

## 9) วิธีใช้งานตามบทบาท

### เจ้าของ

ทำได้ทั้งหมด:

- เพิ่ม/แก้/ปิดใช้ user
- เห็น PIN และ reset PIN
- เพิ่ม/แก้/ปิดใช้สาขา
- เพิ่ม/แก้/ปิดใช้ชา
- เพิ่ม/ปิดใช้ขนาด
- ตั้งค่าเตือนใกล้หมด
- เปลี่ยนสีธีม/ขนาดตัวอักษร/โลโก้
- ซ่อน/แสดงกลับประวัติ
- Export/Backup/Restore
- ตั้งค่า Google Drive Backup

### ผู้จัดการ

- เพิ่ม/ลด/นับใหม่ stock
- ส่งของ/ยืนยันรับโอน
- ดูทุกสาขาและประวัติ
- เพิ่ม/แก้ชื่อชา
- ตั้งค่าแจ้งเตือนใกล้หมด
- เพิ่ม/ปิดใช้ user เฉพาะพนักงาน
- Export backup ได้ ถ้า owner อนุญาต
- Restore ไม่ได้
- ไม่เห็น PIN คนอื่น

### พนักงาน

- เพิ่ม stock
- ลด stock
- นับใหม่
- ส่งของให้สาขาอื่น
- ยืนยันรับของเข้าสต๊อกสาขาปลายทางของตัวเอง
- ดู stock ทุกสาขา
- ดูประวัติที่ไม่ได้ซ่อนไว้
- เปลี่ยน PIN ตัวเอง
- เข้า user management/แก้รายการชา/แก้สาขา/restore ไม่ได้

## 10) Workflow สำคัญ

### เพิ่ม/ลด stock

ระบบใช้ Firestore transaction อ่านยอดล่าสุดก่อนเขียนทุกครั้ง ป้องกันการกดพร้อมกันแล้ว stock ชนกัน

### โอนระหว่างสาขา

1. ต้นทางเลือกส่งให้สาขาอื่น
2. stock ต้นทางลดทันที
3. สร้างรายการ `pending`
4. ปลายทางเห็นรายการรอยืนยัน
5. ถ้ารับครบ กดรับเข้า stock ปลายทางจึงเพิ่ม
6. ถ้าจำนวนไม่ตรง กดไม่ตรง/ปฏิเสธ พร้อมระบุจำนวนจริงและหมายเหตุ ระบบบันทึกเป็นรายการต้องตรวจสอบ และไม่เพิ่ม stock ปลายทางเอง

### รีแพคแปลงขนาด

ตัวอย่าง: ลด 1000 gm 1 ถุง เพิ่ม 40 gm 25 ถุง ระบบจะบันทึก log ทั้งขาออกและขาเข้า และแสดงกรัมรวมโดยประมาณ

### Offline mode

PWA cache ไฟล์หลักไว้ เปิดดูข้อมูลล่าสุดได้ แต่ปุ่มบันทึก/เพิ่ม/ลด/นับใหม่/โอน/ยืนยันจะ disabled และมีข้อความเตือน `ออฟไลน์อยู่ กรุณาต่ออินเตอร์เน็ตก่อน`

## 11) Checklist ทดสอบก่อนใช้งานจริง

- [ ] เปิดเว็บแล้วไม่ขึ้น error console สำคัญ
- [ ] ใส่ Firebase config ถูกต้อง
- [ ] Anonymous Auth เปิดแล้ว
- [ ] Firestore Rules publish แล้ว
- [ ] กด seed ข้อมูลเริ่มต้นสำเร็จ
- [ ] Login owner / 1234 ได้
- [ ] เปลี่ยน PIN owner แล้ว
- [ ] เพิ่ม user พนักงานแต่ละสาขา
- [ ] เปิดพร้อมกัน 2 มือถือ แล้วเพิ่ม stock เห็น realtime ทั้งสองเครื่อง
- [ ] ลองลด stock เกินยอด ระบบต้องห้ามบันทึกติดลบ
- [ ] ลองส่งของจากสาขา A ไป B แล้วตรวจว่าต้นทางลดทันที ปลายทางยังไม่เพิ่มจนกดยืนยัน
- [ ] ลองกดรับโอนไม่ตรง ระบบต้องแสดงในหน้าผิดปกติ
- [ ] ลองตั้ง threshold แล้ว Dashboard แสดง badge ใกล้หมด
- [ ] ลองซ่อนประวัติด้วย owner แล้วพนักงานไม่เห็น
- [ ] Export JSON/CSV/Excel ได้
- [ ] ตั้ง Apps Script backup URL และกด backup แล้วเห็นไฟล์ใน Google Drive
- [ ] ติดตั้ง PWA บน Android/iPhone ได้
- [ ] ทดสอบออฟไลน์: เปิดดูได้ แต่บันทึกไม่ได้

## 12) Version

ระบบนี้คือ `Love Matcha Stock v1.0.0`
