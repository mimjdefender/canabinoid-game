// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {
    shoot: new Audio('audio/shoot.mp3'),
    hit: new Audio('audio/hit.mp3'),
    miss: new Audio('audio/miss.mp3'),
    switch: new Audio('audio/switch.mp3'),
    bgm: new Audio('audio/bgm.mp3')
};

// Configure background music
sounds.bgm.loop = true;
sounds.bgm.volume = 0.3;

// Sound effect volumes
sounds.shoot.volume = 0.4;
sounds.hit.volume = 0.4;
sounds.miss.volume = 0.3;
sounds.switch.volume = 0.4;

// Function to play sound with error handling
function playSound(soundName) {
    try {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play error:', e));
    } catch (e) {
        console.log('Sound play error:', e);
    }
}

// Add mute functionality
let isMuted = false;
function toggleMute() {
    isMuted = !isMuted;
    Object.values(sounds).forEach(sound => {
        sound.muted = isMuted;
    });
}

// Start background music
function startBGM() {
    sounds.bgm.play().catch(e => console.log('BGM play error:', e));
}

// Constants
const PROJECTILE_SPEED = 8;
const RECEPTOR_SPEED = 2.5;
const RECEPTOR_SPAWN_INTERVAL = 1800;
const RECEPTOR_SIZE = 40;
const PROJECTILE_SIZE = 30;
const PLAYER_SPEED = 8;

// Particle system
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.alpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.01;
        this.size -= 0.1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Game state
let score = 0;
let currentMolecule = 'THC';
let particles = [];
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    speed: PLAYER_SPEED,
    width: PROJECTILE_SIZE,
    height: PROJECTILE_SIZE
};
let projectiles = [];
let receptors = [];
let spawnInterval;
let keys = {
    left: false,
    right: false
};

// Draw cannabis leaf shape
function drawLeaf(x, y, size, rotation = 0, color = '#4a8505') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size, size);
    
    ctx.beginPath();
    // Main leaf body
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-5, -5, -10, 0, -10, 5);
    ctx.bezierCurveTo(-10, 10, -5, 15, 0, 15);
    ctx.bezierCurveTo(5, 15, 10, 10, 10, 5);
    ctx.bezierCurveTo(10, 0, 5, -5, 0, -10);
    
    // Left leaflets
    ctx.moveTo(-2, -8);
    ctx.bezierCurveTo(-8, -8, -12, -4, -12, 0);
    ctx.bezierCurveTo(-12, 4, -8, 6, -2, 6);
    
    // Right leaflets
    ctx.moveTo(2, -8);
    ctx.bezierCurveTo(8, -8, 12, -4, 12, 0);
    ctx.bezierCurveTo(12, 4, 8, 6, 2, 6);

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

class Projectile {
    constructor() {
        this.x = player.x;
        this.y = player.y;
        this.dy = -PROJECTILE_SPEED;
        this.type = currentMolecule;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.y += this.dy;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'THC') {
            // THC molecule (hexagonal with leaf pattern)
            ctx.fillStyle = '#8B4513';
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            
            // Draw hexagonal base
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const x = Math.cos(angle) * PROJECTILE_SIZE/3;
                const y = Math.sin(angle) * PROJECTILE_SIZE/3;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Add small leaf decoration
            drawLeaf(0, 0, 0.8, this.rotation, '#006400');
        } else {
            // CBD molecule (circular with crystal pattern)
            ctx.fillStyle = '#006400';
            ctx.strokeStyle = '#004200';
            ctx.lineWidth = 2;

            // Draw base circle
            ctx.beginPath();
            ctx.arc(0, 0, PROJECTILE_SIZE/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Add crystal-like extensions
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3) + this.rotation;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const x = Math.cos(angle) * PROJECTILE_SIZE/2;
                const y = Math.sin(angle) * PROJECTILE_SIZE/2;
                ctx.lineTo(x, y);
                ctx.strokeStyle = '#90EE90';
                ctx.stroke();
            }
        }

        ctx.restore();

        // Add glow effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, PROJECTILE_SIZE/2, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'THC' ? '#d4a017' : '#90EE90';
        ctx.fill();
        ctx.restore();
    }
}

class Receptor {
    constructor() {
        this.type = Math.random() < 0.5 ? 'CB1' : 'CB2';
        this.x = Math.random() * (canvas.width - RECEPTOR_SIZE);
        this.y = -RECEPTOR_SIZE;
        this.dy = RECEPTOR_SPEED;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
        this.y += this.dy;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + RECEPTOR_SIZE/2, this.y + RECEPTOR_SIZE/2);
        ctx.rotate(this.rotation);

        // Draw receptor
        ctx.beginPath();
        const baseColor = this.type === 'CB1' ? '#FF6B6B' : '#4ECDC4';
        const strokeColor = this.type === 'CB1' ? '#FF4040' : '#3DAA9D';
        ctx.fillStyle = baseColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        // Draw receptor body with cannabis leaf influence
        ctx.beginPath();
        ctx.arc(0, 0, RECEPTOR_SIZE/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw receptor "arms" with leaf-like endings
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.save();
            ctx.rotate(angle);
            
            // Draw the arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(RECEPTOR_SIZE/2, 0);
            ctx.stroke();
            
            // Draw small leaf at the end
            drawLeaf(RECEPTOR_SIZE/2, 0, 0.3, Math.PI/4, baseColor);
            ctx.restore();
        }

