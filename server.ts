import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from "./src/data";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parse with high limit for any backup/restore
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup database and file upload paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure directories exist recursively
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Seed database on startup if db.json does not exist
if (!fs.existsSync(DB_FILE)) {
  const seedData = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SETTINGS
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), "utf-8");
  console.log("Database seeded successfully with initial data.");
}

// Database helper functions
const readDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database:", err);
  }
  return { products: [], categories: [], settings: {} };
};

const writeDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing to database:", err);
    return false;
  }
};

// Set up static serving for uploaded media assets at /uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// Setup multer storage configuration for media file uploads (images, audio, video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// --- API Endpoints ---

// Get all store data (products, categories, settings)
app.get("/api/data", (req, res) => {
  const dbData = readDB();
  res.json(dbData);
});

// Update products list
app.post("/api/products", (req, res) => {
  const { products } = req.body;
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: "لیست محصولات معتبر نیست" });
  }
  const dbData = readDB();
  dbData.products = products;
  if (writeDB(dbData)) {
    res.json({ success: true, message: "کالاها با موفقیت در دیتابیس بروزرسانی شدند" });
  } else {
    res.status(500).json({ error: "خطا در ذخیره‌سازی اطلاعات" });
  }
});

// Update categories list
app.post("/api/categories", (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: "دسته‌بندی‌ها معتبر نیستند" });
  }
  const dbData = readDB();
  dbData.categories = categories;
  if (writeDB(dbData)) {
    res.json({ success: true, message: "دسته‌بندی‌ها با موفقیت ذخیره شدند" });
  } else {
    res.status(500).json({ error: "خطا در ذخیره‌سازی اطلاعات" });
  }
});

// Update settings
app.post("/api/settings", (req, res) => {
  const { settings } = req.body;
  if (!settings) {
    return res.status(400).json({ error: "تنظیمات معتبر نیست" });
  }
  const dbData = readDB();
  dbData.settings = settings;
  if (writeDB(dbData)) {
    res.json({ success: true, message: "تنظیمات با موفقیت ذخیره شدند" });
  } else {
    res.status(500).json({ error: "خطا در ذخیره‌سازی اطلاعات" });
  }
});

// Upload media file (image, audio, video)
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "فایلی ارسال نشده است" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Download full project with active database and assets as a ZIP archive
app.get("/api/admin/export", (req, res) => {
  try {
    const zip = new AdmZip();
    const projectDir = process.cwd();
    
    // Core files & directories to pack
    const targets = [
      "src",
      "public",
      "data",
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "index.html",
      ".env.example",
      ".gitignore"
    ];

    for (const target of targets) {
      const targetPath = path.join(projectDir, target);
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
          zip.addLocalFolder(targetPath, target);
        } else {
          // If it is in the root, we add it to root
          zip.addLocalFile(targetPath);
        }
      }
    }
    
    const buffer = zip.toBuffer();
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=EhsanStore-Complete-Project.zip",
      "Content-Length": buffer.length
    });
    res.send(buffer);
  } catch (err) {
    console.error("Export zipped package failed:", err);
    res.status(500).send("خطا در ایجاد پکیج ZIP کدهای سایت");
  }
});

// --- Server & Vite Boot ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite as a middleware for Express in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.PORT) {
    // Under cPanel/Passenger, process.env.PORT can be a UNIX socket path or a number. We listen without host binding.
    const listenTarget = isNaN(Number(process.env.PORT)) ? process.env.PORT : Number(process.env.PORT);
    app.listen(listenTarget, () => {
      console.log(`Ehsan Store Server running on port ${process.env.PORT}`);
    });
  } else {
    // Under local/Docker development, bind to 3000 on "0.0.0.0"
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Ehsan Store Server running on port 3000`);
    });
  }
}

startServer();
