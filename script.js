// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById("potCanvas");
    const ctx = canvas.getContext("2d");

    // Set canvas internal resolution to match display size for crisp images
    function updateCanvasSize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    // Initial setup
    updateCanvasSize();
    
    // Update on window resize
    window.addEventListener('resize', updateCanvasSize);

    const totalFrames = 51;
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let clickCount = 0;
    let loadedImages = 0;
    let showText = false; // Flag to track if text should be displayed
    let completedTextLines = []; // Track which text lines have been completed
    let isTextAnimating = false; // Flag to track if text animation is currently running

    // Debug function
    function debugLog(message) {
        console.log(message);
    }

    // Load images
    for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = `images/flowerPot_animation_v03/flowerPot_animation_v03_${String(i).padStart(5, "0")}.png`;
        
        // Debug: Show the exact path being generated
        debugLog(`Trying to load: ${img.src}`);
        
        img.onload = function() {
            loadedImages++;
            debugLog(`Image ${i} loaded: ${img.src}`);
            if (loadedImages === 1) {
                drawFrame(0); // Draw first frame when it loads
            }
            if (loadedImages === totalFrames) {
                debugLog("All images loaded successfully!");
            }
        };
        
        img.onerror = function() {
            debugLog(`ERROR loading image ${i}: ${img.src}`);
        };
        
        frames.push(img);
    }

    debugLog(`Attempting to load ${totalFrames} images...`);

    function drawFrame(index) {
        if (index < 0 || index >= frames.length) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (frames[index] && frames[index].complete) {
            ctx.drawImage(frames[index], 0, 0, canvas.width, canvas.height);
            debugLog(`Drawing frame ${index}`);
        } else {
            debugLog(`Frame ${index} not ready`);
        }

        // Draw persistent text if it should be shown and not currently animating
        if (showText && !isTextAnimating) {
            drawPersistentText();
        }
    }

    function playNextSegment() {
        if (isPlaying) return;
        if (currentFrame >= totalFrames) return;
        if (loadedImages === 0) {
            debugLog("No images loaded yet, cannot play animation");
            return;
        }

        clickCount++;
        debugLog(`Click ${clickCount}, starting from frame ${currentFrame}`);

        let framesThisClick;
        if (clickCount === 1) {
            framesThisClick = 12;
        } else if (clickCount === 2) {
            framesThisClick = 12;
        } else if (clickCount === 3) {
            framesThisClick = 12;
        } else if (clickCount === 4) {
            framesThisClick = 15;
        } else {
            // Play remaining frames
            framesThisClick = totalFrames - currentFrame;
        }

        const endFrame = Math.min(currentFrame + framesThisClick, totalFrames);
        isPlaying = true;

        // Start text animation on the final click (when remaining frames will be played)
        if (clickCount >= 5 || currentFrame + framesThisClick >= totalFrames) {
            showText = true; // Enable text persistence
            isTextAnimating = true; // Mark that text animation is starting
            setTimeout(() => {
                animateStaggeredText();
            }, 300); // Short delay after click
        }

        const interval = setInterval(() => {
            drawFrame(currentFrame);
            currentFrame++;
            
            if (currentFrame >= endFrame) {
                clearInterval(interval);
                isPlaying = false;
                debugLog(`Segment complete. Current frame: ${currentFrame}`);
                
                if (currentFrame >= totalFrames) {
                    document.getElementById("growBtn").disabled = true;
                    debugLog("Animation complete - button disabled");
                }
            }
        }, 1000 / 8); // 12 fps
    }

    // Ripple effect function
    function drawRippleEffect(clickX, clickY) {
        let radius = 0;
        const maxRadius = 50;
        const duration = 600; // milliseconds
        const startTime = Date.now();
        
        function animateRipple() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                // Animation complete - redraw frame one final time to clear the ripple
                drawFrame(currentFrame);
                return;
            }
            
            // Redraw the current frame
            drawFrame(currentFrame);
            
            // Draw the ripple
            radius = progress * maxRadius;
            const opacity = 1 - progress; // Fade out as it expands
            
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(clickX, clickY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
            
            requestAnimationFrame(animateRipple);
        }
        
        animateRipple();
    }

    // Draw persistent text function
    function drawPersistentText() {
        const textLines = [
            { text: "Hooray!", direction: "left" },
            { text: "You've Got", direction: "top" },
            { text: "An", direction: "top" },
            { text: "Ugly Flower", direction: "left" }
        ];
        
        const fontSize = 25;
        const lineHeight = 30;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const leftSideX = canvas.width * 0.4;
        
        function getStartPosition(direction, lineIndex) {
            const targetY = centerY - ((textLines.length - 1) * lineHeight / 2) + (lineIndex * lineHeight);
            
            switch(direction) {
                case "left":
                    return { x: -400, y: targetY, targetX: leftSideX, targetY: targetY };
                case "right":
                    return { x: canvas.width + 400, y: targetY, targetX: leftSideX, targetY: targetY };
                case "top":
                    return { x: leftSideX, y: -100, targetX: leftSideX, targetY: targetY };
                case "bottom":
                    return { x: leftSideX, y: canvas.height + 100, targetX: leftSideX, targetY: targetY };
                default:
                    return { x: -400, y: targetY, targetX: leftSideX, targetY: targetY };
            }
        }

        // Draw all completed text lines
        for (let i = 0; i < completedTextLines.length; i++) {
            const lineData = textLines[i];
            const positions = getStartPosition(lineData.direction, i);
            
            ctx.save();
            // Use different font and color for line 4 (index 3)
            if (i === 3) {
                ctx.font = `${fontSize}px Impact`;
                ctx.fillStyle = 'rgba(99, 97, 68, 1)';
            } else {
                ctx.font = `${fontSize}px Apple Chancery`;
                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            }
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(lineData.text, positions.targetX, positions.targetY);
            ctx.restore();
        }
    }

    // Staggered text animation function
    function animateStaggeredText() {
        const textLines = [
            { text: "Hooray!", direction: "left" },
            { text: "You've Got", direction: "top" },
            { text: "An", direction: "top" },
            { text: "Ugly Flower", direction: "left" }
        ];
        
        const fontSize = 25;
        const lineHeight = 30;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const leftSideX = canvas.width * 0.4;
        
        const lineDuration = 600; // Duration for each line animation
        const staggerDelay = 120; // Delay between line starts (overlapping)
        
        // Reset completed lines for fresh animation
        completedTextLines = [];
        
        const animationStart = Date.now();
        
        // Calculate starting positions for each direction
        function getStartPosition(direction, lineIndex) {
            const targetY = centerY - ((textLines.length - 1) * lineHeight / 2) + (lineIndex * lineHeight);
            
            switch(direction) {
                case "left":
                    return { x: -400, y: targetY, targetX: leftSideX, targetY: targetY };
                case "right":
                    return { x: canvas.width + 400, y: targetY, targetX: leftSideX, targetY: targetY };
                case "top":
                    return { x: leftSideX, y: -100, targetX: leftSideX, targetY: targetY };
                case "bottom":
                    return { x: leftSideX, y: canvas.height + 100, targetX: leftSideX, targetY: targetY };
                default:
                    return { x: -400, y: targetY, targetX: leftSideX, targetY: targetY };
            }
        }
        
        function animateAllLines() {
            const elapsed = Date.now() - animationStart;
            
            // Clear canvas and draw background
            const frameToShow = currentFrame >= frames.length ? frames.length - 1 : currentFrame;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (frameToShow >= 0 && frameToShow < frames.length && frames[frameToShow] && frames[frameToShow].complete) {
                ctx.drawImage(frames[frameToShow], 0, 0, canvas.width, canvas.height);
            }
            
            let allComplete = true;
            
            // Animate each line
            for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
                const lineStartTime = lineIndex < 3 ? lineIndex * staggerDelay : (2 * staggerDelay + 200); // Delay line 4
                const lineElapsed = elapsed - lineStartTime;
                
                if (lineElapsed >= 0) {
                    const lineProgress = Math.min(lineElapsed / lineDuration, 1);
                    const easeOut = 1 - Math.pow(1 - lineProgress, 3);
                    
                    const lineData = textLines[lineIndex];
                    const positions = getStartPosition(lineData.direction, lineIndex);
                    
                    const currentX = positions.x + (easeOut * (positions.targetX - positions.x));
                    const currentY = positions.y + (easeOut * (positions.targetY - positions.y));
                    
                    ctx.save();
                    // Use different font and color for line 4 (index 3)
                    if (lineIndex === 3) {
                        ctx.font = `${fontSize}px Impact`;
                        ctx.fillStyle = 'rgba(99, 97, 68, 1)';
                    } else {
                        ctx.font = `${fontSize}px Apple Chancery`;
                        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    }
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(lineData.text, currentX, currentY);
                    ctx.restore();
                    
                    if (lineProgress < 1) {
                        allComplete = false;
                    } else if (!completedTextLines.includes(lineData)) {
                        completedTextLines.push(lineData);
                    }
                }
            }
            
            if (!allComplete) {
                requestAnimationFrame(animateAllLines);
            } else {
                isTextAnimating = false;
            }
        }
        
        animateAllLines();
    }

    // Add canvas click event listener
    canvas.addEventListener('click', function(event) {
        // Get canvas position and size
        const rect = canvas.getBoundingClientRect();
        
        // Calculate relative click position (0 to 1)
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        // Debug: Show where user clicked
        debugLog(`Click at relative position: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
        
        // Define clickable area (you'll need to adjust these values)
        // Example: center-bottom area where the pot likely is
        if (x > 0.6 && x < 0.9 && y > 0.1 && y < 0.4) {
            debugLog("Click detected in pot area!");
            
            // Only show ripple effect if animation isn't already playing AND not finished
            if (!isPlaying && currentFrame < totalFrames) {
                // Calculate actual canvas coordinates for ripple effect
                const canvasX = x * canvas.width;
                const canvasY = y * canvas.height;
                
                // Create ripple effect at click location
                drawRippleEffect(canvasX, canvasY);
            }
            
            playNextSegment();
        } else {
            debugLog("Click outside pot area");
        }
    });
});