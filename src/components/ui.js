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
        document.getElementById('colorHex').textContent = hexColor;
        document.getElementById('colorSwatch').style.backgroundColor = hexColor;
        document.getElementById('complementaryColorSwatch').style.backgroundColor = complementaryColor;
        
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
        });
    }
    
    // Gradient toggle
    const gradientToggle = document.getElementById('gradientToggle');
    if (gradientToggle) {
        gradientToggle.addEventListener('change', (e) => {
            visualization.toggleGradient(e.target.checked);
        });
    }
    
    // Grid toggle
    const gridToggle = document.getElementById('gridToggle');
    if (gridToggle) {
        gridToggle.addEventListener('change', (e) => {
            visualization.toggleGrid(e.target.checked);
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
                    document.querySelectorAll('.display-mode-selector label').forEach(label => {
                        label.style.backgroundColor = '';
                        label.style.color = '';
                    });
                    
                    e.target.parentElement.style.backgroundColor = '#3498db';
                    e.target.parentElement.style.color = 'white';
                }
            });
        });
    }
    
    // Initialize with default color
    updateColorDisplay('#FF5733', visualization);
}
