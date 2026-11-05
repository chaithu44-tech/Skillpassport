import os
from pathlib import Path
from typing import Dict, Any, Tuple
import pymupdf  # PyMuPDF
import docx

class DocumentParseError(Exception):
    """Custom exception raised when resume parsing fails."""
    pass

class DocumentParserService:
    @staticmethod
    def validate_file(file_name: str, file_bytes: bytes, max_mb: int = 10) -> str:
        """Validates extension, size, and non-emptiness."""
        if not file_bytes or len(file_bytes) == 0:
            raise DocumentParseError("The uploaded file is empty.")
        
        file_size_mb = len(file_bytes) / (1024 * 1024)
        if file_size_mb > max_mb:
            raise DocumentParseError(f"File size ({file_size_mb:.2f} MB) exceeds maximum allowed limit of {max_mb} MB.")
        
        ext = Path(file_name).suffix.lower()
        if ext not in [".pdf", ".docx"]:
            raise DocumentParseError(f"Unsupported file format '{ext}'. Only .pdf and .docx documents are accepted.")
            
        return ext

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
        """Extracts text from PDF across all pages using PyMuPDF."""
        try:
            doc = pymupdf.open(file_path)
            if doc.is_encrypted:
                raise DocumentParseError("The PDF file is password protected. Please upload an unlocked document.")
            
            page_count = len(doc)
            if page_count == 0:
                raise DocumentParseError("The PDF document contains no pages.")
            
            full_text = []
            for page_num in range(page_count):
                page = doc[page_num]
                text = page.get_text()
                if text:
                    full_text.append(text.strip())
            
            doc.close()
            extracted = "\n\n".join(full_text).strip()
            if not extracted:
                raise DocumentParseError("Unable to extract text from PDF. The document may be scanned or image-only without selectable text.")
            
            return extracted, page_count
        except DocumentParseError:
            raise
        except Exception as e:
            raise DocumentParseError(f"Failed to process PDF document: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> Tuple[str, int]:
        """Extracts text from DOCX paragraphs and tables using python-docx."""
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            
            # Extract from tables as well
            table_texts = []
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        table_texts.append(row_text)
            
            all_text = paragraphs + table_texts
            extracted = "\n".join(all_text).strip()
            
            if not extracted:
                raise DocumentParseError("The DOCX document is empty or contains no readable text.")
            
            # Estimate pages roughly for docx (approx 400 words per page)
            words = len(extracted.split())
            page_count = max(1, (words // 400) + 1)
            return extracted, page_count
        except DocumentParseError:
            raise
        except Exception as e:
            raise DocumentParseError(f"Failed to process DOCX document: {str(e)}")

    @classmethod
    def parse_document(cls, file_path: str, file_name: str) -> Tuple[str, int]:
        """Unified entry point to parse PDF or DOCX file."""
        ext = Path(file_name).suffix.lower()
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            return cls.extract_text_from_docx(file_path)
        else:
            raise DocumentParseError(f"Unsupported format '{ext}'.")
