# Hacker News — Show HN 发布素材

> HN 是技术社区，强调技术实现、产品思路和诚实讨论。
> 发布格式：`Show HN: Genjutsu AI — Rewrite any video (motion, cast, style) while keeping the shot`
>
> ⚠️ **本产品是高风险品类**：换脸 / 换人 / 人物替换类工具在 HN 会被强烈质疑，几乎必然出现
> "这不就是 deepfake 工具吗" / "会被用来诈骗" / "非自愿内容" 的敌意提问。发布前必须把
> Consent & safety 讲清楚，并在评论区用**诚实、不回避**的方式回答。装作问题不存在只会被喷得更狠。

---

## Show HN 标题

```
Show HN: Genjutsu AI – rewrite any video (motion, cast, style) while keeping the shot
```

备选（更技术向）：
```
Show HN: Genjutsu AI – preserving motion and camera while swapping who/what is on screen
```

---

## Show HN 正文

```
Hi HN,

I built Genjutsu AI — a tool that takes a video you already have and rewrites it
without losing the thing that made it work: the motion, the camera path and the
timing.

How it works: upload a 2–15s clip, pick a mode, add an optional reference image or
a short prompt, and get a new take back. The source performance drives the output;
what changes is the subject, outfit, prop, location, style or face.

Seven modes:
- Motion Transfer  — drive a character photo with a motion clip
- Character Swap   — recast the performer from one photo
- Outfit Swap      — re-dress the take from a prompt or product shot
- Object Swap      — replace a product/prop, keep the interactions
- Background Swap  — move the location, keep the performance
- Restyle          — live-action <-> anime/3D, same timing
- Face Swap        — change only the face, keep expression and lip-sync

Demo: [DOMAIN]

Design notes that might interest this crowd:

- "Preserve motion" is the hard constraint. It's easy to generate something
  good-looking; it's hard to keep the user's specific choreography, camera move and
  timing intact across a whole clip. Almost all of our iteration went here.
- Style preservation is treated as a hard requirement, not a preference. Photoreal
  in, photoreal out; 3D in, 3D out; anime in, anime out.
- Sound is generated to match the edit by default; the editing modes can keep the
  original audio track.
- Everything runs through one in-house pipeline that we tune against the motion and
  style requirements above, rather than against single-frame prettiness.

Responsible-use decisions (and I expect questions here):

- Every render requires a rights confirmation: you must confirm you have the rights
  to the face and footage you're uploading.
- Outputs carry an invisible watermark plus content-credential metadata.
- Known public figures and minors are blocked.
- Uploads are private, never used for training, and deletable at any time.

I know exactly how this category can be abused, and I'm not going to pretend
otherwise. So keep the questions coming — technical, product, or the uncomfortable
ones. I'll answer straight.

Pricing: free to try (a new account gets 30 credits, enough for one 6-second 480p
video). Subscriptions start at $24.99/mo; commercial use is on the Pro and Studio
plans.

Not affiliated with Higgsfield.

Thanks,
[Your Name]
```

---

## 敌意 / 尖锐提问的预回复（这部分是本文件的重点）

> 语气原则：**先承认风险，再讲机制，最后讲边界**。绝不否认、绝不"我们只是工具"式甩锅。
> HN 会因为你诚实而给你分，因为你打太极而扣你分。

### Q: Isn't this just a deepfake tool?
```
It's a deepfake-capable tool, and I won't pretend it isn't. Face Swap and Character
Swap can produce the same class of output as a deepfake — that's the honest framing.

What we control is the friction and the traceability:
- The render won't run unless you affirm you have the rights to the face and footage.
- Every output carries an invisible watermark and content-credential metadata, so it
  can be identified and traced after the fact.
- Known public figures and minors are blocked outright.
- Uploads are private, never used for training, and deletable anytime.

We can't make a generative video tool that is inherently safe, because no one can.
We can make it accountable and we can make casual abuse expensive and visible.
```

### Q: This will be used for scams / fraud.
```
Yes — face and identity swaps are already used in fraud, and a better tool makes
that easier for bad actors. I'm not going to claim otherwise.

Where we can act, we do: rights confirmation on every render, invisible watermark
and content-credential metadata on every output, and blocking of public figures and
minors. Content credentials matter here specifically because scam material that
propagates gets flagged as AI-generated rather than as real footage.

Where it's honestly limited: a determined attacker with a watermark-removal step is
hard to stop at the tool level. That's a platform-and-policy problem, not something
one product solves. I'd rather say that plainly than oversell safety.
```

