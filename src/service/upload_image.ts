import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import "dotenv/config";
import optimizeImage, { OptimizeImageOptions } from "./optimize_upload.js";
import { UploadFile } from "../../type.js";

// ---------- Prepare values ----------
const imagePath = "public/strawberry2.jpg";
const parsed = path.parse(imagePath);

const files: UploadFile[] = [
  {
    name: `${parsed.name}.webp`,
    path: imagePath,
    format: "webp",
    quality: 85,
  },
];

const requiredEnvVars = ["ACCOUNT_ID", "ACCESS_KEY", "SECRET_KEY", "BUCKET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

const month = new Date().getMonth() + 1;
const year = new Date().getFullYear();

if (missingVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
  console.error("Please check your .env file");
  process.exit(1);
}

// ---------- S3 Client (Cloudflare R2) ----------
const client = new S3Client({
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

// ---------- Upload Single File ----------
async function uploadSingleFile(
  key: string,
  fileContent: Buffer,
  format: string
): Promise<{ success: boolean; key: string; error?: string }> {
  try {
    console.log(`✅ Created: ${key}`);

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET!,
        Key: key,
        Body: fileContent,
        ContentType: format,
      })
    );

    console.log(`📤 Uploaded: ${key}`);
    return { success: true, key };
  } catch (error: any) {
    console.error(`❌ Error with ${key}:`, error.message);
    return { success: false, key, error: error.message };
  }
}

// ---------- Upload Multiple Files ----------
async function uploadMultipleFiles(files: UploadFile[]) {
  console.log("🚀 Starting multi-file upload...\n");

  const results: Array<{ success: boolean; key: string; error?: string }> = [];

  for (const file of files) {
    try {
      // 🟢 Optimize image with sharp
      const opts: OptimizeImageOptions = {
        format: file.format,
        quality: file.quality,
        width: file.width,
        height: file.height,
      };

      const buffer = await optimizeImage(file.path, opts);

      const key = `${month}-${year}/${file.name}`;

      const contentTypeMap: Record<string, string> = {
        webp: "image/webp",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        png: "image/png",
        avif: "image/avif",
      };

      const contentType =
        contentTypeMap[file.format] || "application/octet-stream";

      const result = await uploadSingleFile(key, buffer, contentType);
      results.push(result);
    } catch (error: any) {
      console.error(`❌ Error processing ${file.name}:`, error.message);
      results.push({ success: false, key: file.name, error: error.message });
    }
  }

  // Summary
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("=".repeat(50));
  console.log(
    `✨ Upload Summary: ${successCount} succeeded, ${failCount} failed`
  );
  console.log("=".repeat(50));

  if (failCount > 0) {
    console.log("\n❌ Failed files:");
    results
      .filter((r) => !r.success)
      .forEach((r) => console.log(`   - ${r.key}: ${r.error}`));
  }

  // List objects in bucket
  console.log("\n📋 Listing all objects in bucket...\n");

  try {
    const list = await client.send(
      new ListObjectsCommand({
        Bucket: process.env.BUCKET!,
        Prefix: `${month}-${year}/`,
      })
    );

    if (list.Contents && list.Contents.length > 0) {
      console.log(`Found ${list.Contents.length} object(s):\n`);
      list.Contents.forEach((obj, i) => {
        const sizeKB = (obj.Size! / 1024).toFixed(2);
        console.log(`${i + 1}. ${obj.Key}`);
        console.log(`   Size: ${obj.Size} bytes (${sizeKB} KB)\n`);
      });
    } else {
      console.log("No objects found in bucket");
    }
  } catch (error: any) {
    console.error("❌ Error listing files:", error.message);
  }
}

// Run
uploadMultipleFiles(files).catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
