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
    const version = getVersion();
    const buildDate = getBuildDate();
    const currentYear = new Date().getFullYear();
    
    // Update the banner version info if it exists
    const bannerVersionInfo = document.getElementById('banner-version-info');
    if (bannerVersionInfo) {
        bannerVersionInfo.textContent = `v${version}`;
    }
    
    // Look for the footer-version-info element in our new footer structure
    const footerVersionInfo = document.getElementById('footer-version-info');
    
    if (footerVersionInfo) {
        // If the new footer structure exists, update it
        footerVersionInfo.innerHTML = `
            <p style="margin: 5px 0;">TCS Visualizer v${version} | Build: ${buildDate}</p>
            <p style="margin: 5px 0;">&copy; ${currentYear} <a href="https://hextra.io" target="_blank" style="color: var(--selector-active-bg); text-decoration: none;">HEXTRA.io</a> All rights reserved</p>
        `;
    } else {
        // Fallback to the old method if the new footer isn't found
        console.warn('New footer element not found, creating standalone footer');
        
        // Add version info to the footer
        const footer = document.createElement('footer');
        footer.style.textAlign = 'center';
        footer.style.padding = '10px';
        footer.style.fontSize = '12px';
        footer.style.color = 'var(--text-color)';
        footer.style.opacity = '0.7';
        footer.style.marginTop = '20px';
        footer.style.borderTop = '1px solid var(--selector-border)';
        
        // Create a container div with max-width to match other UI elements
        const footerContainer = document.createElement('div');
        footerContainer.style.maxWidth = '850px';
        footerContainer.style.margin = '0 auto';
        footer.appendChild(footerContainer);
        
        footerContainer.innerHTML = `<p style="margin: 5px 0;">TCS Visualizer v${version} | Build: ${buildDate}</p>
<p style="margin: 5px 0;">&copy; ${currentYear} <a href="https://hextra.io" target="_blank" style="color: var(--selector-active-bg); text-decoration: none;">HEXTRA.io</a> All rights reserved</p>`;
        
        // Add the footer to the end of the body for proper positioning
        document.body.appendChild(footer);
    }
    
    // Also update the About Box if it exists
    updateAboutBoxVersionInfo(version, buildDate, currentYear);
}

/**
 * Update the About Box with version and build information
 * @param {string} version - The application version
 * @param {string} buildDate - The build date
 * @param {number} year - The current year
 */
function updateAboutBoxVersionInfo(version, buildDate, year) {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        // Try to find the elements in the About Box
        const buildDateEl = document.getElementById('build-date');
        const copyrightYearEl = document.getElementById('copyright-year');
        
        // Update the build date if element exists
        if (buildDateEl) {
            buildDateEl.textContent = buildDate;
        }
        
        // Update the copyright year if element exists
        if (copyrightYearEl) {
            copyrightYearEl.textContent = year;
        }
    });
}
