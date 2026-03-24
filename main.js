// Shan Hai Jing Gacha Game - Main JavaScript

// Creature data with authentic Shan Hai Jing information
const creatures = [
    {
        id: 'feifei',
        name: 'Feifei (腓腓)',
        rarity: 'common',
        image: 'resources/feifei.png',
        symbolism: 'Dispels depression and brings joy to those who encounter it',
        lore: 'A supernatural creature with fox-like eyes and a white tail mentioned in the Shan Hai Jing. This benevolent beast has the lovely benefit of dispelling depression and sorrow from anyone who keeps it as a companion. Its gentle nature and mystical presence bring comfort and happiness to all who encounter it.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'pixiu',
        name: 'Pixiu (貔貅)',
        rarity: 'rare',
        image: 'resources/pixiu.png',
        symbolism: 'Wealth gathering and protection from misfortune',
        lore: 'A hybrid Chinese mythical creature resembling a winged lion, the Pixiu is one of the most beloved symbols of wealth in Chinese Feng Shui practices. According to legend, the Pixiu only eats gold, silver, and jewels, and has no rectum, thus whatever wealth it ingests will never be expelled. It serves as a powerful guardian of prosperity.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'qilin',
        name: 'Qilin (麒麟)',
        rarity: 'rare',
        image: 'resources/qilin.png',
        symbolism: 'Wisdom, prosperity, and harmony',
        lore: 'A benevolent and auspicious creature often depicted as a cross between a deer and a horse, with a single horn on its head. The Qilin is said to appear only during times of peace and prosperity, and its presence is considered a sign of good fortune and wise leadership. It represents the perfect balance of all virtues.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'phoenix',
        name: 'Fenghuang (凤凰)',
        rarity: 'rare',
        image: 'resources/phoenix.png',
        symbolism: 'Rebirth, immortality, and renewal',
        lore: 'The Chinese phoenix, originally a pair with Feng being male and Huang being female. This mythical bird is reborn from its own ashes and represents the cyclical nature of life, death, and rebirth. Its appearance signals times of peace and prosperity, and it is often associated with the Empress and feminine power.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'bai_ze',
        name: 'Bai Ze (白泽)',
        rarity: 'rare',
        image: 'resources/bai_ze.png',
        symbolism: 'Universal knowledge and wisdom',
        lore: 'A legendary ancient Chinese creature capable of human speech and described as knowledgeable about all beings in the world. It is usually depicted as a four-legged creature with a human face. In Chinese creation myths, Huang Di encountered Bai Ze and from this legendary creature learned about the many supernatural beings of the world.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'nine_tailed_fox',
        name: 'Nine-Tailed Fox (九尾狐)',
        rarity: 'epic',
        image: 'resources/nine_tailed_fox.png',
        symbolism: 'Beauty, wisdom, and supernatural power',
        lore: 'A powerful fox spirit with nine tails, representing immense magical power and wisdom. In Chinese mythology, the nine-tailed fox is both a symbol of beauty and a formidable magical creature. It can live for thousands of years, gaining more tails and power as it ages. Some legends portray it as benevolent, while others warn of its trickster nature.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'yinglong',
        name: 'Yinglong (应龙)',
        rarity: 'epic',
        image: 'resources/yinglong.png',
        symbolism: 'Divine rain and celestial power',
        lore: 'In Chinese creation myths, Yinglong was a winged dragon and rain deity, serving as the chief lieutenant of Huang Di. This divine dragon could control storms and floods, and assisted Yu the Great in controlling the great flood. Its wings symbolize the connection between heaven and earth, and its power over water makes it essential for agricultural prosperity.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'zhulong',
        name: 'Zhulong (烛龙)',
        rarity: 'epic',
        image: 'resources/zhulong.png',
        symbolism: 'Time, seasons, and cosmic order',
        lore: 'A massive dragon with a human face, also known as the Torch Dragon. This mythical creature controls day and night by opening and closing its eyes. When it opens its eyes, daylight comes; when it closes them, darkness falls. Its breath creates the seasons and winds, making it a fundamental force of cosmic order and natural cycles.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'dijiang',
        name: 'Dijiang (帝江)',
        rarity: 'legendary',
        image: 'resources/dijiang.png',
        symbolism: 'Chaos, music, and primordial energy',
        lore: 'One of the weirdest Chinese mythical creatures recorded in the Shan Hai Jing, the Dijiang is a crimson, six-legged, four-winged creature with no facial features. This strange paranormal beast was also written about by Taoist sage Zhuangzi. It represents the formless chaos from which all things emerge and is associated with music and dance.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'taotie',
        name: 'Taotie (饕餮)',
        rarity: 'legendary',
        image: 'resources/taotie.png',
        symbolism: 'Greed, gluttony, and insatiable desire',
        lore: 'One of the Four Perils, Taotie is the symbol of greed and gluttony. As described in the Shan Hai Jing, it features a sheep\'s body, tiger\'s teeth, and human face and hands. Its eyes are hidden under its armpits. This monstrous creature is so greedy that it even eats its own body, representing the destructive nature of unchecked desire.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'xingtian',
        name: 'Xingtian (刑天)',
        rarity: 'legendary',
        image: 'resources/xingtian.png',
        symbolism: 'Defiance, perseverance, and warrior spirit',
        lore: 'A mythical warrior who fought against heaven and lost his head in battle. Despite being decapitated, Xingtian continues to fight using his nipples as eyes and his navel as a mouth. This powerful symbol of defiance and perseverance represents the unconquerable spirit that continues to resist even in the face of impossible odds.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'kaiming_shou',
        name: 'Kaiming Shou (开明兽)',
        rarity: 'legendary',
        image: 'resources/kaiming_shou.png',
        symbolism: 'Prophecy, wisdom, and divine guardianship',
        lore: 'Yet another weird beast listed in the Shan Hai Jing, the Kaiming Shou is described as having the body of a large tiger and nine human heads. Other ancient compendiums describe this magical beast as a servant of Xiwangmu and endowed with the power of prophecy. It serves as a guardian of celestial realms and possesses divine wisdom.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    },
    {
        id: 'hun_dun',
        name: 'Hun Dun (混沌)',
        rarity: 'legendary',
        image: 'resources/hun_dun.png',
        symbolism: 'Primordial chaos and the formless void',
        lore: 'A primordial being that embodies disorder and unpredictability. The Shan Hai Jing describes it as a god bird colored red and shaped like a bag, with six feet, four wings, and no face. It lives in the Tianshan Mountain and sings and dances. Hun Dun represents the formless chaos from which the universe emerged, the state before creation and order.',
        discovered: false,
        firstDiscovery: null,
        drawCount: 0
    }
];

// Game state
let gameState = {
    totalDraws: 0,
    dailyDraws: 3,
    lastResetDate: new Date().toDateString(),
    discoveredCreatures: [],
    recentDiscoveries: []
};

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('shanhaijing-game-state');
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
        
        // Reset daily draws if it's a new day
        const today = new Date().toDateString();
        if (gameState.lastResetDate !== today) {
            gameState.dailyDraws = 3;
            gameState.lastResetDate = today;
        }
        
        // Restore discovered creatures
        creatures.forEach(creature => {
            const savedCreature = gameState.discoveredCreatures.find(c => c.id === creature.id);
            if (savedCreature) {
                creature.discovered = savedCreature.discovered;
                creature.firstDiscovery = savedCreature.firstDiscovery;
                creature.drawCount = savedCreature.drawCount;
            }
        });
    }
}

