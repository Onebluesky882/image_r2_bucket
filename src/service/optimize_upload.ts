import sharp from "sharp";

export interface OptimizeImageOptions {
  format?: "webp" | "avif" | "jpeg" | "jpg" | "png";
  quality?: number;
  width?: number;
  height?: number;
}

export default async function optimizeImage(
  inputPath: string,
  options: OptimizeImageOptions = {}
): Promise<Buffer> {
  const {
    format = "webp",
    quality = 85,
    width,
    height,
  } = options;

  let pipeline = sharp(inputPath);

  // Resize (ถ้าระบุ w/h)
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: "inside", // รักษา aspect ratio
      withoutEnlargement: true, // ไม่ขยายเกินขนาดจริง
    });
  }

  // Format conversion
  switch (format.toLowerCase()) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
    default:
      pipeline = pipeline.webp({ quality }); // fallback
  }

  return pipeline.toBuffer();
}
