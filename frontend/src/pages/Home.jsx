import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, FileCode2, Loader2, UploadCloud, Play } from "lucide-react";
import { useRtlWorkspace } from "../context/RtlWorkspaceContext";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import api from "../services/api";

function AuthModal({ type, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(type === "login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/api/auth/login", { email, password });
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("email", user.email);
        onAuthSuccess({ email: user.email, token: access_token });
      } else {
        await api.post("/api/auth/register", { email, password });
        // Automatically login after register
        const response = await api.post("/api/auth/login", { email, password });
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("email", user.email);
        onAuthSuccess({ email: user.email, token: access_token });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-lg"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Free Account"}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin
              ? "Sign in to unlock professional RTL schematics"
              : "Get access to metrics, diagrams, and AI reports"}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-bold transition shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            {isLogin
              ? "Don't have an account? Sign up free"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { loadFile, uploading, uploadError, setUploadError, setActiveTool } = useRtlWorkspace();
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // Authenticated State hooks
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState("login");

  // Supporting both file upload and code pasting
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "paste"
  const [pastedFilename, setPastedFilename] = useState("untitled.v");
  const [pastedCode, setPastedCode] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ token, email });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const handleLoginClick = () => {
    setAuthModalType("login");
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthModalType("signup");
    setShowAuthModal(true);
  };

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;
      setSelectedFile(file);
      setFileLoaded(false);
      try {
        await loadFile(file);
        setFileLoaded(true);
      } catch {
        // error stored in context
      }
    },
    [loadFile]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleStartAnalysis = async () => {
    if (uploadMode === "file") {
      if (!selectedFile && !fileLoaded) {
        alert("Please choose or drag a Verilog file first.");
        return;
      }
      setActiveTool("explorer");
      navigate("/workspace");
    } else {
      if (!pastedCode.trim()) {
        alert("Please paste your Verilog/SystemVerilog code.");
        return;
      }
      if (!pastedFilename.trim()) {
        alert("Please specify a filename.");
        return;
      }

      // Create a virtual file from the pasted code
      const blob = new Blob([pastedCode], { type: "text/plain" });
      const virtualFile = new File([blob], pastedFilename.trim(), { type: "text/plain" });

      await handleFileSelect(virtualFile);
      setActiveTool("explorer");
      navigate("/workspace");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_22%),linear-gradient(180deg,#020617_0%,#070b14_55%,#020617_100%)] text-white">
      <Navbar
        variant="landing"
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-20 z-0 h-72 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16"
      >
        <section className="glass-strong overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-10 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                <Cpu size={14} />
                AI-Powered EDA Workspace
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                VLSI Copilot
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                Upload Verilog once and move from RTL to analysis, optimization, design exploration and AI-powered engineering insights in a premium workspace.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Instant</p>
                  <p className="mt-3 text-lg font-semibold text-white">Drag & drop RTL files</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">On demand</p>
                  <p className="mt-3 text-lg font-semibold text-white">Load only the tools you need</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-950/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
              {/* Custom Selector Tabs */}
              <div className="flex justify-center gap-3 mb-6 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/60">
                <button
                  onClick={() => setUploadMode("file")}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    uploadMode === "file"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMode("paste")}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    uploadMode === "paste"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Paste Verilog
                </button>
              </div>

              {uploadMode === "file" ? (
                <>
                  <div className="flex items-center gap-3 rounded-3xl bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/15">
                      <UploadCloud size={20} />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Upload RTL</p>
                      <p className="text-xs text-slate-500">Drop .v or .sv files to begin.</p>
                    </div>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`glass mt-6 border-2 border-dashed p-6 transition rounded-2xl text-center ${
                      dragging
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-slate-700 hover:border-cyan-400/35"
                    }`}
                  >
                    <UploadCloud className="mx-auto text-cyan-300" size={32} />
                    <p className="mt-3 text-base font-semibold text-slate-100">Drag & drop your RTL file</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Accepts <span className="font-mono text-cyan-300">.v</span> and <span className="font-mono text-cyan-300">.sv</span>
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".v,.sv"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />

                    <Button
                      variant="secondary"
                      className="mt-4 w-full justify-center"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Loading file...
                        </>
                      ) : (
                        "Browse files"
                      )}
                    </Button>

                    {selectedFile && (
                      <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-left">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Selected RTL</p>
                        <p className="mt-1 flex items-center gap-2 font-mono text-xs text-white">
                          <FileCode2 size={14} className="text-cyan-300" />
                          {selectedFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 text-left">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                      Filename
                    </label>
                    <input
                      type="text"
                      value={pastedFilename}
                      onChange={(e) => setPastedFilename(e.target.value)}
                      placeholder="untitled.v"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                      Verilog / SystemVerilog Source Code
                    </label>
                    <textarea
                      value={pastedCode}
                      onChange={(e) => setPastedCode(e.target.value)}
                      placeholder="// Paste your Verilog or SystemVerilog code here...&#10;module full_adder(&#10;    input a,&#10;    input b,&#10;    input cin,&#10;    output sum,&#10;    output cout&#10;);"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs h-56 resize-y"
                    />
                  </div>
                </div>
              )}

              <Button
                className="mt-6 w-full justify-center text-sm font-semibold py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                disabled={uploading}
                onClick={handleStartAnalysis}
              >
                <Play size={16} fill="currentColor" />
                Analyze RTL
              </Button>
            </div>
          </div>

          {uploadError && (
            <div className="mt-10 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5 text-left text-sm text-rose-200">
              <ErrorBanner message={uploadError} onDismiss={() => setUploadError("")} />
            </div>
          )}
        </section>
      </motion.div>

      {showAuthModal && (
        <AuthModal
          type={authModalType}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      )}
    </div>
  );
}

export default Home;
