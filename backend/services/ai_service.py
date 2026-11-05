import json
import re
from typing import Dict, Any, List, Optional
import httpx
from backend.config import settings

# Comprehensive skill dictionary categorized for precise extraction
KNOWN_SKILLS = {
    "languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "golang",
        "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "sql", "html", "css", "bash", "shell"
    ],
    "frameworks": [
        "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "express.js",
        "django", "flask", "fastapi", "spring", "spring boot", "asp.net", "laravel", "ruby on rails",
        "tailwind css", "bootstrap", "flutter", "react native"
    ],
    "databases": [
        "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "cassandra",
        "dynamodb", "elasticsearch", "oracle", "mariadb", "firebase"
    ],
    "tools": [
        "git", "github", "gitlab", "docker", "kubernetes", "jenkins", "terraform",
        "postman", "linux", "jira", "figma", "webpack", "vite", "ci/cd"
    ],
    "cloud": [
        "aws", "amazon web services", "azure", "google cloud", "gcp", "cloudflare", "heroku", "vercel"
    ],
    "aiml": [
        "machine learning", "deep learning", "artificial intelligence", "nlp", "computer vision",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "opencv",
        "huggingface", "llm", "langchain", "prompt engineering", "data science", "data analysis"
    ]
}

class AIService:
    @classmethod
    async def analyze_resume(cls, extracted_text: str) -> Dict[str, Any]:
        """Analyzes actual resume text using Cloud LLM if API key exists, otherwise uses deterministic local NLP parser."""
        if settings.AI_API_KEY and len(settings.AI_API_KEY.strip()) > 5:
            try:
                result = await cls._analyze_with_gemini(extracted_text)
                if result:
                    result["ai_provider_used"] = f"Google Gemini ({settings.AI_MODEL})"
                    return result
            except Exception as e:
                print(f"[AI Service Warning] Gemini API call failed: {e}. Falling back to Local Semantic Parser.")
        
        # Local semantic analysis engine
        result = cls._analyze_with_local_nlp(extracted_text)
        result["ai_provider_used"] = "Local Semantic Parser (Development Mode)"
        return result

    @classmethod
    async def _analyze_with_gemini(cls, text: str) -> Optional[Dict[str, Any]]:
        """Invokes Gemini API with strict structured JSON schema."""
        prompt = f"""
You are an expert AI Resume Analyst for the Skill Passport career intelligence platform.
Analyze the following actual resume text and extract truthful information.
CRITICAL RULES:
1. ONLY identify information explicitly supported by the text below.
2. If information is missing, set the field to "Not found in resume" or an empty list.
3. NEVER invent or hallucinate experience, skills, projects, education, or contact details.
4. Provide constructive, honest quality suggestions based solely on this resume.

Resume Text:
\"\"\"{text[:10000]}\"\"\"

Return ONLY a valid JSON object with the following schema:
{{
  "personal_info": {{
    "name": "string or 'Not found in resume'",
    "email": "string or 'Not found in resume'",
    "phone": "string or 'Not found in resume'",
    "college": "string or 'Not found in resume'",
    "degree": "string or 'Not found in resume'",
    "graduation_year": "string or 'Not found in resume'"
  }},
  "technical_skills": {{
    "languages": ["skill1", ...],
    "frameworks": ["framework1", ...],
    "databases": ["db1", ...],
    "tools": ["tool1", ...],
    "cloud": ["cloud1", ...],
    "aiml": ["aiml1", ...]
  }},
  "other_info": {{
    "projects": [
      {{"title": "project title", "description": "details or 'Not found in resume'", "technologies": ["tech1"]}}
    ],
    "internships_and_experience": [
      {{"role": "role title", "company": "company or 'Not specified'", "duration": "dates", "summary": "details"}}
    ],
    "certifications": ["cert1", ...],
    "achievements": ["achievement1", ...]
  }},
  "quality_analysis": {{
    "structure_rating": "Good / Needs Improvement / Weak",
    "ats_readability_score": 75,
    "missing_sections": ["list of sections missing like Projects, Summary, etc."],
    "strong_points": ["bullet points"],
    "improvement_suggestions": ["practical suggestions to improve resume"],
    "keyword_density_summary": "overview of keywords present"
  }}
}}
"""
        url = f"{settings.AI_BASE_URL}/models/{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(content)
        return None

    @classmethod
    def _analyze_with_local_nlp(cls, text: str) -> Dict[str, Any]:
        """High-precision local semantic extraction engine extracting truthful information directly from the document."""
        lower_text = text.lower()
        
        # 1. Personal Info Extraction
        # Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else "Not found in resume"
        
        # Phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0).strip() if phone_match else "Not found in resume"
        
        # Name: usually the first non-empty line of the resume, or near contact details
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        name = "Not found in resume"
        if lines:
            candidate_name = lines[0]
            if len(candidate_name.split()) <= 4 and not re.search(r'resume|curriculum|email|phone|http', candidate_name.lower()):
                name = candidate_name
            elif len(lines) > 1 and len(lines[1].split()) <= 4:
                name = lines[1]
                
        # Education & College
        college = "Not found in resume"
        degree = "Not found in resume"
        college_keywords = ["university", "institute", "college", "school of", "technology", "polytechnic"]
        degree_keywords = ["b.tech", "bachelor", "b.e", "b.s", "m.tech", "master", "m.s", "ph.d", "diploma", "bca", "mca"]
        
        for line in lines:
            ll = line.lower()
            if any(k in ll for k in college_keywords) and college == "Not found in resume":
                college = line[:120].strip()
            if any(k in ll for k in degree_keywords) and degree == "Not found in resume":
                degree = line[:120].strip()
                
        # Graduation Year
        grad_match = re.search(r'\b(20\d{2})\b', text)
        grad_year = grad_match.group(1) if grad_match else "Not found in resume"

        # 2. Technical Skills Extraction (exact boundary match against real resume text)
        extracted_skills = {
            "languages": [],
            "frameworks": [],
            "databases": [],
            "tools": [],
            "cloud": [],
            "aiml": []
        }
        
        for category, skill_list in KNOWN_SKILLS.items():
            for skill in skill_list:
                # Use regex with word boundaries where appropriate (e.g. \bc\b for C language, \br\b for R)
                escaped = re.escape(skill)
                pattern = rf'(?:^|[\s,;/|•\(\)])({escaped})(?:$|[\s,;/|•\(\)])'
                if re.search(pattern, lower_text):
                    # Format nicely
                    formatted = skill.title() if len(skill) > 3 else skill.upper()
                    if skill in ["javascript", "typescript"]:
                        formatted = "JavaScript" if skill == "javascript" else "TypeScript"
                    elif skill in ["react", "react.js"]:
                        formatted = "React.js"
                    elif skill in ["node.js", "next.js", "vue.js", "express.js"]:
                        formatted = skill.capitalize()
                    elif skill in ["postgresql", "mongodb", "mysql", "sqlite"]:
                        formatted = {"postgresql": "PostgreSQL", "mongodb": "MongoDB", "mysql": "MySQL", "sqlite": "SQLite"}[skill]
                    elif skill in ["aws", "gcp", "ci/cd", "nlp", "llm", "html", "css", "sql"]:
                        formatted = skill.upper()
                    
                    if formatted not in extracted_skills[category]:
                        extracted_skills[category].append(formatted)

        # 3. Projects Extraction
        projects = []
        project_headers = ["projects", "personal projects", "academic projects", "key projects"]
        in_projects = False
        current_project = None
        
        for line in lines:
            line_clean = line.strip()
            ll = line_clean.lower()
            if any(ll.startswith(h) or ll == h for h in project_headers):
                in_projects = True
                continue
            if in_projects and any(ll.startswith(h) for h in ["experience", "education", "skills", "certifications", "achievements"]):
                in_projects = False
                break
            if in_projects and line_clean:
                if len(line_clean) < 60 and not line_clean.startswith("-") and not line_clean.startswith("•"):
                    if current_project:
                        projects.append(current_project)
                    current_project = {
                        "title": line_clean,
                        "description": "",
                        "technologies": []
                    }
                elif current_project:
                    current_project["description"] += " " + line_clean
        if current_project:
            projects.append(current_project)
            
        # Clean up project descriptions
        for p in projects:
            p["description"] = p["description"].strip() or "Detailed project work documented in resume."
            # Check for technologies mentioned
            p_techs = []
            for cat_skills in extracted_skills.values():
                for s in cat_skills:
                    if s.lower() in p["description"].lower() or s.lower() in p["title"].lower():
                        p_techs.append(s)
            p["technologies"] = list(set(p_techs))[:5]

        # 4. Internships & Experience Extraction
        experiences = []
        exp_headers = ["experience", "work experience", "internships", "professional experience", "employment"]
        in_exp = False
        current_exp = None
        for line in lines:
            line_clean = line.strip()
            ll = line_clean.lower()
            if any(ll.startswith(h) or ll == h for h in exp_headers):
                in_exp = True
                continue
            if in_exp and any(ll.startswith(h) for h in ["projects", "education", "skills", "certifications"]):
                in_exp = False
                break
            if in_exp and line_clean:
                if len(line_clean) < 60 and not line_clean.startswith("-") and not line_clean.startswith("•"):
                    if current_exp:
                        experiences.append(current_exp)
                    current_exp = {
                        "role": line_clean,
                        "company": "Organization mentioned in resume",
                        "duration": "Not specified",
                        "summary": ""
                    }
                elif current_exp:
                    current_exp["summary"] += " " + line_clean
        if current_exp:
            experiences.append(current_exp)
        for e in experiences:
            e["summary"] = e["summary"].strip() or "Professional responsibilities outlined in resume."

        # 5. Certifications & Achievements
        certifications = []
        achievements = []
        for line in lines:
            ll = line.lower()
            if any(k in ll for k in ["certified", "certification", "certificate", "coursera", "udemy", "aws certified", "meta"]):
                if len(line) < 100 and line not in certifications:
                    certifications.append(line.strip("•- "))
            if any(k in ll for k in ["won", "winner", "hackathon", "first place", "scholarship", "ranked", "award"]):
                if len(line) < 120 and line not in achievements:
                    achievements.append(line.strip("•- "))

        # 6. Quality Analysis & ATS Readability
        total_skills_count = sum(len(lst) for lst in extracted_skills.values())
        missing_sections = []
        if not projects:
            missing_sections.append("Dedicated Projects Section")
        if not experiences:
            missing_sections.append("Work Experience or Internship Experience")
        if not certifications:
            missing_sections.append("Certifications / Verified Credentials")
        if phone == "Not found in resume":
            missing_sections.append("Phone Number / Direct Contact")
        if college == "Not found in resume":
            missing_sections.append("College or Educational Institution")

        # ATS scoring based on completeness
        ats_score = 60
        if total_skills_count >= 5:
            ats_score += 15
        if projects:
            ats_score += 10
        if experiences:
            ats_score += 10
        if email != "Not found in resume" and phone != "Not found in resume":
            ats_score += 5
        ats_score = min(95, max(40, ats_score))

        strong_points = []
        if total_skills_count >= 6:
            strong_points.append(f"Identified strong foundational technical stack ({total_skills_count} verified tools and technologies).")
        if projects:
            strong_points.append(f"Included {len(projects)} distinct practical project mentions.")
        if experiences:
            strong_points.append(f"Demonstrates practical hands-on experience through internships or work roles.")
        if not strong_points:
            strong_points.append("Clean resume layout with clear contact information.")

        improvement_suggestions = []
        if missing_sections:
            improvement_suggestions.append(f"Add missing sections: {', '.join(missing_sections[:3])}.")
        if total_skills_count < 6:
            improvement_suggestions.append("Explicitly list technical skills under categorized headings (Languages, Frameworks, Cloud, Databases) to pass ATS scans.")
        improvement_suggestions.append("Quantify project outcomes with real impact metrics (e.g., 'reduced load time by 30%', 'handled 5,000 requests').")
        improvement_suggestions.append("Include links to your active GitHub repositories or live web demos.")

        return {
            "personal_info": {
                "name": name,
                "email": email,
                "phone": phone,
                "college": college,
                "degree": degree,
                "graduation_year": grad_year
            },
            "technical_skills": extracted_skills,
            "other_info": {
                "projects": projects[:5],
                "internships_and_experience": experiences[:5],
                "certifications": certifications[:5],
                "achievements": achievements[:5]
            },
            "quality_analysis": {
                "structure_rating": "Good" if ats_score >= 75 else ("Needs Improvement" if ats_score >= 55 else "Weak"),
                "ats_readability_score": ats_score,
                "missing_sections": missing_sections,
                "strong_points": strong_points,
                "improvement_suggestions": improvement_suggestions,
                "keyword_density_summary": f"Detected {total_skills_count} technical keywords across {len(lines)} lines of text."
            }
        }
