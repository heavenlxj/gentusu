import FingerprintJS from "@fingerprintjs/fingerprintjs";

let visitorId: Promise<string | null> | null = null;

/** FingerprintJS visitorId；kinkora 新用户建档时据此做设备去重，缺失则不发注册赠送积分 */
export function getVisitorId(): Promise<string | null> {
  if (!visitorId) {
    visitorId = FingerprintJS.load()
      .then((agent) => agent.get())
      .then((r) => r.visitorId)
      .catch(() => {
        visitorId = null;
        return null;
      });
  }
  return visitorId;
}
