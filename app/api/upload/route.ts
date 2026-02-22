// app/api/upload/route.ts
// TIGRIS DATA VERSION (Recommended - Great Free Tier!)
// S3-compatible with global CDN and 5GB free storage

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";

// Initialize Tigris S3 Client
const tigrisClient = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const EXTENSION_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    await requireRole(ROLES.SUPER_ADMIN);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const studentName = formData.get("studentName") as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: "فایلێک هەڵنەبژێردراوە" },
        { status: 400 },
      );
    }

    // Validate student ID
    // if (!studentId) {
    //   return NextResponse.json(
    //     { error: "Student ID is required" },
    //     { status: 400 },
    //   );
    // }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "قەبارەی فایلەکە زۆر گەورەیە (زیاتر لە 5MB)" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "تەنها فایلی PDF پەسەندکراوە" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    const ext = EXTENSION_MAP[file.type] ?? "bin";
    const folder = studentName ? `receipts/${studentName}` : "expenses";
    const key = `${folder}/${timestamp}-${randomString}.${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Tigris
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Tigris automatically provides CDN, so files are publicly accessible
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await tigrisClient.send(command);

    // Generate public URL
    // Tigris provides automatic CDN URLs
    const fileUrl = `https://fly.storage.tigris.dev/${BUCKET_NAME}/${key}`;

    return NextResponse.json(
      {
        url: fileUrl,
        key,
        size: file.size,
        type: file.type,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading file to Tigris:", error);

    return NextResponse.json({ error: "فایلەکە بارنەبوو" }, { status: 500 });
  }
}

// Optional: DELETE endpoint
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(ROLES.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 },
      );
    }

    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await tigrisClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file from Tigris:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
