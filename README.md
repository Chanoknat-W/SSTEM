# SST-EM — แบบประเมินการจัดการศึกษาสำหรับครูในสถานศึกษาขนาดเล็ก

> Small School Teacher Evaluation Model

---

## ภาพรวม

เว็บแอปสำหรับให้ครูในโรงเรียนขนาดเล็กประเมินตนเองตามโมเดล SST-EM  
อิงโครงสร้าง Hammond's Cube 3 มิติ ผ่านแบบประเมิน 18 ข้อ + Reflection P-A-R-I + ผลสรุปพร้อมกราฟ

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | HTML + CSS + Vanilla JavaScript |
| Database | Supabase |
| Hosting | Vercel |
| Charts | Chart.js |

---

## โครงสร้างไฟล์

```
sst-em/
├── index.html           # หน้า 1: กรอกข้อมูลครู
├── domain1.html         # หน้า 2: ด้านที่ 1 — การจัดการเรียนรู้
├── domain2.html         # หน้า 3: ด้านที่ 2 — สถาบันและบริบท
├── domain3.html         # หน้า 4: ด้านที่ 3 — พฤติกรรมวิชาชีพ
├── reflect.html         # หน้า 5: Reflection P-A-R-I
├── result.html          # หน้า 6: ผลสรุป + Radar Chart + พิมพ์
├── dashboard.html       # หน้า Admin: สรุปข้อมูลทุกคน + Export CSV
├── css/
│   └── style.css        # สไตล์ทั้งหมด (responsive + print)
├── js/
│   ├── questions.js     # คำถาม 18 ข้อ พร้อม choices + คะแนน
│   ├── state.js         # localStorage helpers + level logic
│   ├── domain-page.js   # logic ร่วมหน้า 2–4
│   └── supabase.js      # Supabase client + insert/fetch
├── supabase-schema.sql  # SQL สร้าง table
└── vercel.json          # Vercel config
```

---

## 3 ด้านการประเมิน

### ด้านที่ 1: การจัดการเรียนรู้ (Curriculum & Instruction)
- ความเชี่ยวชาญในหลักสูตร ความสามารถในการปรับปรุงและยืดหยุ่นให้เข้ากับท้องถิ่น
- การนำสื่อท้องถิ่นมาใช้

### ด้านที่ 2: สถาบันและบริบท (Institutional & Community)
- ความเข้มแข็งในการประสานงานกับผู้ปกครองและปราชญ์ท้องถิ่น
- การสนับสนุนทรัพยากรและการสื่อสารที่เข้าถึงง่ายระหว่างโรงเรียนและชุมชน

### ด้านที่ 3: พฤติกรรมวิชาชีพ (Professional Behavior)
- ความรู้ลึกซึ้งในการจัดการเรียนรู้และวิเคราะห์หลักสูตร
- เจตคติที่ดีต่อบริบทโรงเรียนขนาดเล็ก มุ่งมั่นพัฒนาผู้เรียนแม้ทรัพยากรน้อย
- การสอนที่คล่องแคล่ว ความสามารถในการแก้ปัญหาเฉพาะหน้า

---

## เกณฑ์การให้คะแนน

| ระดับ | คะแนนรวม (/72) | คะแนนรายด้าน (/24) |
|---|---|---|
| ดีมาก | 60–72 | 20–24 |
| ดี | 46–59 | 15–19 |
| พอใช้ | 31–45 | 10–14 |
| ปรับปรุง | 0–30 | 0–9 |

---

## การตั้งค่า Supabase

1. สร้าง project ที่ [supabase.com](https://supabase.com)
2. ไปที่ **SQL Editor** → paste ไฟล์ `supabase-schema.sql` → Run
3. ไปที่ **Settings → API** → copy `Project URL` และ `anon/publishable key`
4. แก้ไขไฟล์ `js/supabase.js`:

```js
const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

---

## การ Deploy บน Vercel

```bash
git add .
git commit -m "deploy"
git push origin main
```

Import repo ใน [vercel.com](https://vercel.com) → Deploy อัตโนมัติทุกครั้งที่ push

---

## หน้า Dashboard (Admin)

เข้าถึงได้ที่ `/dashboard`

- รหัสผ่านเริ่มต้น: `sstem2567`  
  (เปลี่ยนได้ใน `dashboard.html` บรรทัด `DASHBOARD_PASSWORD`)
- กราฟ Bar: คะแนนเฉลี่ยรายด้าน (เต็ม 24)
- กราฟ Doughnut: สัดส่วนระดับผลการประเมิน
- ตารางรายชื่อครูทุกคน + ค้นหา + Export CSV

---

## กระบวนการประเมิน P-A-R-I

| ขั้น | ความหมาย |
|---|---|
| P — Prepare | สิ่งที่ทำได้ดีในภาคเรียนนี้ |
| A — Action | ปัญหา/อุปสรรคที่พบ |
| R — Reflect | สิ่งที่เด็กได้รับเกินความคาดหมาย |
| I — Improve | สิ่งที่จะปรับปรุงในภาคเรียนหน้า |

---

## อ้างอิง

- Hammond, R. L. (1969). *Evaluation at the local level*. Project EPIC.
- โมเดล SST-EM พัฒนาจากแนวคิด Hammond's Cube 3 มิติ: Instructional, Institutional, Behavioral
