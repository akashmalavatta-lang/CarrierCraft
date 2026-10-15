"""
CC — Career Craft
Resume Parser: Extract raw text from PDF and DOCX files.
Uses PyMuPDF for PDF and python-docx for DOCX.
Gracefully handles corrupt or unsupported files.
"""
import os
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract text from a PDF using PyMuPDF (fitz).
    Returns (extracted_text, error_message).
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        if doc.is_encrypted:
            doc.close()
            return None, "This PDF is password-protected or encrypted. Please remove the password and re-upload."

        if doc.page_count == 0:
            doc.close()
            return None, "The PDF file is empty and contains no pages."

        pages = []
        has_images = False
        for page in doc:
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                pages.append(page_text.strip())
            if len(page.get_images()) > 0:
                has_images = True
        doc.close()

        full_text = "\n".join(pages).strip()
        if len(full_text) < 50:
            if has_images:
                return None, "The PDF appears to be a scanned image or photo without an extractable text layer. Please upload a searchable text-based PDF or DOCX."
            return None, "Insufficient text extracted from the PDF (under 50 characters). Please upload a complete resume."

        return full_text, None
    except Exception as e:
        logger.error(f"PDF extraction failed for {file_path}: {e}")
        return None, f"PDF file could not be parsed: {str(e)}"


def extract_text_from_docx(file_path: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract text from a DOCX file using python-docx.
    Returns (extracted_text, error_message).
    """
    try:
        from docx import Document
        doc = Document(file_path)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        # Also extract table cells
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    if cell_text and cell_text not in paragraphs:
                        paragraphs.append(cell_text)

        full_text = "\n".join(paragraphs).strip()
        if len(full_text) < 50:
            return None, "The DOCX file contains insufficient text. Please verify the document contains readable text."
        return full_text, None
    except Exception as e:
        logger.error(f"DOCX extraction failed for {file_path}: {e}")
        return None, f"The DOCX file appears to be corrupted or invalid: {str(e)}"


def extract_text(file_path: str) -> dict:
    """
    Extract text from a resume file (PDF or DOCX).
    Returns dict with 'text', 'success', 'error', 'file_type'.
    """
    if not os.path.exists(file_path):
        return {"success": False, "error": "File does not exist on server.", "text": None, "file_type": None}

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        text, err = extract_text_from_pdf(file_path)
        file_type = "pdf"
    elif ext == ".docx":
        text, err = extract_text_from_docx(file_path)
        file_type = "docx"
    else:
        return {
            "success": False,
            "error": f"Unsupported file type: '{ext}'. Please upload a .pdf or .docx file.",
            "text": None,
            "file_type": None,
        }

    if err or not text or len(text.strip()) < 50:
        return {
            "success": False,
            "error": err or "Could not extract sufficient text from the file.",
            "text": None,
            "file_type": file_type,
        }

    cleaned = _clean_text(text)
    return {"success": True, "error": None, "text": cleaned, "file_type": file_type}



def _clean_text(text: str) -> str:
    """Clean extracted text — normalize whitespace, remove garbage chars."""
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove trailing whitespace before newlines
    text = re.sub(r"[ \t]+\n", "\n", text)
    # Remove excessive blank lines (keep max 2 consecutive)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove non-printable chars except newline/tab
    text = re.sub(r"[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()

