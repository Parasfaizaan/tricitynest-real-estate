import { createHash, createHmac, randomUUID } from "crypto";

const MAX_IMAGE_SIZE = 5_000_000;
export const MIN_PROPERTY_IMAGES = 5;
export const MAX_PROPERTY_IMAGES = 15;

const allowedTypes = {
  "image/jpeg": { ext: "jpg", signatures: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: "png", signatures: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { ext: "webp", signatures: [[0x52, 0x49, 0x46, 0x46]] },
} as const;

type AllowedMime = keyof typeof allowedTypes;

export type UploadedPropertyImage = {
  url: string;
  key: string;
  alt?: string | null;
  sortOrder: number;
  isCover: boolean;
};

export type UploadedProfileImage = {
  url: string;
  key: string;
};

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function amzDate(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { long: iso, short: iso.slice(0, 8) };
}

function publicBaseUrl(bucket: string, region: string) {
  return process.env.AWS_S3_PUBLIC_BASE_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
}

function assertAllowedFile(file: File, bytes: Buffer) {
  if (file.size === 0 || bytes.length === 0) throw new Error("Image file is empty");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Image file is too large");
  if (!(file.type in allowedTypes)) throw new Error("Only JPG, PNG and WebP images are allowed");

  const info = allowedTypes[file.type as AllowedMime];
  const hasSignature = info.signatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );
  if (!hasSignature) throw new Error("Uploaded image appears to be invalid or corrupted");
}

export async function uploadPropertyImageToS3(file: File, propertyId: string, sortOrder: number, isCover: boolean) {
  const bytes = Buffer.from(await file.arrayBuffer());
  assertAllowedFile(file, bytes);

  const region = env("AWS_REGION");
  const accessKey = env("AWS_ACCESS_KEY_ID");
  const secretKey = env("AWS_SECRET_ACCESS_KEY");
  const bucket = env("AWS_S3_BUCKET");
  const mime = file.type as AllowedMime;
  const ext = allowedTypes[mime].ext;
  const key = `properties/${propertyId}/${randomUUID()}.${ext}`;
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}/${encodedKey}`;
  const { long, short } = amzDate();
  const payloadHash = sha256(bytes);
  const credentialScope = `${short}/${region}/s3/aws4_request`;
  const canonicalHeaders = `content-type:${mime}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${long}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", `/${encodedKey}`, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", long, credentialScope, sha256(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${secretKey}`, short);
  const dateRegionKey = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, "s3");
  const signingKey = hmac(dateRegionServiceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": mime,
      "X-Amz-Content-Sha256": payloadHash,
      "X-Amz-Date": long,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`S3 upload failed${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }

  return {
    url: `${publicBaseUrl(bucket, region).replace(/\/$/, "")}/${encodedKey}`,
    key,
    alt: file.name || null,
    sortOrder,
    isCover,
  } satisfies UploadedPropertyImage;
}

export async function uploadProfileImageToS3(file: File, userId = "staged") {
  const bytes = Buffer.from(await file.arrayBuffer());
  assertAllowedFile(file, bytes);

  const region = env("AWS_REGION");
  const accessKey = env("AWS_ACCESS_KEY_ID");
  const secretKey = env("AWS_SECRET_ACCESS_KEY");
  const bucket = env("AWS_S3_BUCKET");
  const mime = file.type as AllowedMime;
  const ext = allowedTypes[mime].ext;
  const key = `profiles/${userId}/${randomUUID()}.${ext}`;
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}/${encodedKey}`;
  const { long, short } = amzDate();
  const payloadHash = sha256(bytes);
  const credentialScope = `${short}/${region}/s3/aws4_request`;
  const canonicalHeaders = `content-type:${mime}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${long}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", `/${encodedKey}`, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", long, credentialScope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, short), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": mime,
      "X-Amz-Content-Sha256": payloadHash,
      "X-Amz-Date": long,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`S3 upload failed${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }

  return {
    url: `${publicBaseUrl(bucket, region).replace(/\/$/, "")}/${encodedKey}`,
    key,
  } satisfies UploadedProfileImage;
}

export async function deleteS3Object(key: string | null | undefined) {
  if (!key) return;
  const region = env("AWS_REGION");
  const accessKey = env("AWS_ACCESS_KEY_ID");
  const secretKey = env("AWS_SECRET_ACCESS_KEY");
  const bucket = env("AWS_S3_BUCKET");
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}/${encodedKey}`;
  const { long, short } = amzDate();
  const payloadHash = sha256("");
  const credentialScope = `${short}/${region}/s3/aws4_request`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${long}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["DELETE", `/${encodedKey}`, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", long, credentialScope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, short), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      "X-Amz-Content-Sha256": payloadHash,
      "X-Amz-Date": long,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  });

  if (!res.ok && res.status !== 404) throw new Error("S3 delete failed");
}
