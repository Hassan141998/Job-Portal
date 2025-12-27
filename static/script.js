// Global Variables
let currentUser = null;
let currentStep = 1;
let currentInterview = null;
let currentQuestionIndex = 0;
let interviewAnswers = [];
let skills = [];
let experiences = [];
let educations = [];

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Load jobs when jobs section is shown
    if (sectionId === 'jobs') {
        loadJobs();
    }
}

// Auth Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        const data = await response.json();

        if (data.success) {
            currentUser = {email, user_type: data.user_type};
            document.getElementById('authLink').textContent = 'Logout';
            document.getElementById('authLink').onclick = logout;

            if (data.user_type === 'recruiter') {
                document.getElementById('post-job-btn').style.display = 'block';
            }

            alert('Login successful!');
            showSection('home');
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
}

async function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const user_type = document.getElementById('reg-usertype').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password, user_type})
        });

        const data = await response.json();

        if (data.success) {
            currentUser = {email, user_type: data.user_type};
            document.getElementById('authLink').textContent = 'Logout';
            document.getElementById('authLink').onclick = logout;

            if (data.user_type === 'recruiter') {
                document.getElementById('post-job-btn').style.display = 'block';
            }

            alert('Registration successful!');
            showSection('home');
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (error) {
        alert('Registration error: ' + error.message);
    }
}

function logout() {
    currentUser = null;
    document.getElementById('authLink').textContent = 'Login';
    document.getElementById('authLink').onclick = () => showSection('auth');
    document.getElementById('post-job-btn').style.display = 'none';
    showSection('home');
}

// Resume Analyzer
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload-resume', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            displayAnalysis(data.analysis);
        } else {
            alert('Upload failed: ' + data.error);
        }
    } catch (error) {
        alert('Upload error: ' + error.message);
    }
}

function displayAnalysis(analysis) {
    document.getElementById('analysis-results').style.display = 'block';
    document.getElementById('ats-score').textContent = analysis.ats_score;
    document.getElementById('overall-score').textContent = analysis.overall_score;

    // Keywords
    const keywordsList = document.getElementById('keywords-list');
    keywordsList.innerHTML = '';
    analysis.keywords.forEach(keyword => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = keyword;
        keywordsList.appendChild(tag);
    });

    // Missing Sections
    const missingList = document.getElementById('missing-sections');
    missingList.innerHTML = '';
    if (analysis.missing_sections.length === 0) {
        missingList.innerHTML = '<div class="list-item">All sections present ✓</div>';
    } else {
        analysis.missing_sections.forEach(section => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.textContent = section;
            missingList.appendChild(item);
        });
    }

    // Suggestions
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    analysis.suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.textContent = suggestion;
        suggestionsList.appendChild(item);
    });

    // Strengths
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';
    analysis.strengths.forEach(strength => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.textContent = strength;
        strengthsList.appendChild(item);
    });

    // Improvements
    const improvementsList = document.getElementById('improvements-list');
    improvementsList.innerHTML = '';
    analysis.improvements.forEach(improvement => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.textContent = improvement;
        improvementsList.appendChild(item);
    });
}

// Resume Builder
function nextStep() {
    if (currentStep < 4) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updatePreview();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updatePreview();
    }
}

function addSkill() {
    const skillInput = document.getElementById('skill-input');
    const skill = skillInput.value.trim();

    if (skill) {
        skills.push(skill);
        skillInput.value = '';
        updateSkillsList();
        updatePreview();
    }
}

function updateSkillsList() {
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';

    skills.forEach((skill, index) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = skill;
        tag.onclick = () => {
            skills.splice(index, 1);
            updateSkillsList();
            updatePreview();
        };
        skillsList.appendChild(tag);
    });
}