### Q: What about non-consensual content (NCII)?
```
This is the case I lose the most sleep over. Non-consensual intimate imagery is
explicitly prohibited in our terms, and the product is built so that a render can't
proceed without a rights confirmation. Outputs are watermarked and carry
content-credential metadata, and known public figures and minors are blocked.

But I'll be straight: confirmations catch careless and casual abuse far better than
determined abuse, and I don't have a magic detector for every case. What I can
commit to is that reported misuse gets content removed and accounts actioned, and
that the metadata stays on the output so downstream platforms and reviewers can act
too.
```

### Q: Why ship Face Swap at all? Wouldn't you be safer without it?
```
Legitimate, high-volume uses keep coming up: creators recasting their own footage,
studios previewing a look, people replacing a stand-in in their own shoot, agencies
localizing a campaign with a model who consented. Face Swap is also where the
category's demand actually is.

Shipping it responsibly means: rights confirmation, watermark plus content
credentials, blocks on public figures and minors, private-by-default uploads, and no
training on user data. Dropping the mode doesn't remove the abuse — it just moves
it to a tool with none of those guardrails.
```

### Q: How do you actually enforce the "public figures / minors" block? It sounds hand-wavy.
```
Fair — "we block X" is meaningless without a mechanism, so here's the shape: it's a
combination of checks on the inputs you upload and the outputs we produce, applied
before a render is delivered. It is not perfect, and I won't claim a 100% catch
rate; blocklists and checks like this are always catching up.

What I can promise is that it's a real gate in the pipeline, not a checkbox in the
copy, and that bypass attempts are a violation that gets accounts actioned.
```

### Q: Do you train on user uploads?
```
No. Uploads are private, never used for training, and you can delete them at any
time.
```

### Q: How is identity/consistency preserved across a whole clip?
```
The source motion, camera path and timing come from the input clip; the subject
identity comes from the reference image plus the mode-specific instruction. We treat
"identical timing" and "style preservation" as hard requirements and tune the
pipeline against them rather than against single-frame aesthetics.
```

### Q: Which models / infra? Is it open source?
```
The pipeline is in-house and not open source. I'm keeping the internals out of this
thread; happy to talk about the product behavior, the constraints, and the safety
mechanisms in detail.
```

### Q: Pricing / limits?
```
Free to try: a new account gets 30 credits — enough for one 6-second 480p video.
Source clips are 2–15s. Billing is by source-video seconds and quality. Plans:
Starter $24.99/mo, Pro $69.99/mo, Studio $129.99/mo (yearly is 20% off; commercial
use on Pro and Studio). Failed renders are refunded automatically.
```

### Q: Is this the same as Higgsfield Genjutsu?
```
No. Genjutsu AI is an independent product, not affiliated with Higgsfield.
```

---

## Consent & safety 板块（置顶/首评可直接引用）

```
On responsible use, stated up front:
- Every render requires you to confirm you have the rights to the face and footage.
- Outputs carry an invisible watermark and content-credential metadata.
- Known public figures and minors are blocked.
- Uploads are private, never used for training, and deletable anytime.
```

---

## Assets Checklist（HN 发布专用）

| 素材 | 说明 | 状态 |
|------|------|------|
| 可用站点 | [DOMAIN] 已上线、可直接访问、无需登录即可体验 | ⚠️ 待确认 |
| 演示链接 | Show HN 正文里的 `Demo: [DOMAIN]` | ⚠️ 待替换 |
| 1 张关键截图或 GIF | before→after 对比（HN 正文可贴链接，不内嵌） | ⚠️ 待准备 |
| 账号 | HN 账号（老账号权重更高） | ⚠️ 待确认 |
| 信任与安全页面 | 站点上可被引用的 responsible use 说明 | ⚠️ 待确认 |
| 免责声明 | 正文与首评均已含 "Not affiliated with Higgsfield" | ✅ 已写 |
| 回复话术 | 见上文敌意提问预回复 | ✅ 已写 |

---

## HN 发布注意事项

- 不要选周末发布（流量低）
- 最佳时间：美东时间上午 8-10am（对应北京时间晚上 8-10pm）
- 标题不要用全大写或感叹号（HN 风格偏学术/低调）
- 回复评论时保持诚实和透明，HN 用户能嗅出营销话术
- **换脸/换人类产品必被质疑**：提前把 Consent & safety 放在正文里，第一条评论再强调一次；
  被问到 deepfake / 诈骗 / NCII 时，用上面的预回复，先承认风险，再讲机制，最后讲边界
- 不要反驳技术质疑；不确定的地方就说不确定，HN 尊重这种态度
- 如果被 flagged，冷静处理——可能是标题问题，修改后可以 vouch
- 全文红线检查：无模型名 / 供应商名 / 基础设施名 / API / 阈值 / 管线描述；
  技术表述只用 "our in-house generation pipeline"；必带 "Not affiliated with Higgsfield"；
  商业档位写 "Pro and Studio"
