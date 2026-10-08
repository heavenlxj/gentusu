import { CONFIG } from "@/config/site";
import { supabase } from "@/lib/supabase";

export type TaskStatus = "starting" | "processing" | "succeeded" | "failed" | "canceled" | "error" | "timeout";

export interface TaskState {
  status: TaskStatus;
  progress?: number;
  output?: unknown;
  error?: string;
}

export interface VideoTaskRequest {
  providerId: string;
  modelId: string;
  params: Record<string, unknown>;
  demoOutput?: string;
}

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
  const token = await getToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
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
    throw new KinkoraError(message || "Request failed", code, res.status);
  }

  const json = await res.json();
  return (json && typeof json === "object" && "success" in json ? json.data : json) as T;
}

export function extractVideoUrl(output: unknown): string | undefined {
  if (!output) return undefined;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return typeof output[0] === "string" ? output[0] : undefined;
  if (typeof output === "object") {
    const o = output as Record<string, any>;
    return o.videos?.[0] ?? o.video_url ?? o.url ?? o.video?.url;
  }
  return undefined;
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

  async submitVideo(req: VideoTaskRequest): Promise<string> {
    const data = await request<{ provider_task_id: string }>("/ai-generation/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: (req.params.prompt as string) ?? "",
        provider_id: req.providerId,
        model_id: req.modelId,
        model_params: req.params,
      }),
    });
    return data.provider_task_id;
  },

  async getTask(taskId: string, providerId: string): Promise<TaskState> {
    return request<TaskState>(`/ai-generation/task/${taskId}?provider_id=${encodeURIComponent(providerId)}`);
  },

  async startCheckout(pack: { stripeLookup: string; credits: number }): Promise<string> {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session) throw new KinkoraError("Please sign in to continue", "AUTH_REQUIRED", 401);
    const data = await request<{ checkout_url: string }>("/subscriptions/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({
        price_lookup_name: pack.stripeLookup,
        credits: pack.credits,
        plan_type: "one_time",
        user_id: session.user.id,
        success_url: `${window.location.origin}/?checkout=success`,
        cancel_url: window.location.href,
      }),
    });
    return data.checkout_url;
  },
};

const demoTasks = new Map<string, { startedAt: number; eta: number; output?: string }>();

const demoApi: typeof realApi = {
  async upload(file) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    return URL.createObjectURL(file);
  },
  async submitVideo(req) {
    const id = `demo_${Date.now()}`;
    demoTasks.set(id, { startedAt: Date.now(), eta: 12000, output: req.demoOutput ?? (CONFIG.showcaseVideoUrl || undefined) });
    return id;
  },
  async getTask(taskId) {
    const task = demoTasks.get(taskId);
    if (!task) return { status: "error", error: "Unknown task" };
    const progress = Math.min(1, (Date.now() - task.startedAt) / task.eta);
    if (progress < 0.12) return { status: "starting", progress };
    if (progress < 1) return { status: "processing", progress };
    return { status: "succeeded", progress: 1, output: task.output ? [task.output] : null };
  },
  async startCheckout() {
    await new Promise((r) => setTimeout(r, 600));
    return "";
  },
};

export const kinkora = CONFIG.demoMode ? demoApi : realApi;
