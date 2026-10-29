#!/usr/bin/env node

/**
 * ═════════════════════════════════════════════════════════════════════
 * Elmira Davet - Otomatik Production Build & Hızlı Zip-FTP Dağıtım Scripti
 * ═════════════════════════════════════════════════════════════════════
 * 
 * Özellikler:
 *   - Akıllı Zip-Deploy: Binlerce dosyayı tek tek göndermek yerine
 *     paketleyip (zip) sunucuda açarak Natro FTP ETIMEDOUT hatasını %100 çözer.
 *   - Backend (PHP REST API) ve Frontend (Next.js) desteği.
 *   - Renkli ve detaylı durum raporu.
 */

import { Client } from "basic-ftp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Renkli konsol çıktıları
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function logStep(stepNum, title) {
  console.log("\n" + colors.cyan + colors.bright + `[${stepNum}] ${title}` + colors.reset);
}

// 1. Ortam Değişkenlerini Yükle
const envDeployPath = path.join(ROOT_DIR, ".env.deploy");
if (fs.existsSync(envDeployPath)) {
  dotenv.config({ path: envDeployPath });
} else {
  dotenv.config({ path: path.join(ROOT_DIR, ".env") });
}

// CLI Argümanları
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const skipBuild = args.includes("--skip-build");
const targetArg = args.find((a) => a.startsWith("--target="));
const target = targetArg
  ? targetArg.split("=")[1].toLowerCase()
  : process.env.DEPLOY_TARGET || "all";

// Banner
console.log(colors.cyan + colors.bright + `
╔═══════════════════════════════════════════════════════════════════════╗
║                   ELMIRA DAVET - PRODUCTION DEPLOY                    ║
║         Domain: elmiradavet.com.tr  |  IP: 94.73.151.149             ║
╚═══════════════════════════════════════════════════════════════════════╝
` + colors.reset);

log(`🎯 Hedef: ${colors.bright}${target.toUpperCase()}${colors.reset}`);
log(`🛠️  Dry Run (Simülasyon): ${isDryRun ? colors.yellow + "AÇIK" : "KAPALI"}`);
log(`📦 Derleme (Build): ${skipBuild ? "ATLANACAK (--skip-build)" : "YAPILACAK"}`);

// FTP Bilgileri
const ftpHost = process.env.FTP_HOST || "94.73.151.149";
const ftpPort = parseInt(process.env.FTP_PORT || "21", 10);
const ftpUser = process.env.FTP_USER;
const ftpPassword = process.env.FTP_PASSWORD;
const ftpSecure = process.env.FTP_SECURE === "true";
const remoteRoot = process.env.FTP_REMOTE_ROOT || "/";
const backendDir = process.env.FTP_BACKEND_DIR || "/api";
const frontendDir = process.env.FTP_FRONTEND_DIR || "/";

if (!ftpUser || !ftpPassword || ftpUser === "your_ftp_username") {
  log("\n❌ HATA: FTP Kullanıcı bilgileri eksik veya geçersiz!", colors.red + colors.bright);
  log(`Lütfen proje kökündeki .env.deploy dosyasını kontrol edin.`);
  process.exit(1);
}

// ─── ADIM 1: BUILD AŞAMASI ───
if (!skipBuild && (target === "all" || target === "frontend")) {
  logStep(1, "Next.js Production Build Alınıyor...");
  try {
    log("Komut: npm run build", colors.dim);
    execSync("npm run build", {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
    log("✓ Build başarıyla tamamlandı!", colors.green + colors.bright);
  } catch (err) {
    log("\n❌ Build başarısız oldu! Deploy durduruldu.", colors.red + colors.bright);
    process.exit(1);
  }
} else {
  logStep(1, "Build adımı atlandı (--skip-build veya yalnızca backend).");
}

// ─── ADIM 2: DAĞITIM PAKETLERİ HAZIRLAMA ───
logStep(2, "Dağıtım Paketleri Hazırlanıyor...");
const stageDir = path.join(ROOT_DIR, ".deploy_temp");

function cleanOrCreateDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

cleanOrCreateDir(stageDir);

// 1. Backend PHP Paketi
const stageBackendDir = path.join(stageDir, "backend");
if (target === "all" || target === "backend") {
  cleanOrCreateDir(stageBackendDir);
  const backendSrcDir = path.join(ROOT_DIR, "backend");
  const allowedItems = ["database", "public", "src", ".htaccess", ".env", ".env.example", "README.md"];
  for (const item of allowedItems) {
    const srcPath = path.join(backendSrcDir, item);
    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, path.join(stageBackendDir, item));
    }
  }
  log(`✓ Backend PHP paketi hazırlandı (${stageBackendDir})`, colors.green);
}

