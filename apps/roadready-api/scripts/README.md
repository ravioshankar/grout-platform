# Database Scripts

## Seeding

### Seed database with sample data
```bash
python scripts/seed.py
```

### Clear all seeded data
```bash
python scripts/seed.py --clear
```

## Sample Data

The seed script creates 5 test users with different states and test types:
- john.doe@example.com (CA, car)
- jane.smith@example.com (NY, motorcycle)
- bob.wilson@example.com (TX, car)
- alice.brown@example.com (FL, cdl)
- charlie.davis@example.com (CA, motorcycle)
