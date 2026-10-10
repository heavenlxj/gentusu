"""Collect competitor templates -> normalize -> upload to R2 genjutsu/templates/ -> manifest.json"""
import glob, json, os, re, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

ASSETS = "/Users/apple/projects/github/demo_videos/genjutsu"
ROOT = f"{ASSETS}/templates_scrape"
RAW, OUT = f"{ASSETS}/templates_raw", f"{ASSETS}/templates"
EXCLUDED = set(json.load(open(f"{ROOT}/excluded.json"))) if os.path.exists(f"{ROOT}/excluded.json") else set()
os.makedirs(RAW, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/129.0 Safari/537.36"
MAX_SECONDS, MIN_SECONDS = 15, 2
PEOPLE = ["character-swap", "motion-transfer", "face-swap", "outfit-swap", "background-swap", "restyle"]


def unq(s):
    try:
        return json.loads(f'"{s}"')
    except Exception:
        return s.replace('\\"', '"').replace("\\'", "'")


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "t"


def collect():
    items = []
    # 1. Higgsfield Genjutsu presets (motion-control / replace-objects)
    for p in json.load(open(f"{ROOT}/hf_genjutsu_presets.json")):
        obj = p["mode"] == "replace-objects"
        items.append(dict(
            slug=slugify(p["name"]), title=p["name"], description=p["description"], category="trending",
            src=p["source"], poster=p["poster"], modes=["object-swap", "background-swap", "restyle"] if obj else PEOPLE,
        ))
    # 2. Viral hub effects (all scraped pages)
    pat = re.compile(
        r'slug:"([a-z0-9\-]+)",(?:kind:"[^"]*",)?name:"((?:[^"\\]|\\.)*)",description:"((?:[^"\\]|\\.)*)",'
        r'(?:.{0,600}?)preview_url:"(https://[^"]+\.mp4)"(?:,thumbnail_url:"(https://[^"]+)")?', re.S)
    main = re.compile(r'main_url:"(https://[^"]+\.mp4)"')
    for f in sorted(glob.glob(f"{ROOT}/*.page") + glob.glob(f"{ROOT}/*.html")):
        t = open(f, errors="ignore").read()
        for m in pat.finditer(t):
            tail = t[m.end(): m.end() + 800]
            mm = main.search(tail)
            items.append(dict(
                slug=m[1], title=unq(m[2]), description=unq(m[3]), category="effects",
                src=mm[1] if mm else m[4], poster=m[5], modes=PEOPLE,
            ))
    # 3. Motions (camera / action showcase clips with mp4 sources)
    for i in json.load(open(f"{ROOT}/motions.json"))["items"]:
        if not i["media"]["url"].endswith(".mp4"):
            continue
        cats = i.get("categories", [])
        cat = "camera" if any("camera" in c for c in cats) else "action"
        items.append(dict(
            slug=slugify(i["name"]), title=i["name"], description="", category=cat,
            src=i["media"]["url"], poster=i["media"].get("thumbnail_url"), modes=PEOPLE,
        ))
    # 4. Katana presets (stylized edits)
    for i in json.load(open(f"{ROOT}/katana1.json"))["items"]:
        v = (i.get("video_media") or {}).get("url")
        if not v:
            continue
        items.append(dict(
            slug=i["slug"], title=i["title"], description=i.get("description", ""), category="edits",
            src=v, poster=(i.get("thumbnail_media") or {}).get("url"), modes=PEOPLE,
        ))
    seen_src, seen_title, seen_slug, out = set(), set(), set(), []
    for it in items:
        key = (it["category"], it["title"].strip().lower())
        if it["src"] in seen_src or key in seen_title:
            continue
        seen_src.add(it["src"])
        seen_title.add(key)
        base, n = it["slug"], 2
        while it["slug"] in seen_slug:
            it["slug"] = f"{base}-{n}"
            n += 1
        seen_slug.add(it["slug"])
        if it["slug"] not in EXCLUDED:
            out.append(it)
    return out


def probe(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path], capture_output=True, text=True)
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    v = re.search(r"Video: .*?(\d{2,5})x(\d{2,5})", r.stderr)
    dur = int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3]) if d else 0
    return dur, (int(v[1]), int(v[2])) if v else (0, 0), "Audio:" in r.stderr


