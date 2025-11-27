# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Overview

**Umrah Dua Guide** is a comprehensive, mobile-optimized interactive web application that provides duas (supplications) and adhkar for Tawaf and Sa'i during Umrah. The app uses a **data-driven architecture** with a build process that generates a single self-contained HTML file for deployment.

## Architecture

### Data-Driven Build System (Phase 2)

The project uses a **JSON + Build Process** architecture that separates content from presentation:

```
umrah-plan/
├── src/
│   ├── data/
│   │   ├── duas.json         # ~36 duas with full metadata
│   │   ├── themes.json        # 19 themes with selection rules
│   │   └── rounds.json        # Tawaf/Sa'i configurations
│   └── templates/
│       └── index.html         # HTML template with placeholders
├── build.js                   # Build script (embeds JSON into template)
├── index.html                 # Generated output (~106KB today, deployed to GitHub Pages)
├── package.json               # npm scripts and metadata
└── .gitignore
```

### Build Process

The build script (`build.js`) performs these steps:
1. Loads JSON data files (duas, themes, rounds)
2. Reads HTML template from `src/templates/index.html`
3. Replaces `/*DATA_PLACEHOLDER*/` with embedded JavaScript data
4. Writes final `index.html` (single self-contained file)
   - No minification/validation yet (consider adding size + citation checks)

**Commands:**
```bash
npm run build   # Generate index.html from sources
npm run watch   # Auto-rebuild on file changes (requires nodemon)
npm run serve   # Serve locally for testing (Python)
```

### Why This Architecture?

**Scalability:**
- Easy to add 100+ duas without cluttering code
- Supports random dua selection with consistency
- Theme-based organization with flexible selection rules

**Maintainability:**
- Content changes require only JSON edits
- Clear separation of data and presentation
- Git diffs show exact content changes
- Easy to review for authenticity

**Deployment:**
- Still generates single HTML file for GitHub Pages
- No runtime dependencies
- Offline-capable after first load
- Mobile-first PWA capabilities

## Key Features Implementation

### 1. Comprehensive State Management

The `STATE` object manages all user data and persists to `localStorage`:

```javascript
const STATE = {
    config: {
        ritualType: 'umrah',        // 'umrah' or 'nafil'
        themeSelection: 'default',   // 'default', 'random', 'custom'
        customThemes: [],
        duaRandomization: true       // Enable random dua selection
    },
    progress: {
        tawaf: new Set(),            // Completed Umrah Tawaf rounds
        sai: new Set(),              // Completed Sa'i laps
        tawafNafil: new Set()        // Completed Nafil Tawaf rounds
    },
    selectedDuas: {},                // Cached random selections for consistency
    save(),                          // Persists to localStorage
    load()                           // Loads from localStorage
};
```

**localStorage key:** `umrah_state` (replaces old `umrah_user_config`)

### 2. Dua Selection Engine

Intelligently selects duas based on theme configuration:

```javascript
function selectDuasForTheme(themeId, roundId) {
    // Returns array of dua IDs based on:
    // - Required duas (always shown)
    // - Random selection from pool (if enabled)
    // - Cached selections (for consistency)
}
```

**Theme Configuration Example:**
```json
{
  "salawat-prophet": {
    "duas": {
      "required": ["salawat-virtue", "salawat-ibrahimiyyah"],
      "pool": ["salawat-short", "salawat-intercession", "salawat-rank"],
      "count": 2
    }
  }
}
```

Result: Always shows 2 required + 2 random from pool = 4 total duas.

### 3. Progress Tracking

- Unified `completeRound()` function works for both Umrah and Nafil modes
- Auto-saves progress to STATE on every completion
- Auto-navigation to next round/lap
- Visual feedback with progress bars and checkmarks

### 4. Dynamic Rendering

