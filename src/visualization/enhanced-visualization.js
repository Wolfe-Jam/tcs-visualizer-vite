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
        this.gridHelper = null;
        this.rotationSpeed = 0.005;
        this.showGradient = false;
        this.showGrid = true; // Default to showing grid
        this.currentColor = new THREE.Color(0xFF5733);
        this.complementaryColor = new THREE.Color(0x33B5FF);
        
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
        this.scene.background = new THREE.Color(0xf0f0f0);
        
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
        const cylinderMaterial = new THREE.MeshStandardMaterial({
            color: this.currentColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
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
    
    setColor(color) {
        this.currentColor = color;
        
        // Update materials
        if (this.cylinder && this.innerCylinder && this.centerLine) {
            this.cylinder.material.color = this.currentColor;
            this.innerCylinder.material.color = this.currentColor;
            this.centerLine.material.color = this.currentColor;
            this.centerLine.material.emissive = this.currentColor;
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
    
    toggleGrid(showGrid) {
        this.showGrid = showGrid;
        
        if (this.gridHelper) {
            this.gridHelper.visible = showGrid;
        }
    }
    
    updateGradient() {
        // Implementation would depend on how you want to visualize the gradient
        // This is a simplified version
        if (this.cylinder && this.innerCylinder) {
            // For demonstration, we'll just set different colors to different parts
            this.cylinder.material.color = this.currentColor;
            this.innerCylinder.material.color = this.complementaryColor;
        }
    }
    
    resetCamera() {
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
}
