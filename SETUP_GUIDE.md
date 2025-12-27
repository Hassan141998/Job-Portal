# AI-Powered Job Portal - Complete Setup Guide

## 📁 Project Structure

```
job-portal/
│
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
│
├── templates/
│   └── index.html             # Main HTML file
│
├── static/
│   ├── style.css              # Complete styling
│   └── script.js              # Frontend logic (combine Part 1 & 2)
│
├── uploads/                   # For resume uploads (auto-created)
└── data/                      # For data storage (auto-created)
```

## 🚀 Installation Steps

### Step 1: Prerequisites
Make sure you have Python 3.8+ installed on your system.

```bash
python --version
```

### Step 2: Create Project Directory

```bash
mkdir job-portal
cd job-portal
```

### Step 3: Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Create Project Files

Create the following directory structure:

```bash
mkdir templates
mkdir static
```

### Step 5: Create Files

1. **Create app.py** - Copy the content from "app.py - Main Flask Application"

2. **Create requirements.txt** - Copy the content from "requirements.txt"

3. **Create templates/index.html** - Copy the content from "templates/index.html"

4. **Create static/style.css** - Copy the content from "static/style.css"

5. **Create static/script.js** - Combine both Part 1 and Part 2 of the JavaScript code into a single file

### Step 6: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 7: Run the Application

```bash
python app.py
```

The application will start at: **http://localhost:5000**

## 🎯 Features Included

### ✅ Core Modules

1. **AI Resume Analyzer**
   - Upload PDF/DOCX resumes
   - Get ATS compatibility score
   - Keyword analysis
   - Missing sections detection
   - Improvement suggestions

2. **AI Resume Builder**
   - Step-by-step guided creation
   - AI-generated professional summaries
   - Multiple sections (Experience, Education, Skills)
   - Real-time preview
   - Export to HTML (can be printed to PDF)

3. **Job Portal**
   - Dual interface (Job Seeker & Recruiter)
   - Post jobs (Recruiters)
   - Browse and search jobs
   - Apply to jobs
   - Filter by location, type
   - Job recommendations

4. **AI Mock Interview**
   - Multiple interview types (Technical, Behavioral, HR)
   - Difficulty levels (Entry, Mid, Senior)
   - AI-powered questions
   - Performance analysis
   - Detailed feedback and scoring

5. **Additional Features**
   - User authentication (Login/Register)
   - Cover letter generator
   - Skill suggestions
   - Job filters and search

## 🔧 How to Use

### For Job Seekers:

1. **Register** - Click "Login" → "Register" → Select "Job Seeker"
2. **Analyze Resume** - Go to "Resume Analyzer" and upload your resume
3. **Build Resume** - Use "Resume Builder" to create a new resume
4. **Browse Jobs** - Search and apply for jobs in "Jobs" section
5. **Practice Interview** - Use "Mock Interview" to prepare

### For Recruiters:

1. **Register** - Click "Login" → "Register" → Select "Recruiter"
2. **Post Jobs** - Use the floating "+" button in Jobs section
3. **Manage Applications** - View applications for your posted jobs

## 📝 Important Notes

### File Combination:
The JavaScript code is split into two parts (Part 1 and Part 2). **You must combine them into a single `script.js` file**:

1. Copy all code from Part 1
2. Append all code from Part 2
3. Save as `static/script.js`

### Data Storage:
This version uses **in-memory storage** (dictionaries). In production:
- Replace with a database (SQLite, PostgreSQL, MongoDB)
- Use SQLAlchemy or similar ORM
- Implement proper session management

### File Uploads:
- Resumes are stored in `uploads/` folder
- Supported formats: PDF, DOCX, DOC

### Security Considerations:
- Change the `app.secret_key` in app.py
- Use environment variables for sensitive data
- Implement CSRF protection
- Add input validation
- Use HTTPS in production

## 🐛 Troubleshooting

### Issue: Module not found
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Port already in use
Change the port in app.py:
```python
app.run(debug=True, port=5001)  # Use different port
```

### Issue: File upload fails
Check if `uploads/` directory exists and has write permissions.

### Issue: Templates not found
Ensure `templates/` folder is in the same directory as `app.py`

## 🔄 Database Migration (Production)

For production use, replace in-memory storage with a database:

```python
# Example with SQLite
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobportal.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    # ... other fields
```

## 📦 Deployment

### Heroku:
1. Create `Procfile`: `web: gunicorn app:app`
2. Add `gunicorn` to requirements.txt
3. Deploy: `git push heroku main`

### Docker:
Create `Dockerfile`:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 🎨 Customization

### Change Colors:
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #6366f1;  /* Change to your color */
    --secondary-color: #8b5cf6;
}
```

### Add More Features:
- Extend the AI analysis algorithms
- Add email notifications
- Implement video interviews
- Add chat functionality
- Create admin dashboard

## 📞 Support

If you encounter issues:
1. Check all files are in correct locations
2. Verify Python version (3.8+)
3. Ensure all dependencies are installed
4. Check browser console for JavaScript errors
5. Review Flask console for Python errors

## 🎉 Success!

If everything is set up correctly, you should see:
- A beautiful landing page at http://localhost:5000
- Working navigation between sections
- Functional login/register
- Resume upload and analysis
- Job posting and browsing
- Mock interview system

Enjoy your AI-Powered Job Portal! 🚀