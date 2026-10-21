#!/usr/bin/env python3
"""Download images from hathienbao.com into public/images for missing assets."""

from __future__ import annotations

import json
import re
import urllib.request
import ssl
from pathlib import Path

CTX = ssl.create_default_context()
UA = {"User-Agent": "Mozilla/5.0"}
ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "images"
BASE = PUBLIC / "hathienbao"

DATA = json.loads(Path("/tmp/htb-all-images.json").read_text(encoding="utf-8"))

EXTRA = [
    "https://hathienbao.com/wp-content/uploads/2025/05/25-1-scaled-e1751549023997.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/26-1-scaled.webp",
    "https://hathienbao.com/wp-content/uploads/2025/07/canh-quan.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/1-1-scaled.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/21-scaled.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/2-1-scaled.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/19-1-scaled.webp",
    "https://hathienbao.com/wp-content/uploads/2025/05/graphic-2.webp",
]

SLUG_FROM_URL = {
    "https://hathienbao.com/cau-chuyen-ve-chung-toi": "cau-chuyen",
    "https://hathienbao.com/da-phong-thuy/": "da-phong-thuy",
    "https://hathienbao.com/da-san-ho/": "da-san-ho",
    "https://hathienbao.com/go-hoa-thach/": "go-hoa-thach",
    "https://hathienbao.com/da-lua-den/": "da-lua-den",
    "https://hathienbao.com/da-lua-da-sac/": "da-lua-da-sac",
    "https://hathienbao.com/da-tram-tich-xanh/": "da-tram-tich-xanh",
    "https://hathienbao.com/da-quang-thach/": "da-quang-thach",
    "https://hathienbao.com/da-tuyet-son/": "da-tuyet-son",
    "https://hathienbao.com/da-da-bao/": "da-da-bao",
    "https://hathienbao.com/da-song-ba/": "da-song-ba",
    "https://hathienbao.com/da-van-go/": "da-van-go",
    "https://hathienbao.com/da-bazan/": "da-bazan",
    "https://hathienbao.com/soi-thach-anh/": "soi-thach-anh",
    "https://hathienbao.com/da-van-thach/": "da-van-thach",
    "https://hathienbao.com/da-co-thach/": "da-co-thach",
}


def download(url: str, dest: Path) -> str:
    if dest.exists() and dest.stat().st_size > 5000:
        return "exists"
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=45) as resp:
            content = resp.read()
            ctype = resp.headers.get("Content-Type", "")
        if len(content) < 2000:
            return f"small:{len(content)}"
        if b"<html" in content[:200].lower() or ctype.startswith("text/html"):
            return "html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        return f"ok:{len(content)}"
    except Exception as exc:  # noqa: BLE001
        return f"fail:{exc}"


def web_path(path: Path) -> str:
    return "/" + str(path.relative_to(ROOT / "public")).replace("\\", "/")


def filter_urls(urls: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for url in urls:
        name = url.split("/")[-1]
        if len(name) > 140:
            continue
        if name.count("https") > 1:
            continue
        key = re.sub(r"-\d+x\d+", "", name).lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(url)
    return out


def next_anh_dest(folder: Path, n: int, ext: str) -> tuple[Path, int]:
    while n <= 30:
        exists = any((folder / f"anh{n}{e}").exists() for e in [".webp", ".jpg", ".jpeg", ".png", ext])
        if not exists:
            return folder / f"anh{n}{ext}", n
        n += 1
    return folder / f"anh{n}{ext}", n


def main() -> None:
    BASE.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, list[str]] = {}

    # Home / hero backgrounds
    home_dir = BASE / "home"
    saved_home: list[str] = []
    idx = 1
    for url in EXTRA:
        ext = Path(url.split("?")[0]).suffix.lower() or ".webp"
        if ext not in {".webp", ".jpg", ".jpeg", ".png"}:
            continue
        dest = home_dir / f"bg{idx}{ext}"
        status = download(url, dest)
        print("HOME", dest.name, status)
        if status.startswith("ok") or status == "exists":
            saved_home.append(web_path(dest))
            idx += 1
    manifest["home"] = saved_home

    by_page = DATA.get("by_page", {})
    for page_url, folder_name in SLUG_FROM_URL.items():
        urls = filter_urls(by_page.get(page_url, []))
        dest_root = BASE / folder_name
        dest_root.mkdir(parents=True, exist_ok=True)
        saved: list[str] = []
        n = 1
        for url in urls:
            if n > 8:
                break
            ext = Path(url.split("?")[0]).suffix.lower() or ".webp"
            if ext not in {".webp", ".jpg", ".jpeg", ".png"}:
                continue
            dest, n = next_anh_dest(dest_root, n, ext)
            status = download(url, dest)
            print(folder_name, dest.name, status)
            if status.startswith("ok") or status == "exists":
                head = dest.read_bytes()[:40]
                if head.lstrip().startswith(b"<!"):
                    dest.unlink(missing_ok=True)
                    continue
                saved.append(web_path(dest))
                n += 1
        if saved:
            manifest[folder_name] = saved

    # Ensure craft folders have at least 4 images each by topping up from scrape
    craft_pages = {
        "https://hathienbao.com/ban-ghe-da/": "san-pham-my-nghe/ban-ghe-da",
        "https://hathienbao.com/dai-phun-nuoc/": "san-pham-my-nghe/dai-phun-nuoc",
        "https://hathienbao.com/bang-hieu-da/": "san-pham-my-nghe/bang-hieu-da",
        "https://hathienbao.com/bon-tam-da/": "san-pham-my-nghe/bon-tam-da",
        "https://hathienbao.com/den-da/": "san-pham-my-nghe/den-da",
        "https://hathienbao.com/lavabo-da/": "san-pham-my-nghe/lavabo-da",
        "https://hathienbao.com/tuong-da/": "san-pham-my-nghe/tuong-da",
        "https://hathienbao.com/thach-my-nghe/": "san-pham-my-nghe/thach-my-nghe",
    }
    for page_url, rel in craft_pages.items():
        folder = PUBLIC / rel
        folder.mkdir(parents=True, exist_ok=True)
        existing = [
            p
            for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"} and p.stat().st_size > 5000
        ]
        if len(existing) >= 6:
            print("CRAFT OK", rel, len(existing))
            continue
        urls = filter_urls(by_page.get(page_url, []))
        n = 1
        saved = [web_path(p) for p in sorted(existing)]
        for url in urls:
            if len(saved) >= 8:
                break
            ext = Path(url.split("?")[0]).suffix.lower() or ".webp"
            if ext not in {".webp", ".jpg", ".jpeg", ".png"}:
                continue
            dest, n = next_anh_dest(folder, n, ext)
            status = download(url, dest)
            print("CRAFT", rel, dest.name, status)
            if status.startswith("ok") or status == "exists":
                head = dest.read_bytes()[:40]
                if head.lstrip().startswith(b"<!"):
                    dest.unlink(missing_ok=True)
                    continue
                path = web_path(dest)
                if path not in saved:
                    saved.append(path)
                n += 1
        manifest[rel] = saved

    out = ROOT / "prisma" / "htb-download-manifest.json"
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", out)
    for key, values in manifest.items():
        print(f"{key}: {len(values)}")


if __name__ == "__main__":
    main()
