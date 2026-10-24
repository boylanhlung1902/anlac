#!/usr/bin/env python3
"""Build the An Lạc catalog from one image folder per category.

Each image becomes one product. Filenames are rewritten to stable paths
under public/images/anlac/<slug>/ so the site never depends on the
original Zalo export names. Products have no listed price.
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone

SOURCE = os.environ.get("ANLAC_SOURCE", "/Users/trungminh/Downloads/AnhAnlac")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMAGE_ROOT = os.path.join(ROOT, "public", "images", "anlac")
CATALOG_PATH = os.path.join(ROOT, "data", "catalog.json")
HIGHLIGHTS_PATH = os.path.join(ROOT, "data", "home-highlights.json")
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
QUOTE = "Liên hệ để báo giá"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

# Folder name -> public slug. Every directory in SOURCE must be listed.
FOLDERS = [
    ("Tượng Phật Thích Ca", "tuong-phat-thich-ca", "fa-place-of-worship", "Tượng Phật Thích Ca chế tác từ đá tự nhiên."),
    ("Tượng chú tiểu", "tuong-chu-tieu", "fa-child", "Tượng chú tiểu đá, đường nét sinh động."),
    ("Đèn đá", "den-da", "fa-lightbulb", "Đèn đá sân vườn và không gian thờ."),
    ("Đài phun nước", "dai-phun-nuoc", "fa-water", "Đài phun nước đá cho sân vườn."),
    ("Tượng Di Lặc", "tuong-di-lac", "fa-smile", "Tượng Di Lặc đá phong thủy."),
    ("Tượng Kỳ Lân", "tuong-ky-lan", "fa-shield-alt", "Tượng kỳ lân đá."),
    ("Điêu khắc chân dung", "dieu-khac-chan-dung", "fa-user", "Điêu khắc chân dung trên đá."),
    ("Tượng cô gái", "tuong-co-gai", "fa-female", "Tượng cô gái đá nghệ thuật."),
    ("Tượng thiên thần", "tuong-thien-than", "fa-feather-alt", "Tượng thiên thần đá."),
    ("Ếch đá phong thuỷ", "ech-da-phong-thuy", "fa-frog", "Ếch đá phong thủy."),
    ("Tượng Tỳ Hưu", "tuong-ty-huu", "fa-paw", "Tượng tỳ hưu đá phong thủy."),
    ("Phù điêu", "phu-dieu", "fa-border-all", "Phù điêu đá trang trí."),
    ("Quả cầu đá", "qua-cau-da", "fa-circle", "Quả cầu đá phong thủy."),
    ("Tượng Quan Âm", "tuong-quan-am", "fa-praying-hands", "Tượng Quan Âm đá."),
    ("Tượng rồng", "tuong-rong", "fa-dragon", "Tượng rồng đá."),
    ("Tượng cá", "tuong-ca", "fa-fish", "Tượng cá đá."),
    ("Đồ đá khác", "do-da-khac", "fa-gem", "Sản phẩm đá mỹ nghệ khác."),
    ("Ảnh tổng hợp", "anh-tong-hop", "fa-images", "Hình ảnh tổng hợp sản phẩm đá An Lạc."),
]

FEATURED_SLUGS = ["tuong-phat-thich-ca", "den-da", "dai-phun-nuoc"]


def list_images(folder):
    names = []
    for name in os.listdir(folder):
        if name.startswith("."):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext not in IMAGE_EXTS:
            continue
        path = os.path.join(folder, name)
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            names.append(name)
    names.sort(key=lambda item: item.casefold())
    return names


def export_image(src, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    subprocess.run(
        [
            "sips",
            "-Z",
            "1600",
            "-s",
            "format",
            "jpeg",
            "-s",
            "formatOptions",
            "80",
            src,
            "--out",
            dest,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    if not os.path.isfile(dest) or os.path.getsize(dest) == 0:
        raise RuntimeError(f"Export failed: {src}")


def main():
    if not os.path.isdir(SOURCE):
        sys.exit(f"Missing source folder: {SOURCE}")

    actual = sorted(
        name
        for name in os.listdir(SOURCE)
        if os.path.isdir(os.path.join(SOURCE, name)) and not name.startswith(".")
    )
    expected = [name for name, *_rest in FOLDERS]
    if actual != sorted(expected):
        missing = sorted(set(actual) - set(expected))
        extra = sorted(set(expected) - set(actual))
        sys.exit(f"Folder mismatch. Unexpected: {missing}. Missing: {extra}.")

    if os.path.isdir(IMAGE_ROOT):
        for dirpath, dirnames, filenames in os.walk(IMAGE_ROOT, topdown=False):
            for filename in filenames:
                os.remove(os.path.join(dirpath, filename))
            for dirname in dirnames:
                os.rmdir(os.path.join(dirpath, dirname))

    categories = []
    products = []
    highlights = []
    featured = []
    product_id = 1

    for index, (folder_name, slug, icon, description) in enumerate(FOLDERS, start=1):
        files = list_images(os.path.join(SOURCE, folder_name))
        if not files:
            sys.exit(f"No images in {folder_name}")

        category = {
            "id": index,
            "name": folder_name,
            "description": description,
            "image": f"/images/anlac/{slug}/001.jpg",
            "slug": slug,
            "createdAt": NOW,
            "updatedAt": NOW,
        }
        categories.append(category)
        highlights.append(
            {
                "name": folder_name,
                "slug": slug,
                "image": category["image"],
                "icon": icon,
                "count": len(files),
            }
        )

        for image_index, filename in enumerate(files, start=1):
            dest_name = f"{image_index:03d}.jpg"
            dest = os.path.join(IMAGE_ROOT, slug, dest_name)
            export_image(os.path.join(SOURCE, folder_name, filename), dest)
            public_path = f"/images/anlac/{slug}/{dest_name}"
            name = folder_name if len(files) == 1 else f"{folder_name} {image_index:02d}"
            product = {
                "id": product_id,
                "name": name,
                "description": f"{description} Giá chưa niêm yết, vui lòng liên hệ để nhận báo giá.",
                "price": 0,
                "priceVND": 0,
                "netPrice": 0,
                "tax": 0,
                "image": public_path,
                "images": [public_path],
                "categoryId": index,
                "stock": 1,
                "rating": 0,
                "reviewCount": 0,
                "isFeatured": slug in FEATURED_SLUGS and image_index == 1,
                "isActive": True,
                "slug": f"{slug}-{image_index:03d}",
                "weight": None,
                "dimensions": None,
                "material": "Đá tự nhiên",
                "origin": "Việt Nam",
                "createdAt": NOW,
                "updatedAt": NOW,
                "category": category,
            }
            products.append(product)
            if product["isFeatured"]:
                featured.append(
                    {
                        "id": product["id"],
                        "name": folder_name,
                        "price": QUOTE,
                        "image": public_path,
                        "description": description,
                    }
                )
            product_id += 1
            print(f"{folder_name} {image_index}/{len(files)}", flush=True)

    featured.sort(key=lambda item: FEATURED_SLUGS.index(
        next(category["slug"] for category in categories if category["name"] == item["name"])
    ))

    os.makedirs(os.path.dirname(CATALOG_PATH), exist_ok=True)
    with open(CATALOG_PATH, "w", encoding="utf-8") as handle:
        json.dump({"categories": categories, "products": products}, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    with open(HIGHLIGHTS_PATH, "w", encoding="utf-8") as handle:
        json.dump({"categories": highlights, "featured": featured}, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(f"categories={len(categories)} products={len(products)}")


if __name__ == "__main__":
    main()
