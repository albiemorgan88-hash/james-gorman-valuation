// Property Valuation Tool Script
class PropertyValuationTool {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.addAnimations();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Form submission
        document.getElementById('valuationForm').addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Radio button changes
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => this.handleInputChange(input));
        });
        
        // Select changes
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => this.handleInputChange(select));
        });

        // Auto-advance for radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                setTimeout(() => {
                    if (this.currentStep < this.totalSteps - 1) {
                        this.nextStep();
                    }
                }, 600);
            });
        });

        // Select auto-advance
        document.querySelector('select[name="location"]').addEventListener('change', () => {
            setTimeout(() => {
                if (this.currentStep < this.totalSteps - 1) {
                    this.nextStep();
                }
            }, 600);
        });
    }

    handleInputChange(input) {
        // Add selection animation
        if (input.type === 'radio') {
            const card = input.closest('.option-card');
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }
        
        this.validateStep(this.currentStep);
    }

    nextStep() {
        if (!this.validateStep(this.currentStep)) {
            this.showError('Please make a selection before continuing');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    hideStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        step.style.opacity = '0';
        step.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            step.classList.remove('active');
        }, 300);
    }

    showStep(stepNumber) {
        setTimeout(() => {
            const step = document.getElementById(`step${stepNumber}`);
            step.classList.add('active');
            step.style.opacity = '0';
            step.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateX(0)';
            }, 50);
        }, 300);
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentStepSpan = document.getElementById('currentStep');
        
        const progressPercent = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;
        currentStepSpan.textContent = this.currentStep;
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    validateStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        const requiredInputs = step.querySelectorAll('input[required], select[required]');
        
        for (let input of requiredInputs) {
            if (!input.value || (input.type === 'radio' && !step.querySelector(`input[name="${input.name}"]:checked`))) {
                return false;
            }
        }
        return true;
    }

    showError(message) {
        // Create temporary error message
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #dc3545;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: center;
            animation: slideInDown 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        const navigation = document.querySelector('.form-navigation');
        navigation.parentNode.insertBefore(errorDiv, navigation);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('valuationForm'));
        this.formData = Object.fromEntries(formData.entries());
        return this.formData;
    }

    calculateValuation(data) {
        // Mock valuation calculation based on inputs
        let baseValue = 150000;
        
        // Property type adjustments
        switch (data.propertyType) {
            case 'house': baseValue *= 1.2; break;
            case 'apartment': baseValue *= 0.8; break;
            case 'bungalow': baseValue *= 1.1; break;
            case 'commercial': baseValue *= 1.5; break;
        }
        
        // Bedroom adjustments
        const bedrooms = parseInt(data.bedrooms) || 3;
        baseValue *= (0.7 + (bedrooms * 0.15));
        
        // Location adjustments
        const locationMultipliers = {
            'culmore': 1.1,
            'eglinton': 1.15,
            'waterside': 0.95,
            'cityside': 1.05,
            'drumahoe': 1.12,
            'strathfoyle': 1.08,
            'ballynagard': 0.9,
            'rosemount': 0.88,
            'bogside': 0.85,
            'creggan': 0.87,
            'shantallow': 0.9,
            'newbuildings': 1.2
        };
        
        baseValue *= (locationMultipliers[data.location] || 1.0);
        
        // Condition adjustments
        switch (data.condition) {
            case 'excellent': baseValue *= 1.1; break;
            case 'good': baseValue *= 1.0; break;
            case 'fair': baseValue *= 0.9; break;
            case 'needs-work': baseValue *= 0.75; break;
        }
        
        // Add some randomization for realism
        const variation = 0.1; // 10% variation
        const randomFactor = 1 + (Math.random() - 0.5) * variation;
        baseValue *= randomFactor;
        
        // Calculate range (±15%)
        const minValue = Math.round((baseValue * 0.85) / 1000) * 1000;
        const maxValue = Math.round((baseValue * 1.15) / 1000) * 1000;
        
        return { min: minValue, max: maxValue };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('£', '');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateStep(this.currentStep)) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        const data = this.collectFormData();
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Simulate API call delay
        await this.simulateCalculation();
        
        // Calculate valuation
        const valuation = this.calculateValuation(data);
        
        // Show results
        this.showResults(valuation);
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('active');
        
        // Animate loading text
        const loadingTexts = [
            'Analyzing local market data',
            'Comparing similar properties',
            'Calculating market trends',
            'Finalizing your valuation'
        ];
        
        let textIndex = 0;
        const loadingText = document.querySelector('.loading-text');
        
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length;
            loadingText.style.opacity = '0';
            setTimeout(() => {
                loadingText.textContent = loadingTexts[textIndex];
                loadingText.style.opacity = '1';
            }, 300);
        }, 1500);
        
        // Store interval to clear it later
        this.textInterval = textInterval;
    }

    async simulateCalculation() {
        // Realistic loading time
        const loadingTime = 3000 + Math.random() * 2000; // 3-5 seconds
        return new Promise(resolve => setTimeout(resolve, loadingTime));
    }

    showResults(valuation) {
        // Clear text animation interval
        clearInterval(this.textInterval);
        
        // Hide loading screen
        document.getElementById('loadingScreen').classList.remove('active');
        
        // Update valuation amounts
        document.getElementById('valuationMin').textContent = this.formatCurrency(valuation.min);
        document.getElementById('valuationMax').textContent = this.formatCurrency(valuation.max);
        
        // Show results screen
        const resultsScreen = document.getElementById('resultsScreen');
        resultsScreen.classList.add('active');
        
        // Add celebration animation
        this.addCelebrationAnimation();
        
        // Track completion (you could send this to analytics)
        this.trackCompletion(valuation);
    }

    addCelebrationAnimation() {
        // Create floating elements animation
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createFloatingElement();
            }, i * 100);
        }
    }

    createFloatingElement() {
        const element = document.createElement('div');
        element.innerHTML = ['🏠', '💰', '⭐', '📈'][Math.floor(Math.random() * 4)];
        element.style.cssText = `
            position: fixed;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: 1000;
            animation: float 3s ease-out forwards;
            left: ${Math.random() * 100}vw;
            top: 100vh;
        `;
        
        document.body.appendChild(element);
        
        setTimeout(() => element.remove(), 3000);
    }

    addAnimations() {
        // Add CSS for floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                to {
                    transform: translateY(-120vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes slideInDown {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    trackCompletion(valuation) {
        // Store completion in localStorage for analytics
        const completion = {
            timestamp: new Date().toISOString(),
            formData: this.formData,
            valuation: valuation,
            userAgent: navigator.userAgent
        };
        
        try {
            localStorage.setItem('jgp_valuation_completion', JSON.stringify(completion));
        } catch (e) {
            console.log('Analytics tracking unavailable');
        }
    }
}

// Initialize the tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PropertyValuationTool();
});

// Add smooth scrolling for mobile
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Mobile viewport height fix
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
});

// Add loading states for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Preload hero background
    const heroImg = new Image();
    heroImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">...</svg>';
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.option-card, .trust-item, .stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});