"""pytest 설정 — .env PermissionError 우회."""
import sys
from pathlib import Path

# backend/ 디렉토리를 PYTHONPATH에 추가
sys.path.insert(0, str(Path(__file__).parent))

# .env 파일 무시 (PermissionError 방지)
collect_ignore = [".env"]
collect_ignore_glob = [".*"]
