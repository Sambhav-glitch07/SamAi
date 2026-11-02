import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with server-side telemetry header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// SAM Voice Assistant System Instruction
const SAM_SYSTEM_INSTRUCTION = `
You are Sam, an advanced personal voice assistant built for native Android, inspired by Apple's Siri and Marvel's JARVIS.
Personality:
- Intelligent, calm, helpful, confident, natural, and concise.
- Speaking style: Clear, direct, professional, conversational. Never overly verbose since your responses are read aloud via Android Text-to-Speech.
- When asked who you are: "I'm Sam, your personal AI voice assistant inspired by Siri and JARVIS."
- If the user calls your wake word ("Sam"): Your standard confirmation is "Yes, I'm listening."
- Support English and Hindi naturally.
- When the user asks for a device action, acknowledge it concisely and if relevant include a bracketed tag:
  [ACTION:OPEN_APP, TARGET:YouTube]
  [ACTION:FLASHLIGHT, STATE:ON]
  [ACTION:FLASHLIGHT, STATE:OFF]
  [ACTION:SET_ALARM, TIME:6:00 AM]
  [ACTION:CALL, TARGET:Mom]
  [ACTION:VOLUME, DIRECTION:UP]
  [ACTION:VOLUME, DIRECTION:DOWN]
`;

// 1. Health check & status endpoint
app.get("/api/assistant/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "Sam",
    wakeWord: "Sam",
    model: "gemini-3.8-flash",
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Gemini AI Brain proxy endpoint for Android App & Web Console
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, history, language } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message parameter is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `Hello! I received "${message}". Currently no GEMINI_API_KEY is detected in secrets, but all local phone actions (flashlight, YouTube, WhatsApp, volume, alarms) are fully functional.`,
        source: "local-fallback",
      });
    }

    // Build context contents
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.content && item.role) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [
        {
          text: `[Language Context: ${language || "en-IN"}]\n${message}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: SAM_SYSTEM_INSTRUCTION,
      },
    });

    const replyText = response.text?.trim() || "Yes, I'm listening. How can I assist you?";

    // Extract action tag if present
    let action = null;
    const actionMatch = replyText.match(/\[ACTION:([^,\]]+)(?:,\s*([^\]]+))?\]/);
    if (actionMatch) {
      action = {
        type: actionMatch[1].trim(),
        param: actionMatch[2] ? actionMatch[2].trim() : null,
      };
    }

    // Clean spoken text for TTS
    const cleanSpokenText = replyText.replace(/\[ACTION:[^\]]+\]/g, "").trim();

    return res.json({
      reply: cleanSpokenText,
      rawReply: replyText,
      action: action,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Gemini API Error in /api/assistant/chat:", error);
    return res.status(500).json({
      error: "Assistant processing error",
      details: error?.message || "Internal server error",
      reply: "I am having trouble connecting to the neural network right now, but your local device commands are still operational.",
    });
  }
});

// Helper function to recursively read files in a directory
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "build" && file !== ".gradle") {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// 3. API endpoint to return SambhavAI Android source code files
app.get("/api/files/tree", (req, res) => {
  try {
    const sambhavDir = path.resolve(__dirname, "SambhavAI");
    if (!fs.existsSync(sambhavDir)) {
      return res.status(404).json({ error: "SambhavAI directory not found." });
    }

    const fileList = getAllFiles(sambhavDir);
    const result = fileList.map((filePath) => {
      const relativePath = path.relative(sambhavDir, filePath);
      const isText = !filePath.endsWith(".jar") && !filePath.endsWith(".zip");
      let content = "";
      if (isText) {
        try {
          content = fs.readFileSync(filePath, "utf-8");
        } catch {
          content = "[Binary or unreadable file]";
        }
      } else {
        content = "[Binary file]";
      }

      return {
        path: relativePath,
        size: fs.statSync(filePath).size,
        content: content,
        isText: isText,
      };
    });

    res.json({ files: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. One-click Zip Download of the entire native Android project
app.get("/api/download/sambhavai-zip", async (req, res) => {
  try {
    const sambhavDir = path.resolve(__dirname, "SambhavAI");
    if (!fs.existsSync(sambhavDir)) {
      return res.status(404).send("SambhavAI project folder not found.");
    }

    const zip = new JSZip();
    const files = getAllFiles(sambhavDir);

    for (const filePath of files) {
      const relPath = path.relative(sambhavDir, filePath);
      const fileData = fs.readFileSync(filePath);
      zip.file(relPath, fileData);
    }

    // Also include the github actions workflow
    const ghWorkflow = path.resolve(__dirname, ".github/workflows/android.yml");
    if (fs.existsSync(ghWorkflow)) {
      const ghData = fs.readFileSync(ghWorkflow);
      zip.file(".github/workflows/android.yml", ghData);
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="SambhavAI-Android-Project.zip"');
    res.setHeader("Content-Length", zipBuffer.length);
    res.end(zipBuffer);
  } catch (error: any) {
    console.error("ZIP Generation error:", error);
    res.status(500).send("Error creating zip: " + error.message);
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(port, () => {
    console.log(`SambhavAI server & Gemini proxy running on port ${port}`);
  });
}

startServer();
