// =============== GLOBAL VARIABLES ===============
let worksData = [];
let allWorkItems = [];

// =============== LOAD AND RENDER WORKS ===============
async function loadWorksData() {
    try {
        const response = await fetch('works-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        worksData = data.works;
        renderWorks();
        initializeAllFunctionality();
    } catch (error) {
        console.error('Error loading works data:', error);
        document.getElementById('all-container').innerHTML = 
            '<p style="color: red; text-align: center;">Error loading works. Please refresh the page.</p>';
    }
}

// Create HTML for a single work item
function createWorkItem(work) {
    const platformLinks = work.platforms.map(platform => 
        `<a href="${platform.url}" target="_blank" class="platform-link">${platform.name}</a>`
    ).join('\n                    ');
    
    const titleDisplay = work.titleChinese ? 
        `${work.title} &nbsp; ${work.titleChinese}` : 
        work.title;
    
    return `
        <div class="work-item" data-id="${work.id}">
            <div class="work-year">${work.date}</div>
            <h3 class="work-title">${titleDisplay}</h3>
            <div class="work-role">Role: ${work.role}</div>
            <p class="work-description">${work.description}</p>
            <div class="platform-links">
                ${platformLinks}
            </div>
        </div>
    `;
}

// Render works into their containers
function renderWorks() {
    // Render all works
    const allContainer = document.getElementById('all-container');
    if (allContainer) {
        allContainer.classList.remove('loading');
        allContainer.innerHTML = worksData.map(work => createWorkItem(work)).join('');
    }
    
    // Render by category
    const categoryMap = {
        'dramas': 'dramas-container',
        'movies': 'movies-container',
        'stage performances': 'stage-performances-container',
        'variety': 'variety-container'
    };
    
    Object.entries(categoryMap).forEach(([category, containerId]) => {
        const container = document.getElementById(containerId);
        if (container) {
            const categoryWorks = worksData.filter(work => 
                work.category.includes(category)
            );
            container.innerHTML = categoryWorks.map(work => createWorkItem(work)).join('');
        }
    });
    
    // Update global reference to all work items
    allWorkItems = document.querySelectorAll('.work-item');
}

// =============== INITIALIZE ALL FUNCTIONALITY ===============
function initializeAllFunctionality() {
    initializeTabs();
    initializeSearch();
    initializeBackToTop();
    initializeTermsToggle();
    initializeMusicPlayer();
    initializeCarousel();
}

// =============== TAB FUNCTIONALITY ===============
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contentSections = document.querySelectorAll('.content-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('youtube-tab')) {
                window.location.href = 'https://canadaxfx.github.io/XZYT/';
                return;
            }

            tabs.forEach(t => t.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            tab.classList.add('active');
            
            const sectionId = tab.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            if (window.clearSearch) {
                window.clearSearch();
            }
        });
    });
}

