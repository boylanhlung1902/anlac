#!/usr/bin/env python3
"""Sync AnhANLAC_watermark product photos into catalog.json.

- Every image under SOURCE becomes one product (except empty folders).
- SAE* folders merge into the matching non-SAE category.
- Keeps Bồn Tắm Đá / Lavabo Đá / Bàn Ghế (and Bàn Đá Trang Trí) from the
  current catalog, including their images under san-pham-my-nghe.
- Rebuilds public/images/anlac/* and deletes other legacy product image folders.
- Does NOT touch slide assets (home/, hero/, hero2/, videos/, welcome-bg).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    os.environ.get(
        "ANLAC_SOURCE",
        "/Users/tt/Documents/Toolvideo/AnhANLAC_watermark",
    )
)
IMAGE_ROOT = ROOT / "public" / "images" / "anlac"
PUBLIC_IMAGES = ROOT / "public" / "images"
CATALOG_PATH = ROOT / "data" / "catalog.json"
HIGHLIGHTS_PATH = ROOT / "data" / "home-highlights.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
QUOTE = "Liên hệ để báo giá"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

KEEP_CATEGORY_SLUGS = {
    "bon-tam-da",
    "lavabo-da",
    "ban-ghe-da",
    "ban-da-trang-tri",
}

# Slide / site assets that must never be deleted.
PROTECTED_IMAGE_DIRS = {
    "home",
    "hero",
    "hero2",
    "about",
    "clean",
    "_branded-backup",
}

# Legacy product photo folders to wipe after rebuild (not slides, not keep craft).
LEGACY_PRODUCT_DIRS = {
    "anlac",
    "cuoivanmay",
    "dacothach",
    "dacuoitunhien",
    "daiphunnuoc",
    "davanthachco",
    "davanthachtrang",
    "denda",
    "hathienbao",
    "saedaiphannuoc",
    "saedenda",
    "saedieukhacchandung",
    "saephatthichca",
    "tuongchutieu",
}

KEEP_CRAFT_DIRS = {
    "bon-tam-da",
    "lavabo-da",
    "ban-ghe-da",
}

DISPLAY_NAMES = {
    "cuoi-van-may": "Cuội vân mây",
    "phu-dieu-tranh-da": "Phù điêu tranh đá",
    "qua-cau-da": "Quả cầu đá",
    "tuong-phat-thich-ca": "Tượng Phật Thích Ca",
    "tuong-chu-tieu": "Tượng chú tiểu",
    "dieu-khac-chan-dung": "Điêu khắc chân dung",
    "dai-phun-nuoc": "Đài phun nước",
    "den-da": "Đèn đá",
    "tuong-quan-am": "Tượng Quan Âm",
    "tuong-co-dien-chau-au": "Tượng cổ điển châu Âu",
    "tuong-ho": "Tượng hổ",
    "tuong-ky-lan": "Tượng kỳ lân",
    "tuong-thien-than": "Tượng thiên thần",
    "tuong-tre-em": "Tượng trẻ em",
    "tong-hop-xuong": "Tổng hợp xưởng",
    "da-co-thach": "Đá cổ thạch",
    "da-van-thach-co": "Đá vân thạch cổ",
    "da-van-thach-trang": "Đá vân thạch trắng",
}

CATEGORY_META = {
    "cuoi-van-may": {
        "icon": "fa-cloud",
        "description": "Cuội vân mây tự nhiên, vân đá mềm như mây, dùng trang trí tiểu cảnh và phong thủy.",
        "material": "Cuội tự nhiên",
        "highlights": [
            "Vân mây tự nhiên không trùng lặp",
            "Phù hợp tiểu cảnh, sân vườn",
            "Tư vấn chọn viên theo không gian",
        ],
    },
    "phu-dieu-tranh-da": {
        "icon": "fa-border-all",
        "description": "Phù điêu và tranh đá nghệ thuật, khắc nổi hoa sen, mã đáo thành công, cá vượt vũ môn.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Khắc nổi thủ công tinh xảo",
            "Treo tường hoặc ốp trang trí",
            "Chủ đề phong thủy theo yêu cầu",
        ],
    },
    "qua-cau-da": {
        "icon": "fa-circle",
        "description": "Quả cầu đá phong thủy, đá quý hoặc đá tự nhiên đánh bóng cao cấp.",
        "material": "Đá tự nhiên / đá quý",
        "highlights": [
            "Bề mặt đánh bóng mịn",
            "Đế đá đi kèm theo mẫu",
            "Phong thủy cho bàn làm việc, phòng khách",
        ],
    },
    "tuong-phat-thich-ca": {
        "icon": "fa-place-of-worship",
        "description": "Tượng Phật Thích Ca chế tác từ đá tự nhiên, đường nét trang nghiêm, phù hợp không gian thờ.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Tư thế ngồi thiền chuẩn mực",
            "Chế tác thủ công theo kích thước yêu cầu",
            "Phù hợp chùa, nhà thờ tổ, biệt thự",
        ],
    },
    "tuong-chu-tieu": {
        "icon": "fa-child",
        "description": "Tượng chú tiểu đá với nhiều tư thế vui tươi, mang lại không khí an nhiên cho sân vườn.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Nhiều dáng: đứng, ngồi, nằm, chắp tay",
            "Nụ cười và nếp áo rõ nét",
            "Trang trí sân vườn, tiểu cảnh",
        ],
    },
    "dieu-khac-chan-dung": {
        "icon": "fa-user",
        "description": "Điêu khắc chân dung trên đá theo ảnh mẫu, lưu giữ thần thái người thân hoặc danh nhân.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Làm theo ảnh mẫu thực tế",
            "Phù điêu hoặc tượng bán thân",
            "Chi tiết khuôn mặt tinh xảo",
        ],
    },
    "dai-phun-nuoc": {
        "icon": "fa-water",
        "description": "Đài phun nước đá cho sân vườn, resort và không gian ngoại thất cao cấp.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Thiết kế nhiều tầng / đài tròn",
            "Bền ngoài trời",
            "Tư vấn lắp đặt hệ thống nước",
        ],
    },
    "den-da": {
        "icon": "fa-lightbulb",
        "description": "Đèn đá sân vườn và không gian thờ, ánh sáng ấm kết hợp chất liệu đá tự nhiên.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Chịu nắng mưa ngoài trời",
            "Phù hợp lối đi, sân vườn, cổng",
            "Có thể kết hợp đèn LED",
        ],
    },
    "tuong-quan-am": {
        "icon": "fa-praying-hands",
        "description": "Tượng Quan Âm đá tự nhiên, dáng đứng thanh thoát, phù hợp không gian thờ và sân chùa.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Tư thế đứng trang nghiêm",
            "Chế tác theo kích thước đặt hàng",
            "Đá nguyên khối hoặc ghép theo mẫu",
        ],
    },
    "tuong-co-dien-chau-au": {
        "icon": "fa-landmark",
        "description": "Tượng cổ điển châu Âu bằng đá trắng, phong cách Hy Lạp – La Mã cho biệt thự và sân vườn.",
        "material": "Đá trắng / đá marble",
        "highlights": [
            "Phong cách cổ điển châu Âu",
            "Phù hợp biệt thự, quảng trường nhỏ",
            "Hoàn thiện bề mặt mịn",
        ],
    },
    "tuong-ho": {
        "icon": "fa-dragon",
        "description": "Tượng hổ đá phong thủy, dáng đứng oai vệ, tượng trưng cho uy quyền và bảo hộ.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Dáng đứng trên bệ đá",
            "Nhiều màu đá: trắng, xám, đen",
            "Trang trí cổng, sân, phòng khách",
        ],
    },
    "tuong-ky-lan": {
        "icon": "fa-shield-alt",
        "description": "Tượng kỳ lân đá phong thủy, linh vật trấn trạch và thu hút vượng khí.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Linh vật trấn trạch",
            "Có mẫu lớn đặt bệ và mẫu cặp nhỏ",
            "Phù hợp cổng nhà, công ty",
        ],
    },
    "tuong-thien-than": {
        "icon": "fa-feather-alt",
        "description": "Tượng thiên thần đá trắng phong cách phương Tây, trang trí sân vườn và nhà thờ.",
        "material": "Đá trắng",
        "highlights": [
            "Cánh và nếp áo chi tiết",
            "Thường cầm hoa / vòng nguyệt quế",
            "Phù hợp biệt thự kiểu Âu",
        ],
    },
    "tuong-tre-em": {
        "icon": "fa-child",
        "description": "Tượng trẻ em đá nghệ thuật, dáng vui tươi cho sân vườn và góc trang trí.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Dáng chơi đùa sinh động",
            "Kích thước vừa trang trí",
            "Hoàn thiện mịn, an toàn góc cạnh",
        ],
    },
    "tong-hop-xuong": {
        "icon": "fa-images",
        "description": "Ảnh tổng hợp xưởng đá An Lạc, giới thiệu đa dạng sản phẩm đang chế tác.",
        "material": "Đá tự nhiên",
        "highlights": [
            "Góc nhìn thực tế tại xưởng",
            "Tham khảo quy mô chế tác",
            "Liên hệ để xem mẫu trực tiếp",
        ],
    },
    "da-co-thach": {
        "icon": "fa-gem",
        "description": "Đá cổ thạch với vẻ cổ kính, dùng làm đá cảnh và điểm nhấn sân vườn.",
        "material": "Đá cổ thạch tự nhiên",
        "highlights": [
            "Vân đá cổ độc đáo",
            "Phù hợp non bộ, tiểu cảnh",
            "Chọn viên theo không gian",
        ],
    },
    "da-van-thach-co": {
        "icon": "fa-mountain",
        "description": "Đá vân thạch cổ, hoa văn sâu và màu trầm, dùng trang trí cao cấp.",
        "material": "Đá vân thạch cổ",
        "highlights": [
            "Hoa văn cổ độc bản",
            "Ốp tường hoặc đá cảnh",
            "Tư vấn cắt tấm theo kích thước",
        ],
    },
    "da-van-thach-trang": {
        "icon": "fa-layer-group",
        "description": "Đá vân thạch trắng tự nhiên, vân rõ, phù hợp ốp tường và mặt bàn.",
        "material": "Đá vân thạch trắng",
        "highlights": [
            "Vân trắng sạch, sáng không gian",
            "Cắt tấm theo yêu cầu",
            "Dùng nội thất và ngoại thất",
        ],
    },
}

FEATURED_SLUGS = [
    "tuong-phat-thich-ca",
    "tuong-chu-tieu",
    "den-da",
    "dai-phun-nuoc",
    "tuong-quan-am",
]


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def slugify(text: str) -> str:
    text = nfc(text).strip().lower()
    replacements = {
        "đ": "d",
        "Đ": "d",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def normalize_folder_name(raw: str) -> tuple[str, str]:
    name = nfc(raw).strip()
    if name.upper().startswith("SAE "):
        name = name[4:].strip()
    # Align common variants to canonical display names
    lowered = name.casefold()
    if "phật thích ca" in lowered or "phat thich ca" in slugify(name):
        name = "Tượng Phật Thích Ca"
    elif lowered in {"tượng chú tiểu", "tuong chu tieu"}:
        name = "Tượng chú tiểu"
    elif "điêu khắc chân dung" in lowered:
        name = "Điêu khắc chân dung"
    elif "đài phun nước" in lowered:
        name = "Đài phun nước"
    elif lowered in {"đèn đá", "den da"}:
        name = "Đèn đá"
    slug = slugify(name)
    display = DISPLAY_NAMES.get(slug, name)
    return display, slugify(display)


def list_images(folder: Path) -> list[Path]:
    files = []
    for path in folder.iterdir():
        if path.name.startswith("."):
            continue
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS and path.stat().st_size > 0:
            files.append(path)
    files.sort(key=lambda item: item.name.casefold())
    return files


def export_image(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
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
            str(src),
            "--out",
            str(dest),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    if not dest.is_file() or dest.stat().st_size == 0:
        raise RuntimeError(f"Export failed: {src}")


def clear_dir(path: Path) -> None:
    if not path.exists():
        return
    for child in path.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def wipe_legacy_product_images() -> None:
    for name in LEGACY_PRODUCT_DIRS:
        if name in PROTECTED_IMAGE_DIRS:
            continue
        target = PUBLIC_IMAGES / name
        if target.exists():
            print(f"wipe legacy {target.relative_to(ROOT)}")
            shutil.rmtree(target)

    craft_root = PUBLIC_IMAGES / "san-pham-my-nghe"
    if craft_root.exists():
        for child in list(craft_root.iterdir()):
            if not child.is_dir():
                continue
            if child.name in KEEP_CRAFT_DIRS:
                continue
            print(f"wipe craft {child.relative_to(ROOT)}")
            shutil.rmtree(child)


def load_keep_from_catalog() -> tuple[list[dict], list[dict]]:
    if not CATALOG_PATH.exists():
        return [], []
    data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    cats = [c for c in data.get("categories", []) if c.get("slug") in KEEP_CATEGORY_SLUGS]
    keep_ids = {c["id"] for c in cats}
    products = [p for p in data.get("products", []) if p.get("categoryId") in keep_ids]
    # Drop nested category refs that may be stale; reattach later
    cleaned_products = []
    cat_by_id = {c["id"]: c for c in cats}
    for product in products:
        item = dict(product)
        category = cat_by_id.get(product["categoryId"])
        if not category:
            continue
        item["category"] = {
            "id": category["id"],
            "name": category["name"],
            "description": category.get("description"),
            "image": category.get("image"),
            "slug": category["slug"],
            "createdAt": category.get("createdAt", NOW),
            "updatedAt": category.get("updatedAt", NOW),
        }
        cleaned_products.append(item)
    return cats, cleaned_products


def meta_for(slug: str, display: str) -> dict:
    base = CATEGORY_META.get(
        slug,
        {
            "icon": "fa-gem",
            "description": f"{display} chế tác từ đá tự nhiên tại xưởng An Lạc Stone.",
            "material": "Đá tự nhiên",
            "highlights": [
                "Chế tác thủ công tinh xảo",
                "Bảo hành 12 tháng",
                "Tư vấn theo không gian",
                "Giao hàng toàn quốc",
            ],
        },
    )
    return base


def main() -> None:
    if not SOURCE.is_dir():
        sys.exit(f"Missing source folder: {SOURCE}")

    # Group source folders by canonical slug
    grouped: dict[str, dict] = {}
    for entry in sorted(SOURCE.iterdir(), key=lambda p: nfc(p.name)):
        if not entry.is_dir() or entry.name.startswith("."):
            continue
        display, slug = normalize_folder_name(entry.name)
        if slug in {"tuong-xuong-a-ha"}:
            print(f"skip empty-source folder {entry.name}")
            continue
        images = list_images(entry)
        if not images:
            print(f"skip empty {entry.name}")
            continue
        bucket = grouped.setdefault(slug, {"display": display, "sources": []})
        bucket["display"] = DISPLAY_NAMES.get(slug, display)
        bucket["sources"].append((entry.name, images))

    if not grouped:
        sys.exit("No product images found in source")

    keep_cats, keep_products = load_keep_from_catalog()
    print(f"keep categories={len(keep_cats)} products={len(keep_products)}")

    wipe_legacy_product_images()
    IMAGE_ROOT.mkdir(parents=True, exist_ok=True)

    categories: list[dict] = []
    products: list[dict] = []
    highlights: list[dict] = []
    featured: list[dict] = []
    category_id = 1
    product_id = 1

    for slug in sorted(grouped.keys(), key=lambda s: grouped[s]["display"].casefold()):
        info = grouped[slug]
        display = info["display"]
        meta = meta_for(slug, display)
        all_files: list[tuple[str, Path]] = []
        for folder_name, images in info["sources"]:
            for image in images:
                all_files.append((folder_name, image))

        category = {
            "id": category_id,
            "name": display,
            "description": meta["description"],
            "image": f"/images/anlac/{slug}/001.jpg",
            "slug": slug,
            "createdAt": NOW,
            "updatedAt": NOW,
        }
        categories.append(category)

        for index, (_folder_name, src) in enumerate(all_files, start=1):
            dest_name = f"{index:03d}.jpg"
            dest = IMAGE_ROOT / slug / dest_name
            export_image(src, dest)
            public_path = f"/images/anlac/{slug}/{dest_name}"
            if index == 1:
                category["image"] = public_path

            name = display if len(all_files) == 1 else f"{display} {index:02d}"
            product = {
                "id": product_id,
                "name": name,
                "description": (
                    f"{meta['description']} Giá chưa niêm yết, vui lòng liên hệ để nhận báo giá."
                ),
                "price": 0,
                "priceVND": 0,
                "netPrice": 0,
                "tax": 0,
                "image": public_path,
                "images": [public_path],
                "categoryId": category_id,
                "stock": 1,
                "rating": 0,
                "reviewCount": 0,
                "isFeatured": slug in FEATURED_SLUGS and index == 1,
                "isActive": True,
                "slug": f"{slug}-{index:03d}",
                "weight": None,
                "dimensions": None,
                "material": meta["material"],
                "origin": "Việt Nam — Xưởng An Lạc Stone",
                "craft": "Thủ công tinh xảo",
                "warranty": "12 tháng",
                "highlights": meta["highlights"],
                "createdAt": NOW,
                "updatedAt": NOW,
                "category": category,
            }
            products.append(product)
            if product["isFeatured"]:
                featured.append(
                    {
                        "id": product["id"],
                        "name": display,
                        "price": QUOTE,
                        "image": public_path,
                        "description": meta["description"],
                    }
                )
            product_id += 1
            if index == 1 or index == len(all_files) or index % 20 == 0:
                print(f"{display}: {index}/{len(all_files)}", flush=True)

        highlights.append(
            {
                "name": display,
                "slug": slug,
                "image": category["image"],
                "icon": meta["icon"],
                "count": len(all_files),
            }
        )
        category_id += 1

    # Append kept craft categories/products with remapped ids
    old_to_new_cat: dict[int, int] = {}
    for old_cat in keep_cats:
        new_cat = {
            "id": category_id,
            "name": old_cat["name"],
            "description": old_cat.get("description")
            or f"{old_cat['name']} đá mỹ nghệ An Lạc Stone.",
            "image": old_cat["image"],
            "slug": old_cat["slug"],
            "createdAt": old_cat.get("createdAt", NOW),
            "updatedAt": NOW,
        }
        old_to_new_cat[old_cat["id"]] = category_id
        categories.append(new_cat)
        highlights.append(
            {
                "name": new_cat["name"],
                "slug": new_cat["slug"],
                "image": new_cat["image"],
                "icon": {
                    "bon-tam-da": "fa-bath",
                    "lavabo-da": "fa-sink",
                    "ban-ghe-da": "fa-chair",
                    "ban-da-trang-tri": "fa-table",
                }.get(new_cat["slug"], "fa-gem"),
                "count": sum(1 for p in keep_products if p["categoryId"] == old_cat["id"]),
            }
        )
        category_id += 1

    used_slugs = {p["slug"] for p in products}
    for old_product in keep_products:
        new_cat_id = old_to_new_cat[old_product["categoryId"]]
        category = next(c for c in categories if c["id"] == new_cat_id)
        slug = old_product["slug"]
        if slug in used_slugs:
            slug = f"{slug}-kept"
        product = {
            "id": product_id,
            "name": old_product["name"],
            "description": old_product["description"],
            "price": old_product.get("price", 0),
            "priceVND": old_product.get("priceVND", 0),
            "netPrice": old_product.get("netPrice", 0),
            "tax": old_product.get("tax", 10),
            "image": old_product["image"],
            "images": old_product.get("images") or [old_product["image"]],
            "categoryId": new_cat_id,
            "stock": old_product.get("stock", 1),
            "rating": old_product.get("rating", 0),
            "reviewCount": old_product.get("reviewCount", 0),
            "isFeatured": bool(old_product.get("isFeatured", False)),
            "isActive": True,
            "slug": slug,
            "weight": old_product.get("weight"),
            "dimensions": old_product.get("dimensions"),
            "material": old_product.get("material") or "Đá tự nhiên",
            "origin": old_product.get("origin") or "Việt Nam — Xưởng An Lạc Stone",
            "craft": old_product.get("craft") or "Thủ công tinh xảo",
            "warranty": old_product.get("warranty") or "12 tháng",
            "highlights": old_product.get("highlights")
            or [
                "Chế tác thủ công tinh xảo",
                "Bảo hành 12 tháng",
                "Tư vấn theo không gian",
                "Giao hàng toàn quốc",
            ],
            "createdAt": old_product.get("createdAt", NOW),
            "updatedAt": NOW,
            "category": category,
        }
        products.append(product)
        used_slugs.add(slug)
        product_id += 1

    featured.sort(
        key=lambda item: FEATURED_SLUGS.index(next(c["slug"] for c in categories if c["name"] == item["name"]))
        if any(c["name"] == item["name"] and c["slug"] in FEATURED_SLUGS for c in categories)
        else 99
    )

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CATALOG_PATH.write_text(
        json.dumps({"categories": categories, "products": products}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    HIGHLIGHTS_PATH.write_text(
        json.dumps({"categories": highlights, "featured": featured}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )

    print(
        f"Done: categories={len(categories)} products={len(products)} "
        f"watermark_groups={len(grouped)} kept={len(keep_products)}"
    )


if __name__ == "__main__":
    main()
