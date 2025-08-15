"use client";

import React, { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import ViewImage from "../components/ViewImage";

// Types
interface GenerateImageRequest {
  prompt: string;
}

interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const CharacterGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    "a beautiful elegant young woman, realistic 3D character, high quality, close-up portrait, long dark hair tied up in an elaborate bun with a large light blue flower headdress, intricate silver and blue earrings, traditional fantasy outfit, subtle face markings, a gentle and graceful expression, serene and dreamy atmosphere with soft blue light, a full moon behind, high detail, masterpiece, photorealistic."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<boolean>(false);

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const generateImage = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError("กรุณาใส่คำบรรยายเพื่อสร้างภาพ");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const maxRetries = 3;
    const initialDelay = 1000;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const requestBody: GenerateImageRequest = {
          prompt: prompt.trim(),
        };

        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 429) {
            // Rate limit - retry with exponential backoff
            const delay = initialDelay * Math.pow(2, retries);
            Swal.fire({
              title: "Error!",
              text: `ขออภัยเนื่องเกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่ภายหลััง`,
              icon: "error",
              confirmButtonText: "ปิด",
            });
            await sleep(delay);
            retries++;
            continue;
          } else if (response.status >= 500) {
            // Server error - retry
            const delay = initialDelay * Math.pow(2, retries);
            Swal.fire({
              title: "Error!",
              text: `ขออภัยเนื่องเกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่ภายหลััง`,
              icon: "error",
              confirmButtonText: "ปิด",
            });
            await sleep(delay);
            retries++;
            continue;
          } else {
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
        }

        const result: GenerateImageResponse = await response.json();

        if (result.success && result.imageUrl) {
          setGeneratedImage(result.imageUrl);
          break;
        } else {
          throw new Error(result.error || "ไม่พบข้อมูลภาพในผลลัพธ์");
        }
      } catch (error) {
        console.error("Error generating image:", error);

        if (retries < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, retries);
          await sleep(delay);
          retries++;
          continue;
        } else {
          setError(
            `เกิดข้อผิดพลาดในการสร้างภาพ: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          break;
        }
      }
    }

    setIsLoading(false);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      generateImage();
    }
  };

  const downloadImage = async (): Promise<void> => {
    if (!generatedImage) return;

    try {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `character-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `ขออภัยเนื่องเกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่ภายหลััง:${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        icon: "error",
        confirmButtonText: "ปิด",
      });
    }
  };

  const handleCloseViewImage = () => {
    console.log("Closing image view");
    setViewImage(false);
  };

  return (
    <>
      {viewImage && (
        <ViewImage imageUrl={generatedImage} onClose={handleCloseViewImage} />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              สร้างภาพตัวละครในนิยาย
            </h1>
            <p className="text-center text-sm mb-8 text-slate-400">
              {`เขียนบรรยายลักษณะตัวละครที่คุณต้องการลงในช่องด้านล่าง แล้วกด
              "สร้างภาพ" เพื่อให้ AI สร้างภาพให้คุณ`}
              <br />
              <span className="text-xs text-slate-500">
                ใช้ Gemini 2.0 Flash Preview สำหรับการสร้างภาพ
              </span>
            </p>

            <div className="mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-4 h-32 text-sm rounded-xl bg-slate-900/50 text-slate-100 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none placeholder-slate-400 transition-all duration-200"
                placeholder="ใส่คำบรรยายตัวละครที่นี่... (กด Ctrl+Enter เพื่อสร้างภาพ)"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-4 font-semibold text-lg rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 ease-out"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังสร้างภาพ...
                </div>
              ) : (
                "สร้างภาพ"
              )}
            </button>

            <div className="mt-8 min-h-[300px] rounded-2xl overflow-hidden bg-slate-900/30 border-2 border-dashed border-slate-600/50 flex items-center justify-center">
              {error ? (
                <div className="text-center px-4">
                  <div className="text-red-400 mb-2">{error}</div>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-slate-400 hover:text-slate-300 underline"
                  >
                    ลองใหม่
                  </button>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="relative overflow-hidden cursor-pointer group mb-4">
                    <Image
                      src={generatedImage}
                      alt="Generated Character"
                      width={512}
                      height={512}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0  bg-black opacity-0 group-hover:opacity-75 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        className="text-white text-4xl cursor-pointer"
                        onClick={() => setViewImage(true)}
                      >
                        <svg width="30" height="30" viewBox="0 0 24 24">
                          <g fill="none" stroke="currentColor">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                            <circle cx="12" cy="12" r="1" />
                            <path d="M18.944 12.33a1 1 0 0 0 0-.66a7.5 7.5 0 0 0-13.888 0a1 1 0 0 0 0 .66a7.5 7.5 0 0 0 13.888 0" />
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={downloadImage}
                    className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    ดาวน์โหลดภาพ
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-600 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p>ภาพที่สร้างจะแสดงที่นี่</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharacterGenerator;
