# Ultimate AI Predictor

A sleek, interactive probability forecasting dashboard that applies Bayesian principles and dynamic S-curve modeling to evaluate real-world scenarios based on incremental evidence

---

## Overview

Unlike standard generative tools that output arbitrary responses, **Ultimate AI Predictor** models logical certainty mathematically. Users define a target event and continuously introduce new data points or evidence. The platform assigns contextual weights and maps adjustments onto a logistic sigmoid curve, simulating the increasing threshold of proof required as certainty nears 0% or 100%

---

## Core Features

* **Bayesian Probability Engine:** Starts at maximum entropy (50.0%) and dynamically updates using logarithmic odds transformations.
* **Dynamic S-Curve Canvas:** An interactive HTML5 Canvas modal visualizing the current belief state along a non-linear sigmoid trajectory.
* **Multi-Point Evidence Stacking:** Input and chain multiple pieces of real-world evidence within a single analysis cycle.
* **Intelligence Audit Log:** A chronological feed documenting raw evidence inputs, contextual AI impact scores, and structured reasoning.
* **One-Click Multi-Channel Sharing:** Integrated custom share intents for WhatsApp, Facebook, Instagram, and standard clipboard copying.
* **Glassmorphic Responsive Interface:** Modern dark-mode UI with fluid typography, responsive layout scaling, and hardware-accelerated animations.

---

## Mathematical Model

The engine operates on log-odds transformations to prevent linear probability distortions:

Odds = P / (1 - P)

Log-Odds = ln(Odds)

When evidence is evaluated, an impact score (w) modifies the current log-odds state:
Log-Odds_updated = Log-Odds_current + (w × 0.4)
The updated log-odds are mapped back to a normalized probability percentage via the logistic sigmoid function:
P_updated = 1 / (1 + e^(-Log-Odds_updated)) × 100

This mirrors real-world Bayesian inference: moving the dial near 50% requires moderate evidence, whereas shifting certainty beyond 95% requires exponentially higher weights of proof.

Tech Stack
Ο Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
HTML +1
Styling: Custom Glassmorphic CSS Variables, Font Awesome Icons HTML +1
Visualization: Native HTML5 Canvas API.
Deployment: Vercel

Project Structure
ai-predictor/
├── public/
│   ├── index.html       # Primary prediction dashboard
│   ├── style.css        # Responsive glassmorphism styling
│   ├── script.js        # Core DOM logic, canvas math, and share routines
│   ├── about.html       # Documentation on statistical models
│   ├── how-it-works.html# Operational guide
│   ├── privacy.html     # Privacy Policy
│   └── terms.html       # Terms of Service
└── README.md
Getting Started
Prerequisites
A modern web browser (Chrome, Firefox, Safari, or Edge)
Local preview server (e.g., VS Code Live Server)

Local Setup
1. Clone the repository:
2. git clone [https://github.com/ShunyaPulse/ai-predictor.git](https://github.com/ShunyaPulse/ai-predictor.git)
cd ai-predictor

2. Run Locally:
Open public/index.html directly in your browser or serve via VS Code Live Server.

Contributing
Contributions, issue reports, and feature proposals are welcome.
1. Fork the repository
2. Create a feature branch (git checkout -b feature/dynamic-weights)
3. Commit your changes (git commit -m "Add dynamic weight balancing")
4. Push to the branch (git push origin feature/dynamic-weights)
5. Open a Pull Request

License
Distributed under the MIT License. See LICENSE for more information.

Contact
Email: techanics6174@gmail.com