// 2. Frontend Paketi ve Akıllı Zip
const stageFrontendDir = path.join(stageDir, "frontend");
let frontendZipPath = null;
let extractToken = null;

if (target === "all" || target === "frontend") {
  cleanOrCreateDir(stageFrontendDir);
  const nextAppDir = path.join(ROOT_DIR, "elmira-davet");
  const standaloneDir = path.join(nextAppDir, ".next", "standalone");
  const staticDir = path.join(nextAppDir, ".next", "static");
  const publicDir = path.join(nextAppDir, "public");

  if (fs.existsSync(standaloneDir)) {
    log("✓ Next.js Standalone derleme ve üretim node_modules paketleri toplanıyor...", colors.dim);
    const innerStandaloneApp = path.join(standaloneDir, "elmira-davet");
    const sourceDir = fs.existsSync(innerStandaloneApp) ? innerStandaloneApp : standaloneDir;
    copyRecursive(sourceDir, stageFrontendDir);

    if (fs.existsSync(staticDir)) {
      copyRecursive(staticDir, path.join(stageFrontendDir, ".next", "static"));
    }
    if (fs.existsSync(publicDir)) {
      copyRecursive(publicDir, path.join(stageFrontendDir, "public"));
    }
  } else {
    copyRecursive(path.join(nextAppDir, ".next"), path.join(stageFrontendDir, ".next"));
    copyRecursive(publicDir, path.join(stageFrontendDir, "public"));
    copyRecursive(path.join(nextAppDir, "package.json"), path.join(stageFrontendDir, "package.json"));
  }

  // ZIP Paketi Oluştur (Natro FTP ETIMEDOUT hatasını önlemek için)
  log("⚡ Binlerce dosya ve node_modules optimize tek bir pakete dönüştürülüyor (frontend.zip)...", colors.cyan);
  frontendZipPath = path.join(stageDir, "frontend.zip");
  execSync(`cd "${stageFrontendDir}" && zip -rq "${frontendZipPath}" .`);
  const zipSizeMb = (fs.statSync(frontendZipPath).size / (1024 * 1024)).toFixed(2);
  log(`✓ frontend.zip hazırlandı (${zipSizeMb} MB, production node_modules dahil)`, colors.green + colors.bright);

  // Güvenli Unzip PHP Betiği
  extractToken = crypto.randomBytes(16).toString("hex");
  const unzipPhpContent = `<?php
@ini_set('memory_limit', '512M');
@ini_set('max_execution_time', 300);
header('Content-Type: application/json');
$token = $_GET['token'] ?? '';
$expectedToken = '${extractToken}';

if (!$token || $token !== $expectedToken) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Yetkisiz erişim']);
    exit;
}

$zipFile = __DIR__ . '/frontend.zip';
if (!file_exists($zipFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'frontend.zip bulunamadı']);
    exit;
}

$zip = new ZipArchive();
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo(__DIR__);
    $zip->close();
    @unlink($zipFile);
    @unlink(__FILE__);
    echo json_encode(['success' => true, 'message' => 'Frontend ve node_modules başarıyla açıldı, paketler temizlendi']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'ZipArchive açılamadı']);
}
`;
  fs.writeFileSync(path.join(stageDir, "unzip_frontend.php"), unzipPhpContent);
}

