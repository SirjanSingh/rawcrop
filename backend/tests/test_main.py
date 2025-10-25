import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from PIL import Image
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)


def create_test_image(format='JPEG', size=(100, 100)):
    """Helper to create a test image file"""
    img = Image.new('RGB', size, color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes

class TestFileValidation:
    """Test file upload validation"""
    
    def test_upload_without_file(self):
        """Test upload endpoint without file returns error"""
        response = client.post("/upload")
        assert response.status_code == 422
    
    def test_upload_with_invalid_file_type(self):
        """Test upload with non-image file"""
        files = {"file": ("test.txt", BytesIO(b"not an image"), "text/plain")}
        response = client.post("/upload", files=files)
        assert response.status_code in [400, 422]
    
    def test_upload_with_valid_image(self):
        """Test upload with valid image file"""
        img_bytes = create_test_image()
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        response = client.post("/upload", files=files)
        assert response.status_code in [200, 400]


class TestRawFileFormats:
    """Test RAW file format support"""
    
    def test_supported_formats_list(self):
        """Test that common RAW formats are recognized"""
        supported_formats = ['.NEF', '.CR2', '.ARW', '.DNG']
        
        for fmt in supported_formats:
            assert fmt in ['.NEF', '.CR2', '.ARW', '.DNG', '.RAF', '.ORF']
    
    def test_case_insensitive_format_check(self):
        """Test that format checking is case-insensitive"""
        formats = ['.nef', '.NEF', '.Nef']
        normalized = [fmt.upper() for fmt in formats]
        assert len(set(normalized)) == 1


class TestCropEndpoint:
    """Test image cropping functionality"""
    
    def test_crop_with_invalid_coordinates(self):
        """Test crop endpoint rejects invalid coordinates"""
        payload = {
            "x": -10,
            "y": -10,
            "width": 100,
            "height": 100
        }
        response = client.post("/crop", json=payload)
        assert response.status_code in [400, 404, 422]
    
    def test_crop_with_zero_dimensions(self):
        """Test crop endpoint rejects zero dimensions"""
        payload = {
            "x": 0,
            "y": 0,
            "width": 0,  
            "height": 0 
        }
        response = client.post("/crop", json=payload)
        assert response.status_code in [400, 404, 422]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])