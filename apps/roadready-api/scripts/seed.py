#!/usr/bin/env python3
"""
Seed database with sample data for local development
Usage: python scripts/seed.py [--clear]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.seed import seed_users, clear_users

def main():
    if "--clear" in sys.argv:
        print("Clearing database...")
        clear_users()
    else:
        print("Seeding database...")
        seed_users()

if __name__ == "__main__":
    main()
