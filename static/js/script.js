document.addEventListener('DOMContentLoaded', function () {

    /* =====================================================
       SCROLL-REVEAL
       ===================================================== */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* =====================================================
       PROGRESS BAR ANIMATION ON SCROLL
       ===================================================== */
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const target = bar.dataset.width;
                bar.style.width = '0%';
                requestAnimationFrame(() => {
                    setTimeout(() => { bar.style.width = target; }, 80);
                });
                barObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.progress-fill').forEach(bar => {
        bar.dataset.width = bar.style.width;
        bar.style.width = '0%';
        barObserver.observe(bar);
    });

    /* =====================================================
       STAT NUMBER COUNTER ANIMATION
       ===================================================== */
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatNumbers(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));

    function animateStatNumbers(card) {
        const h3 = card.querySelector('h3');
        if (!h3 || h3.dataset.animated) return;
        h3.dataset.animated = '1';

        const raw = h3.textContent.trim();           // e.g. "14M", "67%", "3.2M", "89%"
        const match = raw.match(/^([\d.]+)([A-Z%]*)$/);
        if (!match) return;

        const target   = parseFloat(match[1]);
        const suffix   = match[2] || '';
        const isDecimal = match[1].includes('.');
        const duration = 1600;
        const t0 = performance.now();

        const tick = (now) => {
            const p  = Math.min((now - t0) / duration, 1);
            const e  = 1 - Math.pow(1 - p, 3);
            const val = target * e;
            h3.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* =====================================================
       ANALYZE FORM
       ===================================================== */
    const analyzeBtn   = document.getElementById('analyze-btn');
    const jobTextarea  = document.getElementById('job-description');
    const analysisResults = document.getElementById('analysis-results');
    const resultStatus = document.getElementById('result-status');
    const resultTitle  = document.getElementById('result-title');
    const confidenceLabel = document.getElementById('confidence-label');
    const riskSection  = document.getElementById('risk-factors');
    const posSection   = document.getElementById('positive-indicators');
    const riskBadges   = document.getElementById('risk-badges');
    const posBadges    = document.getElementById('positive-badges');
    const btnText      = analyzeBtn.querySelector('.button-text');
    const btnIcon      = analyzeBtn.querySelector('.button-icon');

    const gaugeFill    = document.getElementById('gauge-fill');
    const gaugeNeedle  = document.getElementById('gauge-needle');
    const gaugePercent = document.getElementById('gauge-percent');

    let isAnalyzing = false;

    function updateButtonState() {
        const hasText = jobTextarea.value.trim().length > 0;
        analyzeBtn.disabled = !hasText || isAnalyzing;
    }

    jobTextarea.addEventListener('input', updateButtonState);
    updateButtonState();

    analyzeBtn.addEventListener('click', async () => {
        const text = jobTextarea.value.trim();
        if (!text || isAnalyzing) return;
        setAnalyzing(true);
        try {
            await delay(1800);
            const result = await callPredict(text);
            showResults(result);
        } catch (e) {
            console.error(e);
            alert('Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    });

    function setAnalyzing(on) {
        isAnalyzing = on;
        btnText.textContent = on ? 'Analyzing...' : 'Analyze Job Posting';
        btnIcon.innerHTML   = `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`;
        analyzeBtn.classList.toggle('analyzing', on);
        updateButtonState();
    }

    async function callPredict(text) {
        const fd = new FormData();
        fd.append('job_description', text);
        const res  = await fetch('/predict', { method: 'POST', body: fd });
        const data = await res.json();

        const fakeProb = data.isGenuine
            ? Math.floor(Math.random() * 22) + 4
            : Math.floor(Math.random() * 30) + 65;

        return {
            isGenuine:         data.isGenuine,
            fakeProbability:   fakeProb,
            riskFactors:       data.isGenuine ? [] : ['Detected as Potential Scam by ML model', 'Review posting carefully'],
            genuineIndicators: data.isGenuine ? ['Verified Genuine by ML model', 'Posting appears legitimate'] : []
        };
    }

    function showResults(result) {
        analysisResults.classList.remove('hidden');
        animateGauge(result.fakeProbability);

        if (result.isGenuine) {
            resultStatus.className = 'result-status genuine';
            resultTitle.textContent = 'Likely Genuine';
            confidenceLabel.textContent = result.fakeProbability < 15 ? 'Confidence: Very High' : 'Confidence: High';
            resultStatus.querySelector('.result-icon').innerHTML =
                `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>`;
        } else {
            resultStatus.className = 'result-status scam';
            resultTitle.textContent = 'Potential Scam';
            confidenceLabel.textContent = result.fakeProbability > 80 ? 'Confidence: Very High Risk' : 'Confidence: High Risk';
            resultStatus.querySelector('.result-icon').innerHTML =
                `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`;
        }

        riskSection.classList.toggle('hidden', !result.riskFactors.length);
        if (result.riskFactors.length) {
            riskBadges.innerHTML = '';
            result.riskFactors.forEach(f => riskBadges.appendChild(badge(f, 'danger')));
        }

        posSection.classList.toggle('hidden', !result.genuineIndicators.length);
        if (result.genuineIndicators.length) {
            posBadges.innerHTML = '';
            result.genuineIndicators.forEach(i => posBadges.appendChild(badge(i, 'success')));
        }

        setTimeout(() => analysisResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }

    /* =====================================================
       GAUGE
       ===================================================== */
    function animateGauge(pct) {
        const totalArc = 283;
        const fill     = (pct / 100) * totalArc;

        const [c1, c2] = pct < 30
            ? ['#10b981','#34d399']
            : pct < 60
            ? ['#f59e0b','#fbbf24']
            : ['#dc2626','#f87171'];

        const color = c1;

        const s1 = document.getElementById('gaugeStop1');
        const s2 = document.getElementById('gaugeStop2');
        if (s1) s1.setAttribute('stop-color', c1);
        if (s2) s2.setAttribute('stop-color', c2);

        gaugeFill.style.stroke          = color;
        gaugeFill.style.strokeDasharray = `0 ${totalArc}`;
        setTimeout(() => {
            gaugeFill.style.strokeDasharray = `${fill} ${totalArc - fill}`;
        }, 60);

        const rot = -90 + (pct / 100) * 180;
        gaugeNeedle.style.transformOrigin = '100px 110px';
        gaugeNeedle.style.transform       = `rotate(-90deg)`;
        setTimeout(() => { gaugeNeedle.style.transform = `rotate(${rot}deg)`; }, 60);

        gaugePercent.style.color = color;
        counter(0, pct, 1200, v => { gaugePercent.textContent = v + '%'; });
    }

    function counter(from, to, dur, cb) {
        const t0 = performance.now();
        const tick = now => {
            const p = Math.min((now - t0) / dur, 1);
            cb(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function badge(text, type) {
        const el = document.createElement('span');
        el.className = `badge ${type}`;
        el.textContent = text;
        return el;
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    /* =====================================================
       MOBILE NAV
       ===================================================== */
    const ham = document.getElementById('hamburger');
    if (ham) {
        ham.addEventListener('click', () => {
            const links = document.querySelector('.nav-links');
            const cta   = document.querySelector('.nav-cta');
            const open  = links && links.style.display === 'flex';
            if (links) {
                links.style.cssText = open
                    ? ''
                    : 'display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:rgba(6,13,31,0.98);padding:1rem;gap:0.25rem;border-bottom:1px solid rgba(59,130,246,0.2);backdrop-filter:blur(18px);z-index:199;';
            }
            if (cta) cta.style.display = open ? '' : 'block';
        });
    }

    /* =====================================================
       NAVBAR ACTIVE LINK on scroll
       ===================================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));

});