Content is rendered dynamically from JSON data. All accordions (Tawaf + Sa'i) are generated in JS and stay collapsed by default; completion toggles happen via state.

```javascript
renderRound(roundConfig, mode)      // Renders round with theme + duas
renderDuasByIds(duaIds)             // Renders duas from DUA_LIBRARY
renderDuaItem(dua, index)           // Renders individual dua with formatting
```

## Data Structure Reference

Authoritative definitions live in JSON Schemas at `src/data/schemas/`:
- `duas.schema.json` — dua entries (types, labels, source, ref_url, citation.type, tags)
- `themes.schema.json` — theme composition (required/pool/count, suggestions, tags)
- `rounds.schema.json` — mapping of tawaf/sa'i rounds/laps to theme IDs

Use these schemas for validation (the data editor already enforces them).

## Development Workflow

### Adding New Duas

1. **Add to duas.json:**
```json
{
  "my-new-dua": {
    "id": "my-new-dua",
    "category": ["family"],
    "type": "full",
    "arabic": "رَبِّ...",
    "transliteration": "Rabbi...",
    "translation": "(My Lord...) - Quran 25:74",
    "source": "Quran 25:74",
    "tags": ["family", "children"]
  }
}
```

2. **Reference in themes.json:**
```json
{
  "family-loved-ones": {
    "duas": {
      "required": ["rabbi-rhamhuma"],
      "pool": ["my-new-dua", "other-dua"],
      "count": 2
    }
  }
}
```

3. **Build and test:**
```bash
npm run build
npm run serve  # Test at localhost:8000
```

4. **Commit:**
```bash
git add src/data/duas.json src/data/themes.json index.html
git commit -m "Add new dua for [purpose]"
git push origin main
```

### Creating New Themes

1. **Define in themes.json:**
```json
{
  "new-theme-id": {
    "title": "Theme Title",
    "description": "Theme: Brief Description",
    "suggestions": ["Suggestion 1", "Suggestion 2"],
    "duas": {
      "required": ["dua-id-1"],
      "pool": ["dua-id-2", "dua-id-3"],
      "count": 1
    },
    "tags": ["custom", "special"]
  }
}
```

2. **Assign to rounds in rounds.json:**
```json
{
  "tawaf": {
    "umrah": [
      { "number": 4, "theme": "new-theme-id" }
    ]
  }
}
```

3. **Build and deploy**

### Modifying Template

Edit `src/templates/index.html` (not the generated `index.html`):
- HTML structure
- CSS styles
- JavaScript functions
- Keep `/*DATA_PLACEHOLDER*/` intact

Then rebuild: `npm run build`

### Testing Locally

```bash
# Serve and test
npm run serve  # Opens localhost:8000

# Watch mode (auto-rebuild)
npm run watch  # Requires: npm install

# Manual build
npm run build
```

### Deployment

```bash
# Build and commit
npm run build
git add -A
git commit -m "Description of changes"
git push origin main

# GitHub Pages automatically deploys index.html
```

## Content Structure

### Tawaf - 7 Themed Rounds (Umrah Mode)
1. **Gratitude and Arrival** (Shukr)
2. **Seeking Forgiveness** (Istighfar)
3. **Sending Blessings Upon the Prophet ﷺ** (Salawat)
4. **Family and Loved Ones**
5. **Worldly Needs and Livelihood**
6. **The Muslim Ummah**
7. **Jannah and Protection**

### Tawaf - 7 Themed Rounds (Nafil Mode)
1. **Forgiveness and Repentance**
2. **Faith, Guidance, and Spiritual Strength**
3. **Sending Blessings Upon the Prophet ﷺ** (Salawat)
4. **Knowledge, Wisdom, and Righteous Deeds**
5. **Health, Provision, and Worldly Needs**
6. **The Muslim Ummah**
7. **Jannah and Protection**

### Sa'i - 7 Themed Laps (Umrah Mode only)
1. Trust in Allah (Tawakkul)
2. Patience and Perseverance (Sabr)
3. Health and Well-being
4. Knowledge and Wisdom
5. Righteous Deeds
6. Protection and Safety
7. Comprehensive Final Dua

Note: these Sa'i theme IDs are referenced in `src/data/rounds.json` but not yet defined in `src/data/themes.json`. Add them to avoid fallback/empty content.

### Additional Sections
- Personal notes textarea (localStorage: `umrah_personal_notes`)
- Special positions for dua
- General tips
- Quick reference guide
- Janaza prayer guide

## Code Editing Guidelines

### When Adding Content

**Always verify authenticity:**
- Quran verses with proper citation (Surah:Ayah)
- Authentic Hadith from: Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Ahmad
- Scholar attributions when applicable
- Mark significant duas with `⭐ HIGH-VALUE` label

**Data integrity:**
- Use unique IDs for all duas and themes
- Include proper `type`, `category`, and `tags`
- Provide complete metadata (source, translation)
- Test JSON validity before committing

### When Modifying Styles

- Maintain dark theme color scheme (primary gradient: #667eea to #764ba2)
- Keep mobile-first approach (max-width not min-width)
- Accordions are collapsed by default; avoid auto-expanding on render
- Test touch interactions (44x44px minimum touch targets)
- Preserve accessibility (color contrast, semantic HTML)
- Test on actual mobile devices

### When Updating JavaScript

- Use vanilla JavaScript only (no external frameworks)
- Maintain backward compatibility with STATE.load()
- Save state after progress updates: `STATE.save()`
- Test dua selection engine with different configurations
- Preserve auto-navigation and progress tracking
- Accordions: render via JS helpers; keep header/content classes consistent
- Citations: if adding Qur'an/Hadith refs, prefer `ref_url` pointing to quran.com or sunnah.com; avoid embedding source text inside translations

## Important Considerations

### Content Authenticity

All duas must be verified against authentic Islamic sources. The JSON structure makes it easy to:
- Add proper `source` field to each dua
- Review changes via git diffs
- Maintain consistency across themes

### Mobile Performance

- Generated file: ~145KB (acceptable for mobile)
- Minimize DOM manipulation in render functions
- Use CSS transforms for animations (hardware accelerated)
- Test on lower-end devices
- Ensure smooth scrolling

### Accessibility

- Semantic HTML structure maintained in template
- Color contrast ratios accessible (WCAG AA)
- Touch targets minimum 44x44px
- Both RTL (Arabic) and LTR (English) text support
- Screen reader compatibility

### State Management

- All user data persists to `localStorage.umrah_state`
- State includes: config, progress, selectedDuas
- Auto-save on every progress update
- Backward compatible with old `umrah_user_config`

## Future Extensibility

The current architecture supports:

**Easy additions:**
- ✅ More duas (just add to duas.json)
- ✅ New themes (define in themes.json)
- ✅ Random dua selection (already implemented)
- ✅ Custom theme ordering (update rounds.json)

**Ready for:**
- Gender-specific content (filter by tags)
- Madhab-specific duas (category filtering)
- Multiple languages (add translation fields)
- Dua categories/browsing (use tags)
- Search functionality (index by tags/content)
- User favorites (extend STATE.config)

## Common Tasks Quick Reference

### Add a High-Value Dua
1. Add to `src/data/duas.json` with `"category": ["high-value"]`
2. Add `"label": "⭐ HIGH-VALUE: Description"`
3. Include in theme's `required` array
4. Build and test

### Change Round Themes
1. Edit `src/data/rounds.json`
2. Change `theme` value to different theme ID
3. Build and deploy

### Enable/Disable Dua Randomization
User can toggle in Settings, or modify:
```javascript
STATE.config.duaRandomization = true/false
```

### Reset User Progress
```javascript
STATE.progress.tawaf.clear();
STATE.progress.sai.clear();
STATE.progress.tawafNafil.clear();
STATE.save();
```

Or user can use "Reset Progress" buttons in UI.
