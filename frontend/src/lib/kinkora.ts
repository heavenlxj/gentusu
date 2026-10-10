import { COINS_PER_CREDIT, CONFIG, type BillingInterval } from "@/config/site";
import { getVisitorId } from "@/lib/fingerprint";
import { supabase } from "@/lib/supabase";

export interface VideoTaskRequest {
  providerId: string;
  modelId: string;
  params: Record<string, unknown>;
  /** 结果库展示用（标题 / 时长 / 清晰度 / 封面） */
  meta?: GenerationMeta;
  /** 仅演示模式使用：模拟渲染完成后返回的成片 */
  demoOutput?: string;
}

export interface GenerationMeta {
  mode?: string;
  title?: string;
  seconds?: number;
  resolution?: string;
  aspect?: string;
  poster?: string;
  thumbs?: string[];
}

export type GenerationStatus = "processing" | "finalizing" | "succeeded" | "failed";

export interface Generation {
  id: string;
  shareId: string;
  status: GenerationStatus;
  /** 0–100 */
  progress: number;
  etaSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  title?: string | null;
  resolution?: string | null;
  seconds?: number | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  watermarked: boolean;
  createdAt: string;
  completedAt?: string | null;
  credits?: number;
  error?: string | null;
  meta: GenerationMeta;
}

export interface BillingState {
  /** 可用站点积分（已扣除进行中任务的预留） */
  credits: number;
  subscription: {
    lookup: string;
    interval: BillingInterval;
    status: "active" | "past_due";
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    monthlyCredits: number;
  } | null;
  /** 当月订阅积分余量（到期作废） */
  subscriptionCredits: number;
  /** 积分包余量（永久） */
  packCredits: number;
  nextExpiry: { credits: number; at: string } | null;
  upcoming: { credits: number; at: string }[];
}

export const EMPTY_BILLING: BillingState = {
  credits: 0,
  subscription: null,
  subscriptionCredits: 0,
  packCredits: 0,
  nextExpiry: null,
  upcoming: [],
};

const toCredits = (coins: unknown) => Math.floor(Number(coins ?? 0) / COINS_PER_CREDIT);

export class KinkoraError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function getToken(): Promise<string> {
  if (!supabase) throw new KinkoraError("Auth is not configured", "AUTH_NOT_CONFIGURED");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new KinkoraError("Please sign in to continue", "AUTH_REQUIRED", 401);
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const [token, fingerprint] = await Promise.all([getToken(), getVisitorId()]);
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (fingerprint) headers["X-Device-Fingerprint"] = fingerprint;
  if (!(init.body instanceof FormData)) headers["Content-Type"] = "application/json";

  const res = await fetch(`${CONFIG.apiBaseUrl}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body?.detail;
    const code = (typeof detail === "object" && detail?.error_code) || body?.error_code || body?.code;
    const message = (typeof detail === "object" ? detail?.message : detail) || body?.message || res.statusText;
    if (res.status === 402 || code === "INSUFFICIENT_CREDITS") {
      throw new KinkoraError("Not enough credits", "INSUFFICIENT_CREDITS", res.status);
    }
    if (res.status === 401) throw new KinkoraError("Please sign in to continue", "AUTH_REQUIRED", 401);
    if (res.status === 403 && /registration denied/i.test(message ?? "")) {
      throw new KinkoraError(
        "We couldn't open an account for this sign-in. Please use your personal Google account on your own device.",
        "REGISTRATION_DENIED",
        403,
      );
    }
    throw new KinkoraError(message || "Request failed", code, res.status);
  }

  const json = await res.json();
  return (json && typeof json === "object" && "success" in json ? json.data : json) as T;
}

function toGeneration(d: any): Generation {
  return {
    id: d.id,
    shareId: d.share_id,
    status: d.status,
    progress: Number(d.progress ?? 0),
    etaSeconds: Number(d.eta_seconds ?? 300),
    remainingSeconds: Number(d.remaining_seconds ?? 0),
    elapsedSeconds: Number(d.elapsed_seconds ?? 0),
    title: d.title,
    resolution: d.resolution,
    seconds: d.seconds,
    videoUrl: d.video_url,
    posterUrl: d.poster_url,
    watermarked: !!d.watermarked,
    createdAt: d.created_at,
    completedAt: d.completed_at,
    credits: d.credits != null ? toCredits(d.credits) : undefined,
    error: d.error,
    meta: d.meta ?? {},
  };
}

const realApi = {
  async upload(file: File, kind: "images" | "videos" = "images"): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("file_type", kind);
    const data = await request<{ signedUrl: string }>("/storage/upload", { method: "POST", body: form });
    const url = data.signedUrl;
    return url.startsWith("/") ? `${CONFIG.apiBaseUrl}${url}` : url;
  },

  /** 提交后任务在后台运行（积分先预留，成功后扣除，失败自动退回），返回结果库记录 ID */
  async submitVideo(req: VideoTaskRequest): Promise<string> {
    const data = await request<{ generation_id?: string; provider_task_id: string }>("/ai-generation/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: (req.params.prompt as string) ?? "",
        provider_id: req.providerId,
        model_id: req.modelId,
        model_params: req.params,
        site_meta: req.meta,
      }),
    });
    return data.generation_id ?? data.provider_task_id;
  },

  async listGenerations(): Promise<Generation[]> {
    const data = await request<any[]>("/site/generations?limit=60");
    return (data ?? []).map(toGeneration);
  },

  async deleteGeneration(id: string): Promise<void> {
    await request(`/site/generations/${id}`, { method: "DELETE" });
  },

  /** 公开分享页，无需登录 */
  async getShared(shareId: string): Promise<Generation> {
    const res = await fetch(`${CONFIG.apiBaseUrl}/site/share/${encodeURIComponent(shareId)}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new KinkoraError(body?.detail?.message ?? "This video is no longer available", "NOT_FOUND", res.status);
    return toGeneration(body.data ?? body);
  },

