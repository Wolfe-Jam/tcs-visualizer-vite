import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class EnhancedTCMVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cylinder = null;
        this.innerCylinder = null;
        this.centerLine = null;
        this.knitPattern = null;
        this.gridHelper = null;
        this.rotationSpeed = 0.005;
        this.showGradient = false;
        this.showGrid = true; // Default to showing grid
        this.displayMode = 'semi-transparent'; // Options: 'knit-pattern', 'semi-transparent', 'solid'
        this.currentColor = new THREE.Color(0xFF5733);
        this.complementaryColor = new THREE.Color(0x33B5FF);
        this.grayLiningColor = new THREE.Color(0x666666); // Gray color for lining
        this.useGrayLining = false; // Default to complementary color lining
        this.showCircularGradient = false; // Default to no circular gradient
        this.isDarkMode = false; // Default to light mode
        this.originalCylinderMaterial = null; // Store original material
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.createVisualization();
        this.animate();
        
        return this;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        // Set initial background color based on theme
        this.updateSceneBackground();
        
        // Add a grid helper for better spatial awareness
        this.gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(this.gridHelper);
        
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Set a better default camera position - closer and tilted forward
        this.camera.position.set(0, 3, 4);
        this.camera.lookAt(0, 0, 0);
        
        // Store default position for reset functionality
        this.defaultCameraPosition = {
            position: new THREE.Vector3(0, 3, 4),
            lookAt: new THREE.Vector3(0, 0, 0)
        };
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const container = document.getElementById('visualization');
            if (container) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            }
        });
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        const container = document.getElementById('visualization');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(this.renderer.domElement);
        } else {
            console.error('Visualization container not found');
        }
    }
    
    setupControls() {
        // Use the imported OrbitControls class
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        console.log('Successfully created OrbitControls');
        
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        
        // Slightly tilt the controls for a better view
        this.controls.maxPolarAngle = Math.PI * 0.85; // Limit how far you can orbit vertically
    }
    
    setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
    }
    
    createVisualization() {
        // Create cylinder geometry for the outer shell
        const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 3, 32, 1, true);
        
        // Create core TCS shader material with vertical gradient (black-color-white)
        const tcsMaterial = this.createTCSMaterial();
        
        // Create a backup standard material for compatibility
        const standardMaterial = new THREE.MeshStandardMaterial({
            color: this.currentColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        this.cylinder = new THREE.Mesh(cylinderGeometry, tcsMaterial);
        this.originalCylinderMaterial = standardMaterial.clone(); // Store original material for fallback
        this.scene.add(this.cylinder);
        
        // Create inner cylinder for depth perception
        const innerCylinderGeometry = new THREE.CylinderGeometry(0.9, 0.9, 3, 32, 1, true);
        const innerCylinderMaterial = new THREE.MeshStandardMaterial({
            color: this.currentColor,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.5
        });
        this.innerCylinder = new THREE.Mesh(innerCylinderGeometry, innerCylinderMaterial);
        this.scene.add(this.innerCylinder);
        
        // Create knit pattern mesh (hidden by default)
        this.createKnitPattern();
        
        // Store original materials for later reference
        this.originalMaterials = {
            cylinder: this.cylinder.material.clone(),
            innerCylinder: this.innerCylinder.material.clone()
        };
        
        // Create center line to represent material absorption
        const centerLineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const centerLineMaterial = new THREE.MeshStandardMaterial({
            color: this.currentColor,
            emissive: this.currentColor,
            emissiveIntensity: 0.5
        });
        this.centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        this.scene.add(this.centerLine);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Auto-rotate the visualization
        if (this.cylinder && this.innerCylinder && this.centerLine) {
            this.cylinder.rotation.y += this.rotationSpeed;
            this.innerCylinder.rotation.y += this.rotationSpeed;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    createTCSMaterial() {
        // Create a shader material for the core TCS vertical gradient
        return new THREE.ShaderMaterial({
            uniforms: {
                mainColor: { value: this.currentColor }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 mainColor;
                varying vec2 vUv;
                
                void main() {
                    // vUv.y ranges from 0 (bottom) to 1 (top)
                    // Create a vertical gradient: black -> main color -> white
                    vec3 color;
                    
                    if (vUv.y < 0.5) {
                        // Bottom half: black to main color
                        float t = vUv.y * 2.0; // Normalize to 0-1 range
                        color = mix(vec3(0.0, 0.0, 0.0), mainColor, t);
                    } else {
                        // Top half: main color to white
                        float t = (vUv.y - 0.5) * 2.0; // Normalize to 0-1 range
                        color = mix(mainColor, vec3(1.0, 1.0, 1.0), t);
                    }
                    
                    gl_FragColor = vec4(color, 0.8); // 0.8 for slight transparency
                }
            `,
            side: THREE.DoubleSide,
            transparent: true
        });
    }
    
    setColor(color) {
        this.currentColor = color;
        
        // Update materials
        if (this.cylinder && this.innerCylinder && this.centerLine) {
            // For shader materials, update the uniform
            if (this.cylinder.material.type === 'ShaderMaterial') {
                if (this.cylinder.material.uniforms.mainColor) {
                    this.cylinder.material.uniforms.mainColor.value = this.currentColor;
                }
                
                // For circular gradient, update both colors
                if (this.showCircularGradient && this.cylinder.material.uniforms.color1) {
                    this.cylinder.material.uniforms.color1.value = this.currentColor;
                }
            } else {
                // For standard materials, update color property
                this.cylinder.material.color = this.currentColor;
            }
            
            this.innerCylinder.material.color = this.currentColor;
            this.centerLine.material.color = this.currentColor;
            this.centerLine.material.emissive = this.currentColor;
            
            // Update knit pattern color if it exists
            if (this.knitPattern) {
                if (this.knitPattern.material) {
                    this.knitPattern.material.color = this.currentColor;
                }
                
                // Update child lines too
                this.knitPattern.children.forEach(child => {
                    if (child.material) {
                        child.material.color = this.currentColor;
                    }
                });
            }
            
            // Update original material color for future use
            if (this.originalCylinderMaterial) {
                this.originalCylinderMaterial.color = this.currentColor;
            }
        }
        
        // Update gradient if enabled
        if (this.showGradient) {
            this.updateGradient();
        }
    }
    
    setComplementaryColor(color) {
        this.complementaryColor = color;
        
        // Update gradient if enabled
        if (this.showGradient) {
            this.updateGradient();
        }
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
    
    toggleGradient(showGradient) {
        this.showGradient = showGradient;
        
        if (showGradient) {
            this.updateGradient();
        } else {
            // Reset to solid color
            this.setColor(this.currentColor);
        }
    }
    
    toggleGrayLining(useGray) {
        this.useGrayLining = useGray;
        
        if (this.showGradient) {
            // Update the gradient/lining with the new setting
            this.updateGradient();
        }
    }
    
    toggleCircularGradient(showCircularGradient) {
        this.showCircularGradient = showCircularGradient;
        
        if (this.cylinder) {
            if (showCircularGradient) {
                // Apply circular gradient material
                this.applyCircularGradient();
            } else {
                // Restore TCS core material (vertical gradient)
                this.cylinder.material = this.createTCSMaterial();
                
                // Update other elements if needed
                if (this.showGradient) {
                    this.updateGradient();
                }
            }
        }
    }
    
    /**
     * Reset the visualization to the default core view
     * - Main color only (with vertical gradient: black -> main color -> white)
     * - No lining, no tonal effects, no circular gradient
     */
    resetToDefaultView() {
        // Reset state flags
        this.showGradient = false;
        this.useGrayLining = false;
        this.showCircularGradient = false;
        
        // Restore the core TCS material (vertical gradient)
        if (this.cylinder) {
            this.cylinder.material = this.createTCSMaterial();
        }
        
        // Make sure inner cylinder is not visible (no lining)
        if (this.innerCylinder) {
            this.innerCylinder.visible = false;
        }
    }
    
    applyCircularGradient() {
        if (!this.cylinder) return;
        
        // Create a shader material for the circular gradient
        // This combines both the vertical TCS gradient and the circular gradient
        const gradientMaterial = new THREE.ShaderMaterial({
            uniforms: {
                mainColor: { value: this.currentColor },
                color2: { value: this.complementaryColor }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 mainColor;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                    // Calculate vertical gradient (TCS core functionality)
                    vec3 verticalColor;
                    if (vUv.y < 0.5) {
                        // Bottom half: black to main color
                        float t = vUv.y * 2.0;
                        verticalColor = mix(vec3(0.0, 0.0, 0.0), mainColor, t);
                    } else {
                        // Top half: main color to white
                        float t = (vUv.y - 0.5) * 2.0;
                        verticalColor = mix(mainColor, vec3(1.0, 1.0, 1.0), t);
                    }
                    
                    // Calculate circular gradient
                    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (2.0 * 3.14159) + 0.5;
                    
                    // Mix the vertical gradient with the circular gradient
                    // Use the vertical color as the first color in the circular gradient
                    vec3 finalColor = mix(verticalColor, color2, angle * 0.5);
                    
                    gl_FragColor = vec4(finalColor, 0.8);
                }
            `,
            side: THREE.DoubleSide,
            transparent: true
        });
        
        // Apply the gradient material to the cylinder
        this.cylinder.material = gradientMaterial;
    }
    
    resetCamera() {
        // Reset to default camera position
        if (this.camera && this.controls) {
            // Smoothly animate to the default position
            const duration = 1000; // milliseconds
            const startPosition = this.camera.position.clone();
            const startTime = Date.now();
            
            const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease function (cubic ease out)
                const ease = 1 - Math.pow(1 - progress, 3);
                
                // Interpolate position
                this.camera.position.lerpVectors(
                    startPosition,
                    this.defaultCameraPosition.position,
                    ease
                );
                
                // Update controls target
                this.controls.target.copy(this.defaultCameraPosition.lookAt);
                this.controls.update();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        }
    }
    
    setCurrentCameraAsDefault() {
        // Save the current camera position and target as the new default
        if (this.camera && this.controls) {
            // Store current position and controls target
            this.defaultCameraPosition = {
                position: this.camera.position.clone(),
                lookAt: this.controls.target.clone()
            };
            
            // Provide visual feedback
            const notification = document.createElement('div');
            notification.textContent = 'Camera position saved!';
            notification.style.position = 'absolute';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 150, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '1000';
            notification.style.transition = 'opacity 0.5s';
            
            const container = document.getElementById('visualization');
            if (container) {
                container.appendChild(notification);
                
                // Fade out and remove after 2 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        container.removeChild(notification);
                    }, 500);
                }, 2000);
            }
            
            return true;
        }
        return false;
    }
    
    zoomToFit() {
        if (!this.camera || !this.controls) {
            return;
        }
        
        // Use the user's preferred camera position instead of calculating one
        const newPosition = new THREE.Vector3(0.005039515598749067, 2.3361920342575657, 1.9404878995926225);
        const center = new THREE.Vector3(0, 0, 0); // Target center
        
        // Animate to the new position
        const duration = 1000; // milliseconds
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease function (cubic ease out)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            this.camera.position.lerpVectors(
                startPosition,
                newPosition,
                ease
            );
            
            // Interpolate target (look at center)
            this.controls.target.lerpVectors(
                startTarget,
                center,
                ease
            );
            
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
        
        // Provide visual feedback
        const notification = document.createElement('div');
        notification.textContent = 'Zoomed to fit';
        notification.style.position = 'absolute';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 150, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        
        const container = document.getElementById('visualization');
        if (container) {
            container.appendChild(notification);
            
            // Fade out and remove after 2 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    container.removeChild(notification);
                }, 500);
            }, 2000);
        }
    }
    
    toggleGrid(showGrid) {
        this.showGrid = showGrid;
        
        if (this.gridHelper) {
            this.gridHelper.visible = showGrid;
        }
    }
    
    createKnitPattern() {
        // Create a more detailed cylinder for the knit pattern
        const knitGeometry = new THREE.CylinderGeometry(1.01, 1.01, 3, 32, 16, true);
        
        // Create lines to represent the knit pattern
        const linesMaterial = new THREE.LineBasicMaterial({
            color: this.currentColor,
            transparent: true,
            opacity: 0.9,
            linewidth: 1 // Note: linewidth > 1 not supported in WebGL
        });
        
        // Create diagonal lines for the knit pattern
        const knitEdges = new THREE.EdgesGeometry(knitGeometry, 15); // 15 degrees threshold
        this.knitPattern = new THREE.LineSegments(knitEdges, linesMaterial);
        
        // Add additional diagonal lines to create a more textile-like pattern
        const diagonalLines = this.createDiagonalKnitLines(1.01, 3, 16, 32);
        this.knitPattern.add(diagonalLines);
        
        // Hide by default
        this.knitPattern.visible = false;
        this.scene.add(this.knitPattern);
    }
    
    createDiagonalKnitLines(radius, height, heightSegments, radialSegments) {
        const points = [];
        const angleStep = (Math.PI * 2) / radialSegments;
        const heightStep = height / heightSegments;
        
        // Create diagonal lines in both directions
        for (let i = 0; i < heightSegments; i++) {
            const y1 = (i * heightStep) - (height / 2);
            const y2 = ((i + 1) * heightStep) - (height / 2);
            
            for (let j = 0; j < radialSegments; j++) {
                const angle1 = j * angleStep;
                const angle2 = ((j + 1) % radialSegments) * angleStep;
                
                // First diagonal (bottom-left to top-right)
                const x1 = radius * Math.cos(angle1);
                const z1 = radius * Math.sin(angle1);
                const x2 = radius * Math.cos(angle2);
                const z2 = radius * Math.sin(angle2);
                
                points.push(new THREE.Vector3(x1, y1, z1));
                points.push(new THREE.Vector3(x2, y2, z2));
                
                // Second diagonal (top-left to bottom-right) - creates the cross pattern
                if (i < heightSegments - 1) {
                    points.push(new THREE.Vector3(x1, y2, z1));
                    points.push(new THREE.Vector3(x2, y1, z2));
                }
            }
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
            color: this.currentColor,
            transparent: true,
            opacity: 0.7
        }));
    }
    
    updateSceneBackground() {
        // Get the current theme background color
        const bgColor = this.isDarkMode ? 0x2a2a2a : 0xf0f0f0;
        if (this.scene) {
            this.scene.background = new THREE.Color(bgColor);
        }
    }
    
    setTheme(isDarkMode) {
        this.isDarkMode = isDarkMode;
        this.updateSceneBackground();
        
        // Update grid color for better visibility in dark mode
        if (this.gridHelper) {
            // In dark mode, make the grid lighter for better contrast
            const gridColor = this.isDarkMode ? 0x555555 : 0x888888;
            const gridCenterColor = this.isDarkMode ? 0x666666 : 0x444444;
            
            // Update grid colors (need to recreate the grid as THREE.js doesn't allow changing colors directly)
            this.scene.remove(this.gridHelper);
            this.gridHelper = new THREE.GridHelper(10, 10, gridCenterColor, gridColor);
            this.gridHelper.visible = this.showGrid;
            this.scene.add(this.gridHelper);
        }
    }
    
    setDisplayMode(mode) {
        // Valid modes: 'knit-pattern', 'semi-transparent', 'solid'
        if (!['knit-pattern', 'semi-transparent', 'solid'].includes(mode)) {
            console.error('Invalid display mode:', mode);
            return;
        }
        
        this.displayMode = mode;
        
        if (!this.cylinder || !this.innerCylinder) return;
        
        // Reset materials to original state first
        this.cylinder.material = this.originalMaterials.cylinder.clone();
        this.innerCylinder.material = this.originalMaterials.innerCylinder.clone();
        
        // Hide knit pattern by default
        if (this.knitPattern) {
            this.knitPattern.visible = false;
        }
        
        // Apply the selected display mode
        switch (mode) {
            case 'knit-pattern':
                // Knit pattern mode - show diagonal knit texture
                if (this.knitPattern) {
                    this.knitPattern.visible = true;
                    
                    // Update knit pattern color to match current color
                    if (this.knitPattern.material) {
                        this.knitPattern.material.color = this.currentColor;
                    }
                    
                    // Make children lines match color too
                    this.knitPattern.children.forEach(child => {
                        if (child.material) {
                            child.material.color = this.currentColor;
                        }
                    });
                }
                
                // Make the cylinder semi-transparent to show the knit pattern
                this.cylinder.material.transparent = true;
                this.innerCylinder.material.transparent = true;
                this.cylinder.material.opacity = 0.3;
                this.innerCylinder.material.opacity = 0.2;
                this.cylinder.material.wireframe = false;
                this.innerCylinder.material.wireframe = false;
                break;
                
            case 'semi-transparent':
                // Semi-transparent mode (default)
                this.cylinder.material.wireframe = false;
                this.innerCylinder.material.wireframe = false;
                this.cylinder.material.transparent = true;
                this.innerCylinder.material.transparent = true;
                this.cylinder.material.opacity = 0.8;
                this.innerCylinder.material.opacity = 0.5;
                break;
                
            case 'solid':
                // Solid mode
                this.cylinder.material.wireframe = false;
                this.innerCylinder.material.wireframe = false;
                this.cylinder.material.transparent = false;
                this.innerCylinder.material.transparent = false;
                this.cylinder.material.opacity = 1.0;
                this.innerCylinder.material.opacity = 1.0;
                break;
        }
        
        // Update colors to ensure they're applied with the new material settings
        this.setColor(this.currentColor);
    }
    
    updateGradient() {
        // Implementation would depend on how you want to visualize the gradient
        // This is a simplified version
        if (this.cylinder && this.innerCylinder) {
            // For demonstration, we'll just set different colors to different parts
            this.cylinder.material.color = this.currentColor;
            
            // Use gray lining if enabled, otherwise use complementary color
            if (this.useGrayLining) {
                this.innerCylinder.material.color = this.grayLiningColor;
            } else {
                this.innerCylinder.material.color = this.complementaryColor;
            }
        }
    }
    
    resetCamera() {
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
}
