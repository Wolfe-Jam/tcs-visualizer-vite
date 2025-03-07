/**
 * Version information for the TCS Visualizer
 */

// Import version from package.json
import packageInfo from '../../package.json';

/**
 * Get the current version of the application
 * @returns {string} The current version
 */
export function getVersion() {
    return packageInfo.version;
}

/**
 * Get the build date of the application
 * @returns {string} The build date in YYYY-MM-DD format
 */
export function getBuildDate() {
    // For now, we'll use the current date
    // In a production environment, this would be set during the build process
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Initialize the version display in the UI
 */
export function initVersionDisplay() {
    // Add version info to the footer
    const footer = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.style.padding = '10px';
    footer.style.fontSize = '12px';
    footer.style.color = 'var(--text-color)';
    footer.style.opacity = '0.7';
    footer.style.marginTop = '20px';
    
    footer.innerHTML = `TCS Visualizer v${getVersion()} | Build: ${getBuildDate()}`;
    
    // Add the footer to the container
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(footer);
    }
}