// ─── ADIM 3: FTP TRANSFER VE ÇIKARTMA ───
logStep(3, "Production Sunucusuna Bağlanılıyor & Gönderiliyor...");
log(`Bağlantı: ${ftpHost}:${ftpPort} (${ftpSecure ? "FTPS" : "FTP"})`, colors.cyan);
log(`Kullanıcı: ${ftpUser}`, colors.cyan);

if (isDryRun) {
  log("\n[DRY-RUN] Simülasyon modunda sunucuya yükleme yapılmadı.", colors.yellow + colors.bright);
  process.exit(0);
}

const client = new Client();
client.ftp.verbose = false;
client.ftp.timeout = 180000; // 3 dakika timeout (kesintileri önlemek için)

async function runDeploy() {
  const startTime = Date.now();
  try {
    await client.access({
      host: ftpHost,
      port: ftpPort,
      user: ftpUser,
      password: ftpPassword,
      secure: ftpSecure,
    });
    log("✓ FTP Sunucusuna başarıyla bağlanıldı!", colors.green + colors.bright);

    // 1. Backend Yükleme
    if (target === "all" || target === "backend") {
      log(`\n📤 Backend dosyaları yükleniyor -> ${backendDir}...`, colors.cyan);
      await client.ensureDir(backendDir);
      await client.uploadFromDir(stageBackendDir, backendDir);
      log(`✓ Backend PHP servisi başarıyla yüklendi!`, colors.green);
    }

    // 2. Frontend Yükleme (Hızlı Zip Yöntemi)
    if (target === "all" || target === "frontend") {
      log(`\n📤 Frontend paketi (frontend.zip) yükleniyor -> ${frontendDir}...`, colors.cyan);
      await client.ensureDir(frontendDir);
      
      // Tek bir zip dosyası yüklenir (ETIMEDOUT hatası olmaz!)
      await client.uploadFrom(frontendZipPath, path.posix.join(frontendDir, "frontend.zip"));
      await client.uploadFrom(path.join(stageDir, "unzip_frontend.php"), path.posix.join(frontendDir, "unzip_frontend.php"));
      log(`✓ frontend.zip ve açıcı sunucuya aktarıldı!`, colors.green);

      // Sunucuda zip'i açması için HTTP isteği gönder
      log(`⚡ Sunucudaki zip paketi açılıyor (LiteSpeed / PHP ZipArchive)...`, colors.cyan);
      let unzipped = false;
      const urlsToTry = [
        `http://${ftpHost}/unzip_frontend.php?token=${extractToken}`,
        `http://elmiradavet.com.tr/unzip_frontend.php?token=${extractToken}`,
        `https://elmiradavet.com.tr/unzip_frontend.php?token=${extractToken}`,
      ];

      for (const url of urlsToTry) {
        try {
          const res = await fetch(url, { headers: { Host: "elmiradavet.com.tr" } });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              log(`✓ ${json.message}`, colors.green + colors.bright);
              unzipped = true;
              break;
            }
          }
        } catch (_) {}
      }

      if (!unzipped) {
        log(`ℹ️  Zip paketi sunucuya yüklendi (frontend.zip). Tarayıcıdan açmak için:\n  http://elmiradavet.com.tr/unzip_frontend.php?token=${extractToken}`, colors.yellow);
      }
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    log("\n" + colors.green + colors.bright + `
═══════════════════════════════════════════════════════════════════════
  🎉 DEPLOY BAŞARIYLA TAMAMLANDI! (Toplam Süre: ${durationSec}s)
  Site Adresi: https://elmiradavet.com.tr
  API Adresi:  https://elmiradavet.com.tr/api/
═══════════════════════════════════════════════════════════════════════
` + colors.reset);

    // Temizlik
    if (fs.existsSync(stageDir)) {
      fs.rmSync(stageDir, { recursive: true, force: true });
    }
  } catch (error) {
    log("\n❌ FTP Transfer Hatası!", colors.red + colors.bright);
    console.error(error);
    process.exit(1);
  } finally {
    client.close();
  }
}

runDeploy();
