import fs from 'fs';
import path from 'path';
import http from 'http';

const compiledServerPath = path.join(process.cwd(), 'dist', 'server.cjs');

async function main() {
  if (!fs.existsSync(compiledServerPath)) {
    console.error("Error: The project has not been compiled yet. (dist/server.cjs is missing)");
    
    const server = http.createServer((req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: Tahoma, sans-serif; direction: rtl; padding: 40px; text-align: center; max-width: 600px; margin: 50px auto; border: 1px solid #ffccd5; background: #fff5f5; border-radius: 12px; line-height: 1.8;">
          <h2 style="color: #d90429; margin-bottom: 20px;">⚠️ خطای راه‌اندازی پروژه روی هاست</h2>
          <p style="font-size: 15px; color: #333;">پروژه شما به زبان <strong>TypeScript</strong> و فریمورک <strong>Vite + React</strong> نوشته شده است. برای اجرای آن روی هاست‌های معمولی مانند سی‌پنل، ابتدا باید پروژه را بیلد (کامپایل) کنید تا کدهای جاوااسکریپت و پوشه <code>dist</code> ساخته شوند.</p>
          <div style="background: #e9ecef; padding: 12px; border-radius: 8px; font-family: monospace; direction: ltr; font-size: 13px; margin: 15px 0; border: 1px dashed #ced4da; text-align: left;">
            Error: dist/server.cjs not found
          </div>
          <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
            <strong style="color: #2b2d42; display: block; margin-bottom: 10px;">💡 چگونه این مشکل را برطرف کنم؟</strong>
            <ol style="padding-right: 20px; color: #555;">
              <li style="margin-bottom: 8px;">ابتدا در کامپیوتر شخصی خودتان دستور <code style="background:#f1f3f5; padding: 2px 6px; border-radius: 4px;">npm run build</code> را بزنید.</li>
              <li style="margin-bottom: 8px;">یک پوشه به نام <strong style="color: #d90429;">dist</strong> در پروژه شما ساخته می‌شود که حاوی تمام کدهای فشرده و آماده اجراست.</li>
              <li style="margin-bottom: 8px;">آرشیو ZIP پروژه خود را مجدد بسازید به‌گونه‌ای که پوشه جدید <strong style="color: #d90429;">dist</strong> نیز درون آن وجود داشته باشد.</li>
              <li style="margin-bottom: 8px;">فایل ZIP جدید را روی هاست آپلود کرده، از فشرده‌سازی خارج کنید، و در پنل مدیریت Node.js سی‌پنل دکمه <strong>Restart</strong> را بزنید.</li>
            </ol>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #f2f2f2; padding-top: 10px;">توسعه داده شده با ❤️ در محیط Google AI Studio</p>
        </div>
      `);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(Number(PORT) || PORT, () => {
      console.log(`Fallback error server is listening on port ${PORT}`);
    });
  } else {
    // If compiled server exists, import and execute it
    console.log("Loading compiled server from:", compiledServerPath);
    await import('./dist/server.cjs');
  }
}

main().catch(err => {
  console.error("Bootstrapping crashed:", err);
});
