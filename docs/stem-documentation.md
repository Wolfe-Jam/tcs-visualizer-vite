# Curved Stem Implementation Documentation

## Overview
This document describes the implementation of the curved stem visualization in the Textile Color System (TCS) Visualizer, which is designed to accurately represent material absorption properties in textiles.

## Implementation Details

### Curved Stem Generation
The curved stem is implemented using a Catmull-Rom spline to create a smooth, curved path from the bottom to the top of the color cylinder. The stem follows a precise mathematical curve with the following characteristics:

1. **5-Point Gradient Path**:
   - Bottom (y = -1.5): Pure black (0x000000)
   - Lower middle (y = -0.75): 30% of the current color
   - Middle (y = 0): 100% of the current color
   - Upper middle (y = 0.75): 70% blend toward white
   - Top (y = 1.5): Pure white (0xFFFFFF)

2. **Adjustable Maximum Offset**:
   - Default value: 0.4 units (20% of cylinder radius)
   - Range: 0.0 (straight line) to 1.0 (50% of cylinder radius)
   - Controlled via UI slider in Advanced Settings panel

3. **Shader-Based Color Gradient**:
   - Uses a custom fragment shader to create a continuous color gradient
   - Implements precise color blending between control points
   - Includes subtle animation pulse for enhanced visual perception

### Technical Implementation

```javascript
createCurvedStem() {
    // Define path points for curved stem
    const pathPoints = [
        { pos: new THREE.Vector3(0, -1.5, 0), color: new THREE.Color(0x000000) },
        { pos: new THREE.Vector3(this.stemMaxOffset * 0.5, -0.75, this.stemMaxOffset * 0.5), 
          color: this.currentColor.clone().multiplyScalar(0.3) },
        { pos: new THREE.Vector3(this.stemMaxOffset, 0, this.stemMaxOffset), 
          color: this.currentColor.clone() },
        { pos: new THREE.Vector3(this.stemMaxOffset * 0.5, 0.75, this.stemMaxOffset * 0.5), 
          color: this.currentColor.clone().lerp(new THREE.Color(0xffffff), 0.7) },
        { pos: new THREE.Vector3(0, 1.5, 0), color: new THREE.Color(0xffffff) }
    ];
    
    // Create curve and tube geometry
    const curve = new THREE.CatmullRomCurve3(pathPoints.map(p => p.pos));
    const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.05, 8, false);
    
    // Create shader material with gradient and animation
    // ...
}
```

## User Interface

### Advanced Settings Panel
A collapsible "Advanced Settings" panel has been added to the UI with the following features:

1. **Toggle Visibility**: Click on the header or arrow button to collapse/expand
2. **Stem Max Offset Slider**:
   - Controls the maximum offset of the curved stem
   - Shows percentage (0-50%) for intuitive control
   - Updates in real-time as the user adjusts the slider

### Curved Stem Toggle
A toggle switch has been added to the Visualization Controls panel to enable/disable the curved stem:

- When enabled (default): Shows the curved stem with gradient
- When disabled: Shows a straight center line

## Significance in Textile Color Theory

The curved stem visualization represents the material absorption properties in textiles more accurately than a straight line. The curvature illustrates how light interacts with the material at different depths:

1. **Bottom (Black)**: Initial light absorption
2. **Middle (Full Color)**: Maximum color reflection
3. **Top (White)**: Light scattering at material exit point

The ability to adjust the maximum offset allows for visualizing different material behaviors:

- Lower values (straighter stem): More translucent materials
- Higher values (more curved stem): More opaque materials with complex light scattering

## Future Enhancements

Potential future improvements to the curved stem visualization:

1. **Material-Specific Curves**: Predefined curves for different textile materials
2. **Dynamic Response**: Altering curve based on color properties (saturation, brightness)
3. **Enhanced Animation**: More sophisticated animation based on material physics
4. **Comparative Visualization**: Ability to show multiple stems for different colors/materials

## Technical Notes

- Implementation based on Three.js TubeGeometry and ShaderMaterial
- Custom fragment shader ensures precise color gradient control
- Performance optimized with appropriate polygon count (50 segments, 8 radial segments)
