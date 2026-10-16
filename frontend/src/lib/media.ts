export const shareUrl = (shareId: string) => `${window.location.origin}/v/${shareId}`;

/** 跨域地址的 <a download> 会被浏览器忽略，先拉成 blob 再存；失败则新窗口打开 */
export async function downloadFile(url: string, filename: string) {
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

export const downloadVideo = downloadFile;

/** 剪贴板：优先 Clipboard API（写 promise 在个别环境会永不作数 → 加 1.2s 上限，不能让点分享卡住）；
 *  没有该 API 的老浏览器 / 非安全上下文才退回 execCommand —— 后者在部分环境下会阻塞渲染线程。 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    const write = navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    return (await Promise.race([write, new Promise<false>((r) => setTimeout(() => r(false), 1200))])) === true;
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
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
