import requests
import json
import time
from datetime import datetime
from pathlib import Path

# -----------------------
# 配置
# -----------------------
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "../frontend/public/data"
OUTPUT_FILE = OUTPUT_DIR / "worldtime.json"

TIMEZONES = [
    "Asia/Tokyo",
    "Europe/London",
    "America/New_York",
    "Asia/Shanghai"
]

PROXIES = {
    "http": "http://127.0.0.1:10090",
    "https": "http://127.0.0.1:10090"
}

# -----------------------
# 工具函数
# -----------------------
def fetch_timezone_with_retry(tz: str, delay: int = 2) -> dict:
    attempt = 0
    while True:
        attempt += 1
        try:
            resp = requests.get(f"https://worldtimeapi.org/api/timezone/{tz}", timeout=5, proxies=PROXIES)
            resp.raise_for_status()
            data = resp.json()
            return {
                "timezone": tz,
                "datetime": data.get("datetime"),
                "unixtime": data.get("unixtime"),
                "utc_offset": data.get("utc_offset"),
                "attempts": attempt
            }
        except Exception as e:
            print(f"[WARN] Attempt {attempt} failed for {tz}: {e}")
            time.sleep(delay)

# -----------------------
# 主逻辑
# -----------------------
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)  # 确保 output 目录存在

    result = {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "timezones": []
    }

    for tz in TIMEZONES:
        tz_data = fetch_timezone_with_retry(tz)
        result["timezones"].append(tz_data)

    # 写入 JSON 文件
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"[INFO] Worldtime data updated at {OUTPUT_FILE}")

# -----------------------
# 脚本入口
# -----------------------
if __name__ == "__main__":
    main()