function addExperience() {
    const expDiv = document.createElement('div');
    expDiv.className = 'experience-item';
    expDiv.innerHTML = `
        <input type="text" placeholder="Job Title" class="exp-title">
        <input type="text" placeholder="Company" class="exp-company">
        <input type="text" placeholder="Duration (e.g., 2020-2023)" class="exp-duration">
        <textarea placeholder="Job Description" class="exp-description"></textarea>
        <button onclick="this.parentElement.remove(); updatePreview();" class="btn-secondary">Remove</button>
    `;
    document.getElementById('experience-list').appendChild(expDiv);
}

function addEducation() {
    const eduDiv = document.createElement('div');
    eduDiv.className = 'education-item';
    eduDiv.innerHTML = `
        <input type="text" placeholder="Degree" class="edu-degree">
        <input type="text" placeholder="Institution" class="edu-institution">
        <input type="text" placeholder="Year" class="edu-year">
        <button onclick="this.parentElement.remove(); updatePreview();" class="btn-secondary">Remove</button>
    `;
    document.getElementById('education-list').appendChild(eduDiv);
}

function generateSummary() {
    const name = document.getElementById('builder-name').value;
    const summaries = [
        `Experienced professional with expertise in delivering high-quality results and driving innovation.`,
        `Results-driven individual with a proven track record of success in dynamic environments.`,
        `Dedicated professional committed to excellence and continuous improvement.`,
        `Strategic thinker with strong analytical and problem-solving skills.`
    ];

    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
    document.getElementById('builder-summary').value = randomSummary;
    updatePreview();
}

function getSkillSuggestions() {
    const suggestions = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'Agile', 'Communication'];
    const newSkills = suggestions.filter(s => !skills.includes(s)).slice(0, 3);

    newSkills.forEach(skill => skills.push(skill));
    updateSkillsList();
    updatePreview();
    alert('Added suggested skills!');
}

