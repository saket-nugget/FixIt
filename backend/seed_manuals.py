from sqlalchemy.orm import Session
from database import SessionLocal
from crud import create_manual
import json

def seed_manuals():
    db = SessionLocal()
    try:
        # Check if already seeded to avoid duplicates
        from models import Manual
        if db.query(Manual).filter(Manual.is_default == 1).count() > 0:
            print("Manuals already seeded.")
            return

        print("Seeding default manuals...")
        
        defaults = [
            {
                "title": "Industrial Conveyor Belt Maintenance",
                "category": "Machinery",
                "content": json.dumps([
                    {"role": "model", "content": "This guide covers the tensioning and alignment of industrial conveyor systems.\n\nKey Steps:\n1. Lockout/Tagout the power supply.\n2. Inspect rollers for debris.\n3. Adjust tension bolts equally on both sides."}
                ])
            },
            {
                "title": "Hydraulic Press Safety & Troubleshooting",
                "category": "Machinery",
                "content": json.dumps([
                    {"role": "model", "content": "Safety protocols for high-pressure hydraulic systems.\n\nChecklist:\n- Verify fluid levels.\n- Inspect hoses for micro-leaks.\n- Test emergency stop valves."}
                ])
            },
            {
                "title": "AC Motor Calibration Guide",
                "category": "Electronics",
                "content": json.dumps([
                    {"role": "model", "content": "Calibration steps for 3-phase AC motors.\n\nSteps:\n1. Check insulation resistance.\n2. Verify phase balance.\n3. Calibrate variable frequency drive (VFD)."}
                ])
            }
        ]

        for m in defaults:
            create_manual(
                db, 
                title=m["title"], 
                category=m["category"], 
                content=m["content"], 
                is_default=1
            )
        
        print("Seeding complete!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_manuals()
