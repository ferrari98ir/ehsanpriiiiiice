import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import AdmZip from "adm-zip";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from "./src/data";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parse with high limit for any backup/restore
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Robust project root detection (handles both direct execution and bundled dist/server.cjs)
const getProjectRoot = () => {
  if (fs.existsSync(path.join(process.cwd(), "data"))) {
    return process.cwd();
  }
  if (typeof __dirname !== "undefined") {
    const parent = path.resolve(__dirname, "..");
    if (fs.existsSync(path.join(parent, "data"))) {
      return parent;
    }
  }
  return process.cwd();
};
const PROJECT_ROOT = getProjectRoot();

// Setup database and file upload paths
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const DB_BACKUP_FILE = path.join(DATA_DIR, "db.backup.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const ORDERS_BACKUP_FILE = path.join(DATA_DIR, "orders.backup.json");
const UPLOADS_DIR = path.join(PROJECT_ROOT, "public", "uploads");

// Ensure directories exist recursively with write access
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Ensure orders database exists independently
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
}

// Helper functions for Orders (Completely isolated from products db.json)
const readOrders = (): any[] => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading orders:", err);
    if (fs.existsSync(ORDERS_BACKUP_FILE)) {
      try {
        const backupContent = fs.readFileSync(ORDERS_BACKUP_FILE, "utf-8");
        const parsed = JSON.parse(backupContent);
        if (Array.isArray(parsed)) return parsed;
      } catch (backupErr) {
        console.error("Backup recovery for orders failed:", backupErr);
      }
    }
  }
  return [];
};

const writeOrders = (orders: any[]): boolean => {
  try {
    const tmpFile = path.join(DATA_DIR, `orders.json.tmp.${Date.now()}`);
    const jsonStr = JSON.stringify(orders, null, 2);
    fs.writeFileSync(tmpFile, jsonStr, "utf-8");

    if (fs.existsSync(ORDERS_FILE)) {
      try {
        fs.copyFileSync(ORDERS_FILE, ORDERS_BACKUP_FILE);
      } catch (backupErr) {
        // Continue
      }
    }

    fs.renameSync(tmpFile, ORDERS_FILE);
    return true;
  } catch (err) {
    console.error("Error writing orders:", err);
    return false;
  }
};

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
    // If db.json was corrupted, attempt recovery from backup
    if (fs.existsSync(DB_BACKUP_FILE)) {
      try {
        console.warn("Attempting recovery from db.backup.json...");
        const backupContent = fs.readFileSync(DB_BACKUP_FILE, "utf-8");
        const parsed = JSON.parse(backupContent);
        fs.writeFileSync(DB_FILE, backupContent, "utf-8");
        return parsed;
      } catch (backupErr) {
        console.error("Backup recovery also failed:", backupErr);
      }
    }
  }
  return { products: [], categories: [], settings: {} };
};

// Safe Atomic Write to avoid corrupted files and data loss
const writeDB = (data: any) => {
  try {
    const tmpFile = path.join(DATA_DIR, `db.json.tmp.${Date.now()}`);
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(tmpFile, jsonStr, "utf-8");

    // Automatically create a backup of current valid db.json before overwrite
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch (backupErr) {
        // Non-fatal, continue with replace
      }
    }

    fs.renameSync(tmpFile, DB_FILE);
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

// Save or update a single product (efficient, low payload, immune to 413 or timeout)
app.post("/api/products/single", (req, res) => {
  const { product } = req.body;
  if (!product || !product.id) {
    return res.status(400).json({ error: "اطلاعات کالا ناقص است یا شناسه کالا ارسال نشده است" });
  }

  const dbData = readDB();
  if (!Array.isArray(dbData.products)) {
    dbData.products = [];
  }

  const index = dbData.products.findIndex((p: any) => p.id === product.id);
  if (index >= 0) {
    dbData.products[index] = product;
  } else {
    dbData.products.unshift(product);
  }

  if (!dbData.settings) dbData.settings = {};
  dbData.settings.lastPriceUpdate = new Date().toISOString();

  if (writeDB(dbData)) {
    res.json({ success: true, message: "کالا با موفقیت ذخیره شد", product });
  } else {
    res.status(500).json({ error: "خطا در نوشتن اطلاعات روی دیسک هاست" });
  }
});

// Delete a single product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const dbData = readDB();
  if (!Array.isArray(dbData.products)) {
    return res.status(404).json({ error: "کالایی در دیتابیس وجود ندارد" });
  }

  const prevLen = dbData.products.length;
  dbData.products = dbData.products.filter((p: any) => p.id !== id);

  if (dbData.products.length === prevLen) {
    return res.status(404).json({ error: "کالای مورد نظر یافت نشد" });
  }

  if (writeDB(dbData)) {
    res.json({ success: true, message: "کالا با موفقیت حذف شد" });
  } else {
    res.status(500).json({ error: "خطا در بروزرسانی دیتابیس سرور" });
  }
});

