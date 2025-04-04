document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.querySelector('.landing-page');
    const biolinkPage = document.querySelector('.biolink-page');
    const enterButton = document.querySelector('.enter-button');
    const viewCountElement = document.getElementById('viewCount');
    const videos = document.querySelectorAll('.background-video');
    const bioElement = document.querySelector('.bio');
    const bioText = "Don't go broke trying to look rich.";
    const creatorAttribution = document.querySelector('.creator-attribution');

    // Music Player
    const musicControl = document.querySelector('.music-control');
    const musicIcon = document.querySelector('.music-icon');
    const musicTrigger = document.querySelector('.music-trigger');
    const musicPopup = document.querySelector('.music-popup');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const closeBtn = document.querySelector('.close-btn');
    const audio = document.getElementById('audio-player');
    const progress = document.querySelector('.progress');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.querySelector('.volume-control i');
    
    // Initialize audio
    audio.volume = 0.5;
    let isPlaying = false;
    let isExpanded = false;

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        audio.volume = value / 100;
        updateVolumeIcon(value);
    });

    function updateVolumeIcon(value) {
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    // Volume icon click to mute/unmute
    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = 'fas fa-volume-mute';
        } else {
            audio.volume = 0.5;
            volumeSlider.value = 50;
            volumeIcon.className = 'fas fa-volume-up';
        }
    });

    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Preload video
    videos.forEach(video => {
        video.load();
        video.addEventListener('loadeddata', () => {
            // Start playing once loaded
            video.play().catch(error => {
                console.error('Video autoplay failed:', error);
            });
        });

        // Handle video loop seamlessly
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= video.duration - 0.5) {
                video.currentTime = 0;
            }
        });
    });

    // Smooth page transition
    enterButton.addEventListener('click', () => {
        // Start playing music
        audio.play();
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        document.querySelectorAll('.soundbar').forEach(bar => {
            bar.style.animationPlayState = 'running';
        });

        // Add transition class for smooth fade
        landingPage.style.opacity = '0';
        landingPage.style.pointerEvents = 'none';
        
        setTimeout(() => {
            landingPage.classList.add('hidden');
            biolinkPage.classList.remove('hidden');
            // Force reflow
            void biolinkPage.offsetWidth;
            requestAnimationFrame(() => {
                biolinkPage.classList.add('visible');
                // Show music icon after page transition
                setTimeout(() => {
                    musicControl.classList.remove('hidden');
                    musicControl.classList.add('visible');
                }, 1000);
                // Start typewriter effect after page transition
                setTimeout(() => {
                    typeWriter(bioElement, bioText);
                }, 500);
                // Show creator attribution after a delay
                setTimeout(() => {
                    creatorAttribution.classList.add('visible');
                }, 1500);
            });
        }, 800);
    });

    // Function to update view count
    async function updateViewCount() {
        try {
            // Log the view
            await fetch('/api/views', { method: 'POST' });
            
            // Get updated count
            const response = await fetch('/api/views');
            const data = await response.json();
            
            // Update the view counter
            if (viewCountElement) {
                viewCountElement.textContent = data.views.toLocaleString();
            }
        } catch (error) {
            console.error('Error updating view count:', error);
        }
    }

    // Initialize view counter
    updateViewCount();

    // Optimize performance
    document.fonts.ready.then(() => {
        document.body.style.visibility = 'visible';
    });

    // Handle visibility change to pause/resume video
    document.addEventListener('visibilitychange', () => {
        videos.forEach(video => {
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(() => {});
            }
        });
    });

    // Initialize Discord presence
    updateDiscordPresence();
    // Update Discord presence every 30 seconds
    setInterval(updateDiscordPresence, 30000);

    // Function to fetch Discord server members
    updateDiscordMembers();
    // Update member count every 5 minutes
    setInterval(updateDiscordMembers, 5 * 60 * 1000);

    // Toggle expanded view
    musicIcon.addEventListener('click', () => {
        musicIcon.classList.add('hidden');
        musicTrigger.classList.add('active');
        isExpanded = true;
        
        // Start playing when expanded
        if (!isPlaying) {
            audio.play();
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            document.querySelectorAll('.soundbar').forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        }
    });

    // Toggle popup
    musicTrigger.addEventListener('click', (e) => {
        if (!e.target.closest('.play-pause-btn') && !e.target.closest('.close-btn')) {
            musicPopup.classList.toggle('active');
        }
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (musicPopup.classList.contains('active') && 
            !e.target.closest('.music-popup') && 
            !e.target.closest('.music-trigger')) {
            musicPopup.classList.remove('active');
        }
    });

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            document.querySelectorAll('.soundbar').forEach(bar => {
                bar.style.animationPlayState = 'paused';
            });
        } else {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            document.querySelectorAll('.soundbar').forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        }
        isPlaying = !isPlaying;
    });

    // Close button
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        isExpanded = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        musicTrigger.classList.remove('active');
        musicPopup.classList.remove('active');
        musicIcon.classList.remove('hidden');
        document.querySelectorAll('.soundbar').forEach(bar => {
            bar.style.animationPlayState = 'paused';
        });
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
    });

    // Click on progress bar to seek
    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const totalWidth = progressBar.offsetWidth;
        const seekTime = (clickPosition / totalWidth) * audio.duration;
        audio.currentTime = seekTime;
    });
});

