# Grout-Platform - Source Code & Utilities

## src/ Directory Structure

```
src/
├── setup.py         # Package setup configuration
├── utils.py         # Utility functions
└── covid19/         # COVID-19 related tools
    └── (contents)   # Pandemic data processing tools
```

---

## 📄 Core Utilities

### `src/utils.py`
Simple utility functions for the project:
- `greeter(name)` - Welcome message generator
- Additional helper functions (expandable)

**Example Usage:**
```python
from src.utils import greeter
print(greeter("Ravio"))  # Output: Welcome Ravio
```

---

## 🎯 Main Entry Point (`main.py`)

Command-line application with argparse:

### Arguments
- `<arg>` (required) - Positional argument
- `-f, --flag` (optional) - Boolean flag
- `-n, --name` (optional) - Name parameter
- `-v, --verbose` (optional) - Verbosity counter (-v, -vv, etc.)
- `--version` - Show version info

### Example Usage
```bash
# Basic run
python main.py argument_name

# With verbose mode
python main.py arg -vv

# With custom name
python main.py arg -n "Ravio"

# Show version
python main.py --version
```

---

## 📦 Dependencies (`requirements.txt`)

- `logzero` - Logging library for application logging
  - See: https://github.com/metachris/logzero

**Installation:**
```bash
pip install -r requirements.txt
```

---

## 🛠️ Package Setup (`setup.py`)

Configuration file for packaging the grout-platform as a Python package.

**Features:**
- MIT License
- Version tracking: 0.1.0
- Author metadata support

---