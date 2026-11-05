#!/usr/bin/env python3
"""
SKILL PASSPORT - Test Suite Runner
Executes comprehensive end-to-end verification covering:
1. Authentication (Student, Recruiter, Owner Bootstrap)
2. Resume Processing (PyMuPDF, python-docx, multi-page, invalid file rejection)
3. Career Engine (Role compatibility %, gap detection, roadmap milestone checks)
4. Admin Security (Owner exclusivity, role enforcement, live database metrics)
5. Opportunities & Hiring (Posting, applications, status updates, interview scheduling)
"""

import unittest
import sys

if __name__ == "__main__":
    print("=" * 70)
    print("  SKILL PASSPORT - Comprehensive Verification Test Suite")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = loader.discover("tests")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print("\n" + "=" * 70)
        print("  ALL TESTS PASSED SUCCESSFULLY! (100% Integrity Verified)")
        print("=" * 70)
        sys.exit(0)
    else:
        print("\n" + "=" * 70)
        print("  SOME TESTS FAILED! Inspect logs above.")
        print("=" * 70)
        sys.exit(1)
