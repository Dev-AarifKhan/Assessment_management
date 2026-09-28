# Government Higher Secondary School (GHSS) Larnoo
## Student Assessment, Examination & Result Management System

A unified, institutional-grade Result & Assessment Management System for **Government Higher Secondary School Larnoo** (Anantnag, Jammu & Kashmir). Affiliated with the **Jammu and Kashmir Board of School Education (JKBOSE)**.

---

## 🚀 Vercel Deployment (Ready)

This repository is **100% Vercel deployment ready** with zero configuration required.

### One-Click Git Deployment
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import this repository. Vercel automatically detects the framework (`Vite`), build command (`npm run build`), and output directory (`dist`).
4. Click **Deploy**. Your portal will be live globally on HTTPS with instant CDN edge caching.

### Deploying via Vercel CLI
```bash
npm install -g vercel
vercel deploy --prod
```

### Pre-configured Vercel Files
- `vercel.json`: Handles routing and single-page application rewrites to `index.html`.
- `package.json`: Contains production `build`, `dev`, and `preview` scripts with React 18, Vite, and Lucide icons.
- `.vercelignore`: Excludes Gradle and Android build artifacts from Vercel deployments.
- `.gitignore` & `.env.example`: Excludes `firebase-applet-config.json`, `google-services.json`, keystores, and `.env` files from Git so API keys and secrets are never committed to GitHub. Configure `VITE_FIREBASE_*` environment variables (listed in `.env.example`) in your deployment environment.

---

## ✨ Features

- **School Crest Branding & Watermark**: Official GHSS Larnoo crest integrated into headers, and stamped as a high-fidelity subtle watermark on all award rolls and marksheets.
- **Classwise Subject Award Roll (PDF & Print)**: Complete official JKBOSE format with Student ID, Roll No, Max Marks, Marks Obtained, Status, Result, and 3-signatory verification block (Subject Teacher, Incharge Examination, Principal).
- **Cumulative Student Marksheets**: Student transcripts with percentage, division, subject-wise score tables, and promotion eligibility.
- **Interactive Marks Entry**: Spreadsheet-style real-time grading sheet with automatic pass/fail thresholding and validation against maximum marks.
- **Role Switcher**: Switch between **Administrator** and **Teacher** views.
- **High-Contrast Design**: Bright, accessible color scheme with clear legibility in both High-Contrast Light and Dark themes.
- **Student ID Card Generator**: Printable student identity cards with barcodes and photo frames.
- **Android App Support**: The repository also contains the full native Android application (`app/src/main/`) built with Kotlin and Jetpack Compose.
