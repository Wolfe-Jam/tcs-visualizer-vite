import './style.css';
import { EnhancedTCMVisualization } from './visualization/enhanced-visualization';
import { setupUI } from './components/ui';
import { initVersionDisplay } from './components/version';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing TCS Visualizer...');
  
  // Create visualization instance
  const viz = new EnhancedTCMVisualization();
  window.viz = viz; // For debugging and global access
  
  // Initialize UI components
  setupUI(viz);
  
  // Initialize version display
  initVersionDisplay();
  
  console.log('TCS Visualizer initialized successfully');
});