  async getBilling(): Promise<BillingState> {
    const d = await request<any>("/billing/overview");
    const sub = d.subscription;
    return {
      credits: toCredits(d.available),
      subscription: sub
        ? {
            lookup: sub.lookup_name,
            interval: sub.interval === "year" ? "year" : "month",
            status: sub.status,
            periodEnd: sub.current_period_end ?? null,
            cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            monthlyCredits: toCredits(sub.credits_monthly),
          }
        : null,
      subscriptionCredits: toCredits(d.subscription_remaining),
      packCredits: toCredits(d.pack_remaining),
      nextExpiry: d.next_expiry ? { credits: toCredits(d.next_expiry.amount), at: d.next_expiry.at } : null,
      upcoming: (d.upcoming ?? []).map((u: any) => ({ credits: toCredits(u.amount), at: u.at })),
    };
  },

  /** 订阅（无订阅时）或积分包（需有效订阅）→ Stripe Checkout 地址 */
  async checkout(lookup: string): Promise<string> {
    const data = await request<{ checkout_url: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({
        lookup_key: lookup,
        success_url: `${window.location.origin}/?checkout=success#pricing`,
        cancel_url: window.location.href,
      }),
    });
    return data.checkout_url;
  },

  /** 升级：按比例补差价并立即扣款，返回本次支付金额（美分） */
  async upgrade(lookup: string): Promise<{ amountPaid: number; topup: number }> {
    const data = await request<{ amount_paid: number; topup: number }>("/billing/upgrade", {
      method: "POST",
      body: JSON.stringify({ lookup_key: lookup }),
    });
    return { amountPaid: data.amount_paid ?? 0, topup: toCredits(data.topup) };
  },

  async setCancel(cancel: boolean): Promise<void> {
    await request(cancel ? "/billing/cancel" : "/billing/resume", { method: "POST" });
  },

  async portal(): Promise<string> {
    const data = await request<{ url: string }>("/billing/portal", {
      method: "POST",
      body: JSON.stringify({ return_url: `${window.location.origin}/#pricing` }),
    });
    return data.url;
  },
};

const DEMO_ETA = 20;
const demoGenerations: (Generation & { startedAt: number; output?: string })[] = [];

function demoView(g: (typeof demoGenerations)[number]): Generation {
  const elapsed = (Date.now() - g.startedAt) / 1000;
  if (elapsed < DEMO_ETA) {
    return { ...g, status: "processing", progress: Math.round((elapsed / DEMO_ETA) * 95), elapsedSeconds: elapsed, remainingSeconds: DEMO_ETA - elapsed };
  }
  return { ...g, status: "succeeded", progress: 100, elapsedSeconds: elapsed, remainingSeconds: 0, videoUrl: g.output, posterUrl: g.meta.poster };
}

const demoApi: typeof realApi = {
  async upload(file) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    return URL.createObjectURL(file);
  },
  async submitVideo(req) {
    const id = `demo_${Date.now()}`;
    demoGenerations.unshift({
      id,
      shareId: id,
      status: "processing",
      progress: 0,
      etaSeconds: DEMO_ETA,
      remainingSeconds: DEMO_ETA,
      elapsedSeconds: 0,
      title: req.meta?.title,
      resolution: req.meta?.resolution,
      seconds: req.meta?.seconds,
      watermarked: true,
      createdAt: new Date().toISOString(),
      meta: req.meta ?? {},
      startedAt: Date.now(),
      output: req.demoOutput,
    });
    return id;
  },
  async listGenerations() {
    return demoGenerations.map(demoView);
  },
  async deleteGeneration(id) {
    const i = demoGenerations.findIndex((g) => g.id === id);
    if (i >= 0) demoGenerations.splice(i, 1);
  },
  async getShared(shareId) {
    const g = demoGenerations.find((x) => x.shareId === shareId);
    if (!g) throw new KinkoraError("This video is no longer available", "NOT_FOUND", 404);
    return demoView(g);
  },
  async getBilling() {
    return EMPTY_BILLING;
  },
  async checkout() {
    await new Promise((r) => setTimeout(r, 600));
    return "";
  },
  async upgrade() {
    await new Promise((r) => setTimeout(r, 600));
    return { amountPaid: 0, topup: 0 };
  },
  async setCancel() {},
  async portal() {
    return "";
  },
};

export const kinkora = CONFIG.demoMode ? demoApi : realApi;
