export const shareUrl = (shareId: string) => `${window.location.origin}/v/${shareId}`;

/** 跨域地址的 <a download> 会被浏览器忽略，先拉成 blob 再存；失败则新窗口打开 */
export async function downloadVideo(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

/** 返回 "shared" | "copied" | "cancelled" */
export async function shareLink(url: string, title: string): Promise<"shared" | "copied" | "cancelled"> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (e: any) {
      if (e?.name === "AbortError") return "cancelled";
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

export function formatRemaining(seconds: number) {
  if (seconds <= 30) return "almost done";
  const m = Math.ceil(seconds / 60);
  return m <= 1 ? "~1 min left" : `~${m} min left`;
}

export function formatAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}
