document.addEventListener('DOMContentLoaded', function () {
    const analyzeBtn = document.getElementById('analyze-btn');
    const jobTitle = document.getElementById('job-title');
    const companyName = document.getElementById('company-name');
    const jobTextarea = document.getElementById('job-description');
    const logoInput = document.getElementById('company-logo');

    const analysisResults = document.getElementById('analysis-results');
    const resultStatus = document.getElementById('result-status');
    const resultTitle = document.getElementById('result-title');
    const confidenceLabel = document.getElementById('confidence-label');

    const riskSection = document.getElementById('risk-factors');
    const posSection = document.getElementById('positive-indicators');

    const riskBadges = document.getElementById('risk-badges');
    const posBadges = document.getElementById('positive-badges');

    const btnText = analyzeBtn.querySelector('.button-text');

    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeNeedle = document.getElementById('gauge-needle');
    const gaugePercent = document.getElementById('gauge-percent');

    let isAnalyzing = false;

       //BUTTON ENABLE / DISABLE

    function updateButtonState() {
        const title = jobTitle.value.trim();
        const desc = jobTextarea.value.trim();
        analyzeBtn.disabled = !(title.length > 0 && desc.length > 0) || isAnalyzing;
    }
    jobTitle.addEventListener('input', updateButtonState);
    jobTextarea.addEventListener('input', updateButtonState);
    updateButtonState();

    /* ===============================
    SCROLL REVEAL ANIMATION
    ================================= */

    const revealElements = document.querySelectorAll(".reveal");

    function revealOnScroll() {
        const windowHeight = window.innerHeight;

        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;

            if (elementTop < windowHeight - 80) {
                el.classList.add("visible");
            }
        });
    }

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

       //ANALYZE BUTTON

    analyzeBtn.addEventListener('click', async () => {
        if (isAnalyzing) return;
        setAnalyzing(true);
        try {
            const result = await callPredict();
            showResults(result);
        } catch (e) {
            console.error(e);
            alert("Prediction failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    });

    function setAnalyzing(on) {
        isAnalyzing = on;
        btnText.textContent = on ? "Analyzing..." : "Analyze Job Posting";
        updateButtonState();
    }

       //CALL FLASK API

    async function callPredict() {
        const title = jobTitle.value.trim();
        const company = companyName.value.trim();
        const description = jobTextarea.value.trim();
        const logo = logoInput ? logoInput.value : 0;
        const res = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: description,
                has_logo: logo
            })
        });

        const data = await res.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        const fakeProbability = Math.round(data.probability * 100);

        return {
            isGenuine: data.prediction === 1,
            fakeProbability: fakeProbability,
            riskFactors: data.prediction === 1
                ? [
                    "AI model detected suspicious language patterns",
                    "Job posting resembles known scam patterns"
                ]
                : [],
            genuineIndicators: data.prediction === 0
                ? [
                    "AI model detected legitimate job characteristics",
                    "Language similar to verified job postings"
                ]
                : []
        };
    }

       //DISPLAY RESULTS

    function showResults(result) {
        analysisResults.classList.remove("hidden");
        animateGauge(result.fakeProbability);
        if (result.isGenuine) {
            resultStatus.className = "result-status scam";
            resultTitle.textContent = "Potential Scam";
            confidenceLabel.textContent = result.fakeProbability > 80
                ? "Confidence: Very High Risk"
                : "Confidence: High Risk";
        } else {
            resultStatus.className = "result-status genuine";
            resultTitle.textContent = "Likely Genuine";
            confidenceLabel.textContent = result.fakeProbability < 20
                ? "Confidence: Very High"
                : "Confidence: High";
        }

        riskSection.classList.toggle("hidden", result.riskFactors.length === 0);
        posSection.classList.toggle("hidden", result.genuineIndicators.length === 0);

        riskBadges.innerHTML = "";
        posBadges.innerHTML = "";
        result.riskFactors.forEach(text => {
            riskBadges.appendChild(createBadge(text, "danger"));
        });
        result.genuineIndicators.forEach(text => {
            posBadges.appendChild(createBadge(text, "success"));
        });
    }

       //GAUGE ANIMATION

    function animateGauge(percent) {
        const totalArc = 283;
        const fill = (percent / 100) * totalArc;
        gaugeFill.style.strokeDasharray = `${fill} ${totalArc - fill}`;
        const rotation = -90 + (percent / 100) * 180;
        gaugeNeedle.style.transformOrigin = "100px 110px";
        gaugeNeedle.style.transform = `rotate(${rotation}deg)`;
        animateCounter(percent);
    }

    function animateCounter(target) {
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        function update(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const value = Math.round(progress * target);
            gaugePercent.textContent = value + "%";
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

       //BADGE CREATOR

    function createBadge(text, type) {
        const el = document.createElement("span");
        el.className = "badge " + type;
        el.textContent = text;
        return el;
    }
});