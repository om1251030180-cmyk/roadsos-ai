"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { speak as elevenLabsSpeak, type VoiceStyle } from "@/utils/voice";

type Emotion = "idle" | "listening" | "thinking" | "speaking" | "emergency";

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
};

function useWakeSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionType;
      webkitSpeechRecognition?: new () => SpeechRecognitionType;
    };

    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const start = (onFinal: (text: string) => void, onInterim?: (text: string) => void) => {
    const rec = recognitionRef.current;
    if (!rec) return false;

    rec.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: Array<{
          isFinal: boolean;
          0?: { transcript?: string };
        }>;
      };

      let interim = "";
      let finalText = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0]?.transcript ?? "";
        if (e.results[i].isFinal) finalText += transcript;
        else interim += transcript;
      }

      if (onInterim && interim.trim()) onInterim(interim.trim());
      if (finalText.trim()) onFinal(finalText.trim());
    };

    rec.onerror = () => {
      // Let outer UI handle “thinking/listening” fallback.
    };

    try {
      rec.start();
      return true;
    } catch {
      return false;
    }
  };

  const stop = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  };

  return { start, stop };
}

function normalizeWakeText(s: string) {
  const t = s.toLowerCase();
  // minimal wake word support
  if (
    t.includes("hey roadso") ||
    t.includes("hey roadsos") ||
    t.includes("emergency help") ||
    t.includes("ai assistant") ||
    t.includes("roadsos")
  ) {
    return t;
  }
  return null;
}

