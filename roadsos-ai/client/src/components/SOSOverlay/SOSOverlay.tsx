"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

type SosResponse = {
  ok: boolean;
  firstAid: string;
  emergencyContacts: Array<{ type: string; number: string }>;
  nearby: {
    hospitals: Array<{ name: string; distanceKm: number }>;
    ambulances: Array<{ name: string; distanceKm: number; phone: string }>;
    police: Array<{ name: string; distanceKm: number; phone: string }>;
  };
  meta: {
    normalizedMessage: string;
    location: { lat: number; lng: number };
  };
};

type Coords = { lat: number; lng: number };

async function getCurrentLocation(): Promise<Coords> {
  return await new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 }
    );
  });
}

export default function SOSOverlay() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sos, setSos] = useState<SosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pulseBg = useMemo(() => (open ? "bg-red-500" : "bg-rose-600"), [open]);

  const onSOS = async () => {
    setError(null);
    setLoading(true);
    setOpen(true);

    try {
      const coords = await getCurrentLocation();
      const res = await axios.post<SosResponse>("http://localhost:4000/api/sos", {
        lat: coords.lat,
        lng: coords.lng,
        message: "Help accident near me",
        language: "en",
      });

      if (res.data?.ok) setSos(res.data);
      else setError("SOS request failed.");
    } catch {
      setError("Could not get location / call SOS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={onSOS}
        className={`fixed bottom-5 left-4 z-[70] overflow-hidden rounded-full border border-white/15 px-6 py-4 text-left text-white shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl transition sm:bottom-6 sm:left-6 ${pulseBg}`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_40%)]" />
        <span className="relative flex items-center gap-4">
          <motion.span
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-black tracking-[0.35em]"
            animate={open ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, repeat: open ? Infinity : 0, ease: "easeInOut" }}
          >
            SOS
          </motion.span>
          <span className="max-w-[180px] text-sm font-black uppercase tracking-[0.22em] sm:max-w-none">
            Emergency mode
            <span className="mt-1 block text-[11px] font-semibold normal-case tracking-normal text-white/75">
              Every second saves a life
            </span>
          </span>
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-4 z-[69] w-[min(560px,calc(100vw-24px))] overflow-hidden rounded-[30px] border border-white/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.95),rgba(3,8,18,0.9))] shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:left-6"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[linear-gradient(90deg,rgba(239,68,68,0.95),rgba(190,18,60,0.96))] px-5 py-4">
            <div className="text-white">
              <div className="text-2xl font-black leading-tight">Emergency Mode</div>
              <div className="text-sm font-medium text-white/85">Location, response routing, first aid, and hotline controls</div>
            </div>

            <button
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-black text-white backdrop-blur-xl"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Close
            </button>
          </div>

          <div className="p-5">
            {loading && <div className="font-black text-lg text-cyan-100">Calling SOS and isolating nearest services...</div>}
            {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 font-bold text-red-100">{error}</div>}

            {sos && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-white/50">Detected</div>
                  <div className="text-lg font-black text-white">{sos.meta.normalizedMessage}</div>
                  <div className="text-sm text-white/70">
                    Lat {sos.meta.location.lat.toFixed(4)} / Lng {sos.meta.location.lng.toFixed(4)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-3">
                    <div className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100/80">Ambulance</div>
                    <div className="mt-1 font-black text-white">{sos.nearby.ambulances?.[0]?.name ?? "—"}</div>
                    <div className="text-sm text-white/70">{sos.nearby.ambulances?.[0]?.phone ?? "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 p-3">
                    <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-100/80">Hospital</div>
                    <div className="mt-1 font-black text-white">{sos.nearby.hospitals?.[0]?.name ?? "—"}</div>
                    <div className="text-sm text-white/70">
                      {sos.nearby.hospitals?.[0]?.distanceKm ? `${sos.nearby.hospitals[0].distanceKm.toFixed(1)} km` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-3">
                    <div className="text-sm font-black uppercase tracking-[0.18em] text-amber-100/80">Police</div>
                    <div className="mt-1 font-black text-white">{sos.nearby.police?.[0]?.name ?? "—"}</div>
                    <div className="text-sm text-white/70">{sos.nearby.police?.[0]?.phone ?? "—"}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-amber-100/80">First Aid (General)</div>
                  <div className="mt-2 text-sm font-medium text-white/88">{sos.firstAid}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-black uppercase tracking-[0.18em] text-white/50">Emergency Contacts</div>
                  <div className="mt-2 flex flex-col gap-2">
                    {sos.emergencyContacts.map((c) => (
                      <div key={`${c.type}-${c.number}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/55 px-3 py-2">
                        <div className="font-black text-white">{c.type}</div>
                        <div className="font-black text-cyan-100">{c.number}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