// Save game state to localStorage
function saveGameState() {
    gameState.discoveredCreatures = creatures.map(creature => ({
        id: creature.id,
        discovered: creature.discovered,
        firstDiscovery: creature.firstDiscovery,
        drawCount: creature.drawCount
    }));
    localStorage.setItem('shanhaijing-game-state', JSON.stringify(gameState));
}

// Get rarity color
function getRarityColor(rarity) {
    const colors = {
        common: '#6b6b6b',
        rare: '#4a7c59',
        epic: '#7c4a7c',
        legendary: '#b8860b'
    };
    return colors[rarity] || colors.common;
}

// Get rarity name
function getRarityName(rarity) {
    const names = {
        common: 'Common',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary'
    };
    return names[rarity] || 'Common';
}

// Randomly select a creature based on rarity weights
function drawRandomCreature() {
    const weights = {
        common: 60,
        rare: 30,
        epic: 8,
        legendary: 2
    };
    
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity = 'common';
    for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const availableCreatures = creatures.filter(c => c.rarity === selectedRarity);
    return availableCreatures[Math.floor(Math.random() * availableCreatures.length)];
}

// Animate card flip
function flipCard() {
    const card = document.getElementById('main-card');
    card.classList.add('flipped');
}

// Reset card to back
function resetCard() {
    const card = document.getElementById('main-card');
    card.classList.remove('flipped');
}