// =============== SEARCH FUNCTIONALITY ===============
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search');
    const searchResultsCount = document.getElementById('search-results-count');
    
    function highlightText(element, searchTerm) {
        if (!element) return;
        
        const content = element.innerHTML;
        const pattern = new RegExp(searchTerm, 'gi');
        
        if (pattern.test(content)) {
            const newContent = content.replace(pattern, match => `<span class="highlight">${match}</span>`);
            element.innerHTML = newContent;
        }
    }

    function removeHighlights(item) {
        const highlightedElements = item.querySelectorAll('.highlight');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
    }

    function clearSearch() {
        searchInput.value = '';
        searchResultsCount.textContent = '';
        
        allWorkItems.forEach(item => {
            item.classList.remove('hidden');
            removeHighlights(item);
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            allWorkItems.forEach(item => {
                item.classList.remove('hidden');
                removeHighlights(item);
            });
            searchResultsCount.textContent = '';
            return;
        }
        
        let matchCount = 0;
        
        allWorkItems.forEach(item => {
            const title = item.querySelector('.work-title')?.textContent.toLowerCase() || '';
            const year = item.querySelector('.work-year')?.textContent.toLowerCase() || '';
            const role = item.querySelector('.work-role')?.textContent.toLowerCase() || '';
            const description = item.querySelector('.work-description')?.textContent.toLowerCase() || '';
            
            const isMatch = title.includes(searchTerm) || 
                            year.includes(searchTerm) || 
                            role.includes(searchTerm) || 
                            description.includes(searchTerm);
            
            if (isMatch) {
                item.classList.remove('hidden');
                matchCount++;
                
                removeHighlights(item);
                highlightText(item.querySelector('.work-title'), searchTerm);
                highlightText(item.querySelector('.work-year'), searchTerm);
                highlightText(item.querySelector('.work-role'), searchTerm);
                highlightText(item.querySelector('.work-description'), searchTerm);
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show "All Works" section for search results
        const tabs = document.querySelectorAll('.tab');
        const contentSections = document.querySelectorAll('.content-section');
        
        tabs.forEach(t => t.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        const allTab = document.querySelector('[data-section="all"]');
        allTab.classList.add('active');
        document.getElementById('all').classList.add('active');
        
        searchResultsCount.textContent = `Found ${matchCount} result${matchCount !== 1 ? 's' : ''}`;
    }

    // Make clearSearch available globally
    window.clearSearch = clearSearch;

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    clearSearchButton.addEventListener('click', clearSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// =============== BACK TO TOP FUNCTIONALITY ===============
function initializeBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============== TERMS TOGGLE ===============
function initializeTermsToggle() {
    const termsToggle = document.getElementById('terms-toggle');
    if (termsToggle) {
        termsToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const termsContent = document.getElementById('terms-content');
            if (termsContent.style.display === 'none' || !termsContent.style.display) {
                termsContent.style.display = 'block';
                this.textContent = 'Hide Terms of Use';
                
                setTimeout(() => {
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start'
                    });
                }, 100);
            } else {
                termsContent.style.display = 'none';
                this.textContent = 'See Terms of Use';
            }
        });
    }
}

// =============== MUSIC PLAYER ===============
function initializeMusicPlayer() {
    const originalPlaylist = [
        { name: "XZ-岁岁年年", file: "岁岁年年.mp3" },
        { name: "XZ-都一样", file: "都一样.mp3" },
        { name: "XZ-灯塔", file: "灯塔.mp3" },
        { name: "XZ-漂流", file: "漂流.mp3" },
        { name: "XZ-不要回头", file: "不要回头.mp3" },
        { name: "XZ-如愿", file: "如愿.mp3" },
        { name: "XZ-同路人", file: "同路人.mp3" },
        { name: "XZ-得闲谨制", file: "得闲谨制.mp3" },
    ];
    
    let playlist = [...originalPlaylist];
    const audioElement = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const prevButton = document.getElementById('prev-track');
    const nextButton = document.getElementById('next-track');
    const shuffleButton = document.getElementById('shuffle-toggle');
    const trackNameDisplay = document.getElementById('track-name');
    
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    
    function loadTrack(index) {
        const track = playlist[index];
        audioElement.src = track.file;
        audioElement.load();
        trackNameDisplay.textContent = track.name;
        trackNameDisplay.title = track.name;
        
        if (isPlaying) {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error('Playback prevented:', e);
                    isPlaying = false;
                    updatePlayButton();
                });
            }
        }
    }
    
    function updatePlayButton() {
        musicToggle.innerHTML = isPlaying ? 
            '<span class="music-icon">⏸️</span>' : 
            '<span class="music-icon">▶️</span>';
    }

    function updateShuffleButton() {
        shuffleButton.style.backgroundColor = isShuffled ? 
            '#1a252f' : 'var(--primary-color)';
    }
    
    function shuffleArray(array) {
        let currentIndex = array.length;
        let temporaryValue, randomIndex;
        
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        
        return array;
    }
    
    function toggleShuffle() {
        const currentTrack = playlist[currentTrackIndex];
        
        if (isShuffled) {
            playlist = [...originalPlaylist];
            isShuffled = false;
        } else {
            playlist = shuffleArray([...originalPlaylist]);
            isShuffled = true;
        }
        
        currentTrackIndex = playlist.findIndex(track => 
            track.file === currentTrack.file);
        
        if (currentTrackIndex === -1) currentTrackIndex = 0;
        
        updateShuffleButton();
    }
    
    function toggleMusic() {
        if (isPlaying) {
            audioElement.pause();
        } else {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error('Playback prevented:', e);
                });
            }
        }
        isPlaying = !isPlaying;
        updatePlayButton();
    }
    
    function playPreviousTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    }
    
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    }
    
    // Event listeners
    musicToggle.addEventListener('click', toggleMusic);
    prevButton.addEventListener('click', playPreviousTrack);
    nextButton.addEventListener('click', playNextTrack);
    shuffleButton.addEventListener('click', toggleShuffle);
    
    audioElement.addEventListener('ended', function() {
        playNextTrack();
    });
    
    audioElement.addEventListener('error', function(e) {
        console.error('Audio loading error:', e);
    });
    
    // Initialize
    loadTrack(currentTrackIndex);
    audioElement.volume = 0.5;
    updateShuffleButton();
}

