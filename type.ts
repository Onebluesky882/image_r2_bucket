export type Env = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};


export type UploadFile = {
	name: string;
	path: string;
	format: "webp" | "jpeg" | "jpg" | "png" | "avif";  
	quality: number;
	width?: number;
	height?: number;
}