        // Add text label with better contrast
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px Righteous';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(this.type, 0, 0);
        ctx.fillText(this.type, 0, 0);

        ctx.restore();
    }
}

function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0 || particles[i].size <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

function spawnReceptor() {
    receptors.push(new Receptor());
}

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
        createParticles(player.x + PROJECTILE_SIZE, player.y, '#4a8505', 1);
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
        createParticles(player.x - PROJECTILE_SIZE, player.y, '#4a8505', 1);
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Draw player molecule
    if (currentMolecule === 'THC') {
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#654321';
    } else {
        ctx.fillStyle = '#006400';
        ctx.strokeStyle = '#004200';
    }
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, PROJECTILE_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Add glow effect
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, PROJECTILE_SIZE/1.5, 0, Math.PI * 2);
    ctx.fillStyle = currentMolecule === 'THC' ? '#d4a017' : '#90EE90';
    ctx.fill();

    // Add text label
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '14px Righteous';
    ctx.textAlign = 'center';
    ctx.fillText(currentMolecule, 0, PROJECTILE_SIZE + 5);

    ctx.restore();
}

function checkCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = receptors.length - 1; j >= 0; j--) {
            const p = projectiles[i];
            const r = receptors[j];
            
            const dx = p.x - (r.x + RECEPTOR_SIZE/2);
            const dy = p.y - (r.y + RECEPTOR_SIZE/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < RECEPTOR_SIZE/2 + PROJECTILE_SIZE/3) {
                const isCorrectPair = (p.type === 'THC' && r.type === 'CB1') ||
                                    (p.type === 'CBD' && r.type === 'CB2');
                
                if (isCorrectPair) {
                    score += 10;
                    createParticles(p.x, p.y, '#00ff00', 20);
                    playSound('hit');
                } else {
                    score = Math.max(0, score - 5);
                    createParticles(p.x, p.y, '#ff0000', 20);
                    playSound('miss');
                }
                
                scoreElement.textContent = score;
                projectiles.splice(i, 1);
                receptors.splice(j, 1);
                break;
            }
        }
    }
}

function update() {
    updatePlayer();
    updateParticles();

    projectiles.forEach((p, index) => {
        p.update();
        if (p.y < 0) {
            projectiles.splice(index, 1);
        }
    });

    receptors.forEach((r, index) => {
        r.update();
        if (r.y > canvas.height) {
            receptors.splice(index, 1);
        }
    });

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw animated background pattern
    ctx.save();
    ctx.globalAlpha = 0.1;
    const time = Date.now() / 3000;
    for (let i = 0; i < canvas.width; i += 50) {
        for (let j = 0; j < canvas.height; j += 50) {
            const offset = Math.sin(time + i/50 + j/50) * 0.5;
            drawLeaf(i, j, 0.5, Math.PI/4 + offset, '#4a8505');
        }
    }
    ctx.restore();

    drawParticles();
    drawPlayer();
    projectiles.forEach(p => p.draw());
    receptors.forEach(r => r.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        currentMolecule = currentMolecule === 'THC' ? 'CBD' : 'THC';
        createParticles(player.x, player.y, currentMolecule === 'THC' ? '#d4a017' : '#90EE90', 10);
        playSound('switch');
    } else if (e.code === 'ArrowLeft') {
        keys.left = true;
    } else if (e.code === 'ArrowRight') {
        keys.right = true;
    } else if (e.code === 'KeyX') {
        projectiles.push(new Projectile());
        createParticles(player.x, player.y - 20, currentMolecule === 'THC' ? '#8B4513' : '#006400', 5);
        playSound('shoot');
    } else if (e.code === 'KeyM') {
        toggleMute();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') {
        keys.left = false;
    } else if (e.code === 'ArrowRight') {
        keys.right = false;
    }
});

// Add click handler for starting the game with sound
canvas.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    if (!sounds.bgm.playing) {
        startBGM();
    }
});

// Add after canvas setup
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.clientWidth - 40);
    const scale = maxWidth / 600;
    
    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = `${maxWidth}px`;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
}

// Call resize on load and window resize
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Mobile controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const switchBtn = document.getElementById('switchBtn');
const shootBtn = document.getElementById('shootBtn');

// Touch controls state
let touchControls = {
    left: false,
    right: false
};

// Mobile button event listeners
if (leftBtn && rightBtn && switchBtn && shootBtn) {
    // Movement controls
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
        keys.left = true;
    });
    leftBtn.addEventListener('touchend', () => {
        touchControls.left = false;
        keys.left = false;
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
        keys.right = true;
    });
    rightBtn.addEventListener('touchend', () => {
        touchControls.right = false;
        keys.right = false;
    });

    // Action controls
    switchBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        currentMolecule = currentMolecule === 'THC' ? 'CBD' : 'THC';
        createParticles(player.x, player.y, currentMolecule === 'THC' ? '#d4a017' : '#90EE90', 10);
        playSound('switch');
    });

    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        projectiles.push(new Projectile());
        createParticles(player.x, player.y - 20, currentMolecule === 'THC' ? '#8B4513' : '#006400', 5);
        playSound('shoot');
    });
}

// Prevent default touch behaviors
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => e.preventDefault());

// Start game
gameLoop();
setInterval(spawnReceptor, RECEPTOR_SPAWN_INTERVAL); 