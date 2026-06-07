# SST-EM — เอกสารโครงการ

> Small School Teacher Evaluation Model  
> แบบประเมินการจัดการศึกษาสำหรับครูในสถานศึกษาขนาดเล็ก

---

## สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [Tech Stack](#tech-stack)
3. [โครงสร้างไฟล์](#โครงสร้างไฟล์)
4. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
5. [ฐานข้อมูล](#ฐานข้อมูล)
6. [การไหลของข้อมูล](#การไหลของข้อมูล)
7. [ฟีเจอร์แยกตามบทบาท](#ฟีเจอร์แยกตามบทบาท)
8. [ระบบคะแนน](#ระบบคะแนน)
9. [JavaScript Modules](#javascript-modules)
10. [การตั้งค่าและ Deploy](#การตั้งค่าและ-deploy)

---

## ภาพรวม

SST-EM เป็นเว็บแอปสำหรับให้ครูในโรงเรียนขนาดเล็กประเมินตนเองตามโมเดล **SST-EM** ที่พัฒนาจาก **Hammond's Cube 3 มิติ** ได้แก่ Instructional, Institutional, Behavioral

กระบวนการครบวงจรในระบบเดียว:
- ครูประเมินตนเอง 18 ข้อ แบ่ง 3 ด้าน
- สะท้อนคิดด้วย P-A-R-I
- ดูผลพร้อม Radar Chart
- ผู้ประเมินประเมินซ้ำและให้ข้อเสนอแนะ
- ผู้บริหารดู Dashboard ภาพรวม

---

## Tech Stack

| ส่วน | เทคโนโลยี | หมายเหตุ |
|------|-----------|----------|
| Frontend | HTML5 + Vanilla JavaScript | ไม่ใช้ framework |
| Styling | CSS3 | Responsive, Thai fonts (Sarabun) |
| Database | Supabase (PostgreSQL) | JSONB สำหรับ answers |
| Auth | Supabase Auth (JWT) | Email/Password |
| Storage | Supabase Storage | อัปโหลด PDF/เอกสาร |
| Charts | Chart.js v4.4.0 (CDN) | Radar + Bar + Doughnut |
| Hosting | Vercel | Static site, cleanUrls |

---

## โครงสร้างไฟล์

```
sst-em/
│
├── HTML (User-facing pages)
│   ├── index.html          # ขั้น 1: กรอกข้อมูลครู
│   ├── login.html          # หน้า Login
│   ├── register.html       # หน้า Register
│   ├── home.html           # เลือกบทบาท (ครู / ผู้ประเมิน)
│   ├── profile.html        # จัดการโปรไฟล์
│   │
│   ├── domain1.html        # ขั้น 2: ด้านที่ 1 — การจัดการเรียนรู้
│   ├── domain2.html        # ขั้น 3: ด้านที่ 2 — สถาบันและบริบท
│   ├── domain3.html        # ขั้น 4: ด้านที่ 3 — พฤติกรรมวิชาชีพ
│   ├── reflect.html        # ขั้น 5: Reflection P-A-R-I
│   ├── result.html         # ขั้น 6: ผลสรุป + Radar Chart
│   ├── my-results.html     # ประวัติการประเมินของครู
│   ├── upload.html         # อัปโหลดเอกสารประกอบ
│   │
│   ├── eval-search.html    # ผู้ประเมิน: ค้นหาครู
│   ├── eval-domain1.html   # ผู้ประเมิน: ประเมินด้าน 1
│   ├── eval-domain2.html   # ผู้ประเมิน: ประเมินด้าน 2
│   ├── eval-domain3.html   # ผู้ประเมิน: ประเมินด้าน 3
│   ├── eval-score.html     # ผู้ประเมิน: สรุปและข้อเสนอแนะ
│   ├── eval-result.html    # ผู้ประเมิน: ดูผลการประเมิน
│   │
│   └── dashboard.html      # Admin: ภาพรวมทุกคน (password-protected)
│
├── css/
│   └── style.css           # สไตล์ทั้งหมด (mobile-first, print-friendly)
│
├── js/
│   ├── questions.js        # คำถาม 18 ข้อ + choices + คะแนน
│   ├── state.js            # localStorage + scoring logic
│   ├── supabase.js         # Supabase REST client
│   ├── auth.js             # Login / Register / Guard
│   ├── domain-page.js      # Logic ร่วมหน้า domain1-3 (ครู)
│   └── eval-domain-page.js # Logic ร่วมหน้า eval-domain1-3 (ผู้ประเมิน)
│
├── supabase-schema.sql     # SQL สร้าง tables + storage
├── vercel.json             # Vercel config (cleanUrls)
├── README.md               # README เบื้องต้น
└── DOCS.md                 # เอกสารฉบับนี้
```

---

## สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)               │
│                                                  │
│  HTML Pages ──── Vanilla JS Modules              │
│                       │                          │
│              localStorage (state ชั่วคราว)      │
└───────────────────────┼─────────────────────────┘
                         │ REST API (fetch)
                         ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│                                                  │
│  Auth (JWT) ─── PostgreSQL ─── Storage (S3)      │
│                  profiles        evaluation-docs  │
│                  evaluations                      │
└─────────────────────────────────────────────────┘
                         │
              Git Push → Vercel Deploy
```

**Pattern หลัก:** localStorage-first — บันทึก state ขณะกรอกข้อมูล, ส่ง Supabase ครั้งเดียวตอน Submit สุดท้าย

---

## ฐานข้อมูล

### ตาราง `profiles`

| คอลัมน์ | ชนิด | คำอธิบาย |
|---------|------|----------|
| id | UUID | FK → auth.users |
| display_name | text | ชื่อ-นามสกุล |
| position | text | ตำแหน่ง |
| grade | text | ระดับชั้นที่สอน |
| school | text | โรงเรียน |
| district | text | อำเภอ/จังหวัด |
| semester | text | ภาคเรียน |
| created_at | timestamptz | — |

### ตาราง `evaluations`

| คอลัมน์ | ชนิด | คำอธิบาย |
|---------|------|----------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users (ครู) |
| teacher_name | text | ชื่อครู (snapshot) |
| school, district, semester, grade | text | ข้อมูล ณ เวลาประเมิน |
| domain1_answers | JSONB | `{ q1: 3, q2: 2, ... }` |
| domain2_answers | JSONB | — |
| domain3_answers | JSONB | — |
| domain1_total | int | คะแนนด้านที่ 1 (0-24) |
| domain2_total | int | — |
| domain3_total | int | — |
| total_score | int | คะแนนรวม (0-72) |
| level | text | ดีมาก / ดี / พอใช้ / ปรับปรุง |
| files | JSONB | `{ d1_1: { url: "..." }, ... }` |
| eval_status | text | draft / pending / evaluated |
| eval_scores | JSONB | คะแนนของผู้ประเมิน |
| eval_suggestions | JSONB | ข้อเสนอแนะของผู้ประเมิน |
| eval_by | UUID | FK → auth.users (ผู้ประเมิน) |
| eval_by_name | text | ชื่อผู้ประเมิน (snapshot) |
| created_at | timestamptz | — |

---

## การไหลของข้อมูล

### ครู (Self-Assessment)

```
register() → Supabase Auth + INSERT profiles
    ↓
index.html → localStorage: sst_info
    ↓
domain1-3.html → localStorage: sst_domain1, sst_domain2, sst_domain3
    ↓
reflect.html → localStorage: sst_reflection
    ↓
reflect.html → saveEvaluation()
    → INSERT evaluations (status: 'draft')
    ↓
result.html → getEvaluation(id)
    → แสดง Radar Chart + คะแนนรายด้าน + ข้อเสนอแนะ
    ↓
result.html → อัปโหลดเอกสาร (optional)
    → uploadFile() → Supabase Storage
    → UPDATE evaluations.files
```

### ผู้ประเมิน (Evaluator)

```
login() → Supabase Auth
    ↓
eval-search.html → getPendingEvaluations()
    → ค้นหาตามชื่อ/โรงเรียน
    ↓
eval-domain1-3.html → localStorage: eval_domain1-3
    ↓
eval-score.html → saveEvalScore()
    → UPDATE evaluations:
        eval_scores, eval_suggestions,
        eval_by, eval_by_name,
        eval_status: 'evaluated'
```

---

## ฟีเจอร์แยกตามบทบาท

### ครู
- สมัครสมาชิกและเข้าสู่ระบบ
- ประเมินตนเอง 18 ข้อ (6 ข้อต่อด้าน)
- สะท้อนคิดแบบ P-A-R-I
- ดูผลพร้อม Radar Chart และข้อเสนอแนะ
- อัปโหลดเอกสารประกอบ (รูบริค, แบบสังเกต)
- ดูประวัติการประเมินย้อนหลัง

### ผู้ประเมิน
- ค้นหาครูที่ส่งแบบประเมิน
- ประเมินซ้ำ 3 ด้านด้วยคำถามชุดเดียวกัน
- เพิ่มข้อเสนอแนะรายด้าน
- ติดตามสถานะ: draft → pending → evaluated

### ผู้บริหาร (Admin)
- เข้าถึง `/dashboard` ด้วยรหัสผ่าน (`sstem2567`)
- สถิติภาพรวม: จำนวนครู, คะแนนเฉลี่ย, สัดส่วนผ่าน/ปรับปรุง
- Bar Chart: คะแนนเฉลี่ยรายด้าน (เต็ม 24)
- Doughnut Chart: สัดส่วนระดับผลการประเมิน
- ตารางรายชื่อครูทุกคนพร้อมค้นหา
- Export CSV

---

## ระบบคะแนน

### สูตรคะแนน

- แต่ละข้อ: **1–4 คะแนน**
- ต่อด้าน: 6 ข้อ × 4 = **24 คะแนนสูงสุด**
- รวมทั้งหมด: 3 ด้าน × 24 = **72 คะแนนสูงสุด**

### เกณฑ์ระดับ

| ระดับ | คะแนนรวม (/72) | คะแนนรายด้าน (/24) |
|-------|----------------|-------------------|
| ดีมาก | 60–72 | 20–24 |
| ดี | 46–59 | 15–19 |
| พอใช้ | 31–45 | 10–14 |
| ปรับปรุง | 0–30 | 0–9 |

### Reflection P-A-R-I

| ขั้น | ความหมาย |
|------|----------|
| P — Prepare | สิ่งที่ทำได้ดีในภาคเรียนนี้ |
| A — Action | ปัญหา/อุปสรรคที่พบ |
| R — Reflect | สิ่งที่นักเรียนได้รับเกินความคาดหมาย |
| I — Improve | สิ่งที่จะปรับปรุงในภาคเรียนหน้า |

---

## JavaScript Modules

### `js/questions.js`

ฐานข้อมูลคำถาม 18 ข้อ แบ่ง 3 domain:

```js
QUESTIONS = {
  domain1: [ { text: "...", choices: [...], feedback: [...] }, ... ],  // 6 ข้อ
  domain2: [ ... ],
  domain3: [ ... ]
}
```

แต่ละข้อมี:
- `text` — เนื้อหาคำถาม
- `choices` — 4 ตัวเลือก (ค่า 1-4)
- `feedback` — ข้อความแสดงผลต่อระดับคะแนน

---

### `js/state.js`

localStorage wrapper + scoring logic:

```js
State.save(key, value)           // บันทึก JSON
State.load(key)                  // โหลด JSON
State.clearAll()                 // ล้างทุก key ที่ขึ้นต้นด้วย sst_

State.getScore(answers)          // คำนวณคะแนนรวมจาก JSONB answers
State.getLevel(total)            // คืน 'ดีมาก'|'ดี'|'พอใช้'|'ปรับปรุง'
State.getDomainLevel(total)      // ระดับต่อด้าน (เกณฑ์ /24)

State.DOMAIN_FEEDBACK            // ข้อความแนะนำสำเร็จรูปรายด้าน/ระดับ
```

---

### `js/supabase.js`

REST client สำหรับ Supabase:

```js
SupabaseClient.saveEvaluation(data)      // INSERT evaluations
SupabaseClient.getMyEvaluations()        // ดึงประวัติของครูตัวเอง
SupabaseClient.getEvaluation(id)         // ดึง evaluation รายการเดียว
SupabaseClient.getPendingEvaluations()   // ดึงรายการรอผู้ประเมิน
SupabaseClient.saveEvalScore(id, data)   // UPDATE คะแนนผู้ประเมิน
SupabaseClient.uploadFile(file, path)    // อัปโหลดไปยัง Storage
```

ทุก request แนบ `Authorization: Bearer <jwt>` จาก localStorage

---

### `js/auth.js`

```js
Auth.login(email, password)     // POST /auth/v1/token → บันทึก sst_token
Auth.register(email, password, profileData)
Auth.updateProfile(data)
Auth.logout()                   // ล้าง token → redirect /login
Auth.requireAuth()              // guard — redirect ถ้าไม่มี token
Auth.getUser()                  // คืน user object จาก localStorage
```

---

### `js/domain-page.js` และ `js/eval-domain-page.js`

Logic ร่วมสำหรับหน้าคำถามแต่ละด้าน:
- render คำถาม 6 ข้อจาก `QUESTIONS[domain]`
- ตรวจสอบว่าตอบครบก่อน Next
- บันทึกคำตอบลง localStorage
- Scroll ไปยังคำถามที่ยังไม่ได้ตอบ (UX)

ใช้ data attribute บน `<body>` เพื่อ config:

```html
<body data-domain="domain1" data-next="domain2.html">
```

---

## การตั้งค่าและ Deploy

### 1. Supabase Setup

```
1. สร้าง project ที่ supabase.com
2. SQL Editor → paste supabase-schema.sql → Run
3. Authentication → Settings → ปิด "Enable email confirmations"
4. Settings → API → copy Project URL และ anon key
5. แก้ไข js/supabase.js:
```

```js
const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

ทำซ้ำใน `js/auth.js` ด้วย

### 2. Deploy บน Vercel

```bash
git add .
git commit -m "initial"
git push origin main
```

Import repo ใน vercel.com → Deploy อัตโนมัติทุกครั้งที่ push

`vercel.json` ตั้งค่าให้ URL สะอาด:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

> `/domain1.html` → `/domain1`

### 3. Admin Dashboard

เข้าได้ที่ `/dashboard`  
รหัสผ่านเริ่มต้น: `sstem2567`  
เปลี่ยนได้ใน `dashboard.html` บรรทัด `DASHBOARD_PASSWORD`

---

## อ้างอิง

- Hammond, R. L. (1969). *Evaluation at the local level*. Project EPIC.
- โมเดล SST-EM พัฒนาจากแนวคิด Hammond's Cube 3 มิติ: Instructional, Institutional, Behavioral
