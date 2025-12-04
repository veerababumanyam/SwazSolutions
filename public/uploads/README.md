# Image Storage Directory

This directory contains uploaded profile assets organized by type:

- **avatars/** - User profile pictures (512x512px max, JPEG/PNG/WebP)
- **backgrounds/** - Profile background images (1920x1080px max, optimized for responsive)
- **logos/** - Custom company/brand logos (512x512px max, PNG/SVG)
- **social-logos/** - Platform logos for social links (auto-detected, 15+ platforms)

## Naming Convention
Files are named using: `{user_id}_{timestamp}_{type}.{ext}`
Example: `123_1701532800_avatar.jpg`

## Storage Guidelines
- Avatars: Max 2MB, auto-optimize to 512x512px
- Backgrounds: Max 10MB, generate responsive sizes (768px, 1024px, 1920px)
- Logos: Max 500KB, support PNG and SVG
- Social logos: Provided by system, cached from CDN

## Cleanup Policy
- Orphaned files (no DB reference) are cleaned up after 30 days
- Old versions are kept for 7 days for rollback
