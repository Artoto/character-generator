// types/gemini.ts
export interface GeminiImageRequest {
  prompt: string;
}

export interface GeminiImageResponse {
  success: boolean;
  imageUrl?: string;
  textResponse?: string;
  error?: string;
}

export interface GeminiCandidate {
  content: {
    parts: Array<{
      text?: string;
      inlineData?: {
        data: string;
        mimeType: string;
      };
    }>;
  };
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
}
