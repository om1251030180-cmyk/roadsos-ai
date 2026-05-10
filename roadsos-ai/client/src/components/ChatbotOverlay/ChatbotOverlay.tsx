"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

type ChatMeta = { language: string; isEmergency: boolean };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  isEmergency?: boolean;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function ChatbotOverlay() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"companion" | "law" | "report">("companion");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      text: "RoadSoS AI is online. Ask for emergency help, traffic law guidance, route safety, or RoadWatch reporting.",
    },
  ]);

  const emergencyHint = useMemo(() => messages.some((m) => m.isEmergency), [messages]);

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;

    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 }
      );
    });
  };

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const loc = await getCurrentLocation();

      const res = await axios.post<{ reply: string; meta: ChatMeta }>("http://localhost:4000/api/chat", {
        message: trimmed,
        language: "en",
        ...(loc ? { lat: loc.lat, lng: loc.lng } : {}),
      });

      const data = res.data;
      const isEmergency = data.meta?.isEmergency ?? false;

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: data.reply,
        isEmergency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: "Sorry—chat service is temporarily unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 z-[70] rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:bottom-6 sm:right-6"
      >
        {open ? "Companion ✕" : "Companion"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-4 z-[70] w-[min(460px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-white/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.92),rgba(3,8,18,0.85))] shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:right-6"
          >
              <div className="border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/55">AI companion</div>
                    <div className="text-lg font-black leading-none">RoadSoS Neural Guide</div>
                    <div className="text-xs font-medium text-white/65">
                      {emergencyHint ? "Emergency intelligence enabled" : "Always-on safety and law support"}
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-white backdrop-blur-xl"
                  >
                    Hide
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[["Companion", "companion"], ["DriveLegal", "law"], ["RoadWatch", "report"]].map(([label, value]) => (
                    <button
                      key={value}
                      onClick={() => setMode(value as typeof mode)}
                      className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                        mode === value ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 border-b border-white/10 px-4 py-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Voice</div>
                  <div className="mt-1 text-sm font-black text-white">Continuous</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Memory</div>
                  <div className="mt-1 text-sm font-black text-white">Context aware</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Language</div>
                  <div className="mt-1 text-sm font-black text-white">EN / multilingual</div>
                </div>
              </div>

              <div className="h-[330px] overflow-y-auto px-4 py-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`mb-3 rounded-2xl border px-3 py-2 ${
                      m.role === "user"
                        ? "border-cyan-300/15 bg-cyan-300/10"
                        : m.isEmergency
                          ? "border-red-300/20 bg-red-500/10"
                          : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                      {m.role === "user" ? "You" : m.isEmergency ? "Emergency Copilot" : "Assistant"}
                    </div>
                    <div className={`mt-1 whitespace-pre-wrap break-words text-sm font-medium ${m.role === "user" ? "text-cyan-50" : "text-white/90"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-3 py-2">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Assistant is thinking...</div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["Nearest hospital", "Helmets fine", "Report pothole", "Flood-safe route"].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setText(chip)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

              <div className="text-white">
                  <div className="flex items-center gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSend();
                      }}
                      placeholder={
                        mode === "law"
                          ? "Ask: helmet fine, drunk driving law, challan calculator..."
                          : mode === "report"
                            ? "Report: pothole, broken light, illegal parking..."
                            : "Ask: nearest ambulance, accident help, safe route..."
                      }
                      className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      onClick={onSend}
                      disabled={loading}
                      className="rounded-full border border-white/10 bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Send
                    </button>
                </div>
                  <div className="mt-2 text-[11px] font-medium text-white/55">
                    Sends GPS to <span className="font-black text-cyan-100">/api/chat</span> when allowed.
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
