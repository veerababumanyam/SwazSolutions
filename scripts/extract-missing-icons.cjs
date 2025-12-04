const fs = require('fs');
const path = require('path');
const simpleIcons = require('simple-icons');

const logosDir = path.join(__dirname, '../public/assets/social-logos');

// Find all available icons
console.log('Looking for Amazon icons:');
Object.keys(simpleIcons).filter(k => k.toLowerCase().includes('amazon')).forEach(k => {
  console.log(k, '->', simpleIcons[k].title);
});

console.log('\nLooking for CodePen:');
Object.keys(simpleIcons).filter(k => k.toLowerCase().includes('codepen')).forEach(k => {
  console.log(k, '->', simpleIcons[k].title);
});

console.log('\nLooking for Deezer:');
Object.keys(simpleIcons).filter(k => k.toLowerCase().includes('deezer')).forEach(k => {
  console.log(k, '->', simpleIcons[k].title);
});

console.log('\nLooking for Microsoft Teams:');
Object.keys(simpleIcons).filter(k => k.toLowerCase().includes('team')).forEach(k => {
  console.log(k, '->', simpleIcons[k].title);
});

// Define the correct mappings
const iconMappings = {
  'amazon': 'siAmazon',
  'codepen': 'siCodepen',
  'deezer': 'siDeezer',
  'amazonmusic': 'siAmazonmusic',
  'microsoftteams': 'siMicrosoftteams',
};

console.log('\n\nExtracting icons:');
for (const [filename, siKey] of Object.entries(iconMappings)) {
  const icon = simpleIcons[siKey];
  if (icon) {
    const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>${icon.title}</title><path d="${icon.path}"/></svg>`;
    fs.writeFileSync(path.join(logosDir, filename + '.svg'), svg);
    console.log('Created:', filename + '.svg');
  } else {
    console.log('Not found:', siKey);
  }
}
