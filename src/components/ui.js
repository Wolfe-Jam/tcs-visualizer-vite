import * as THREE from 'three';

// Calculate complementary color
function calculateComplementaryColor(hexColor) {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Invert the colors (255 - value)
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    // Convert back to hex
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
}

// Update color display and visualization
export function updateColorDisplay(hexColor, visualization) {
    try {
        // Remove # if present for calculations
        const cleanHex = hexColor.replace('#', '');
        
        // Calculate complementary color
        const complementaryColor = calculateComplementaryColor(hexColor);
        
        // Update UI elements
        const colorHexInput = document.getElementById('colorHex');
        const complementaryHexInput = document.getElementById('complementaryColorHex');
        
        // Update with uppercase HEX values
        const upperHexColor = hexColor.toUpperCase();
        const upperComplementaryColor = complementaryColor.toUpperCase();
        
        // Update input values
        if (colorHexInput) colorHexInput.value = upperHexColor;
        if (complementaryHexInput) complementaryHexInput.value = upperComplementaryColor;
        
        // Update swatch colors
        document.getElementById('colorSwatch').style.backgroundColor = hexColor;
        document.getElementById('complementaryColorSwatch').style.backgroundColor = complementaryColor;
        
        // Update gradient bar
        const gradientBar = document.getElementById('gradientBar');
        if (gradientBar) {
            gradientBar.style.backgroundImage = `linear-gradient(to right, ${hexColor}, ${complementaryColor})`;
        }
        
        // No color picker button indicator to update
        
        // Update visualization if available
        if (visualization) {
            visualization.setColor(new THREE.Color(hexColor));
            visualization.setComplementaryColor(new THREE.Color(complementaryColor));
        }
    } catch (error) {
        console.error('Error updating color display:', error);
    }
}