async function updateDiscordPresence() {
    try {
        const response = await fetch('http://localhost:3000/api/discord-presence');
        const data = await response.json();

        // Update avatar
        const avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`;
        document.getElementById('discordAvatar').src = avatarUrl;

        // Update username
        document.getElementById('discordUsername').textContent = data.username;

        // Update status
        const statusElement = document.getElementById('discordStatus');
        statusElement.className = 'discord-status ' + (data.status || 'offline');

        // Update activity
        const activityElement = document.getElementById('discordActivity');
        const activityText = activityElement.querySelector('.activity-text');
        
        if (data.activities && data.activities.length > 0) {
            const activity = data.activities[0];
            let activityString = '';
            
            switch (activity.type) {
                case 0: // Playing
                    activityString = `<i class="fas fa-gamepad"></i> Playing ${activity.name}`;
                    break;
                case 1: // Streaming
                    activityString = `<i class="fas fa-broadcast-tower"></i> Streaming ${activity.name}`;
                    break;
                case 2: // Listening
                    activityString = `<i class="fas fa-headphones"></i> Listening to ${activity.name}`;
                    break;
                case 3: // Watching
                    activityString = `<i class="fas fa-tv"></i> Watching ${activity.name}`;
                    break;
                case 4: // Custom
                    activityString = activity.state || '';
                    break;
                case 5: // Competing
                    activityString = `<i class="fas fa-trophy"></i> Competing in ${activity.name}`;
                    break;
            }
            
            activityText.innerHTML = activityString;
        } else {
            activityText.innerHTML = '';
        }
    } catch (error) {
        console.error('Error updating Discord presence:', error);
    }
}

// Function to fetch Discord server members
async function updateDiscordMembers() {
    try {
        const response = await fetch(`https://discord.com/api/v9/invites/E13Services?with_counts=true`);
        const data = await response.json();
        
        if (data.approximate_member_count) {
            const memberCountElement = document.querySelector('.discord-server-members');
            const onlineCount = data.approximate_presence_count;
            const totalCount = data.approximate_member_count;
            const offlineCount = totalCount - onlineCount;
            
            memberCountElement.innerHTML = `<span style="color: #3ba55c">●</span> ${onlineCount.toLocaleString()} Online <span style="color: #747f8d">●</span> ${offlineCount.toLocaleString()} Offline`;
        }
    } catch (error) {
        console.error('Error fetching Discord members:', error);
    }
}

// Anti-inspect element code
function addAntiInspectElement() {
    const style = `
        .access-denied-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-family: 'Courier New', monospace;
        }
        .access-denied-content {
            text-align: center;
            animation: glitch 725ms infinite;
        }
        .access-denied-logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            filter: invert(1);
        }
        .access-denied-title {
            font-size: 2em;
            color: #ff0000;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .access-denied-text {
            color: #ff0000;
            margin: 10px 0;
            font-size: 1.2em;
        }
        .system-text {
            color: #00ff00;
            margin: 5px 0;
            font-size: 0.9em;
            opacity: 0.8;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.innerText = style;
    document.head.appendChild(styleSheet);

    const overlay = document.createElement('div');
    overlay.className = 'access-denied-overlay';
    overlay.innerHTML = `
        <div class="access-denied-content">
            <img src="media/discord-logo-0.webp" class="access-denied-logo">
            <div class="access-denied-title">Access Denied</div>
            <div class="access-denied-text">Source Code Access Blocked</div>
            <div class="system-text">[SECURITY] > Unauthorized inspection attempt detected</div>
            <div class="system-text">[SYSTEM] > Source access prohibited</div>
            <div class="system-text">[ALERT] > Security measures activated</div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// DevTools Detection
function detectDevTools() {
    const devtools = {
        isOpen: false,
        orientation: undefined
    };

    const threshold = 160;
    let reloadTimeout;

    function startTypingAnimation() {
        const lines = document.querySelectorAll('.terminal-line');
        let delay = 0;
        const typingDelay = 1000; // 1 second per line

        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('typing');
                // Add typed class to previous line to remove blinking cursor
                if (index > 0) {
                    lines[index - 1].classList.add('typed');
                }
            }, delay);
            delay += typingDelay;
        });

        // Set reload timeout after all lines have typed
        const totalDuration = (lines.length * typingDelay) + 1000;
        reloadTimeout = setTimeout(() => {
            const hackerOverlay = document.querySelector('.hacker-overlay');
            hackerOverlay.style.opacity = '0';
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }, totalDuration);
    }

    const emitEvent = (isOpen, orientation) => {
        devtools.isOpen = isOpen;
        devtools.orientation = orientation;
        
        const hackerOverlay = document.querySelector('.hacker-overlay');
        const landingPage = document.querySelector('.landing-page');
        const biolinkPage = document.querySelector('.biolink-page');
        const musicControl = document.querySelector('.music-control');
        
        if (isOpen) {
            // Clear any existing reload timeout
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }

            // Reset all lines
            document.querySelectorAll('.terminal-line').forEach(line => {
                line.classList.remove('typing', 'typed');
            });

            // Hide all content immediately
            landingPage.style.display = 'none';
            biolinkPage.style.display = 'none';
            musicControl.style.display = 'none';
            
            // Show hacker overlay with flex display
            hackerOverlay.style.display = 'flex';
            hackerOverlay.style.opacity = '1';
            
            // Start the typing animation
            startTypingAnimation();
        }
    };

    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        const orientation = widthThreshold ? 'vertical' : 'horizontal';

        if (
            !(heightThreshold && widthThreshold) &&
            ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
        ) {
            if (!devtools.isOpen || devtools.orientation !== orientation) {
                emitEvent(true, orientation);
            }
        }
    }, 100);

    // Also detect right-click and F12
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        emitEvent(true, 'unknown');
    });

    window.addEventListener('keydown', function (e) {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            emitEvent(true, 'unknown');
        }
    });
}

// Initialize DevTools detection
detectDevTools(); 