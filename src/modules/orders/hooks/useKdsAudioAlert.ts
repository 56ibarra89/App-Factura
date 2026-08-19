import { useState, useEffect, useCallback, useRef } from "react";
import type { Order } from "../model/order.types";

const STORAGE_KEY = "kds_audio_muted";

export interface UseKdsAudioAlertReturn {
  isMuted: boolean;
  toggleMute: () => void;
  playNewOrderSound: () => void;
  newOrderAlert: Order | null;
  clearNewOrderAlert: () => void;
}

export function useKdsAudioAlert(activeOrders: readonly Order[]): UseKdsAudioAlertReturn {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const previousOrdersCountRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {

      }
      return next;
    });
  }, []);

  const playNewOrderSound = useCallback(() => {
    if (isMuted) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, now + 0.15);
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn("No se pudo reproducir el sonido KDS:", e);
    }
  }, [isMuted]);

  useEffect(() => {
    if (previousOrdersCountRef.current === null) {
      previousOrdersCountRef.current = activeOrders.length;
      return;
    }

    if (activeOrders.length > previousOrdersCountRef.current) {
      const newestOrder = activeOrders[activeOrders.length - 1] || activeOrders[0];
      setNewOrderAlert(newestOrder);
      playNewOrderSound();
    }

    previousOrdersCountRef.current = activeOrders.length;
  }, [activeOrders, playNewOrderSound]);

  const clearNewOrderAlert = useCallback(() => {
    setNewOrderAlert(null);
  }, []);

  return {
    isMuted,
    toggleMute,
    playNewOrderSound,
    newOrderAlert,
    clearNewOrderAlert,
  };
}

