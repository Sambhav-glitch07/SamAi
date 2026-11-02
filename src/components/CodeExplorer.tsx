import React, { useState, useEffect } from "react";
import {
  Folder,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Layers,
  Search,
} from "lucide-react";
import { AndroidFile } from "../types";

export const CodeExplorer: React.FC = () => {
  const [files, setFiles] = useState<AndroidFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<AndroidFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files/tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
          // Default select MainActivity.kt if present
          const mainActivity = data.files.find((f: AndroidFile) =>
            f.path.includes("MainActivity.kt")
          );
          setSelectedFile(mainActivity || data.files[0] || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load files:", err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Download Bar */}
      <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium mb-2">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            STANDALONE ANDROID REPOSITORY
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Complete Native Android Codebase
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse and copy 100% complete Kotlin, XML, Gradle, and GitHub Actions files formatted for phone editing.
          </p>
        </div>

        <a
          href="/api/download/sambhavai-zip"
          download="SambhavAI-Android-Project.zip"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Download className="w-4 h-4" />
          Download Android ZIP Repository
        </a>
      </div>

      {/* Code Viewer & File Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree */}
        <div className="lg:col-span-4 liquid-glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Project Files ({files.length})
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="max-h-[560px] overflow-y-auto space-y-1 pr-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Loading repository structure...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching files found.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const isKotlin = file.path.endsWith(".kt");
                const isXml = file.path.endsWith(".xml");
                const isGradle = file.path.endsWith(".gradle.kts");

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    {isKotlin ? (
                      <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : isXml ? (
                      <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : isGradle ? (
                      <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate font-mono text-[11px]">{file.path}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Code Content Display */}
        <div className="lg:col-span-8 liquid-glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[640px]">
          {selectedFile ? (
            <>
              {/* File details bar */}
              <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-cyan-300 font-bold truncate">
                    SambhavAI/{selectedFile.path}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Complete Source File
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Full File
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre container */}
              <div className="flex-1 overflow-auto bg-[#070b19] p-4 text-[12px] font-mono leading-relaxed text-slate-200">
                <pre className="select-text whitespace-pre">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a file from the left to inspect its contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
