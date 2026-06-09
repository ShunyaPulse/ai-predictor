let currentLogOdds = 0;
let currentProb = 50.0;

const probNumber = document.getElementById('probNumber');
const progressFill = document.getElementById('progressFill');
const statusMsg = document.getElementById('statusMsg');
const eventInput = document.getElementById('eventInput');
const evidenceContainer = document.getElementById('evidenceContainer');
const analyzeBtn = document.getElementById('analyzeBtn');
const shareBtn = document.getElementById('shareBtn');
const socialShareRow = document.getElementById('socialShareRow'); // New element
const historyCard = document.getElementById('historyCard');
const historyList = document.getElementById('historyList');
const loader = document.getElementById('loader');
const mathModal = document.getElementById('mathModal');

function addEvidenceBox() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'evidence-input';
    input.placeholder = 'Enter another piece of evidence...';
    evidenceContainer.appendChild(input);
    input.focus();
}

function resetEvidenceBoxes() {
    evidenceContainer.innerHTML = '<input type="text" class="evidence-input" placeholder="e.g., A major rocket test was successful today">';
}

function animateValue(start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let current = (progress * (end - start) + start);
        probNumber.innerText = current.toFixed(1) + "%";

        if (current > 65) {
            probNumber.style.textShadow = "0 0 40px rgba(16, 185, 129, 0.6)";
        } else if (current < 35) {
            probNumber.style.textShadow = "0 0 40px rgba(239, 68, 68, 0.6)";
        } else {
            probNumber.style.textShadow = "0 0 40px rgba(6, 182, 212, 0.6)";
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

async function runIntelligence() {
    const event = eventInput.value.trim();
    const inputs = document.querySelectorAll('.evidence-input');
    const evidenceArray = Array.from(inputs).map(inp => inp.value.trim()).filter(val => val !== "");

    if (!event) return alert("Please provide the Target Event.");
    if (evidenceArray.length === 0) return alert("Please provide at least one piece of evidence.");

    analyzeBtn.disabled = true;
    loader.style.display = "block";

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventText: event,
                evidenceArray: evidenceArray,
                currentProbability: currentProb
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Server Connection Failed");

        updateDashboard(evidenceArray, data.weight, data.reasoning);

        // Show BOTH the main copy button and social buttons
        shareBtn.style.display = 'block';
        socialShareRow.style.display = 'flex';

    } catch (err) {
        alert("System Error: " + err.message);
    } finally {
        analyzeBtn.disabled = false;
        loader.style.display = "none";
    }
}

function updateDashboard(evidenceArray, weight, reasoning) {
    let oldProb = currentProb;

    currentLogOdds += (weight * 0.4);
    currentProb = (1 / (1 + Math.exp(-currentLogOdds))) * 100;

    animateValue(oldProb, currentProb, 1500);
    progressFill.style.width = currentProb + "%";
    progressFill.style.backgroundPosition = currentProb > 50 ? "100%" : "0%";

    statusMsg.innerText = currentProb > 50 ? "Trajectory favors occurrence." : "Trajectory favors non-occurrence.";

    historyCard.style.display = "block";
    let evidenceHtmlList = evidenceArray.map(ev => `<li>${ev}</li>`).join('');

    const logHtml = `
                <div class="log-item" style="border-color: ${weight > 0 ? 'var(--success)' : (weight < 0 ? 'var(--danger)' : 'var(--text-muted)')}">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: white; margin-bottom: 0.5rem;">
                        <span>Batch Data Processed:</span>
                        <span>Impact: ${weight > 0 ? '+' : ''}${weight}</span>
                    </div>
                    <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-muted); font-size: 0.95rem;">
                        ${evidenceHtmlList}
                    </ul>
                    <div class="ai-reasoning">🧠 ${reasoning}</div>
                </div>
            `;
    historyList.insertAdjacentHTML('afterbegin', logHtml);
    resetEvidenceBoxes();
}

// --- CORE SHARE LOGIC DATA BUILDER ---
function getShareData() {
    const event = eventInput.value.trim() || "this future event";
    const prob = probNumber.innerText;
    const url = window.location.href;
    const text = `✨ This AI predicts a ${prob} chance that "${event}" based on real-world evidence! Run your own scenario here: ${url}`;
    return { text, url };
}

// 1. Original Clipboard Copy
function sharePrediction() {
    const data = getShareData();
    navigator.clipboard.writeText(data.text).then(() => {
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = "✅ Copied to Clipboard!";
        shareBtn.style.background = "var(--success)";
        shareBtn.style.color = "var(--bg-dark)";

        setTimeout(() => {
            shareBtn.innerHTML = originalText;
            shareBtn.style.background = "rgba(16, 185, 129, 0.1)";
            shareBtn.style.color = "var(--success)";
        }, 2000);
    }).catch(err => {
        alert("Could not copy text. Please try again.");
    });
}

// 2. WhatsApp Direct
function shareWhatsApp() {
    const data = getShareData();
    // This API link automatically opens the app on mobile or Web on Desktop
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(data.text)}`, '_blank');
}

// 3. Facebook Direct
function shareFacebook() {
    const data = getShareData();
    // FB only accepts URLs for the sharer intent, it grabs the preview image/title itself
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`, '_blank');
}

// 4. Instagram "Smart Hack"
function shareInstagram() {
    const data = getShareData();
    navigator.clipboard.writeText(data.text).then(() => {
        alert("Text & Link copied! 📸 Instagram doesn't allow direct web sharing. Opening Instagram now so you can paste it in your Story or Bio!");
        window.open('https://instagram.com', '_blank');
    });
}

function resetSystem() {
    currentLogOdds = 0;
    currentProb = 50.0;

    animateValue(parseFloat(probNumber.innerText), 50.0, 1000);
    progressFill.style.width = "50%";
    progressFill.style.backgroundPosition = "50%";
    probNumber.style.textShadow = "0 0 40px rgba(139, 92, 246, 0.5)";

    statusMsg.innerText = "Memory wiped. Awaiting new variables.";
    eventInput.value = "";
    resetEvidenceBoxes();
    historyList.innerHTML = "";
    historyCard.style.display = "none";
    shareBtn.style.display = "none";
    socialShareRow.style.display = "none"; // Hide new buttons on wipe
}

/* --- Modal and Graph Logic --- */
function openModal() {
    mathModal.style.display = 'flex';
    drawSCurve();
}

function closeModal() {
    mathModal.style.display = 'none';
}

function closeModalOutside(event) {
    if (event.target === mathModal) {
        closeModal();
    }
}

function drawSCurve() {
    const canvas = document.getElementById('sCurveCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;

    for (let x = -6; x <= 6; x += 0.1) {
        let y = 1 / (1 + Math.exp(-x));
        let canvasX = ((x + 6) / 12) * width;
        let canvasY = height - (y * height);

        if (x === -6) ctx.moveTo(canvasX, canvasY);
        else ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();

    let displayX = currentLogOdds;
    if (displayX > 5.5) displayX = 5.5;
    if (displayX < -5.5) displayX = -5.5;

    let displayY = 1 / (1 + Math.exp(-displayX));
    let dotX = ((displayX + 6) / 12) * width;
    let dotY = height - (displayY * height);

    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#8b5cf6';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    let textY = dotY - 15;
    if (textY < 20) textY = dotY + 25;
    ctx.fillText('Current Prob: ' + currentProb.toFixed(1) + '%', dotX, textY);
}
