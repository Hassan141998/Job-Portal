from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import uuid
import PyPDF2
import docx
import re

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

# In-memory databases (replace with actual DB in production)
users_db = {}
jobs_db = {}
applications_db = {}
resumes_db = {}
interviews_db = {}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text


def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return '\n'.join([paragraph.text for paragraph in doc.paragraphs])


def analyze_resume(text):
    """AI-powered resume analysis"""
    analysis = {
        'ats_score': 0,
        'keywords': [],
        'suggestions': [],
        'missing_sections': [],
        'overall_score': 0,
        'strengths': [],
        'improvements': []
    }

    # Basic keyword extraction
    keywords = ['python', 'java', 'javascript', 'react', 'sql', 'aws', 'docker',
                'leadership', 'management', 'communication', 'agile']
    found_keywords = [k for k in keywords if k.lower() in text.lower()]
    analysis['keywords'] = found_keywords

    # Check for essential sections
    sections = ['experience', 'education', 'skills', 'summary', 'contact']
    for section in sections:
        if section.lower() not in text.lower():
            analysis['missing_sections'].append(section.capitalize())

    # Calculate scores
    keyword_score = min((len(found_keywords) / len(keywords)) * 100, 100)
    section_score = ((5 - len(analysis['missing_sections'])) / 5) * 100

    # Length check
    word_count = len(text.split())
    length_score = 100 if 300 <= word_count <= 600 else 70

    analysis['ats_score'] = int((keyword_score + section_score) / 2)
    analysis['overall_score'] = int((keyword_score + section_score + length_score) / 3)

    # Generate suggestions
    if len(found_keywords) < 5:
        analysis['suggestions'].append('Add more industry-relevant keywords')
    if word_count < 300:
        analysis['suggestions'].append('Expand your resume with more details')
    if 'summary' not in text.lower():
        analysis['suggestions'].append('Add a professional summary section')

    # Strengths and improvements
    if len(found_keywords) > 5:
        analysis['strengths'].append('Good keyword optimization')
    if len(analysis['missing_sections']) == 0:
        analysis['strengths'].append('All essential sections present')

    for section in analysis['missing_sections']:
        analysis['improvements'].append(f'Add {section} section')

    return analysis


# Routes
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user_type = data.get('user_type', 'jobseeker')
    email = data.get('email')

    if email in users_db:
        return jsonify({'error': 'User already exists'}), 400

    user_id = str(uuid.uuid4())
    users_db[email] = {
        'id': user_id,
        'email': email,
        'password': generate_password_hash(data.get('password')),
        'user_type': user_type,
        'name': data.get('name'),
        'created_at': datetime.now().isoformat()
    }

    session['user_id'] = user_id
    session['user_type'] = user_type

    return jsonify({'success': True, 'user_id': user_id, 'user_type': user_type})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = users_db.get(email)
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        session['user_type'] = user['user_type']
        return jsonify({'success': True, 'user_type': user['user_type']})

    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400

    filename = secure_filename(file.filename)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
    file.save(file_path)

    # Extract text
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    else:
        text = extract_text_from_docx(file_path)

    # Analyze resume
    analysis = analyze_resume(text)

    resume_data = {
        'id': file_id,
        'filename': filename,
        'text': text,
        'analysis': analysis,
        'uploaded_at': datetime.now().isoformat()
    }

    resumes_db[file_id] = resume_data

    return jsonify({
        'success': True,
        'resume_id': file_id,
        'analysis': analysis
    })


@app.route('/post-job', methods=['POST'])
def post_job():
    data = request.json
    job_id = str(uuid.uuid4())

    jobs_db[job_id] = {
        'id': job_id,
        'title': data.get('title'),
        'company': data.get('company'),
        'location': data.get('location'),
        'type': data.get('type', 'Full-time'),
        'salary': data.get('salary'),
        'description': data.get('description'),
        'requirements': data.get('requirements', []),
        'posted_by': session.get('user_id'),
        'posted_at': datetime.now().isoformat(),
        'applications': []
    }

    return jsonify({'success': True, 'job_id': job_id})


@app.route('/get-jobs', methods=['GET'])
def get_jobs():
    return jsonify(list(jobs_db.values()))


