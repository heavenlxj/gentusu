import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "@/config/site";
import { kinkora, type Generation } from "@/lib/kinkora";

const POLL_MS = CONFIG.demoMode ? 2000 : 5000;

const isRunning = (g: Generation) => g.status === "processing" || g.status === "finalizing";

/** 结果库：有进行中的任务时轮询，并在两次轮询之间按预估时间平滑推进进度 */
export function useGenerations(enabled: boolean, onSettled?: () => void) {
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const fetchedAt = useRef(Date.now());
  const itemsRef = useRef<Generation[]>([]);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  const load = useCallback(async () => {
    try {
      const list = await kinkora.listGenerations();
      fetchedAt.current = Date.now();
      const wasRunning = new Set(itemsRef.current.filter(isRunning).map((g) => g.id));
      itemsRef.current = list;
      setItems(list);
      if (list.some((g) => wasRunning.has(g.id) && !isRunning(g))) settledRef.current?.();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    load();
  }, [enabled, load]);

  const running = items.some(isRunning);
  useEffect(() => {
    if (!enabled || !running) return;
    const poll = window.setInterval(load, POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [enabled, running, load]);

  const live = useMemo(
    () =>
      items.map((g) => {
        if (g.status !== "processing") return g;
        const elapsed = g.elapsedSeconds + (now - fetchedAt.current) / 1000;
        return {
          ...g,
          progress: Math.max(g.progress, Math.min(95, Math.round((elapsed / g.etaSeconds) * 95))),
          remainingSeconds: Math.max(10, g.etaSeconds - elapsed),
        };
      }),
    [items, now],
  );

  const remove = useCallback(async (id: string) => {
    await kinkora.deleteGeneration(id);
    itemsRef.current = itemsRef.current.filter((g) => g.id !== id);
    setItems(itemsRef.current);
  }, []);

  return { items: live, loading, error, reload: load, remove };
}
