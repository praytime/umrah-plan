> "Tawaf is an opportunity to focus on Allah’s remembrance. As you circle, recite any dhikr or dua that is easy to recall (e.g., the shahadah, surahs of the Holy Quran, salawat on the Prophet صلى الله عليه وسلم). There is no assigned dhikr for tawaf. At the same time, it is important to plan what you will recite and to maintain a proper mindset throughout it." — Sheikh Hussain Abdul Sattar, [Sacred Learning](https://www.sacredlearning.org/hajj-and-umrah/)

# 🕋 Umrah Dua Guide

A comprehensive, mobile-optimized interactive guide for duas and adhkar during Tawaf and Sa'i of Umrah.

## ✨ Features

### 📱 Mobile-First Design
- **Dark theme** optimized for low-light environments and battery saving
- **Responsive layout** works perfectly on all screen sizes
- **Touch-optimized** interface for easy navigation in crowded conditions
- **Offline-capable** - works without internet after first load

### 🎯 Round Counter & Progress Tracking
- **Visual progress bars** for Tawaf (7 rounds) and Sa'i (7 laps)
- **Complete buttons** at the end of each section
- **Auto-navigation** - automatically opens the next round/lap when you complete one
- **Green checkmarks** to track completed rounds
- **Reset functionality** to start fresh or for multiple Umrahs

### 📿 Authentic Duas
- **Organized by theme** - each round has a specific spiritual focus
- **Arabic text** with proper formatting
- **Transliteration** for easy pronunciation
- **English translations** for understanding
- **Source citations** (Quran & Hadith references)

### ⭐ High-Value Duas Integrated
- **Sayyid al-Istighfar** - The master of seeking forgiveness
- **Protection from Four Great Harms** - Hell, grave, trials, and Dajjal
- **Comprehensive duas** for parents, children, guidance, and Jannah
- Clearly marked with ⭐ **HIGH-VALUE** labels

### 💚 Duas the Prophet ﷺ Loved Most - Integrated Throughout
The Prophet's ﷺ most beloved duas are integrated into the appropriate thematic sections:
- **Forgiveness dua for Laylatul Qadr** - in Tawaf Round 2 (Seeking Forgiveness)
- **"O Turner of Hearts"** (his most frequent dua) - in Tawaf Round 3 (Strengthening Faith)
- **Mercy and Guidance** - in Tawaf Round 3 (Strengthening Faith)
- **Well-being in both worlds** - highlighted in Sa'i Lap 3 (Health and Well-being)
- **Most comprehensive dua** - appears in multiple sections including Sa'i Lap 7

## 📖 Content Structure

### TAWAF - 7 Rounds
1. **Gratitude and Arrival** - Shukr (Thankfulness)
2. **Seeking Forgiveness** - Istighfar (Repentance)
3. **Sending Blessings Upon the Prophet ﷺ** - Salawat
4. **Family and Loved Ones** - Family Bonds
5. **Worldly Needs and Livelihood** - Sustenance and Success
6. **The Muslim Ummah** - Unity and Global Concerns
7. **Jannah and Protection** - The Hereafter

### SA'I - 7 Laps
1. **Trust in Allah** - Tawakkul (Reliance)
2. **Patience and Perseverance** - Sabr
3. **Health and Well-being** - Physical and Mental Wellness
4. **Knowledge and Wisdom** - 'Ilm
5. **Righteous Deeds** - Good Actions
6. **Protection and Safety** - Allah's Protection
7. **Comprehensive Final Dua** - Bringing It All Together

### Additional Sections
- **Personal Notes Section** - Write and save your own duas and intentions
- **Special Positions for Dua** - When and where to make specific duas
- **General Tips** - Practical advice for maximum spiritual benefit
- **Quick Reference** - Essential duas with Arabic text
- **How to Pray Janaza in the Haram** - Complete step-by-step funeral prayer guide

## 🛠️ Development & Build Process

This project uses a **data-driven, single-file build**:

### Project Structure
```
umrah-plan/
├── src/
│   ├── data/
│   │   ├── duas.json          # 36 duas with full metadata
│   │   ├── themes.json        # 19 themes with selection rules
│   │   └── rounds.json        # Tawaf/Sa'i configurations
│   └── templates/
│       └── index.html         # HTML template
├── build.js                   # Build script
├── index.html                 # Generated output (~110 KB, deployed)
└── package.json
```

### Build Commands
```bash
# Install dependencies (optional - for watch mode)
npm install

# Build the site (generates index.html)
npm run build

# Watch for changes and auto-rebuild
npm run watch

# Serve locally for testing
npm run serve

# Launch the JSON data editor (see below)
npm run edit:data
```

### How It Works
1. JSON files contain all duas, themes, and configurations (validated against schemas in `src/data/schemas/`).
2. `build.js` embeds that data into `src/templates/index.html`, producing a single self-contained `index.html`.
3. No runtime dependencies; great for GitHub Pages and offline use.

### Data Editor (schema-validated)
Run `npm run edit:data` to open a local SPA for editing `duas.json`, `themes.json`, and `rounds.json`.
- Default URL: http://127.0.0.1:4000/app
- Uses Ajv 8 in both browser (bundled locally from `node_modules/ajv/dist/ajv.js`) and server for live + save-time validation.
- Writes directly to the JSON files under `src/data/`.

### Adding New Duas
1. Add dua to `src/data/duas.json`:
```json
{
  "my-new-dua": {
    "id": "my-new-dua",
    "category": ["gratitude"],
    "type": "full",
    "arabic": "...",
    "transliteration": "...",
    "translation": "...",
    "source": "Quran 2:201",
    "tags": ["gratitude", "dunya"]
  }
}
```

2. Reference in `src/data/themes.json`:
```json
{
  "gratitude-arrival": {
    "duas": {
      "required": ["my-new-dua"],
      "pool": [...],
      "count": 2
    }
  }
}
```

3. Run `npm run build`

## 🚀 How to Use

1. **Online:** Visit the live site at [praytime.github.io/umrah-plan](https://praytime.github.io/umrah-plan)
2. **Offline:** After visiting once, the page works without internet
3. **Mobile Home Screen:** Add to your phone's home screen for app-like experience
4. **During Umrah:**
   - Open the appropriate section (Tawaf or Sa'i)
   - Tap a round/lap to expand and see the duas
   - Read and recite the duas
   - Tap "Complete Round/Lap" button when finished
   - The next section automatically opens
   - Track your progress with the visual progress bar

## 📱 Add to Home Screen

### iPhone (Safari)
1. Open the website in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Umrah Duas" and tap "Add"

### Android (Chrome)
1. Open the website in Chrome
2. Tap the three dots menu
3. Tap "Add to Home screen"
4. Name it and tap "Add"

## 🌙 Best Practices

- **Quality over Quantity** - Don't rush through duas
- **Understand the Meanings** - Read the translations
- **Personal Connection** - Mix prescribed duas with your own words
- **Stay Present** - Focus on meanings with conviction
- **For Others** - Remember the entire Ummah in your duas
- **Use the Progress Tracker** - It helps you stay focused in crowds

## 📚 Sources

All duas are sourced from:
- **The Holy Quran**
- **Authentic Hadith** (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Ahmad)
- **Verified by scholars** to ensure authenticity

## 🤲 Dua for Acceptance

May Allah ﷻ accept your Umrah and grant you all that you ask for.

**تَقَبَّلَ اللهُ مِنَّا وَمِنْكُم**  
*Taqabbal Allahu minna wa minkum*  
(May Allah accept from us and from you)

## 📄 License

This project is free to use and share for the sake of Allah. Feel free to:
- Share the link with others
- Use it for your Umrah
- Suggest improvements
- Report issues

## 🙏 Contributions

If you find any errors or have suggestions for improvement:
1. Open an issue in this repository
2. Submit a pull request with corrections
3. Share feedback about your experience using it

## ⚠️ Disclaimer

This guide is meant to help organize your thoughts and intentions during Umrah. The most important thing is **sincerity and presence of heart**. Don't stress about following it perfectly—use it as a framework to help you make meaningful, focused duas throughout your blessed journey.

## 🔗 Share This Guide

Help others benefit from this guide:
- Share the link with family and friends planning Umrah
- Post in Islamic community groups
- Share with your local masjid
- Create a QR code for easy sharing

---

**Built with ❤️ for the Muslim Ummah**

*If this guide benefits you, please make dua for the creator, their family, and all Muslims.*

**JazakAllahu Khairan** for using this guide. May your Umrah be accepted! 🕋