// Show creature on card
function showCreature(creature) {
    const image = document.getElementById('creature-image');
    const name = document.getElementById('creature-name');
    const rarity = document.getElementById('creature-rarity');
    const lore = document.getElementById('creature-lore');
    const cardFront = document.getElementById('card-front');
    
    image.src = creature.image;
    image.alt = creature.name;
    name.textContent = creature.name;
    rarity.textContent = getRarityName(creature.rarity);
    rarity.style.backgroundColor = getRarityColor(creature.rarity);
    
    // Add rarity glow to card
    cardFront.className = `card-face card-front rarity-glow-${creature.rarity}`;
    
    // Typewriter effect for lore
    lore.innerHTML = '';
    const typed = new Typed('#creature-lore', {
        strings: [creature.lore],
        typeSpeed: 20,
        showCursor: false,
        onComplete: () => {
            // Add particle effects for rare+ creatures
            if (creature.rarity === 'epic' || creature.rarity === 'legendary') {
                createParticleBurst();
            }
        }
    });
}

// Create particle burst effect
function createParticleBurst() {
    const container = document.getElementById('particles-container');
    const rect = document.querySelector('.card-container').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        container.appendChild(particle);
        
        anime({
            targets: particle,
            translateX: (Math.random() - 0.5) * 400,
            translateY: (Math.random() - 0.5) * 400,
            scale: [1, 0],
            opacity: [1, 0],
            duration: 1500,
            easing: 'easeOutQuart',
            complete: () => {
                particle.remove();
            }
        });
    }
}

// Update stats display
function updateStats() {
    const totalDraws = document.getElementById('total-draws');
    const uniqueCreatures = document.getElementById('unique-creatures');
    const epicCount = document.getElementById('epic-count');
    const completionRate = document.getElementById('completion-rate');
    const drawCount = document.getElementById('draw-count');
    const dailyCount = document.getElementById('daily-count');
    const buttonText = document.getElementById('button-text');
    const drawButton = document.getElementById('draw-button');
    
    if (totalDraws) totalDraws.textContent = gameState.totalDraws;
    if (uniqueCreatures) uniqueCreatures.textContent = creatures.filter(c => c.discovered).length;
    if (epicCount) {
        const epicPlus = creatures.filter(c => (c.rarity === 'epic' || c.rarity === 'legendary') && c.discovered).length;
        epicCount.textContent = epicPlus;
    }
    if (completionRate) {
        const percentage = Math.round((creatures.filter(c => c.discovered).length / creatures.length) * 100);
        completionRate.textContent = percentage + '%';
    }
    if (drawCount) drawCount.textContent = `(${gameState.totalDraws} drawn)`;
    if (dailyCount) dailyCount.textContent = gameState.dailyDraws;
    
    // Update button state
    if (drawButton) {
        if (gameState.dailyDraws <= 0) {
            drawButton.disabled = true;
            if (buttonText) buttonText.textContent = 'No Draws Left';
        } else {
            drawButton.disabled = false;
            if (buttonText) buttonText.textContent = 'Draw Card';
        }
    }
}

