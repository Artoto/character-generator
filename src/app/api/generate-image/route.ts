import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

interface GenerateImageRequest {
  prompt: string;
}

interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(key);

  if (!userLimit) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body: GenerateImageRequest = await request.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid prompt provided" },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Enhance prompt for better results
    const enhancedPrompt = `Create a high-quality, detailed image: ${body.prompt.trim()}`;
    // Generate image using Gemini 2.0 Flash Preview
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: enhancedPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Process the response
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from AI model");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("No content parts found in response");
    }

    // Look for image data
    let imageData: string | null = null;
    let textResponse: string | null = null;

    for (const part of candidate.content.parts) {
      if (part.text) {
        textResponse = part.text;
      } else if (part.inlineData && part.inlineData.data) {
        imageData = part.inlineData.data;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          success: false,
          error:
            textResponse || "ไม่สามารถสร้างภาพได้ กรุณาลองใหม่หรือปรับคำบรรยาย",
        },
        { status: 400 }
      );
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageData}`;

    const result: GenerateImageResponse = {
      success: true,
      imageUrl: imageUrl,
    };

    return NextResponse.json(result);
  } catch (error) {
    // Handle specific error types
    let errorMessage = "เกิดข้อผิดพลาดในการสร้างภาพ";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        errorMessage = "การตั้งค่า API key ไม่ถูกต้อง";
        statusCode = 500;
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
        errorMessage = "เกินขีดจำกัดการใช้งาน กรุณาลองใหม่ภายหลัง";
        statusCode = 429;
      } else if (
        error.message.includes("safety") ||
        error.message.includes("blocked")
      ) {
        errorMessage = "คำบรรยายนี้ไม่เหมาะสม กรุณาใช้คำบรรยายอื่น";
        statusCode = 400;
      } else if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        errorMessage = "การเชื่อมต่อมีปัญหา กรุณาลองใหม่";
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