// Update entire products list (bulk import or quick edit)
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
  // Automatically record timestamp of rates update if cnyRate or aedRate changed
  if (
    dbData.settings?.cnyRate !== settings.cnyRate ||
    dbData.settings?.aedRate !== settings.aedRate ||
    !settings.lastPriceUpdate
  ) {
    settings.lastPriceUpdate = new Date().toISOString();
  }
  dbData.settings = settings;
  if (writeDB(dbData)) {
    res.json({ success: true, message: "تنظیمات با موفقیت ذخیره شدند", settings });
  } else {
    res.status(500).json({ error: "خطا در ذخیره‌سازی اطلاعات" });
  }
});

// --- Order & Proforma Invoice Endpoints (Completely Independent from db.json) ---

// Get all orders (for manager/admin orders panel)
app.get("/api/orders", (req, res) => {
  const orders = readOrders();
  res.json({ orders });
});

// Create a new order / proforma invoice (by customer without requiring registration)
app.post("/api/orders", (req, res) => {
  const { order } = req.body;
  if (!order || !order.customerName || !order.customerPhone || !Array.isArray(order.items) || order.items.length === 0) {
    return res.status(400).json({ error: "اطلاعات سفارش یا خریدار ناقص است" });
  }

  const orders = readOrders();
  const now = new Date();
  
  // Format readable unique invoice number (e.g. ES-0409-8421)
  const invoiceNumber = `ES-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderNumber: invoiceNumber,
    customerName: String(order.customerName).trim(),
    customerPhone: String(order.customerPhone).trim(),
    customerNotes: order.customerNotes ? String(order.customerNotes).trim() : "",
    items: order.items,
    totalToman: Number(order.totalToman) || 0,
    totalAED: Number(order.totalAED) || 0,
    hasAEDItems: !!order.hasAEDItems,
    status: 'pending', // pending | processing | confirmed | completed | cancelled
    createdAt: now.toISOString()
  };

  orders.unshift(newOrder);

  if (writeOrders(orders)) {
    res.json({ success: true, message: "پیش‌فاکتور با موفقیت در سیستم ثبت شد", order: newOrder });
  } else {
    res.status(500).json({ error: "خطا در ثبت فاکتور روی سرور" });
  }
});

// Update order status (for manager)
app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "وضعیت انتخاب شده نامعتبر است" });
  }

  const orders = readOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "سفارش مورد نظر یافت نشد" });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  if (writeOrders(orders)) {
    res.json({ success: true, order: orders[orderIndex] });
  } else {
    res.status(500).json({ error: "خطا در بروزرسانی وضعیت سفارش" });
  }
});

// Delete an order
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const filtered = orders.filter((o: any) => o.id !== id);
  if (filtered.length === orders.length) {
    return res.status(404).json({ error: "سفارش مورد نظر یافت نشد" });
  }

  if (writeOrders(filtered)) {
    res.json({ success: true, message: "فاکتور با موفقیت حذف شد" });
  } else {
    res.status(500).json({ error: "خطا در حذف سفارش از سیستم" });
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
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET") {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ehsan Store Server running on http://localhost:${PORT}`);
  });
}

startServer();