// =============== BACKGROUND CAROUSEL ===============
function initializeCarousel() {
    const imagePaths = [
        'xiao-zhan1-1.jpg', 'xiao-zhan1-2.jpg', 'xiao-zhan1-3.jpg', 'xiao-zhan1-4.jpg',
        'xiao-zhan1-5.jpg', 'xiao-zhan1-6.jpg', 'xiao-zhan1-7.jpg', 'xiao-zhan1-8.jpg',
        'xiao-zhan1-9.jpg', 'xiao-zhan1-10.jpg', 'xiao-zhan1-11.jpg', 'xiao-zhan1-12.jpg',
        'xiao-zhan1-13.jpg', 'xiao-zhan1-14.jpg', 'xiao-zhan1-15.jpg', 'xiao-zhan1-16.jpg',
        'xiao-zhan1-17.jpg', 'xiao-zhan1-18.jpg', 'xiao-zhan2-1.jpg', 'xiao-zhan2-2.jpg',
        'xiao-zhan2-3.jpg', 'xiao-zhan2-4.png', 'xiao-zhan2-5.jpeg','xiao-zhan3-1.jpg'
    ];
    
    const imageStrip = document.querySelector('.image-strip');
    const carouselContainer = document.querySelector('.header-bg-carousel');
    
    if (!imageStrip || !carouselContainer) {
        console.error('Carousel elements not found');
        return;
    }

    imageStrip.innerHTML = '';
    
    function createImageSet() {
        const fragment = document.createDocumentFragment();
        imagePaths.forEach((path, index) => {
            const img = document.createElement('img');
            img.src = path;
            img.alt = `Xiao Zhan Photo ${index + 1}`;
            img.className = 'carousel-image';
            img.loading = 'eager';
            fragment.appendChild(img);
        });
        return fragment;
    }
    
    // Create 4 sets for seamless loop
    imageStrip.appendChild(createImageSet());
    imageStrip.appendChild(createImageSet());
    imageStrip.appendChild(createImageSet());
    imageStrip.appendChild(createImageSet());
    
    let animationId = null;
    let isPaused = false;
    let startTime = null;
    let currentPosition = 0;
    
    function animateCarousel(timestamp) {
        if (isPaused) {
            animationId = requestAnimationFrame(animateCarousel);
            return;
        }
        
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const singleSetWidth = imageStrip.scrollWidth / 4;
        const scrollDuration = 30000;
        
        currentPosition = -(elapsed * singleSetWidth / scrollDuration);
        imageStrip.style.transform = `translate3d(${currentPosition}px, 0, 0)`;
        
        if (Math.abs(currentPosition) >= singleSetWidth) {
            startTime = timestamp;
            currentPosition = 0;
            imageStrip.style.transform = `translate3d(0, 0, 0)`;
        }
        
        animationId = requestAnimationFrame(animateCarousel);
    }
    
    function preloadImages() {
        let imagesLoaded = 0;
        const totalImages = imagePaths.length;
        
        imagePaths.forEach(src => {
            const img = new Image();
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    animationId = requestAnimationFrame(animateCarousel);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    animationId = requestAnimationFrame(animateCarousel);
                }
            };
            img.src = src;
        });
    }
    
    preloadImages();
    
    // Pause on hover
    document.querySelector('header').addEventListener('mouseenter', function() {
        isPaused = true;
    });
    
    document.querySelector('header').addEventListener('mouseleave', function() {
        isPaused = false;
    });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            isPaused = true;
        } else {
            isPaused = false;
        }
    });
}

// =============== START APPLICATION ===============
document.addEventListener('DOMContentLoaded', function() {
    loadWorksData();
});