// Update recent discoveries
function updateRecentDiscoveries() {
    const container = document.getElementById('recent-discoveries');
    if (!container) return;
    
    const discovered = creatures.filter(c => c.discovered);
    const recent = discovered.slice(-5).reverse(); // Last 5 discoveries
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-center py-8 flex-1">Draw your first creature to start your collection</div>';
        return;
    }
    
    container.innerHTML = recent.map(creature => `
        <div class="recent-card rarity-${creature.rarity}" onclick="showCreatureModal('${creature.id}')">
            <img src="${creature.image}" alt="${creature.name}" title="${creature.name}">
        </div>
    `).join('');
}

// Show creature modal
function showCreatureModal(creatureId) {
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature || !creature.discovered) return;
    
    const modal = document.getElementById('creature-modal');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalRarity = document.getElementById('modal-rarity');
    const modalSymbolism = document.getElementById('modal-symbolism');
    const modalLore = document.getElementById('modal-lore');
    const modalDiscovery = document.getElementById('modal-discovery');
    const modalAchievements = document.getElementById('modal-achievements');
    
    modalImage.src = creature.image;
    modalName.textContent = creature.name;
    modalRarity.textContent = getRarityName(creature.rarity);
    modalRarity.style.backgroundColor = getRarityColor(creature.rarity);
    modalSymbolism.textContent = creature.symbolism;
    modalLore.textContent = creature.lore;
    
    const discoveryDate = creature.firstDiscovery ? new Date(creature.firstDiscovery).toLocaleDateString() : 'Unknown';
    modalDiscovery.textContent = `First discovered: ${discoveryDate} • Times drawn: ${creature.drawCount}`;
    
    // Add achievements
    modalAchievements.innerHTML = '';
    if (creature.rarity === 'legendary') {
        modalAchievements.innerHTML += '<span class="achievement-badge">Legendary Discovery</span>';
    }
    if (creature.drawCount >= 5) {
        modalAchievements.innerHTML += '<span class="achievement-badge">Frequent Encounter</span>';
    }
    
    modal.classList.add('active');
}

// Close modal
function closeCreatureModal() {
    const modal = document.getElementById('creature-modal');
    modal.classList.remove('active');
}

// Initialize bestiary page
function initBestiary() {
    const grid = document.getElementById('creatures-grid');
    if (!grid) return;
    
    // Create creature cards
    grid.innerHTML = creatures.map(creature => `
        <div class="creature-card ${creature.discovered ? '' : 'locked'}" onclick="showCreatureModal('${creature.id}')">
            <img class="creature-image" src="${creature.discovered ? creature.image : 'resources/hero_banner.png'}" alt="${creature.name}">
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${creature.discovered ? creature.name : '???'}</h3>
                    <span class="text-xs px-2 py-1 rounded-full text-white" style="background-color: ${getRarityColor(creature.rarity)}">
                        ${getRarityName(creature.rarity)}
                    </span>
                </div>
                <p class="text-sm text-gray-400">
                    ${creature.discovered ? creature.symbolism : 'Mystery awaits discovery...'}
                </p>
                ${creature.discovered ? `<div class="text-xs text-gray-500 mt-2">Drawn: ${creature.drawCount} times</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Update stats
    updateBestiaryStats();
    
    // Setup filters
    setupFilters();
    
    // Setup search
    setupSearch();
}

// Update bestiary stats
function updateBestiaryStats() {
    const totalUnique = document.getElementById('total-unique');
    const commonCount = document.getElementById('common-count');
    const rareCount = document.getElementById('rare-count');
    const epicCount = document.getElementById('epic-count');
    const legendaryCount = document.getElementById('legendary-count');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    const discovered = creatures.filter(c => c.discovered);
    const common = discovered.filter(c => c.rarity === 'common').length;
    const rare = discovered.filter(c => c.rarity === 'rare').length;
    const epic = discovered.filter(c => c.rarity === 'epic').length;
    const legendary = discovered.filter(c => c.rarity === 'legendary').length;
    
    if (totalUnique) totalUnique.textContent = discovered.length;
    if (commonCount) commonCount.textContent = common;
    if (rareCount) rareCount.textContent = rare;
    if (epicCount) epicCount.textContent = epic;
    if (legendaryCount) legendaryCount.textContent = legendary;
    if (progressText) progressText.textContent = `${discovered.length}/${creatures.length}`;
    if (progressFill) progressFill.style.width = `${(discovered.length / creatures.length) * 100}%`;
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter creatures
            const filter = button.dataset.filter;
            filterCreatures(filter);
        });
    });
}

