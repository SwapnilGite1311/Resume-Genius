from flask import Flask, jsonify, request
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "in", "is", "it", "of", "on", "or", "that", "the", "to", "with", "you", "your",
    "will", "this", "we", "our", "their", "they", "using", "used", "into", "over",
    "under", "within", "across", "more", "less", "than", "can", "should", "must",
    "years", "year", "experience", "role", "team", "work", "working", "skills",
}

ACTION_VERBS = {
    "built", "led", "designed", "launched", "improved", "optimized", "reduced",
    "increased", "developed", "implemented", "managed", "delivered", "created",
    "automated", "analyzed", "scaled", "streamlined", "migrated",
}

SECTION_HINTS = {
    "summary": ["summary", "profile", "about"],
    "experience": ["experience", "employment", "work history"],
    "skills": ["skills", "technical skills", "core competencies"],
    "projects": ["projects", "project experience"],
    "education": ["education", "academic"],
}

SKILL_PATTERNS = {
    "React": [r"\breact\b", r"\breactjs\b", r"\breact\.js\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b"],
    "TypeScript": [r"\btypescript\b", r"\bts\b"],
    "Python": [r"\bpython\b"],
    "Node.js": [r"\bnode\b", r"\bnodejs\b", r"\bnode\.js\b"],
    "Express": [r"\bexpress\b", r"\bexpressjs\b"],
    "MongoDB": [r"\bmongodb\b", r"\bmongo\b"],
    "SQL": [r"\bsql\b", r"\bpostgresql\b", r"\bmysql\b"],
    "REST APIs": [r"\brest api\b", r"\brestful\b", r"\bapi development\b"],
    "GraphQL": [r"\bgraphql\b"],
    "AWS": [r"\baws\b", r"\bamazon web services\b"],
    "Docker": [r"\bdocker\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "Git": [r"\bgit\b", r"\bgithub\b", r"\bgitlab\b"],
    "CI/CD": [r"\bci/cd\b", r"\bci cd\b", r"\bcontinuous integration\b"],
    "Machine Learning": [r"\bmachine learning\b", r"\bml\b"],
    "Data Analysis": [r"\bdata analysis\b", r"\banalytics\b", r"\bpandas\b"],
}


def tokenize(text: str):
    return set(re.findall(r"\b\w+\b", text.lower()))


def extract_keywords(text: str):
    words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9.+#-]{2,}\b", text.lower())
    return {
        word
        for word in words
        if word not in STOPWORDS and not word.isdigit()
    }


def extract_skill_matches(text: str):
    lowered = text.lower()
    matches = []
    for skill, patterns in SKILL_PATTERNS.items():
        if any(re.search(pattern, lowered) for pattern in patterns):
            matches.append(skill)
    return matches


def detect_sections(text: str):
    lowered = text.lower()
    found = []
    for section, hints in SECTION_HINTS.items():
        if any(hint in lowered for hint in hints):
            found.append(section)
    return found


def quantified_impact_count(text: str):
    return len(re.findall(r"\b\d+(?:\.\d+)?%?\b|\$\d+|\b\d+\+\b", text))


def action_verb_count(text: str):
    words = re.findall(r"\b[a-z]+\b", text.lower())
    return sum(1 for word in words if word in ACTION_VERBS)


@app.get("/health")
def health_check():
    return jsonify({"status": "healthy"})


@app.post("/score")
def score_resume():
    data = request.get_json(silent=True) or {}
    resume = data.get("resume", "")
    job_description = data.get("jobDescription", "")

    if not resume or not job_description:
        return jsonify({"message": "Resume and job description are required"}), 400

    resume_keywords = extract_keywords(resume)
    jd_keywords = extract_keywords(job_description)

    matched_keywords = jd_keywords.intersection(resume_keywords)
    missing_keywords = [keyword for keyword in sorted(jd_keywords - resume_keywords) if len(keyword) > 3][:8]

    jd_skills = extract_skill_matches(job_description)
    resume_skills = extract_skill_matches(resume)
    matched_skills = [skill for skill in jd_skills if skill in resume_skills]
    missing_skills = [skill for skill in jd_skills if skill not in resume_skills]

    section_hits = detect_sections(resume)
    impact_hits = quantified_impact_count(resume)
    verb_hits = action_verb_count(resume)

    keyword_coverage = (len(matched_keywords) / len(jd_keywords)) if jd_keywords else 0
    skill_coverage = (len(matched_skills) / len(jd_skills)) if jd_skills else keyword_coverage

    match_percentage = skill_coverage * 100 if jd_skills else keyword_coverage * 100

    keyword_score = min(20, keyword_coverage * 20)
    skill_score = min(55, skill_coverage * 55)
    structure_score = min(15, (len(section_hits) / len(SECTION_HINTS)) * 15)
    impact_score = min(10, impact_hits * 2)
    clarity_score = 10 if verb_hits >= 5 else max(2, verb_hits * 2)

    ats_score = min(98, round(keyword_score + skill_score + structure_score + impact_score + clarity_score))

    improvements = []
    if missing_skills:
        improvements.append("Add stronger evidence for these required skills: " + ", ".join(missing_skills[:5]))
    elif missing_keywords:
        improvements.append("Mirror more of the role language in your bullets, such as: " + ", ".join(missing_keywords[:5]))

    missing_sections = [section for section in SECTION_HINTS if section not in section_hits]
    if missing_sections:
        improvements.append("Your resume may be missing clear sections like: " + ", ".join(missing_sections[:3]))

    if impact_hits < 2:
        improvements.append("Add quantified results such as percentages, revenue, time saved, or scale handled.")

    if verb_hits < 4:
        improvements.append("Use stronger action verbs like built, led, improved, optimized, or delivered.")

    if len(resume.strip()) < 500:
        improvements.append("Resume looks short. Add more measurable impact and project detail.")

    highlights = []
    if matched_skills:
        highlights.append("Matched core skills: " + ", ".join(matched_skills[:5]))
    if section_hits:
        highlights.append("Detected resume structure: " + ", ".join(section_hits))
    if impact_hits:
        highlights.append(f"Found {impact_hits} quantified achievement signal(s).")

    summary = (
        f"Matched {len(matched_skills)} of {len(jd_skills)} target skills and "
        f"{len(matched_keywords)} role keywords. "
        f"Detected {len(section_hits)} key resume section(s)."
        if jd_skills
        else f"Matched {len(matched_keywords)} role keywords with {len(section_hits)} key section(s) detected."
    )

    return jsonify(
        {
            "atsScore": round(ats_score, 2),
            "matchPercentage": round(match_percentage, 2),
            "improvements": improvements,
            "highlights": highlights,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "summary": summary,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
