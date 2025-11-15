# Tests

This directory contains automated tests for the RawCrop backend API.

## Overview

We use `pytest` to test the FastAPI endpoints, ensuring reliability and catching bugs early.

**Current Coverage:**
- File upload validation
- RAW format support checks
- Crop endpoint validation

## Quick Start

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
```

### Run All Tests

```bash
pytest
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage Report

```bash
pytest --cov=. --cov-report=html
```

This generates an HTML coverage report in `htmlcov/index.html`.

## Test Files

- **`test_main.py`** - Core API endpoint tests

## Test Categories

### File Validation
Tests for upload security and validation:
- Missing file handling
- Invalid file types rejection
- Valid image acceptance

### RAW File Formats
Tests for supported RAW file formats:
- Format recognition (`.NEF`, `.CR2`, `.ARW`, `.DNG`)
- Case-insensitive format checking

### Crop Functionality
Tests for image cropping logic:
- Invalid coordinates rejection
- Zero dimension handling

## Running Specific Tests

### Run a Single Test File
```bash
pytest tests/test_main.py
```

### Run a Specific Test Class
```bash
pytest tests/test_main.py::TestFileValidation
```

### Run a Specific Test Function
```bash
pytest tests/test_main.py::TestHealthEnTestFileValidationdpoints::test_upload_without_file
```

## Writing New Tests

### Test Naming Convention
- Test files: `test_*.py`
- Test classes: `Test*`
- Test functions: `test_*`

### Example Test

```python
def test_example_endpoint():
    """Test description"""
    response = client.get("/example")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

## Useful pytest Options

```bash
# Stop on first failure
pytest -x

# Show local variables on failure
pytest -l

# Run last failed tests
pytest --lf

# Run tests in parallel (requires pytest-xdist)
pytest -n auto

# Disable warnings
pytest --disable-warnings

# Generate JUnit XML report (for CI)
pytest --junitxml=report.xml
```


## Resources

- [pytest documentation](https://docs.pytest.org/)
- [FastAPI testing guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [pytest-cov documentation](https://pytest-cov.readthedocs.io/)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before submitting PR
3. Aim for >80% code coverage
4. Test both success and failure cases

---

**Last Updated:** 2025-10-24  
**Maintainer:** RawCrop Contributors