# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Umrah Dua Guide** is a comprehensive, mobile-optimized interactive web application that provides duas (supplications) and adhkar for Tawaf and Sa'i during Umrah. The app is built as a single-page HTML application with embedded CSS and JavaScript - no build process required.

## Architecture

### Single-File Structure
The entire application is contained in a single `index.html` file (~1,300 lines) with:
- Inline CSS in `<style>` tags (lines 9-408)
- HTML structure (lines 410-1117)
- Vanilla JavaScript (lines 1119-1315)

This design choice enables:
- Offline functionality after first load
- No dependencies or build process
- Easy deployment to GitHub Pages
- Mobile-first PWA capabilities

### Key Features Implementation

**Progress Tracking System**
- Uses JavaScript `Set` objects (`completedTawaf`, `completedSai`) to track completed rounds/laps
- Progress bars calculated as percentage: `(completed / 7) * 100`
- Auto-navigation: Completing a round/lap automatically opens the next section
- Visual feedback: Green checkmarks and color changes for completed items

**Local Storage**
- Personal notes saved to `localStorage` under key `umrah_personal_notes`
- Auto-save on input with debounced save indicator
- Notes persist across sessions but are device-specific

**UI/UX Patterns**
- Accordion-style collapsible sections for content organization
- Touch-optimized with `user-select: none` and `touch-action: manipulation`
- Dark theme with gradient backgrounds for low-light environments
- Double-tap zoom prevention on mobile devices

## Development Workflow

### Testing Locally
```bash
# No build step needed - just open the file
open index.html
# OR serve locally
python3 -m http.server 8000
```

### Deployment
The site is deployed via GitHub Pages. Any changes pushed to the `main` branch will be automatically reflected at the GitHub Pages URL.

```bash
# Make changes to index.html
git add index.html
git commit -m "Description of changes"
git push origin main
```

### Testing on Mobile
1. Deploy to GitHub Pages or use local network IP
2. Test on actual devices (not just browser dev tools)
3. Verify touch interactions and scroll behavior
4. Test offline functionality by toggling airplane mode
5. Verify add-to-home-screen functionality

## Content Structure

### Tawaf - 7 Themed Rounds
Each round has a spiritual theme with authentic duas:
1. Gratitude and Arrival (Shukr)
2. Seeking Forgiveness (Istighfar)
3. Personal and Spiritual Needs
4. Family and Loved Ones
5. Worldly Needs and Livelihood
6. The Muslim Ummah
7. Jannah and Protection

### Sa'i - 7 Themed Laps
1. Trust in Allah (Tawakkul)
2. Patience and Perseverance (Sabr)
3. Health and Well-being
4. Knowledge and Wisdom
5. Righteous Deeds
6. Protection and Safety
7. Comprehensive Final Dua

### Additional Sections
- Dua upon seeing the Ka'bah
- Personal notes textarea
- Duas the Prophet ﷺ loved most
- Special positions for dua
- Quick reference guide

## Code Editing Guidelines

### When Adding New Duas
1. Ensure Arabic text is authentic and properly formatted
2. Include transliteration in the `dhikr-text` class
3. Provide English translation in the `translation` class
4. Add source citation (Quran/Hadith reference)
5. Use `⭐ HIGH-VALUE` label for particularly significant duas

### When Modifying Styles
- Maintain dark theme color scheme (primary gradient: #667eea to #764ba2)
- Keep mobile-first approach (max-width not min-width)
- Test all touch interactions
- Preserve accessibility features
- Maintain consistency with existing patterns

### When Updating JavaScript
- Use vanilla JavaScript only (no frameworks)
- Maintain backward compatibility with localStorage data
- Test auto-navigation between sections
- Ensure progress tracking remains accurate
- Preserve double-tap zoom prevention

## Important Considerations

### Content Authenticity
All duas must be verified against authentic Islamic sources:
- Quran verses with proper citation
- Authentic Hadith from Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Ahmad
- Properly attributed to scholars when applicable

### Mobile Performance
- Keep file size reasonable (currently ~80KB)
- Minimize DOM manipulation
- Use CSS transforms for animations (hardware accelerated)
- Test on lower-end devices
- Ensure smooth scrolling and interactions

### Accessibility
- Maintain semantic HTML structure
- Keep color contrast ratios accessible
- Ensure touch targets are minimum 44x44px
- Support both RTL (Arabic) and LTR (English) text
- Test with screen readers if adding new sections

## File Organization

```
/
├── index.html          # Single-file application
├── README.md           # User-facing documentation
├── LICENSE             # License file
└── CLAUDE.md          # This file
```

## Common Tasks

### Add a New Dua Box
```html
<div class="dhikr-box">
    <div class="dhikr-label">Label or Category:</div>
    <div class="arabic-text">Arabic text here</div>
    <div class="dhikr-text">"Transliteration"</div>
    <div class="translation">(English translation) - Source</div>
</div>
```

### Add a New Accordion Section
```html
<div class="accordion-item">
    <div class="accordion-header" onclick="toggle(this)">
        <span class="accordion-title">Section Title</span>
        <span class="accordion-icon">▼</span>
    </div>
    <div class="accordion-content">
        <div class="accordion-body">
            <!-- Content here -->
        </div>
    </div>
</div>
```

### Modify Progress Tracking
The progress system uses data attributes on headers:
- `data-round="tawaf"` or `data-round="sai"`
- `data-number="1"` through `data-number="7"`

Complete buttons call: `completeRound(this, 'type', number)`
Reset buttons call: `resetProgress('type')`
