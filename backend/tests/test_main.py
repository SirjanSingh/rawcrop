import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from PIL import Image
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)


@pytest.fixture
def mock_rawpy():
    """Mock rawpy to avoid needing actual RAW files"""
    with patch('main.rawpy') as mock:
        mock_raw_img = MagicMock()
        mock_raw_img.__enter__ = Mock(return_value=mock_raw_img)
        mock_raw_img.__exit__ = Mock(return_value=False)
        mock_raw_img.raw_image_visible = np.random.randint(0, 4096, (4000, 6000), dtype=np.uint16)
        mock_raw_img.postprocess.return_value = np.random.randint(0, 255, (4000, 6000, 3), dtype=np.uint8)
        mock.imread.return_value = mock_raw_img
        yield mock


@pytest.fixture
def mock_subprocess():
    """Mock subprocess calls for exiftool"""
    with patch('main.subprocess.run') as mock:
        mock.return_value = Mock(returncode=0)
        yield mock


@pytest.fixture
def temp_dirs(tmp_path, monkeypatch):
    """Setup temporary directories for testing"""
    upload_dir = tmp_path / "uploads"
    processed_dir = tmp_path / "processed"
    upload_dir.mkdir()
    processed_dir.mkdir()

    monkeypatch.setattr('main.UPLOAD_DIR', str(upload_dir))
    monkeypatch.setattr('main.PROCESSED_DIR', str(processed_dir))

    return {'upload_dir': upload_dir, 'processed_dir': processed_dir}


def create_test_image(format='JPEG', size=(100, 100)):
    """Helper to create a test image file"""
    img = Image.new('RGB', size, color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes


def create_fake_raw_file():
    """Create a fake RAW file (just bytes with .nef extension)"""
    return BytesIO(b"FAKE_RAW_DATA" * 1000)


class TestRootEndpoint:
    def test_root_returns_welcome_message(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "RawCrop" in data["message"]


class TestFileValidation:
    def test_upload_without_file(self):
        response = client.post("/upload/")
        assert response.status_code == 422
        assert "detail" in response.json()

    def test_upload_with_invalid_file_type(self, temp_dirs):
        files = {"file": ("test.txt", BytesIO(b"not an image"), "text/plain")}
        response = client.post("/upload/", files=files)
        assert response.status_code == 400
        assert "Unsupported file format" in response.json()["error"]

    def test_upload_with_jpeg_rejected(self, temp_dirs):
        img_bytes = create_test_image()
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        response = client.post("/upload/", files=files)
        assert response.status_code == 400
        assert "Unsupported file format" in response.json()["error"]

    def test_upload_with_valid_nef_file(self, temp_dirs, mock_rawpy, mock_subprocess):
        raw_bytes = create_fake_raw_file()
        files = {"file": ("test.nef", raw_bytes, "application/octet-stream")}
        with patch('main.imageio.imwrite'):
            response = client.post("/upload/", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["filename"].endswith("test.nef")
        assert "processed successfully" in data["message"]

    def test_upload_case_insensitive_extension(self, temp_dirs, mock_rawpy, mock_subprocess):
        for ext in ["NEF", "nef", "Nef", "NeF"]:
            raw_bytes = create_fake_raw_file()
            files = {"file": (f"case.{ext}", raw_bytes, "application/octet-stream")}
            with patch('main.imageio.imwrite'):
                response = client.post("/upload/", files=files)
            assert response.status_code == 200


class TestRawFileFormats:
    def test_supported_formats_list(self):
        from main import ALLOWED_RAW_EXTENSIONS
        expected = ["nef", "cr2", "arw", "dng"]
        for e in expected:
            assert e in ALLOWED_RAW_EXTENSIONS

    def test_only_raw_formats_allowed(self, temp_dirs):
        for fmt in ["jpg", "png", "gif", "bmp", "tiff"]:
            files = {"file": (f"f.{fmt}", BytesIO(b"data"), "image/jpeg")}
            r = client.post("/upload/", files=files)
            assert r.status_code == 400
            assert "Unsupported file format" in r.json()["error"]


class TestCropEndpoint:
    def test_crop_with_nonexistent_file(self):
        payload = {"filename": "missing.nef", "x": 0, "y": 0, "width": 100, "height": 100}
        r = client.post("/crop-raw/", json=payload)
        assert r.status_code == 500
        assert "image too big" in r.json()["error"].lower()

    def test_crop_with_zero_dimensions(self):
        payload = {"filename": "f.nef", "x": 0, "y": 0, "width": 0, "height": 0}
        r = client.post("/crop-raw/", json=payload)
        assert r.status_code == 500
        assert "image too big" in r.json()["error"].lower()

    def test_crop_with_negative_coordinates(self):
        payload = {"filename": "f.nef", "x": -5, "y": -10, "width": 100, "height": 100}
        r = client.post("/crop-raw/", json=payload)
        assert r.status_code == 500
        assert "image too big" in r.json()["error"].lower()


class TestEndToEndFlow:
    def test_upload_and_crop_workflow(self, temp_dirs, mock_rawpy, mock_subprocess):
        raw_bytes = create_fake_raw_file()
        files = {"file": ("astro.nef", raw_bytes, "application/octet-stream")}
        with patch('main.imageio.imwrite'):
            up = client.post("/upload/", files=files)
        assert up.status_code == 200
        filename = up.json()["filename"]

        payload = {"filename": filename, "x": 100, "y": 100, "width": 500, "height": 500}
        with patch('main.Image.fromarray') as m_img:
            mock_pil = MagicMock()
            m_img.return_value = mock_pil
            mock_pil.crop.return_value = mock_pil
            r = client.post("/crop-raw/", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "successfully" in data["message"]
        assert "cropped_raw_url" in data
        assert "cropped_preview_url" in data


class TestDownloadEndpoints:
    def test_download_raw_nonexistent_file(self, temp_dirs):
        r = client.get("/download/raw/missing.nef")
        assert r.status_code == 404
        assert "not found" in r.json()["error"].lower()

    def test_download_cropped_nonexistent_file(self, temp_dirs):
        r = client.get("/download/cropped/missing_cropped.nef")
        assert r.status_code == 404
        assert "not found" in r.json()["error"].lower()

    def test_download_raw_existing_file(self, temp_dirs):
        f = temp_dirs['upload_dir'] / "t.nef"
        f.write_bytes(b"rawdata")
        r = client.get("/download/raw/t.nef")
        assert r.status_code == 200
        assert r.content == b"rawdata"

    def test_download_cropped_existing_file(self, temp_dirs):
        f = temp_dirs['processed_dir'] / "t_cropped.nef"
        f.write_bytes(b"ok")
        r = client.get("/download/cropped/t_cropped.nef")
        assert r.status_code == 200
        assert r.content == b"ok"


class TestClearDataEndpoint:
    def test_clear_data_removes_files(self, temp_dirs):
        (temp_dirs['upload_dir'] / "a.nef").write_bytes(b"1")
        (temp_dirs['processed_dir'] / "b.jpg").write_bytes(b"2")
        r = client.delete("/clear-data")
        assert r.status_code == 200
        msg = r.json()["message"].lower()
        assert "cleared" in msg
        assert not list(temp_dirs['upload_dir'].iterdir())
        assert not list(temp_dirs['processed_dir'].iterdir())

    def test_clear_data_recreates_directories(self, temp_dirs):
        r = client.delete("/clear-data")
        assert r.status_code == 200
        assert temp_dirs['upload_dir'].exists()
        assert temp_dirs['processed_dir'].exists()
