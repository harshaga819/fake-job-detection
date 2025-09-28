document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const analyzeBtn = document.getElementById('analyze-btn');
    const jobTextarea = document.getElementById('job-description');
    const analysisResults = document.getElementById('analysis-results');
    const resultStatus = document.getElementById('result-status');
    const resultTitle = document.getElementById('result-title');
    const riskFactorsSection = document.getElementById('risk-factors');
    const positiveIndicatorsSection = document.getElementById('positive-indicators');
    const riskBadges = document.getElementById('risk-badges');
    const positiveBadges = document.getElementById('positive-badges');
    const buttonText = analyzeBtn.querySelector('.button-text');
    const buttonIcon = analyzeBtn.querySelector('.button-icon');

    // State management
    let isAnalyzing = false;

    // Initialize event listeners
    initializeEventListeners();

    function initializeEventListeners() {
        // Analyze button click handler
        analyzeBtn.addEventListener('click', handleAnalyzeClick);

        // Textarea input handler for button state
        jobTextarea.addEventListener('input', handleTextareaInput);

        // Animate progress bars on scroll
        window.addEventListener('scroll', animateProgressBars);

        // Initial check for button state
        updateButtonState();
    }

    function handleTextareaInput() {
        updateButtonState();
    }

    function updateButtonState() {
        const hasText = jobTextarea.value.trim().length > 0;
        analyzeBtn.disabled = !hasText || isAnalyzing;

        if (!hasText) {
            analyzeBtn.style.opacity = '0.6';
        } else {
            analyzeBtn.style.opacity = '1';
        }
    }

    async function handleAnalyzeClick() {
        const jobDescription = jobTextarea.value.trim();

        if (!jobDescription || isAnalyzing) {
            return;
        }

        setAnalyzingState(true);

        try {
            // Simulate analysis delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Perform analysis
            const analysisResult = await analyzeJobPosting(jobDescription);

            // Display results
            displayAnalysisResults(analysisResult);

        } catch (error) {
            console.error('Analysis error:', error);
            showError('An error occurred during analysis. Please try again.');
        } finally {
            setAnalyzingState(false);
        }
    }

    async function setAnalyzingState(analyzing) {
        isAnalyzing = analyzing;

        if (analyzing) {
            buttonText.textContent = 'Analyzing Job Posting...';
            buttonIcon.innerHTML = `<circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>`;
            buttonIcon.classList.add('analyzing');
            analyzeBtn.classList.add('analyzing');
            analyzeBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        } else {
            buttonText.textContent = 'Analyze Job Posting';
            buttonIcon.innerHTML = `
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            `;
            buttonIcon.classList.remove('analyzing');
            analyzeBtn.classList.remove('analyzing');
            analyzeBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb, #059669)';
        }

        updateButtonState();
    }

    async function analyzeJobPosting(text) {
        const formData = new FormData();
        formData.append("job_description", text);

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            return {
                isGenuine: data.isGenuine,
                riskFactors: data.isGenuine ? [] : ["Detected as Potential Scam by ML model"],
                genuineIndicators: data.isGenuine ? ["Verified Genuine by ML model"] : []
            };

        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    function displayAnalysisResults(result) {
        // Show results container
        analysisResults.classList.remove('hidden');

        // Update result status
        if (result.isGenuine) {
            resultStatus.className = 'result-status genuine';
            resultTitle.textContent = 'Likely Genuine';
            resultStatus.querySelector('.result-icon').innerHTML = `
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            `;
        } else {
            resultStatus.className = 'result-status scam';
            resultTitle.textContent = 'Potential Scam';
            resultStatus.querySelector('.result-icon').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            `;
        }


        // Handle risk factors
        if (result.riskFactors.length > 0) {
            riskFactorsSection.classList.remove('hidden');
            riskBadges.innerHTML = '';
            result.riskFactors.forEach(factor => {
                const badge = createBadge(factor, 'danger');
                riskBadges.appendChild(badge);
            });
        } else {
            riskFactorsSection.classList.add('hidden');
        }

        // Handle positive indicators
        if (result.genuineIndicators.length > 0) {
            positiveIndicatorsSection.classList.remove('hidden');
            positiveBadges.innerHTML = '';
            result.genuineIndicators.forEach(indicator => {
                const badge = createBadge(indicator, 'success');
                positiveBadges.appendChild(badge);
            });
        } else {
            positiveIndicatorsSection.classList.add('hidden');
        }

        // Smooth scroll to results
        setTimeout(() => {
            analysisResults.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    function createBadge(text, type) {
        const badge = document.createElement('span');
        badge.className = `badge ${type}`;
        badge.textContent = text;
        return badge;
    }

    function showError(message) {
        // Simple error display
        alert(message);
    }

    // Animate progress bars when they come into view
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');

        progressBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible && !bar.classList.contains('animated')) {
                bar.classList.add('animated');
                // Trigger animation by setting width
                const targetWidth = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 100);
            }
        });
    }

    // Add fade-in animation for cards on scroll
    function addScrollAnimations() {
        const cards = document.querySelectorAll('.red-flag-card, .stat-card, .protection-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Initialize scroll animations
    addScrollAnimations();
});