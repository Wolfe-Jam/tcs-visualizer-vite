# TCS Visualizer Feature Ideas

## Already Available Features (could be exposed/improved)

1. **Lining Color Control**
   - Allow users to manually select the inner lining color
   - Currently uses complementary color automatically

2. **Cylinder Dimensions**
   - Add controls to adjust height, radius, and thickness of the cylinder
   - Customize the visualization shape to user preferences

3. **Rotation Speed Control**
   - Already implemented with slider
   - Could add presets (slow, medium, fast)

4. **Camera Presets**
   - Add more preset camera angles (top view, side view, etc.)
   - Building on existing camera controls

5. **Grid Size/Spacing**
   - Allow customization of the grid helper
   - Options for grid density and size

6. **Download/Export**
   - Add ability to export the current view as an image
   - Save configurations for future reference

7. **Display Statistics**
   - Show polygon count, render time, etc.
   - Useful for performance optimization

## Easy-to-Implement Features

1. **Color History**
   - Save recently used colors for quick access
   - Improves workflow efficiency

2. **Color Schemes**
   - Provide preset color combinations (monochromatic, analogous, etc.)
   - Helpful for exploring color relationships

3. **Texture Options**
   - Allow basic textures on the cylinder surface
   - Enhance visualization realism

4. **Background Color Control**
   - Let users customize the scene background
   - Better integration with different design contexts

5. **Lighting Controls**
   - Add sliders to adjust lighting intensity and direction
   - Enhance visual quality of the rendering

6. **Measurement Tools**
   - Add simple dimension lines or measurement display
   - Useful for technical applications

7. **Animation Presets**
   - Different rotation patterns beyond simple Y-axis rotation
   - Create more dynamic visualizations

8. **Toggle Wireframe Mode**
   - Show the mesh structure
   - Useful for technical understanding

9. **Share View**
   - Generate a shareable URL with current settings
   - Improve collaboration

10. **Multiple Viewports**
    - Split screen with different camera angles
    - Better visualization from multiple perspectives

## Note on "Show Gradient" Feature

The current "Show Gradient" toggle is actually displaying the complementary color on the inner cylinder while the main color is on the outer cylinder. Renaming this to "Show Lining" would better describe the visual effect.

The inner cylinder color is determined by this code:
```javascript
// From updateGradient() method
this.cylinder.material.color = this.currentColor;
this.innerCylinder.material.color = this.complementaryColor;
```