// Filter creatures by rarity
function filterCreatures(rarity) {
    const cards = document.querySelectorAll('.creature-card');
    cards.forEach(card => {
        if (rarity === 'all') {
            card.style.display = 'block';
        } else {
            const creatureId = card.getAttribute('onclick').match(/'([^']+)'/)[1];
            const creature = creatures.find(c => c.id === creatureId);
            if (creature && creature.rarity === rarity) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Animate visible cards
    anime({
        targets: '.creature-card[style*="block"], .creature-card:not([style*="none"])',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.creature-card');
        
        cards.forEach(card => {
            const creatureId = card.getAttribute('onclick').match(/'([^']+)'/)[1];
            const creature = creatures.find(c => c.id === creatureId);
            if (creature) {
                const searchText = `${creature.name} ${creature.symbolism} ${getRarityName(creature.rarity)}`.toLowerCase();
                if (searchText.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}

// Handle card draw
function handleCardDraw() {
    if (gameState.dailyDraws <= 0) return;
    
    const creature = drawRandomCreature();
    
    // Update creature data
    if (!creature.discovered) {
        creature.discovered = true;
        creature.firstDiscovery = new Date().toISOString();
        gameState.recentDiscoveries.unshift(creature.id);
    }
    creature.drawCount++;
    
    // Update game state
    gameState.totalDraws++;
    gameState.dailyDraws--;
    
    // Save state
    saveGameState();
    
    // Reset and flip card
    resetCard();
    
    // Disable button during animation
    const drawButton = document.getElementById('draw-button');
    if (drawButton) drawButton.disabled = true;
    
    setTimeout(() => {
        showCreature(creature);
        flipCard();
        
        // Update displays
        updateStats();
        updateRecentDiscoveries();
        
        // Re-enable button
        if (drawButton) {
            setTimeout(() => {
                drawButton.disabled = false;
            }, 1000);
        }
    }, 300);
}

// Initialize page based on current location
function initializePage() {
    loadGameState();
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'bestiary.html') {
        initBestiary();
    } else {
        // Index page
        updateStats();
        updateRecentDiscoveries();
        
        // Setup draw button
        const drawButton = document.getElementById('draw-button');
        if (drawButton) {
            drawButton.addEventListener('click', handleCardDraw);
        }
        
        // Setup card click to flip back
        const card = document.getElementById('main-card');
        if (card) {
            card.addEventListener('click', () => {
                if (card.classList.contains('flipped')) {
                    resetCard();
                }
            });
        }
    }
    
    // Setup modal close
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeCreatureModal);
    }
    
    // Close modal on outside click
    const modal = document.getElementById('creature-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCreatureModal();
            }
        });
    }
    
    // Initialize text splitting animation
    if (typeof Splitting !== 'undefined') {
        Splitting();
        
        // Animate title
        anime({
            targets: '[data-splitting] .char',
            opacity: [0, 1],
            translateY: [100, 0],
            delay: anime.stagger(50),
            duration: 1000,
            easing: 'easeOutQuart'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);