def process(it):
    raw, mp4, jpg = f"{RAW}/{it['slug']}.src", f"{OUT}/{it['slug']}.mp4", f"{OUT}/{it['slug']}.jpg"
    try:
        if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
            req = urllib.request.Request(it["src"], headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r, open(raw, "wb") as f:
                f.write(r.read())
        if not os.path.exists(mp4):
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-t", str(MAX_SECONDS),
                "-map", "0:v:0", "-map", "0:a:0?",
                "-vf", "scale='if(gte(iw,ih),min(iw,1280),-2)':'if(gte(iw,ih),-2,min(ih,1280))',fps=fps='min(source_fps,30)'",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", mp4,
            ], check=True, capture_output=True)
        if not os.path.exists(jpg):
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-ss", "0.8", "-i", mp4, "-frames:v", "1",
                "-vf", "scale='if(gte(iw,ih),480,-2)':'if(gte(iw,ih),-2,480)'", "-q:v", "4", jpg,
            ], check=True, capture_output=True)
        dur, (w, h), audio = probe(mp4)
        if dur < MIN_SECONDS or not w:
            return None
        it.update(seconds=round(dur, 2), width=w, height=h, audio=audio, bytes=os.path.getsize(mp4))
        return it
    except Exception as e:
        print("FAIL", it["slug"], it["src"], str(e)[:200], flush=True)
        return None


def upload(done):
    import boto3
    env = {}
    for line in open("/Users/apple/projects/github/kinkora/.env.gentusu"):
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.strip().split("=", 1)
            env[k] = v.strip().strip('"').strip("'")
    s3 = boto3.client("s3", endpoint_url=env["R2_ENDPOINT_URL"], aws_access_key_id=env["R2_ACCESS_KEY_ID"],
                      aws_secret_access_key=env["R2_SECRET_ACCESS_KEY"], region_name="auto")
    bucket, public = env["R2_BUCKET_NAME"], env["R2_PUBLIC_URL"].rstrip("/")
    existing = set()
    for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket, Prefix="templates/"):
        existing |= {o["Key"] for o in page.get("Contents", [])}
    cache = "public, max-age=31536000, immutable"

    def put(it):
        for ext, ctype in (("mp4", "video/mp4"), ("jpg", "image/jpeg")):
            key = f"templates/{it['category']}/{it['slug']}.{ext}"
            if key not in existing:
                s3.upload_file(f"{OUT}/{it['slug']}.{ext}", bucket, key, ExtraArgs={"ContentType": ctype, "CacheControl": cache})
        it["video"] = f"{public}/templates/{it['category']}/{it['slug']}.mp4"
        it["poster"] = f"{public}/templates/{it['category']}/{it['slug']}.jpg"

    with ThreadPoolExecutor(8) as ex:
        list(ex.map(put, done))
    manifest = [
        {k: it[k] for k in ("slug", "title", "description", "category", "modes", "video", "poster", "seconds", "width", "height", "audio")}
        for it in done
    ]
    body = json.dumps({"version": 1, "templates": manifest}, ensure_ascii=False, separators=(",", ":"))
    s3.put_object(Bucket=bucket, Key="templates/manifest.json", Body=body.encode(), ContentType="application/json",
                  CacheControl="public, max-age=300")
    open(f"{ROOT}/manifest.json", "w").write(body)
    print("uploaded", len(manifest), flush=True)


if __name__ == "__main__":
    items = collect()
    print("candidates", len(items), {c: sum(1 for i in items if i["category"] == c) for c in {i["category"] for i in items}}, flush=True)
    if "--collect" in sys.argv:
        json.dump(items, open(f"{ROOT}/candidates.json", "w"), indent=1)
        sys.exit()
    done = []
    with ThreadPoolExecutor(3) as ex:
        for k, r in enumerate(ex.map(process, items)):
            if r:
                done.append(r)
            if k % 20 == 0:
                print("progress", k, len(done), flush=True)
    print("processed", len(done), flush=True)
    upload(done)