export default function VoiceCompanionOrb() {
  const orbitControls = useAnimation();

  const [emotion, setEmotion] = useState<Emotion>("idle");
  const [interim, setInterim] = useState<string>("");
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [listeningEnabled, setListeningEnabled] = useState(true);

  // draggable position
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const { start, stop } = useWakeSpeechRecognition();

  const wakewords = useMemo(
    () => ["hey roadso", "hey roadsos", "emergency help", "ai assistant", "roadsos"],
    []
  );

  const speak = async (text: string, isEmergency: boolean = false) => {
    if (typeof window === "undefined") return;

    setEmotion("speaking");

    // Choose voice style based on context
    const voiceStyle: VoiceStyle = isEmergency ? "emergency" : "professional";

    // Try ElevenLabs first (premium voice)
    const success = await elevenLabsSpeak(text, voiceStyle);

    if (!success) {
      // Fallback to browser TTS if ElevenLabs unavailable
      console.warn("ElevenLabs unavailable, falling back to browser TTS");
      const synth = window.speechSynthesis;
      if (synth) {
        try {
          synth.cancel();
        } catch {
          // ignore
        }

        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 1.02;
          u.pitch = 1.0;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          synth.speak(u);
        });
      }
    }

    setEmotion("listening");
  };

  const handleCommand = async (raw: string) => {
    const wake = normalizeWakeText(raw);
    setLastTranscript(raw);
    setInterim("");

    if (!wake) {
      // if no wake word, ignore (still emotional idle behavior)
      setEmotion("thinking");
      await new Promise((r) => setTimeout(r, 450));
      setEmotion("listening");
      return;
    }

    // extract user intent after wake word heuristically
    const userIntent = raw.replace(/hey roadso[s]?/gi, "").replace(/roadsos/gi, "").trim();

    setEmotion("thinking");

    // MVP: use existing backend /api/chat with location-aware behavior.
    // We just let the /api/chat reply drive what we say.
    try {
      setEmotion("thinking");
      orbitControls.start({
        scale: 1.02,
        boxShadow: "0 0 40px rgba(59,130,246,0.65)",
      });

      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userIntent || raw,
          language: "en",
        }),
      });

      const data = (await res.json()) as { reply?: string; meta?: { isEmergency?: boolean } };
      const replyText = data.reply ?? "I couldn’t process that. Please try again.";

      const isEmergency = data.meta?.isEmergency ?? /accident|sos|emergency|injur|crash/i.test(raw);
      if (isEmergency) setEmotion("emergency");
      else setEmotion("speaking");

      await speak(replyText, isEmergency);
    } catch {
      await speak("Sorry, voice assistant is having trouble right now.", false);
      setEmotion("listening");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Start continuous listening once mounted.
    if (!listeningEnabled) {
      setEmotion("idle");
      return;
    }

    const ok = start(
      (finalText) => handleCommand(finalText),
      (interimText) => {
        setInterim(interimText);
      }
    );

    window.setTimeout(() => setEmotion(ok ? "listening" : "idle"), 0);

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listeningEnabled]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };

    const onPointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const emotionLabel =
    emotion === "idle"
      ? "Ready"
      : emotion === "listening"
        ? "Listening…"
        : emotion === "thinking"
          ? "Thinking…"
          : emotion === "speaking"
            ? "Speaking"
            : "Emergency";

  const glowColor =
    emotion === "emergency"
      ? "rgba(239,68,68,0.75)"
      : emotion === "speaking"
        ? "rgba(59,130,246,0.75)"
        : emotion === "listening"
          ? "rgba(56,189,248,0.6)"
          : "rgba(99,102,241,0.35)";

  const orbBase =
    emotion === "emergency"
      ? "border-red-500"
      : emotion === "listening"
        ? "border-sky-400"
        : emotion === "speaking"
          ? "border-blue-400"
          : "border-violet-400";

  return (
    <div className="fixed left-0 top-0 z-[68] pointer-events-none">
      <motion.div
        className="pointer-events-auto select-none"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        drag={false}
        onPointerDown={(e) => {
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.x,
            origY: pos.y,
          };
        }}
        animate={orbitControls}
        initial={false}
      >
        {/* Orbit particles */}
        <div className="relative">
          <motion.div
            className={`relative flex h-[92px] w-[92px] items-center justify-center rounded-full border-4 ${orbBase} bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.12),rgba(5,10,20,0.75)_64%)] backdrop-blur-2xl shadow-[0_0_36px_rgba(59,130,246,0.35)]`}
            style={{
              boxShadow: `0 0 50px ${glowColor}`,
            }}
            animate={{
              y: emotion === "emergency" ? [0, -4, 0] : [0, -2, 0],
              scale: emotion === "speaking" ? 1.03 : 1,
              filter: emotion === "thinking" ? "saturate(1.2) brightness(1.08)" : "none",
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* breathing */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                opacity: emotion === "idle" ? 0.35 : 0.8,
              }}
              transition={{ duration: 0.7 }}
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.22), transparent 55%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.18), transparent 58%)",
              }}
            />
            {/* Eyes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-3">
                <motion.div
                  className="w-6 h-6 rounded-full bg-white/90"
                  animate={{
                    scale: emotion === "listening" ? [1, 0.9, 1] : 1,
                  }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-6 h-6 rounded-full bg-white/90"
                  animate={{
                    scale: emotion === "listening" ? [1, 0.9, 1] : 1,
                  }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
            {/* Equalizer ring */}
            <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2">
              {emotion === "speaking" && (
                <motion.div
                  className="w-[72px] h-[72px] rounded-full border-2 border-sky-300/50"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
          </motion.div>

          {/* particles ring */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(44px)`,
                  boxShadow: `0 0 12px ${glowColor}`,
                }}
                animate={
                  emotion === "thinking" || emotion === "listening" || emotion === "emergency"
                    ? { y: [0, -6, 0], opacity: [0.35, 1, 0.4] }
                    : { opacity: 0.55 }
                }
                transition={{ duration: 1.3 + i * 0.06, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* hover label */}
          <div className="mt-2 absolute left-1/2 top-full w-[200px] -translate-x-1/2 text-center">
            <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-black text-white backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              {emotionLabel}
              {interim ? ` • "${interim.slice(0, 18)}…" ` : ""}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
          <button
            onClick={() => setListeningEnabled((current) => !current)}
            className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80 backdrop-blur-xl transition hover:bg-white/10"
          >
            {listeningEnabled ? "Listening" : "Voice off"}
          </button>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-xl">drag me</span>
        </div>
      </motion.div>

      {/* Minimal “transcript” debug (hidden visually but accessible for demo) */}
      <div className="sr-only">{lastTranscript}</div>
    </div>
  );
}
