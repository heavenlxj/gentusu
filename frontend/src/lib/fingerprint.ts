let visitorId: Promise<string | null> | null = null;

/** FingerprintJS visitorId；kinkora 新用户建档时据此做设备去重，缺失则不发注册赠送积分 */
export function getVisitorId(): Promise<string | null> {
  if (!visitorId) {
    visitorId = import("@fingerprintjs/fingerprintjs")
      .then((m) => m.default.load())
      .then((agent) => agent.get())
      .then((r) => r.visitorId)
      .catch(() => {
        visitorId = null;
        return null;
      });
  }
  return visitorId;
}

/** 提前算好 visitorId，但避开首屏：指纹采集很吃 CPU，放到页面 load 之后的空闲时间 */
export function prewarmVisitorId() {
  const run = () => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(() => void getVisitorId(), { timeout: 5000 });
    else window.setTimeout(() => void getVisitorId(), 1500);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}
