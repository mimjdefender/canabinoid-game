# Cannabinoid Receptor Game

An educational game teaching about THC and CBD receptor binding through an engaging shooter-style gameplay.

## Features

- Educational gameplay about cannabinoid receptors
- Mobile-friendly design
- Sound effects and background music
- Particle effects and animations
- Touch controls for mobile devices

## How to Play

1. Use arrow keys (or touch controls on mobile) to move
2. Press SPACE (or "Switch" button) to switch between THC and CBD
3. Press X (or "Shoot" button) to launch molecules
4. Match:
   - THC with CB1 receptors
   - CBD with CB2 receptors

## Deployment Options

### 1. GitHub Pages (Free)
1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your main branch as the source
5. Your game will be available at `https://[username].github.io/[repository-name]`

### 2. Netlify (Free)
1. Sign up for a Netlify account
2. Connect your GitHub repository
3. Deploy with default settings
4. Your game will be available at a Netlify subdomain

### 3. Vercel (Free)
1. Sign up for a Vercel account
2. Import your GitHub repository
3. Deploy with default settings
4. Your game will be available at a Vercel subdomain

### 4. Local Development
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

## Development

### Prerequisites
- Web browser
- Basic HTTP server (for local development)

### File Structure
```
cannabinoid-game/
├── index.html
├── game.js
├── audio/
│   ├── bgm.mp3
│   ├── shoot.mp3
│   ├── hit.mp3
│   ├── miss.mp3
│   └── switch.mp3
└── README.md
```

### Customization
- Edit `game.js` to modify game mechanics
- Adjust canvas size in `index.html`
- Modify styles in the CSS section of `index.html`
- Replace audio files in the `audio` directory

## License
MIT License - Feel free to use and modify for your own purposes! 