@app.route('/apply-job', methods=['POST'])
def apply_job():
    data = request.json
    application_id = str(uuid.uuid4())

    applications_db[application_id] = {
        'id': application_id,
        'job_id': data.get('job_id'),
        'user_id': session.get('user_id'),
        'resume_id': data.get('resume_id'),
        'status': 'applied',
        'applied_at': datetime.now().isoformat()
    }

    # Add to job applications
    if data.get('job_id') in jobs_db:
        jobs_db[data.get('job_id')]['applications'].append(application_id)

    return jsonify({'success': True, 'application_id': application_id})


@app.route('/mock-interview', methods=['POST'])
def mock_interview():
    data = request.json
    interview_type = data.get('type', 'technical')
    level = data.get('level', 'mid')

    # Generate questions based on type and level
    questions = generate_interview_questions(interview_type, level)

    interview_id = str(uuid.uuid4())
    interviews_db[interview_id] = {
        'id': interview_id,
        'type': interview_type,
        'level': level,
        'questions': questions,
        'answers': [],
        'started_at': datetime.now().isoformat()
    }

    return jsonify({
        'success': True,
        'interview_id': interview_id,
        'questions': questions
    })


@app.route('/submit-interview', methods=['POST'])
def submit_interview():
    data = request.json
    interview_id = data.get('interview_id')
    answers = data.get('answers', [])

    if interview_id not in interviews_db:
        return jsonify({'error': 'Interview not found'}), 404

    # Analyze answers
    analysis = analyze_interview_answers(answers)

    interviews_db[interview_id]['answers'] = answers
    interviews_db[interview_id]['analysis'] = analysis
    interviews_db[interview_id]['completed_at'] = datetime.now().isoformat()

    return jsonify({
        'success': True,
        'analysis': analysis
    })


def generate_interview_questions(interview_type, level):
    questions_db = {
        'technical': {
            'entry': [
                'Explain the difference between var, let, and const in JavaScript.',
                'What is the box model in CSS?',
                'Describe the concept of Object-Oriented Programming.'
            ],
            'mid': [
                'How would you optimize a slow database query?',
                'Explain the concept of closures in JavaScript.',
                'What are design patterns? Give examples.'
            ],
            'senior': [
                'Design a scalable microservices architecture.',
                'How would you handle system failure in a distributed system?',
                'Explain your approach to technical leadership.'
            ]
        },
        'behavioral': {
            'entry': [
                'Tell me about a time you worked in a team.',
                'Describe a challenging project you completed.',
                'How do you handle constructive criticism?'
            ],
            'mid': [
                'Tell me about a time you had to meet a tight deadline.',
                'Describe a situation where you had to resolve a conflict.',
                'How do you prioritize multiple tasks?'
            ],
            'senior': [
                'Describe your leadership style.',
                'Tell me about a time you mentored someone.',
                'How do you handle underperforming team members?'
            ]
        }
    }

    return questions_db.get(interview_type, {}).get(level, [])


def analyze_interview_answers(answers):
    analysis = {
        'overall_score': 0,
        'communication_score': 0,
        'technical_score': 0,
        'confidence_score': 0,
        'feedback': [],
        'strengths': [],
        'improvements': []
    }

    total_score = 0
    for answer in answers:
        answer_text = answer.get('answer', '')
        word_count = len(answer_text.split())

        # Score based on answer length and quality
        if word_count > 50:
            score = 85
        elif word_count > 30:
            score = 70
        else:
            score = 50

        total_score += score

    if answers:
        analysis['overall_score'] = int(total_score / len(answers))
        analysis['communication_score'] = min(analysis['overall_score'] + 5, 100)
        analysis['technical_score'] = analysis['overall_score']
        analysis['confidence_score'] = min(analysis['overall_score'] + 3, 100)

    # Generate feedback
    if analysis['overall_score'] > 80:
        analysis['strengths'].append('Excellent detailed responses')
    if analysis['overall_score'] < 70:
        analysis['improvements'].append('Provide more detailed answers')

    return analysis


if __name__ == '__main__':
    app.run(debug=True, port=5000)