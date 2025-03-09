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
        this.isRotating = false; // Default to no rotation
        this.showGradient = false;
        this.showGrid = true; // Default to showing grid
        this.showMesh = false; // Default to not showing mesh in all modes
        this.displayMode = 'solid'; // Options: 'knit-pattern', 'semi-transparent', 'solid'
        this.transparencyLevel = 0.3; // Default transparency level
        this.invertMeshColor = false; // Property for wireframe mesh color inversion
        this.currentColor = new THREE.Color(0xFF5733);
        this.complementaryColor = new THREE.Color(0x33B5FF);
        this.grayLiningColor = new THREE.Color(0x666666); // Gray color for lining
        this.useGrayLining = false; // Default to complementary color lining
        this.showCircularGradient = false; // Default to no circular gradient
        this.isDarkMode = false; // Default to light mode
        this.originalCylinderMaterial = null; // Store original material
        this.stemMaxOffset = 0.4; // Default maximum offset (20% of cylinder radius)
        this.useCurvedStem = true; // Use curved stem by default
        this.showMultipleStems = false; // Default to showing only one curved stem at 3 o'clock
        this.curvedStemSegments = 12; // Default number of segments for 360-degree visualization
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.createVisualization();
        
        // Set initial display mode to solid
        this.setDisplayMode('solid');
        
        // Add quick view camera preset buttons
        this.setupQuickViewButtons();
        
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
    
    /**
     * Capture the current visualization as an image with company information
     * @returns {string} Data URL of the image
     */
    captureImage() {
        // Make sure we render the scene before capturing
        this.renderer.render(this.scene, this.camera);
        
        // Create a temporary canvas to add text/watermark
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sourceCanvas = this.renderer.domElement;
        
        // Match the size of the 3D canvas
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        
        // Draw the original visualization onto our temporary canvas
        ctx.drawImage(sourceCanvas, 0, 0);
        
        // Add company and image information overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        
        // Add text content
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial, sans-serif';
        
        // Current date for the timestamp
        const date = new Date();
        const dateStr = date.toLocaleDateString();
        
        // Add company info
        ctx.textAlign = 'left';
        ctx.fillText('HEXTRA.io | TCS Visualizer', 15, canvas.height - 15);
        
        // Add timestamp
        ctx.textAlign = 'right';
        ctx.fillText(`Generated: ${dateStr}`, canvas.width - 15, canvas.height - 15);
        
        // Return the enhanced canvas image data as a data URL
        return canvas.toDataURL('image/png');
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
        
        // Create inner cylinder with the same gradient pattern
        const innerTCSMaterial = this.createTCSMaterial(this.complementaryColor);
        innerTCSMaterial.side = THREE.BackSide;
        innerTCSMaterial.opacity = 0.5;
        
        this.innerCylinder = new THREE.Mesh(innerCylinderGeometry, innerTCSMaterial);
        this.innerCylinder.visible = false; // Initially hidden
        this.scene.add(this.innerCylinder);
        
        // Create knit pattern mesh (hidden by default)
        this.createKnitPattern();
        
        // Store original materials for later reference
        this.originalMaterials = {
            cylinder: this.cylinder.material.clone(),
            innerCylinder: this.innerCylinder.material.clone()
        };
        
        // Create center stem - either curved or straight based on settings
        if (this.useCurvedStem) {
            this.createCurvedStem();
        } else {
            this.createStraightStem();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = performance.now() * 0.001; // Get time in seconds for animation
        
        // Auto-rotate the visualization only if rotation is enabled
        if (this.isRotating && this.cylinder && this.innerCylinder && this.centerLine) {
            this.cylinder.rotation.y += this.rotationSpeed;
            this.innerCylinder.rotation.y += this.rotationSpeed;
            this.centerLine.rotation.y += this.rotationSpeed;
        }
        
        // Update stem animation if it's a curved stem with shader material
        if (this.useCurvedStem && this.centerLine) {
            if (this.centerLine.isGroup) {
                // For the group-based 360-degree stem
                this.centerLine.children.forEach(stemMesh => {
                    if (stemMesh.material && stemMesh.material.uniforms && stemMesh.material.uniforms.time) {
                        stemMesh.material.uniforms.time.value = time;
                    }
                });
            } else if (this.centerLine.material && this.centerLine.material.uniforms && this.centerLine.material.uniforms.time) {
                // Legacy support for single curved stem
                this.centerLine.material.uniforms.time.value = time;
            }
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Creates a straight center line to represent material absorption
     */
    createStraightStem() {
        // Remove existing centerLine if it exists
        if (this.centerLine) {
            this.scene.remove(this.centerLine);
        }
        
        const centerLineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const centerLineMaterial = new THREE.MeshStandardMaterial({
            color: this.currentColor,
            emissive: this.currentColor,
            emissiveIntensity: 0.5
        });
        this.centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        this.scene.add(this.centerLine);
    }
    
    /**
     * Creates either:
     * 1. The dual stem view (straight + single curved stem at 3 o'clock) - Default view
     * 2. Multiple stem segments view (straight + multiple curved stems) - When showMultipleStems is true
     */
    createCurvedStem() {
        // Remove existing centerLine if it exists
        if (this.centerLine) {
            this.scene.remove(this.centerLine);
        }
        
        // Create a group to hold all stems
        const stemGroup = new THREE.Group();
        
        // First, create the straight central stem
        const centerLineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const centerLineMaterial = new THREE.MeshPhongMaterial({
            color: this.currentColor,
            emissive: this.currentColor,
            emissiveIntensity: 0.5
        });
        const straightStem = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        stemGroup.add(straightStem);
        
        if (this.showMultipleStems) {
            // Show multiple curved stems based on the segments setting
            const segments = this.curvedStemSegments || 12;
            
            // Create curved stems evenly spaced around the circle
            for (let i = 0; i < segments; i++) {
                // Calculate angle based on segment
                const angle = (i / segments) * Math.PI * 2;
                const cosAngle = Math.cos(angle);
                const sinAngle = Math.sin(angle);
                
                // Create a set of points for this segment
                const segmentPoints = [
                    { pos: new THREE.Vector3(0, -1.5, 0), color: new THREE.Color(0x000000) },  // Bottom (black)
                    { 
                        pos: new THREE.Vector3(
                            this.stemMaxOffset * 0.5 * cosAngle, 
                            -0.75, 
                            this.stemMaxOffset * 0.5 * sinAngle
                        ), 
                        color: this.currentColor.clone().multiplyScalar(0.3) // Lower middle (30% color)
                    },
                    { 
                        pos: new THREE.Vector3(
                            this.stemMaxOffset * cosAngle, 
                            0, 
                            this.stemMaxOffset * sinAngle
                        ), 
                        color: this.currentColor.clone() // Middle (full color)
                    },
                    { 
                        pos: new THREE.Vector3(
                            this.stemMaxOffset * 0.5 * cosAngle, 
                            0.75, 
                            this.stemMaxOffset * 0.5 * sinAngle
                        ), 
                        color: this.currentColor.clone().lerp(new THREE.Color(0xffffff), 0.7) // Upper middle (70% to white)
                    },
                    { pos: new THREE.Vector3(0, 1.5, 0), color: new THREE.Color(0xffffff) }  // Top (white)
                ];
                
                // Create curve for this segment
                const curve = new THREE.CatmullRomCurve3(segmentPoints.map(p => p.pos));
                const colors = segmentPoints.map(p => p.color);
                
                // Create the geometry for the curved stem
                const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.05, 8, false);
                
                // Create shader material for this stem
                const stemMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        colors: { value: colors },
                        time: { value: 0 }
                    },
                    vertexShader: `
                        varying float vPosition;
                        
                        void main() {
                            vPosition = position.y;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform vec3 colors[5];
                        uniform float time;
                        varying float vPosition;
                        
                        void main() {
                            float t = (vPosition + 1.5) / 3.0;
                            vec3 color;
                            
                            if (t < 0.25) {
                                color = mix(colors[0], colors[1], t * 4.0);
                            } else if (t < 0.5) {
                                color = mix(colors[1], colors[2], (t - 0.25) * 4.0);
                            } else if (t < 0.75) {
                                color = mix(colors[2], colors[3], (t - 0.5) * 4.0);
                            } else {
                                color = mix(colors[3], colors[4], (t - 0.75) * 4.0);
                            }
                            
                            // Add subtle animation
                            float pulse = sin(time * 2.0 + t * 10.0) * 0.1 + 0.9;
                            color *= pulse;
                            
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `
                });
                
                // Create mesh for this stem and add to group
                const curvedStem = new THREE.Mesh(tubeGeometry, stemMaterial);
                stemGroup.add(curvedStem);
            }
        } else {
            // Show just a single curved stem at 3 o'clock (0 degrees)
            const angle = 0; // 0 radians = 3 o'clock position (right side)
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            
            // Create a set of points for the curved stem
            const segmentPoints = [
                { pos: new THREE.Vector3(0, -1.5, 0), color: new THREE.Color(0x000000) },  // Bottom (black)
                { 
                    pos: new THREE.Vector3(
                        this.stemMaxOffset * 0.5 * cosAngle, 
                        -0.75, 
                        this.stemMaxOffset * 0.5 * sinAngle
                    ), 
                    color: this.currentColor.clone().multiplyScalar(0.3) // Lower middle (30% color)
                },
                { 
                    pos: new THREE.Vector3(
                        this.stemMaxOffset * cosAngle, 
                        0, 
                        this.stemMaxOffset * sinAngle
                    ), 
                    color: this.currentColor.clone() // Middle (full color)
                },
                { 
                    pos: new THREE.Vector3(
                        this.stemMaxOffset * 0.5 * cosAngle, 
                        0.75, 
                        this.stemMaxOffset * 0.5 * sinAngle
                    ), 
                    color: this.currentColor.clone().lerp(new THREE.Color(0xffffff), 0.7) // Upper middle (70% to white)
                },
                { pos: new THREE.Vector3(0, 1.5, 0), color: new THREE.Color(0xffffff) }  // Top (white)
            ];
            
            // Create the curved path
            const curve = new THREE.CatmullRomCurve3(segmentPoints.map(p => p.pos));
            const colors = segmentPoints.map(p => p.color);
            
            // Create the geometry for the curved stem
            const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.05, 8, false);
            
            // Create shader material for the curved stem
            const stemMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    colors: { value: colors },
                    time: { value: 0 }
                },
                vertexShader: `
                    varying float vPosition;
                    
                    void main() {
                        vPosition = position.y;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 colors[5];
                    uniform float time;
                    varying float vPosition;
                    
                    void main() {
                        float t = (vPosition + 1.5) / 3.0;
                        vec3 color;
                        
                        if (t < 0.25) {
                            color = mix(colors[0], colors[1], t * 4.0);
                        } else if (t < 0.5) {
                            color = mix(colors[1], colors[2], (t - 0.25) * 4.0);
                        } else if (t < 0.75) {
                            color = mix(colors[2], colors[3], (t - 0.5) * 4.0);
                        } else {
                            color = mix(colors[3], colors[4], (t - 0.75) * 4.0);
                        }
                        
                        // Add subtle animation
                        float pulse = sin(time * 2.0 + t * 10.0) * 0.1 + 0.9;
                        color *= pulse;
                        
                        gl_FragColor = vec4(color, 1.0);
                    }
                `
            });
            
            // Create mesh for the curved stem and add to group
            const curvedStem = new THREE.Mesh(tubeGeometry, stemMaterial);
            stemGroup.add(curvedStem);
        }
        
        // Store the group as centerLine and add to scene
        this.centerLine = stemGroup;
        this.scene.add(this.centerLine);
    }
    
    /**
     * Updates the stem material with the new color
     */
    updateStemColor(color) {
        if (!this.centerLine) return;
        
        if (this.useCurvedStem) {
            // For the 360-degree curved stem (which is a group of stems)
            if (this.centerLine.isGroup) {
                // Update each child mesh in the group
                this.centerLine.children.forEach(stemMesh => {
                    if (stemMesh.material && stemMesh.material.uniforms && stemMesh.material.uniforms.colors) {
                        const colors = stemMesh.material.uniforms.colors.value;
                        
                        // Update only color-related points (middle three)
                        colors[1] = color.clone().multiplyScalar(0.3);
                        colors[2] = color.clone();
                        colors[3] = color.clone().lerp(new THREE.Color(0xffffff), 0.7);
                        
                        stemMesh.material.uniforms.colors.value = colors;
                    }
                });
            } else if (this.centerLine.material && this.centerLine.material.uniforms && this.centerLine.material.uniforms.colors) {
                // Legacy support for a single curved stem
                const colors = this.centerLine.material.uniforms.colors.value;
                
                // Update only color-related points (middle three)
                colors[1] = color.clone().multiplyScalar(0.3);
                colors[2] = color.clone();
                colors[3] = color.clone().lerp(new THREE.Color(0xffffff), 0.7);
                
                this.centerLine.material.uniforms.colors.value = colors;
            }
        } else if (!this.useCurvedStem) {
            // For straight stem, just update the color
            this.centerLine.material.color = this.currentColor;
            this.centerLine.material.emissive = this.currentColor;
        }
    }
    
    /**
     * Sets the maximum offset for the curved stem
     * @param {number} offset - The maximum offset value (0.0-1.0)
     */
    setStemOffset(offset) {
        this.stemMaxOffset = offset;
        if (this.useCurvedStem) {
            this.createCurvedStem();
        }
    }
    
    /**
     * Sets the number of segments for the 360-degree curved stem visualization
     * @param {number} segments - The number of segments to use (4-24)
     */
    setStemSegments(segments) {
        // Constrain to reasonable values
        segments = Math.max(4, Math.min(segments, 24));
        this.curvedStemSegments = segments;
        
        // Only recreate the stem if we're using the curved stem
        if (this.useCurvedStem) {
            this.createCurvedStem();
        }
    }
    
    /**
     * Toggles between the dual stem view (straight + curved) and just the straight stem
     * @param {boolean} useCurved - Whether to use the dual stem view (straight + curved at 3 o'clock)
     */
    toggleCurvedStem(useCurved) {
        this.useCurvedStem = useCurved;
        if (useCurved) {
            // Use the new dual stem view (straight + curved at 3 o'clock)
            this.createCurvedStem();
        } else {
            // Use only the straight stem
            this.createStraightStem();
        }
    }
    
    /**
     * Toggles between showing a single curved stem or multiple stems
     * @param {boolean} showMultiple - Whether to show multiple stems around the circle
     */
    toggleMultipleStems(showMultiple) {
        this.showMultipleStems = showMultiple;
        
        // Only recreate the stem if we're currently using curved stem view
        if (this.useCurvedStem) {
            this.createCurvedStem();
        }
    }
    
    /**
     * Toggle cylinder rotation on/off
     * @param {boolean} isRotating - Whether the cylinder should rotate
     */
    toggleRotation(isRotating) {
        this.isRotating = isRotating;
        
        // When turning rotation on, reset to a consistent starting position
        if (isRotating && this.cylinder && this.innerCylinder) {
            // Reset to 0 degrees (front-facing position)
            this.cylinder.rotation.y = 0;
            this.innerCylinder.rotation.y = 0;
            if (this.centerLine) {
                this.centerLine.rotation.y = 0;
            }
        }
    }
    
    createTCSMaterial(color, isTransparent = false, opacity = 1.0) {
        // Create a shader material for the core TCS vertical gradient
        // If no color is provided, use the current color
        const materialColor = color || this.currentColor;
        
        return new THREE.ShaderMaterial({
            uniforms: {
                mainColor: { value: materialColor },
                opacity: { value: opacity }
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
                uniform float opacity;
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
                    
                    // Use the opacity uniform for transparency
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            side: THREE.DoubleSide, // Render both sides to show back of cylinder
            transparent: isTransparent,
            opacity: opacity
        });
    }
    
    updateKnitPatternColor() {
        if (!this.knitPattern) return;
        
        // Determine the color to use based on inversion setting
        let meshColor;
        if (this.invertMeshColor) {
            // Create a complementary color
            const tempColor = new THREE.Color().copy(this.currentColor);
            const hsl = {};
            tempColor.getHSL(hsl);
            
            // Invert hue (add 0.5 to get complementary color in HSL space)
            hsl.h = (hsl.h + 0.5) % 1.0;
            
            // Set the new HSL value
            tempColor.setHSL(hsl.h, hsl.s, hsl.l);
            meshColor = tempColor;
        } else {
            meshColor = this.currentColor;
        }
        
        // Update the knit pattern color
        if (this.knitPattern.material) {
            this.knitPattern.material.color = meshColor;
        }
        
        // Update children lines colors too
        this.knitPattern.children.forEach(child => {
            if (child.material) {
                child.material.color = meshColor;
            }
        });
    }
    
    /**
     * Updates the UI elements to display the current colors
     */
    updateColorUI() {
        // Update main color display in UI
        const mainColorDisplay = document.getElementById('currentColorDisplay');
        if (mainColorDisplay) {
            mainColorDisplay.style.backgroundColor = '#' + this.currentColor.getHexString();
        }
        
        // Update complementary color display
        const complementaryColorDisplay = document.getElementById('complementaryColorDisplay');
        if (complementaryColorDisplay) {
            const displayColor = this.useGrayLining ? this.grayLiningColor : this.complementaryColor;
            complementaryColorDisplay.style.backgroundColor = '#' + displayColor.getHexString();
        }
    }
    
    /**
     * Sets the main color of the visualization and updates all related elements
     * @param {THREE.Color} color - The new color to set
     */
    setColor(color) {
        this.currentColor = color;
        
        // Update materials
        if (this.cylinder && this.innerCylinder) {
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
            
            this.innerCylinder.material.color = this.complementaryColor;
            
            // Update stem colors using dedicated method
            this.updateStemColor(this.currentColor);
            
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
            
            // Update the UI color displays
            this.updateColorUI();
        }
        
        // Update original material color for future use
        if (this.originalCylinderMaterial) {
            this.originalCylinderMaterial.color = this.currentColor;
        }
        
        // Update gradient if enabled
        if (this.showGradient) {
            this.updateGradient();
        }
    }
    
    setComplementaryColor(color) {
        this.complementaryColor = color;
        
        // Update inner cylinder if it exists
        if (this.innerCylinder) {
            if (this.innerCylinder.material.type === 'ShaderMaterial' && this.innerCylinder.material.uniforms.mainColor) {
                this.innerCylinder.material.uniforms.mainColor.value = this.complementaryColor;
            } else {
                this.innerCylinder.material.color = this.complementaryColor;
            }
        }
        
        // Update gradient if enabled
        if (this.showGradient) {
            this.updateGradient();
        }
        
        // Update the UI color displays
        this.updateColorUI();
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
    
    toggleGradient(showGradient) {
        this.showGradient = showGradient;
        
        if (showGradient) {
            this.updateGradient();
        } else {
            // Hide inner cylinder when gradient/lining is disabled
            if (this.innerCylinder) {
                this.innerCylinder.visible = false;
            }
            
            // Ensure main cylinder has the correct material
            if (this.cylinder && !this.showCircularGradient) {
                this.cylinder.material = this.createTCSMaterial();
            }
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
     * - No rotation
     * - Solid display mode
     */
    resetToDefaultView() {
        // Reset state flags
        this.showGradient = false;
        this.useGrayLining = false;
        this.showCircularGradient = false;
        this.isRotating = false;
        
        // Reset rotation position to 0 degrees (front-facing position)
        if (this.cylinder && this.innerCylinder) {
            this.cylinder.rotation.y = 0;
            this.innerCylinder.rotation.y = 0;
            if (this.centerLine) {
                this.centerLine.rotation.y = 0;
            }
        }
        
        // Reset camera to default position
        this.resetCamera();
        
        // Set display mode to Solid
        this.setDisplayMode('solid');
        
        // Update the UI radio buttons to reflect Solid mode
        const solidRadio = document.getElementById('solidMode');
        if (solidRadio) {
            solidRadio.checked = true;
            
            // Update the display mode buttons styling
            document.querySelectorAll('.display-mode-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.style.backgroundColor = 'var(--selector-bg)';
                btn.style.color = 'var(--selector-text)';
                btn.style.fontWeight = 'normal';
            });
            
            // Highlight the solid mode button
            const solidBtn = document.querySelector(`label[for="${solidRadio.id}"]`);
            if (solidBtn) {
                solidBtn.classList.add('selected');
                solidBtn.style.backgroundColor = 'var(--selector-active-bg)';
                solidBtn.style.color = 'var(--selector-active-text)';
                solidBtn.style.fontWeight = 'bold';
            }
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
            notification.style.backgroundColor = '#186D6D'; // Updated to requested color
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
    
    /**
     * Set camera to side view (from positive X axis)
     * Smoothly animates to the target position
     */
    setSideView() {
        if (!this.camera || !this.controls) return;
        
        const targetPosition = new THREE.Vector3(5, 0, 0);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        this._animateCamera(targetPosition, targetLookAt);
    }
    
    /**
     * Set camera to top/plan view (from positive Y axis)
     * Smoothly animates to the target position
     */
    setTopView() {
        if (!this.camera || !this.controls) return;
        
        const targetPosition = new THREE.Vector3(0, 5, 0);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        this._animateCamera(targetPosition, targetLookAt);
    }
    
    /**
     * Set camera to front view (from positive Z axis)
     * Smoothly animates to the target position
     */
    setFrontView() {
        if (!this.camera || !this.controls) return;
        
        const targetPosition = new THREE.Vector3(0, 0, 5);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        this._animateCamera(targetPosition, targetLookAt);
    }
    
    /**
     * Set camera to isometric view (equal angle from all axes)
     * Smoothly animates to the target position
     */
    setIsometricView() {
        if (!this.camera || !this.controls) return;
        
        const targetPosition = new THREE.Vector3(3, 3, 3);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        this._animateCamera(targetPosition, targetLookAt);
    }
    
    /**
     * Set camera to cross-section view (close-up of the center)
     * Smoothly animates to the target position
     */
    setCrossSectionView() {
        if (!this.camera || !this.controls) return;
        
        const targetPosition = new THREE.Vector3(1, 0, 0);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        this._animateCamera(targetPosition, targetLookAt);
    }
    
    /**
     * Helper method to animate camera movement
     * @private
     */
    _animateCamera(targetPosition, targetLookAt) {
        // Smoothly animate to the target position
        const duration = 800; // milliseconds
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease function (cubic ease out)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            
            // Interpolate lookAt target
            this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Creates and adds quick camera view buttons to the visualization container
     * Places buttons in the bottom right of the visualization container
     */
    // Store user's saved camera position and target
    savedCameraPosition = null;
    savedCameraTarget = null;
    
    setupQuickViewButtons() {
        // Find the visualization container and controls container
        const visualizationContainer = document.querySelector('.visualization-container');
        const controlsContainer = document.querySelector('.controls');
        if (!visualizationContainer || !controlsContainer) return;
        
        // Create a container for the view bar
        const viewBar = document.createElement('div');
        viewBar.className = 'view-bar'; // Rename to 'view-bar'
        
        // Style the view bar to be centered between visualization and controls
        viewBar.style.display = 'flex';
        viewBar.style.justifyContent = 'center'; // Center buttons horizontally
        viewBar.style.flexDirection = 'row';
        viewBar.style.flexWrap = 'nowrap';
        viewBar.style.gap = '0'; // No gap between buttons
        viewBar.style.padding = '2px';
        viewBar.style.margin = '10px auto'; // Add space above and below, center horizontally
        viewBar.style.width = 'fit-content'; // Size to content
        viewBar.style.borderRadius = '4px';
        viewBar.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
        viewBar.style.zIndex = '10';
        
        // Button style function
        const styleButton = (button) => {
            button.style.backgroundColor = 'rgba(40, 40, 40, 0.85)';
            button.style.color = 'white';
            button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            button.style.borderRadius = '2px';
            button.style.padding = '4px 6px';
            button.style.margin = '0';
            button.style.cursor = 'pointer';
            button.style.fontSize = '11px';
            button.style.fontWeight = 'bold';
            button.style.transition = 'all 0.2s ease';
            button.style.boxShadow = 'none';
            button.style.textAlign = 'center';
            button.style.minWidth = '40px'; // Smaller width for compact layout
            
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = 'rgba(60, 60, 60, 0.95)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'rgba(40, 40, 40, 0.85)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            });
        };
        
        // Optional: Add a separator between button groups
        const createSeparator = () => {
            const separator = document.createElement('div');
            separator.style.width = '1px';
            separator.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            separator.style.margin = '0 4px';
            return separator;
        };
        
        // Create view buttons with shorter labels for a more compact design
        const views = [
            { name: 'Side', method: this.setSideView.bind(this) },
            { name: 'Top', method: this.setTopView.bind(this) },
            { name: 'Front', method: this.setFrontView.bind(this) },
            { name: 'Iso', method: this.setIsometricView.bind(this) },
            { name: 'Sect', method: this.setCrossSectionView.bind(this) }
        ];
        
        // Add camera preset buttons
        views.forEach(view => {
            const button = document.createElement('button');
            button.textContent = view.name;
            button.title = `Switch to ${view.name} view`;
            styleButton(button);
            
            button.addEventListener('click', view.method);
            viewBar.appendChild(button);
        });
        
        // Add a separator before camera control buttons
        viewBar.appendChild(createSeparator());
        
        // Add camera control buttons
        const cameraControls = [
            { name: 'Reset', method: this.resetCamera.bind(this), title: 'Reset camera to default position' },
            { name: 'Set', method: this.setCamera.bind(this), title: 'Save current camera position' },
            { name: 'Fit', method: this.zoomToFit.bind(this), title: 'Zoom to fit model in view' }
        ];
        
        cameraControls.forEach(control => {
            const button = document.createElement('button');
            button.textContent = control.name;
            button.title = control.title;
            styleButton(button);
            
            button.addEventListener('click', control.method);
            viewBar.appendChild(button);
        });
        
        // Insert the view bar between visualization and controls
        visualizationContainer.insertAdjacentElement('afterend', viewBar);
    }
    
    // Reset camera to default position
    resetCamera() {
        if (!this.camera || !this.controls) {
            return;
        }
        
        // Default camera position
        const defaultPosition = new THREE.Vector3(0.005039515598749067, 2.3361920342575657, 1.9404878995926225);
        const defaultTarget = new THREE.Vector3(0, 0, 0);
        
        // Animate to the default position
        this.animateCameraMove(defaultPosition, defaultTarget);
    }
    
    // Save current camera position and target
    setCamera(event) {
        if (!this.camera || !this.controls) {
            return;
        }
        
        // Save current camera position and target
        this.savedCameraPosition = this.camera.position.clone();
        this.savedCameraTarget = this.controls.target.clone();
        
        // Also update the default camera position used by the original method
        this.defaultCameraPosition = {
            position: this.camera.position.clone(),
            lookAt: this.controls.target.clone()
        };
        
        // Flash feedback to user - briefly change button color
        const button = event ? event.target : null;
        if (button) {
            const originalBg = button.style.backgroundColor;
            const originalBorder = button.style.borderColor;
            
            button.style.backgroundColor = 'rgba(0, 150, 0, 0.9)';
            button.style.borderColor = 'rgba(0, 255, 0, 0.5)';
            
            setTimeout(() => {
                button.style.backgroundColor = originalBg;
                button.style.borderColor = originalBorder;
            }, 500);
        }
        
        // Provide visual feedback (similar to setCurrentCameraAsDefault)
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
        
        // Get the container element
        const container = document.getElementById('visualization-container') || document.body;
        container.appendChild(notification);
        
        // Show notification briefly and then remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 500);
        }, 2000);
    }
    
    // Helper method for camera animation
    animateCameraMove(newPosition, newTarget) {
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
            
            // Interpolate target
            this.controls.target.lerpVectors(
                startTarget,
                newTarget,
                ease
            );
            
            // Update controls
            this.controls.update();
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        animate();
    }
    
    // Zoom to fit the model in view
    zoomToFit() {
        if (!this.camera || !this.controls) {
            return;
        }
        
        // If user has saved a camera position, use that instead
        if (this.savedCameraPosition && this.savedCameraTarget) {
            this.animateCameraMove(this.savedCameraPosition, this.savedCameraTarget);
            return;
        }
        
        // Otherwise use the default optimal position
        const newPosition = new THREE.Vector3(0.005039515598749067, 2.3361920342575657, 1.9404878995926225);
        const newTarget = new THREE.Vector3(0, 0, 0); // Target center
        
        // Use our helper method to animate the camera
        this.animateCameraMove(newPosition, newTarget);
        
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
        
        // Get the container element
        const container = document.getElementById('visualization-container') || document.body;
        container.appendChild(notification);
        
        // Show notification briefly and then remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 500);
        }, 2000);
    }
    
    toggleGrid(showGrid) {
        this.showGrid = showGrid;
        
        if (this.gridHelper) {
            this.gridHelper.visible = showGrid;
        }
    }
    
    toggleMeshColorInversion(invert) {
        this.invertMeshColor = invert;
        
        // Update the wireframe mesh color if it's visible
        if (this.knitPattern) {
            this.updateKnitPatternColor();
        }
    }
    
    toggleMesh(show) {
        this.showMesh = show;
        
        // Show/hide the knit pattern based on the toggle
        if (this.knitPattern) {
            // Only update visibility if we're not in construction mode
            // In construction mode, the visibility is controlled by setDisplayMode
            if (this.displayMode !== 'knit-pattern') {
                this.knitPattern.visible = show;
            }
        }
    }
    
    setTransparencyLevel(level) {
        // Ensure level is between 0 and 1
        this.transparencyLevel = Math.max(0, Math.min(1, level));
        
        // Update materials if they exist
        if (this.cylinder && this.innerCylinder) {
            // Only update if in transparent mode or if forcing transparency in other modes
            if (this.displayMode === 'semi-transparent') {
                // Calculate inner cylinder transparency (always more transparent)
                const innerTransparency = Math.max(0.05, this.transparencyLevel * 0.5);
                
                // Update the materials
                if (this.cylinder.material.uniforms && this.cylinder.material.uniforms.opacity) {
                    this.cylinder.material.uniforms.opacity.value = this.transparencyLevel;
                }
                
                if (this.innerCylinder.material.uniforms && this.innerCylinder.material.uniforms.opacity) {
                    this.innerCylinder.material.uniforms.opacity.value = innerTransparency;
                }
            }
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
        this.updateGridColors();
    }
    
    updateGridColors() {
        if (this.gridHelper) {
            // Determine base colors based on dark mode
            let gridColor = this.isDarkMode ? 0x555555 : 0x888888;
            let gridCenterColor = this.isDarkMode ? 0x666666 : 0x444444;
            
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
        
        // Ensure consistent rendering of both sides of cylinder across all modes
        this.cylinder.material.side = THREE.DoubleSide;
        this.innerCylinder.material.side = THREE.DoubleSide;
        
        // Apply the selected display mode
        switch (mode) {
            case 'knit-pattern':
                // Construction mode - show wireframe
                
                // Always show the knit pattern in construction mode
                if (this.knitPattern) {
                    this.knitPattern.visible = true;
                }
                
                // Make the cylinder wireframe to show proper construction view
                this.cylinder.material.wireframe = true;
                this.innerCylinder.material.wireframe = true;
                
                // Update knit pattern color based on inversion setting
                this.updateKnitPatternColor();
                break;
                
            case 'semi-transparent':
                // Semi-transparent mode
                this.cylinder.material.wireframe = false;
                this.innerCylinder.material.wireframe = false;
                
                // Show/hide the knit pattern based on showMesh setting
                if (this.knitPattern) {
                    this.knitPattern.visible = this.showMesh;
                }
                break;
                
            case 'solid':
                // Solid mode
                this.cylinder.material.wireframe = false;
                this.innerCylinder.material.wireframe = false;
                
                // Show/hide the knit pattern based on showMesh setting
                if (this.knitPattern) {
                    this.knitPattern.visible = this.showMesh;
                }
                break;
        }
        
        // Apply appropriate materials based on display mode
        if (mode === 'solid') {
            // Create a solid material with gradient
            const solidMaterial = this.createTCSMaterial(this.currentColor, false, 1.0);
            
            // Apply the material to the cylinder
            this.cylinder.material = solidMaterial;
            
            // Create a solid material for inner cylinder
            const innerColor = this.useGrayLining ? this.grayLiningColor : this.complementaryColor;
            const innerSolidMaterial = this.createTCSMaterial(innerColor, false, 1.0);
            
            // Apply the material to the inner cylinder
            this.innerCylinder.material = innerSolidMaterial;
            
        } else if (mode === 'semi-transparent') {
            // Create a transparent material with gradient using current transparency level
            const transparentMaterial = this.createTCSMaterial(this.currentColor, true, this.transparencyLevel);
            
            // Apply the material to the cylinder
            this.cylinder.material = transparentMaterial;
            
            // Create a transparent material for inner cylinder (half as transparent)
            const innerColor = this.useGrayLining ? this.grayLiningColor : this.complementaryColor;
            const innerTransparency = Math.max(0.05, this.transparencyLevel * 0.5);
            const innerTransparentMaterial = this.createTCSMaterial(innerColor, true, innerTransparency);
            
            // Apply the material to the inner cylinder
            this.innerCylinder.material = innerTransparentMaterial;
            
        } else if (mode === 'knit-pattern') {
            // Construction mode - create a wireframe material
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: this.currentColor,
                wireframe: true,
                side: THREE.DoubleSide
            });
            
            // Apply the material to the cylinder
            this.cylinder.material = wireframeMaterial;
            
            // Create a wireframe material for inner cylinder
            const innerColor = this.useGrayLining ? this.grayLiningColor : this.complementaryColor;
            const innerWireframeMaterial = new THREE.MeshBasicMaterial({
                color: innerColor,
                wireframe: true,
                side: THREE.DoubleSide
            });
            
            // Apply the material to the inner cylinder
            this.innerCylinder.material = innerWireframeMaterial;
        }
        
        // Update colors to ensure they're applied with the new material settings
        this.setColor(this.currentColor);
    }
    
    updateGradient() {
        if (this.cylinder && this.innerCylinder) {
            // Make inner cylinder visible when gradient/lining is enabled
            this.innerCylinder.visible = true;
            
            // Update inner cylinder with appropriate gradient material
            if (this.useGrayLining) {
                // Use gray lining with the same vertical gradient pattern
                this.innerCylinder.material = this.createTCSMaterial(this.grayLiningColor);
            } else {
                // Use complementary color with the same vertical gradient pattern
                this.innerCylinder.material = this.createTCSMaterial(this.complementaryColor);
            }
            
            // Ensure the inner cylinder uses BackSide rendering and proper opacity
            this.innerCylinder.material.side = THREE.BackSide;
            this.innerCylinder.material.opacity = 0.5;
        }
    }
    
    resetCamera() {
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
}
