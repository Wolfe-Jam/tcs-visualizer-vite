# Textile Color System Visualizer (Vite Edition)

A modern, interactive 3D visualization tool for exploring textile color systems and color relationships.

![TCS Visualizer](https://via.placeholder.com/800x400?text=TCS+Visualizer)

## Overview

The Textile Color System (TCS) Visualizer is a web-based application that provides an intuitive way to explore color relationships in textile design. Using Three.js for 3D visualization, it represents colors in a cylindrical space that helps designers understand color harmony, complementary relationships, and material absorption properties.

This version is built with Vite for improved performance, modern module loading, and a better development experience.

## Features

- **Interactive 3D Color Visualization**: Explore colors in a three-dimensional space
- **Real-time Color Updates**: See immediate visual feedback when selecting colors
- **Complementary Color Display**: Automatically view complementary colors for better design decisions
- **Adjustable Visualization Controls**: Customize rotation speed and camera position
- **Gradient Visualization Option**: Toggle between solid colors and gradients

## Technology Stack

- **Vite**: Modern build tool and development server
- **Three.js**: 3D visualization library
- **Vanilla JavaScript**: Clean, framework-free implementation
- **ES Modules**: Modern JavaScript module system

## Project Structure

```
tcs-visualizer-vite/
├── index.html           # Main HTML with styles
├── vite.config.js       # Vite configuration
└── src/
    ├── main.js          # Application entry point
    ├── visualization/
    │   └── enhanced-visualization.js  # 3D visualization logic
    └── components/
        └── ui.js        # UI interaction and color management
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tcs-visualizer-vite.git
   cd tcs-visualizer-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## Usage

1. **Color Selection**: Use the color picker to select a base color
2. **Rotation Speed**: Adjust the slider to control how fast the visualization rotates
3. **Reset Camera**: Click the button to return to the default camera position
4. **Gradient Toggle**: Switch between solid color and gradient visualization modes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for the powerful 3D visualization library
- Vite team for the excellent build tool
- All contributors to the original TCS Visualizer project