// Setup all UI event listeners
export function setupUI(visualization) {
    // Color picker event listener
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            updateColorDisplay(e.target.value, visualization);
        });
    }
    
    // HEX input field event listener
    const colorHexInput = document.getElementById('colorHex');
    if (colorHexInput) {
        colorHexInput.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Ensure the value starts with #
            if (!value.startsWith('#')) {
                value = '#' + value;
                colorHexInput.value = value;
            }
            
            // Validate hex color format
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (hexRegex.test(value)) {
                // Convert to 6-digit hex if it's 3-digit
                if (value.length === 4) {
                    const r = value[1];
                    const g = value[2];
                    const b = value[3];
                    value = `#${r}${r}${g}${g}${b}${b}`;
                    colorHexInput.value = value;
                }
                
                // Update color picker and visualization
                colorPicker.value = value;
                updateColorDisplay(value, visualization);
            }
        });
        
        // Update on blur to ensure valid format
        colorHexInput.addEventListener('blur', (e) => {
            let value = e.target.value;
            
            // Default to a valid color if invalid
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexRegex.test(value)) {
                value = colorPicker.value;
                colorHexInput.value = value.toUpperCase();
            }
        });
    }
    
    // Complementary HEX input field event listener
    const complementaryHexInput = document.getElementById('complementaryColorHex');
    if (complementaryHexInput) {
        complementaryHexInput.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Ensure the value starts with #
            if (!value.startsWith('#')) {
                value = '#' + value;
                complementaryHexInput.value = value;
            }
            
            // Validate hex color format
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (hexRegex.test(value)) {
                // Convert to 6-digit hex if it's 3-digit
                if (value.length === 4) {
                    const r = value[1];
                    const g = value[2];
                    const b = value[3];
                    value = `#${r}${r}${g}${g}${b}${b}`;
                    complementaryHexInput.value = value;
                }
                
                // Calculate the new main color (inverse of complementary)
                const mainColor = calculateComplementaryColor(value);
                
                // Update the visualization with the new colors
                visualization.setColor(new THREE.Color(mainColor));
                visualization.setComplementaryColor(new THREE.Color(value));
                
                // Update UI elements
                document.getElementById('colorSwatch').style.backgroundColor = mainColor;
                document.getElementById('complementaryColorSwatch').style.backgroundColor = value;
                colorHexInput.value = mainColor.toUpperCase();
                
                // Update gradient bar
                const gradientBar = document.getElementById('gradientBar');
                if (gradientBar) {
                    gradientBar.style.backgroundImage = `linear-gradient(to right, ${mainColor}, ${value})`;
                }
            }
        });
        
        // Update on blur to ensure valid format
        complementaryHexInput.addEventListener('blur', (e) => {
            let value = e.target.value;
            
            // Default to a valid color if invalid
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexRegex.test(value)) {
                // Reset to the current complementary color
                value = complementaryHexInput.value;
                complementaryHexInput.value = value.toUpperCase();
            }
        });
    }
    
    // Add click events to color swatches and gradient bar
    const colorSwatch = document.getElementById('colorSwatch');
    const complementaryColorSwatch = document.getElementById('complementaryColorSwatch');
    const gradientBar = document.getElementById('gradientBar');
    const complementaryColorHexInput = document.getElementById('complementaryColorHex');
    
    // Function to open color picker
    const openColorPicker = (e) => {
        // Prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
        
        // Open the color picker
        colorPicker.click();
    };
    
    // Function to promote complementary color to main color
    const promoteComplementaryColor = (e) => {
        // Prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
        
        // Get the complementary color
        const complementaryColor = complementaryColorHexInput.value;
        
        // Set it as the main color
        colorPicker.value = complementaryColor;
        updateColorDisplay(complementaryColor, visualization);
    };
    
    // Add click event listeners
    if (colorSwatch) colorSwatch.addEventListener('click', openColorPicker);
    if (complementaryColorSwatch) complementaryColorSwatch.addEventListener('click', promoteComplementaryColor);
    if (gradientBar) gradientBar.addEventListener('click', openColorPicker);
    
    // Rotation speed slider
    const rotationSpeedSlider = document.getElementById('rotationSpeed');
    if (rotationSpeedSlider) {
        rotationSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            visualization.setRotationSpeed(speed);
        });
    }
    
    // Reset camera button
    const resetCameraButton = document.getElementById('resetCamera');
    if (resetCameraButton) {
        resetCameraButton.addEventListener('click', () => {
            visualization.resetCamera();
        });
    }
    
    // Set camera button
    const setCameraButton = document.getElementById('setCamera');
    if (setCameraButton) {
        setCameraButton.addEventListener('click', () => {
            visualization.setCurrentCameraAsDefault();
            
            // Log camera position for reference
            console.log('Camera Position:', {
                position: {
                    x: visualization.camera.position.x,
                    y: visualization.camera.position.y,
                    z: visualization.camera.position.z
                },
                target: {
                    x: visualization.controls.target.x,
                    y: visualization.controls.target.y,
                    z: visualization.controls.target.z
                }
            });
        });
    }
    
    // Zoom to fit button
    const zoomToFitButton = document.getElementById('zoomToFit');
    if (zoomToFitButton) {
        zoomToFitButton.addEventListener('click', () => {
            visualization.zoomToFit();
        });
    }
    
    // Lining toggle (formerly gradient toggle)
    const gradientToggle = document.getElementById('gradientToggle');
    if (gradientToggle) {
        gradientToggle.addEventListener('change', (e) => {
            visualization.toggleGradient(e.target.checked);
        });
    }
    
    // Tonal toggle (for gray/tonal lining)
    const grayLiningToggle = document.getElementById('grayLiningToggle');
    if (grayLiningToggle) {
        grayLiningToggle.addEventListener('change', (e) => {
            visualization.toggleGrayLining(e.target.checked);
        });
    }
    
    // Circular gradient toggle
    const circularGradientToggle = document.getElementById('circularGradientToggle');
    if (circularGradientToggle) {
        circularGradientToggle.addEventListener('change', (e) => {
            visualization.toggleCircularGradient(e.target.checked);
        });
    }
    
    // Reset button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Reset all toggles to their default state (unchecked)
            if (gradientToggle) gradientToggle.checked = false;
            if (grayLiningToggle) grayLiningToggle.checked = false;
            if (circularGradientToggle) circularGradientToggle.checked = false;
            if (rotationToggle) rotationToggle.checked = false;
            
            // Reset visualization to default state
            visualization.resetToDefaultView();
        });
    }
    
    // Rotation toggle
    const rotationToggle = document.getElementById('rotationToggle');
    if (rotationToggle) {
        rotationToggle.addEventListener('change', (e) => {
            visualization.toggleRotation(e.target.checked);
        });
    }
    
    // Grid toggle
    const gridToggle = document.getElementById('gridToggle');
    if (gridToggle) {
        gridToggle.addEventListener('change', (e) => {
            visualization.toggleGrid(e.target.checked);
        });
    }
    
    // Invert Mesh Color toggle
    const invertGridColorToggle = document.getElementById('invertGridColorToggle');
    if (invertGridColorToggle) {
        invertGridColorToggle.addEventListener('change', (e) => {
            visualization.toggleMeshColorInversion(e.target.checked);
        });
    }
    
    // Show Mesh toggle
    const showMeshToggle = document.getElementById('showMeshToggle');
    if (showMeshToggle) {
        showMeshToggle.addEventListener('change', (e) => {
            visualization.toggleMesh(e.target.checked);
        });
    }
    
    // Transparency level slider
    const transparencySlider = document.getElementById('transparencyLevel');
    if (transparencySlider) {
        // Set initial value from visualization
        transparencySlider.value = visualization.transparencyLevel;
        
        // Update when slider is moved
        transparencySlider.addEventListener('input', (e) => {
            const level = parseFloat(e.target.value);
            visualization.setTransparencyLevel(level);
        });
    }
    
    // Display mode radio buttons
    const displayModeRadios = document.querySelectorAll('input[name="displayMode"]');
    if (displayModeRadios.length > 0) {
        // Add event listeners to all radio buttons
        displayModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Update the visualization display mode
                    visualization.setDisplayMode(e.target.value);
                    
                    // Update the UI - highlight the selected option
                    document.querySelectorAll('.display-mode-btn').forEach(btn => {
                        btn.classList.remove('selected');
                        btn.style.backgroundColor = 'var(--selector-bg)';
                        btn.style.color = 'var(--selector-text)';
                        btn.style.fontWeight = 'normal';
                    });
                    
                    // Add selected class and styling to the selected option
                    const selectedBtn = e.target.parentElement;
                    selectedBtn.classList.add('selected');
                    selectedBtn.style.backgroundColor = 'var(--selector-active-bg)';
                    selectedBtn.style.color = 'var(--selector-active-text)';
                    selectedBtn.style.fontWeight = 'bold';
                }
            });
        });
    }
    
    // Theme toggle (dark/light mode)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Check for user preference in localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
            if (visualization) {
                visualization.setTheme(true);
            }
        }
        
        themeToggle.addEventListener('change', (e) => {
            const isDarkMode = e.target.checked;
            
            // Update HTML attribute for CSS variables
            document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
            
            // Update visualization theme
            if (visualization) {
                visualization.setTheme(isDarkMode);
            }
            
            // Save preference to localStorage
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }
    
    // Advanced Settings toggle with the collapse button
    const advancedSettingsContent = document.getElementById('advancedSettingsContent');
    const advancedSettingsHeader = document.getElementById('advancedSettingsHeader');
    const collapseAdvancedBtn = document.getElementById('collapseAdvanced');
    
    if (advancedSettingsHeader && collapseAdvancedBtn && advancedSettingsContent) {
        // Function to toggle the advanced settings panel
        const toggleAdvancedSettings = () => {
            const isCollapsed = advancedSettingsContent.style.display === 'none';
            
            if (isCollapsed) {
                // Expand
                advancedSettingsContent.style.display = 'block';
                collapseAdvancedBtn.textContent = '▲';
            } else {
                // Collapse
                advancedSettingsContent.style.display = 'none';
                collapseAdvancedBtn.textContent = '▼';
            }
        };
        
        // Add click event to both the header and the collapse button
        advancedSettingsHeader.addEventListener('click', toggleAdvancedSettings);
        collapseAdvancedBtn.addEventListener('click', toggleAdvancedSettings);
    }
    
    // Curved Stem toggle
    const curvedStemToggle = document.getElementById('curvedStemToggle');
    if (curvedStemToggle) {
        // Set initial state based on visualization's property
        curvedStemToggle.checked = visualization.useCurvedStem;
        
        curvedStemToggle.addEventListener('change', (e) => {
            visualization.toggleCurvedStem(e.target.checked);
        });
    }
    
    // Stem Offset Slider
    const stemOffsetSlider = document.getElementById('stemOffsetSlider');
    if (stemOffsetSlider) {
        // Set initial value from visualization
        stemOffsetSlider.value = visualization.stemMaxOffset;
        
        // Update when slider is moved
        stemOffsetSlider.addEventListener('input', (e) => {
            const offset = parseFloat(e.target.value);
            visualization.setStemOffset(offset);
        });
    }
    
    // Initialize with default color
    updateColorDisplay('#FF5733', visualization);
}
