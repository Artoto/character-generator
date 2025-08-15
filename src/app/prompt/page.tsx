"use client";
import React, { useState, useEffect } from "react";
import { Copy, Shuffle, Download } from "lucide-react";

interface CharacterOptions {
  gender: string;
  age: string;
  hair: string;
  theme: string;
  nature: string;
  style: string;
  hairColor: string;
  hairDecorations: string;
  eyeColor: string;
  clothing: string;
  clothingColor: string;
  pose: string;
  background: string;
  mood: string;
  artStyle: string;
  aspectRatio: string;
  phase: string;
}

const CharacterPromptGenerator: React.FC = () => {
  const [options, setOptions] = useState<CharacterOptions>({
    gender: "female",
    hair: "long",
    theme: "wuxia",
    nature: "beautiful",
    age: "young adult",
    style: "anime",
    hairColor: "black",
    hairDecorations: "none",
    eyeColor: "brown",
    clothing: "casual",
    clothingColor: "black",
    pose: "standing",
    background: "simple",
    mood: "happy",
    artStyle: "digital art",
    aspectRatio: "9:16",
    phase:
      "A shot that clearly shows the entire character from head to toe, controlling the character's composition and clothing.",
  });

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const characterOptions = {
    gender: ["male", "female", "non-binary"],
    hair: [
      "Long",
      "Short",
      "Curly",
      "Straight",
      "Long tied up",
      "Long tied up with bangs",
      "Long tied up with one side braid",
      "Long braid",
    ],
    nature: ["beautiful", "cute", "handsome", "ugly"],
    age: [
      "child",
      "teenager",
      "young adult",
      "adult",
      "middle-aged",
      "elderly",
    ],
    style: [
      "anime",
      "realistic",
      "cartoon",
      "chibi",
      "semi-realistic",
      "3D CGI",
    ],
    theme: ["wuxia", "martial artist", "ancient china", "ancient thai"],
    hairDecorations: [
      "flower",
      "ribbon",
      "headband",
      "tiara",
      "hairpin",
      "none",
    ],
    hairColor: [
      "black",
      "brown",
      "blonde",
      "red",
      "blue",
      "pink",
      "purple",
      "green",
      "white",
      "silver",
    ],
    eyeColor: [
      "brown",
      "blue",
      "green",
      "hazel",
      "amber",
      "gray",
      "violet",
      "red",
    ],
    clothing: [
      "casual",
      "formal",
      "school uniform",
      "fantasy armor",
      "kimono",
      "modern dress",
      "streetwear",
      "traditional",
      "traditional Chinese",
    ],
    clothingColor: [
      "black",
      "brown",
      "blonde",
      "red",
      "blue",
      "pink",
      "purple",
      "green",
      "white",
      "silver",
    ],
    pose: [
      "standing",
      "sitting",
      "walking",
      "running",
      "dancing",
      "fighting pose",
      "thinking pose",
      "waving",
    ],
    background: [
      "simple",
      "forest",
      "city",
      "beach",
      "mountain",
      "room",
      "school",
      "fantasy landscape",
    ],
    mood: [
      "happy",
      "sad",
      "angry",
      "surprised",
      "calm",
      "excited",
      "mysterious",
      "confident",
    ],
    artStyle: [
      "digital art",
      "oil painting",
      "watercolor",
      "pencil sketch",
      "cel shading",
      "photorealistic",
    ],
    aspectRatio: ["9:16", "4:3", "1:1", "3:4"],
    phase: [
      "A shot that emphasizes a specific part of the face, the face, or the mouth",
      "A full-length shot of the face, emphasizing the character's emotions",
      "A shot of a character from the chest up, emphasizing emotion and the upper body",
      "A shot that follows a character from the waist up, consistently throughout the scene",
      "A shot that emphasizes the entire body and steps upwards.",
      "A shot that clearly shows the entire character from head to toe, controlling the character's composition and clothing.",
      "A full-length shot of a character, emphasizing the importance of visualizing the character's relationship to the story.",
      "This is referred to here, emphasizing the prominence of the scenery and the story.",
    ],
  };

  const promptTemplates = [
    "A {age} {gender} {nature} {theme} ,{style} style, character with  {hairColor} {hairDecorations} {hair} hair and {eyeColor} eyes, {mood} expression, wearing {clothing} {clothingColor}, {pose},  {background} background, {artStyle}, cinematic lighting, ultra high quality, 8k, epic , aspect ratio {aspectRatio} , {phase}",
  ];

  const generatePrompt = () => {
    const template =
      promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
    let prompt = template;

    Object.entries(options).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, "g"), value);
    });

    setGeneratedPrompt(prompt);
  };

  const randomizeOptions = () => {
    const newOptions: CharacterOptions = {} as CharacterOptions;

    Object.entries(characterOptions).forEach(([key, values]) => {
      newOptions[key as keyof CharacterOptions] =
        values[Math.floor(Math.random() * values.length)];
    });

    setOptions(newOptions);

    // Auto generate prompt with random options
    const template =
      promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
    let prompt = template;

    Object.entries(newOptions).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, "g"), value);
    });

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } catch (err) {
        console.error("Failed to copy prompt:", err);
      }
    }
  };

  const handleOptionChange = (
    category: keyof CharacterOptions,
    value: string
  ) => {
    setOptions((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  useEffect(() => {
    generatePrompt();
  }, [options]);

  const translateCategory = (category: keyof CharacterOptions) => {
    switch (category) {
      case "age":
        return "อายุ";
      case "gender":
        return "เพศ";
      case "hair":
        return "ผม";
      case "theme":
        return "ธีม";
      case "nature":
        return "ลักษณะ";
      case "hairDecorations":
        return "เครื่องประดับผม";
      case "hairColor":
        return "สีผม";
      case "eyeColor":
        return "สีตา";
      case "clothing":
        return "เสื้อผ้า";
      case "clothingColor":
        return "สีเสื้อผ้า";
      case "pose":
        return "ท่าโพส";
      case "background":
        return "พื้นหลัง";
      case "mood":
        return "อารมณ์";
      case "artStyle":
        return "สไตล์ศิลปะ";
      case "style":
        return "สไตล์";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎨 Character Image Prompt Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(characterOptions).map(([category, values]) => (
            <div key={category} className="space-y-2">
              <label className="block text-sm font-medium text-slate-100 capitalize">
                {translateCategory(category as keyof CharacterOptions)}:
              </label>
              <select
                value={options[category as keyof CharacterOptions]}
                onChange={(e) =>
                  handleOptionChange(
                    category as keyof CharacterOptions,
                    e.target.value
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6 justify-center flex-wrap text-slate-100">
          <button
            onClick={generatePrompt}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Generate Prompt
          </button>

          <button
            onClick={randomizeOptions}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <Shuffle size={16} />
            Random Character
          </button>
        </div>

        {generatedPrompt && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Generated Prompt:
              </h3>
              <button
                onClick={copyPrompt}
                className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                  copiedPrompt
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Copy size={14} />
                {copiedPrompt ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">{generatedPrompt}</p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 How to use:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>{`• เลือกคุณสมบัติของตัวละครที่ต้องการ`}</li>
            <li>{`• คลิก "Generate Prompt" เพื่อสร้าง prompt`}</li>
            <li>
              {`• คัดลอก prompt ไปใช้กับ AI image generators เช่น Midjourney,
              DALL-E, Stable Diffusion`}
            </li>
            <li>{`• ลอง "Random Character" สำหรับความคิดสร้างสรรค์แบบสุ่ม`}</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {`Compatible with: Midjourney, DALL-E, Stable Diffusion, และ AI image
            generators อื่นๆ`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterPromptGenerator;