function updatePreview() {
    const preview = document.getElementById('resume-preview');
    const name = document.getElementById('builder-name').value || 'Your Name';
    const email = document.getElementById('builder-email').value || 'email@example.com';
    const phone = document.getElementById('builder-phone').value || '(123) 456-7890';
    const location = document.getElementById('builder-location').value || 'City, State';
    const summary = document.getElementById('builder-summary').value || '';

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #6366f1;">${name}</h2>
            <p style="margin: 5px 0;">${email} | ${phone} | ${location}</p>
        </div>
    `;

    if (summary) {
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Professional Summary</h3>
                <p>${summary}</p>
            </div>
        `;
    }

    // Add experiences
    const experiences = document.querySelectorAll('.experience-item');
    if (experiences.length > 0) {
        html += `<div style="margin-bottom: 20px;">
            <h3 style="border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Work Experience</h3>`;

        experiences.forEach(exp => {
            const title = exp.querySelector('.exp-title').value;
            const company = exp.querySelector('.exp-company').value;
            const duration = exp.querySelector('.exp-duration').value;
            const description = exp.querySelector('.exp-description').value;

            if (title || company) {
                html += `
                    <div style="margin: 15px 0;">
                        <strong>${title}</strong> - ${company}<br>
                        <em>${duration}</em><br>
                        <p>${description}</p>
                    </div>
                `;
            }
        });

        html += `</div>`;
    }

    // Add education
    const educations = document.querySelectorAll('.education-item');
    if (educations.length > 0) {
        html += `<div style="margin-bottom: 20px;">
            <h3 style="border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Education</h3>`;

        educations.forEach(edu => {
            const degree = edu.querySelector('.edu-degree').value;
            const institution = edu.querySelector('.edu-institution').value;
            const year = edu.querySelector('.edu-year').value;

            if (degree || institution) {
                html += `
                    <div style="margin: 10px 0;">
                        <strong>${degree}</strong><br>
                        ${institution} - ${year}
                    </div>
                `;
            }
        });

        html += `</div>`;
    }

    // Add skills
    if (skills.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Skills</h3>
                <p>${skills.join(' • ')}</p>
            </div>
        `;
    }

    preview.innerHTML = html;
}

function exportResume() {
    const preview = document.getElementById('resume-preview');
    const content = preview.innerHTML;

    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Resume</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `], {type: 'text/html'});

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.html';
    a.click();
    URL.revokeObjectURL(url);

    alert('Resume exported! You can open the HTML file in a browser and print to PDF.');
}
// Jobs Functions
async function loadJobs() {
    try {
        const response = await fetch('/get-jobs');
        const jobs = await response.json();

        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function displayJobs(jobs) {
    const jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = '';

    if (jobs.length === 0) {
        jobsList.innerHTML = '<p style="text-align: center; color: #64748b;">No jobs available. Be the first to post!</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
            </div>
            <p>${job.description.substring(0, 150)}...</p>
            <div class="job-details">
                <span class="job-badge">📍 ${job.location}</span>
                <span class="job-badge">💼 ${job.type}</span>
                <span class="job-badge">💰 ${job.salary || 'Competitive'}</span>
            </div>
            <button onclick="applyToJob('${job.id}')" class="btn-primary" style="margin-top: 1rem; width: 100%;">Apply Now</button>
        `;
        jobsList.appendChild(jobCard);
    });
}

function filterJobs() {
    const searchTerm = document.getElementById('search-jobs').value.toLowerCase();
    const locationFilter = document.getElementById('filter-location').value;
    const typeFilter = document.getElementById('filter-type').value;

    const jobCards = document.querySelectorAll('.job-card');

    jobCards.forEach(card => {
        const title = card.querySelector('.job-title').textContent.toLowerCase();
        const company = card.querySelector('.job-company').textContent.toLowerCase();
        const badges = Array.from(card.querySelectorAll('.job-badge')).map(b => b.textContent.toLowerCase());

        const matchesSearch = title.includes(searchTerm) || company.includes(searchTerm);
        const matchesLocation = !locationFilter || badges.some(b => b.includes(locationFilter));
        const matchesType = !typeFilter || badges.some(b => b.includes(typeFilter));

        if (matchesSearch && matchesLocation && matchesType) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function postJob() {
    const title = document.getElementById('job-title').value;
    const company = document.getElementById('job-company').value;
    const location = document.getElementById('job-location').value;
    const type = document.getElementById('job-type').value;
    const salary = document.getElementById('job-salary').value;
    const description = document.getElementById('job-description').value;
    const requirements = document.getElementById('job-requirements').value.split('\n').filter(r => r.trim());

    if (!title || !company || !description) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch('/post-job', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, company, location, type, salary, description, requirements})
        });

        const data = await response.json();

        if (data.success) {
            alert('Job posted successfully!');

            // Clear form
            document.getElementById('job-title').value = '';
            document.getElementById('job-company').value = '';
            document.getElementById('job-location').value = '';
            document.getElementById('job-salary').value = '';
            document.getElementById('job-description').value = '';
            document.getElementById('job-requirements').value = '';

            showSection('jobs');
        } else {
            alert('Failed to post job: ' + data.error);
        }
    } catch (error) {
        alert('Error posting job: ' + error.message);
    }
}

async function applyToJob(jobId) {
    if (!currentUser) {
        alert('Please login to apply for jobs');
        showSection('auth');
        return;
    }

    try {
        const response = await fetch('/apply-job', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({job_id: jobId, resume_id: 'default'})
        });

        const data = await response.json();

        if (data.success) {
            alert('Application submitted successfully!');
        } else {
            alert('Failed to apply: ' + data.error);
        }
    } catch (error) {
        alert('Error applying to job: ' + error.message);
    }
}

// Mock Interview Functions
async function startInterview() {
    const type = document.getElementById('interview-type').value;
    const level = document.getElementById('interview-level').value;

    try {
        const response = await fetch('/mock-interview', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({type, level})
        });

        const data = await response.json();

        if (data.success) {
            currentInterview = data;
            currentQuestionIndex = 0;
            interviewAnswers = [];

            document.getElementById('interview-setup').style.display = 'none';
            document.getElementById('interview-session').style.display = 'block';

            showCurrentQuestion();
        } else {
            alert('Failed to start interview: ' + data.error);
        }
    } catch (error) {
        alert('Error starting interview: ' + error.message);
    }
}

function showCurrentQuestion() {
    const questions = currentInterview.questions;
    const questionNum = document.getElementById('question-number');
    const questionText = document.getElementById('current-question');

    questionNum.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionText.textContent = questions[currentQuestionIndex];

    document.getElementById('interview-answer').value = '';
}

function nextQuestion() {
    const answer = document.getElementById('interview-answer').value.trim();

    if (!answer) {
        alert('Please provide an answer before proceeding');
        return;
    }

    // Save answer
    interviewAnswers.push({
        question: currentInterview.questions[currentQuestionIndex],
        answer: answer
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < currentInterview.questions.length) {
        showCurrentQuestion();
    } else {
        // Interview completed
        submitInterview();
    }
}

async function submitInterview() {
    try {
        const response = await fetch('/submit-interview', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                interview_id: currentInterview.interview_id,
                answers: interviewAnswers
            })
        });

        const data = await response.json();

        if (data.success) {
            displayInterviewResults(data.analysis);
        } else {
            alert('Failed to submit interview: ' + data.error);
        }
    } catch (error) {
        alert('Error submitting interview: ' + error.message);
    }
}

function displayInterviewResults(analysis) {
    document.getElementById('interview-session').style.display = 'none';
    document.getElementById('interview-results').style.display = 'block';

    document.getElementById('interview-overall-score').textContent = analysis.overall_score;
    document.getElementById('interview-communication-score').textContent = analysis.communication_score;
    document.getElementById('interview-technical-score').textContent = analysis.technical_score;
    document.getElementById('interview-confidence-score').textContent = analysis.confidence_score;

    // Strengths
    const strengthsList = document.getElementById('interview-strengths');
    strengthsList.innerHTML = '';
    if (analysis.strengths.length === 0) {
        strengthsList.innerHTML = '<div class="list-item">Keep practicing to identify your strengths!</div>';
    } else {
        analysis.strengths.forEach(strength => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.textContent = strength;
            strengthsList.appendChild(item);
        });
    }

    // Improvements
    const improvementsList = document.getElementById('interview-improvements');
    improvementsList.innerHTML = '';
    if (analysis.improvements.length === 0) {
        improvementsList.innerHTML = '<div class="list-item">Great job! Keep up the good work!</div>';
    } else {
        analysis.improvements.forEach(improvement => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.textContent = improvement;
            improvementsList.appendChild(item);
        });
    }
}

function restartInterview() {
    document.getElementById('interview-results').style.display = 'none';
    document.getElementById('interview-setup').style.display = 'block';

    currentInterview = null;
    currentQuestionIndex = 0;
    interviewAnswers = [];
}

// Cover Letter Generator
function generateCoverLetter() {
    const jobTitle = prompt('Enter the job title:');
    const companyName = prompt('Enter the company name:');

    if (!jobTitle || !companyName) {
        alert('Please provide both job title and company name');
        return;
    }

    const coverLetter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background and experience, I am confident in my ability to contribute effectively to your team.

Throughout my career, I have developed a strong foundation in relevant skills and have consistently demonstrated my ability to deliver results. I am particularly drawn to ${companyName} because of its reputation for innovation and excellence in the industry.

I am excited about the opportunity to bring my unique blend of skills and experience to your organization. I am confident that my passion for excellence and my commitment to continuous learning make me an ideal candidate for this position.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to ${companyName}'s continued success.

Sincerely,
[Your Name]
    `;

    // Create a download
    const blob = new Blob([coverLetter], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${companyName}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Cover letter generated and downloaded!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    document.getElementById('skill-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    // Load initial data
    loadJobs();
});