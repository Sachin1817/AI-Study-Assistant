import os
import logging
from typing import List, Dict
import pypdf
import pdfplumber
from PIL import Image

logger = logging.getLogger("pdf_processor")

try:
    import pytesseract
    pytesseract_available = True
except ImportError:
    pytesseract_available = False
    logger.warning("pytesseract not found. OCR features will be unavailable, fallback to direct text extraction is active.")

def extract_text_from_pdf(file_path: str, use_ocr: bool = False) -> str:
    """
    Extracts text from a local PDF file.
    If use_ocr is True and pytesseract is available, it attempts to scan image-only PDFs.
    Otherwise, standard text extraction is utilized.
    """
    text = ""
    
    # Attempt standard extraction first
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {e}. Trying pypdf...")
        try:
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as ex:
            logger.error(f"pypdf extraction failed as well: {ex}")

    # If OCR is explicitly requested and text is sparse, try pytesseract OCR
    if use_ocr or len(text.strip()) < 100:
        if pytesseract_available:
            logger.info("Direct text extraction returned minimal content. Invoking pytesseract OCR process...")
            try:
                # Set tesseract path on Windows if standard installation exists
                if os.name == 'nt':
                    possible_paths = [
                        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
                    ]
                    for path in possible_paths:
                        if os.path.exists(path):
                            pytesseract.pytesseract.tesseract_cmd = path
                            break

                # Open the reader to scan image-based PDFs
                reader = pypdf.PdfReader(file_path)
                ocr_text = ""
                # Scan up to first 10 pages for performance to prevent hanging
                max_scan_pages = min(len(reader.pages), 10)
                
                # Note: A production system would convert pages to images using pdf2image.
                # Since pdf2image depends on system-level poppler, we log details and gracefully use fallback
                # or extract embedded images.
                for i in range(max_scan_pages):
                    page = reader.pages[i]
                    for image_file_object in page.images:
                        try:
                            # Load the image from PDF structure directly
                            img = Image.open(image_file_object.image)
                            extracted = pytesseract.image_to_string(img)
                            if extracted:
                                ocr_text += extracted + "\n"
                        except Exception as img_err:
                            logger.debug(f"Failed to scan image on page {i}: {img_err}")
                
                if ocr_text.strip():
                    text += "\n[OCR Extracted Content]:\n" + ocr_text
            except Exception as ocr_err:
                logger.error(f"pytesseract OCR scan failed: {ocr_err}. Standard text will be used.")
        else:
            logger.warning("OCR requested but pytesseract is not installed in environment.")

    return text.strip()

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict]:
    """
    Splits text into smaller overlapping chunks for vector database similarity indexing.
    """
    if not text:
        return []

    words = text.split()
    chunks = []
    chunk_id = 0
    
    current_word_idx = 0
    total_words = len(words)
    
    # Standard sliding window over words for higher semantic structure
    while current_word_idx < total_words:
        # Pull words up to chunk size
        selected_words = words[current_word_idx:current_word_idx + chunk_size]
        chunk_text_str = " ".join(selected_words)
        
        chunks.append({
            "chunk_id": chunk_id,
            "text": chunk_text_str
        })
        
        chunk_id += 1
        # Advance word index by chunk_size minus overlap
        current_word_idx += max(1, chunk_size - overlap)
        
    return chunks
