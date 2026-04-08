# DeepSkyn Accessibility Features

## Overview
DeepSkyn is committed to providing an accessible web application for all users, including those with disabilities. This document outlines the accessibility features implemented in the application.

## Accessibility Features Implemented

### 1. **Responsive Text (Textes adaptatifs)**
- Responsive font sizing that adapts to different screen sizes
- Mobile-optimized text scaling (14px base on mobile, 16px on desktop)
- All text elements scale proportionally across viewports
- Fluid typography using CSS custom properties

### 2. **Dark Mode & Light Mode (Mode clair et sombre)**
- Full dark mode support with optimized color contrast
- High contrast mode option for enhanced visibility
- Three theme options available:
  - **Light Mode**: Default bright theme with purple accents
  - **Dark Mode**: Dark background with adapted colors for reduced eye strain
  - **High Contrast Mode**: Maximum contrast for users with visual impairments
- Theme preference saved in localStorage
- Toggle accessible via navigation bar

### 3. **Alternative Text (ALT)**
- All images include descriptive alt text
- Decorative icons marked with `aria-hidden="true"`
- ImageWithFallback component ensures proper alt text on all product images
- Form labels properly associated with inputs

### 4. **Full Keyboard Navigation (Navigation complète au clavier)**
- All interactive elements accessible via Tab key
- Focus indicators with visible outline (2px solid purple)
- Skip to main content link for keyboard users
- Logical tab order throughout the application
- Enter key submission for forms
- Escape key to close modals (where applicable)

### 5. **Screen Reader Compatibility (Compatibilité avec lecteurs d'écran)**
- Semantic HTML structure (nav, main, footer, article, etc.)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content updates
- Descriptive button labels and link text
- Form validation errors announced to screen readers
- Proper heading hierarchy (h1 → h2 → h3)
- Role attributes on navigation and menus

### 6. **High Color Contrast (Contraste élevé des couleurs)**
- WCAG AA compliant color contrast ratios (minimum 4.5:1)
- High contrast mode with 7:1+ contrast ratios
- Purple brand color (#8b63d3) tested for contrast
- Error messages in red with sufficient contrast
- Success messages in green with sufficient contrast
- Dark mode colors selected for optimal contrast

### 7. **Additional Accessibility Features**
- Reduced motion support for users with vestibular disorders
- Focus management for better navigation flow
- Error messages with icons and text
- Loading states announced to screen readers
- Tooltips with proper ARIA labels
- Mobile-friendly touch targets (minimum 44x44px)

## Theme Customization

### How to Switch Themes
Users can toggle between themes by clicking the theme button in the navigation bar:
- **Sun Icon** = Light Mode (current)
- **Moon Icon** = Dark Mode (current)
- **Contrast Icon** = High Contrast Mode (current)

### Theme Classes
The application uses the following CSS classes:
- `.light` - Default light theme
- `.dark` - Dark mode theme
- `.high-contrast` - High contrast theme

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Navigate to next interactive element |
| Shift + Tab | Navigate to previous interactive element |
| Enter | Activate button or submit form |
| Space | Toggle checkboxes and buttons |
| Escape | Close modals and dialogs |

## Screen Reader Testing

The application has been designed to work with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## ARIA Landmarks

The application uses the following ARIA landmarks:
- `role="navigation"` - Main navigation
- `role="main"` - Main content area
- `role="contentinfo"` - Footer
- `role="menu"` - Mobile menu
- `role="menuitem"` - Menu items
- `role="alert"` - Error messages
- `role="status"` - Status updates

## Form Accessibility

All forms include:
- Associated labels with `htmlFor` attributes
- Required field indicators
- Error messages with `aria-describedby`
- `aria-invalid` on fields with errors
- `aria-required` on required fields
- Clear placeholder text
- Visible focus indicators

## Testing Recommendations

To test accessibility:
1. **Keyboard Navigation**: Try navigating the entire site using only the Tab key
2. **Screen Reader**: Use a screen reader to navigate through pages
3. **Color Contrast**: Use browser dev tools to check contrast ratios
4. **Zoom**: Test the site at 200% zoom level
5. **Dark Mode**: Toggle dark mode and verify readability

## Contact

If you encounter any accessibility issues, please contact us:
- Email: accessibility@deepskyn.com
- We are committed to continuous improvement of our accessibility features

## Compliance

This application strives to meet:
- WCAG 2.1 Level AA standards
- Section 508 compliance
- ARIA 1.2 specifications

Last Updated: February 3, 2026
