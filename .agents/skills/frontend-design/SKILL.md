---
name: frontend-design
description: Create distinctive, cinematic, production-grade frontend interfaces with high design quality for Antigravity. Use this skill when the user asks to build web components, pages, or applications that require a premium, tool-like aesthetic.
license: Complete terms in LICENSE.txt
---

# Antigravity Frontend Design

This skill transforms Antigravity into a World-Class Creative Technologist and Lead Frontend Engineer. Every interface produced must feel like a "Digital Tool": every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

## The Antigravity Philosophy

1. **Pixel Perfect 1:1**: Aim for high-fidelity execution that looks designed by a senior human designer.
2. **Cinematic Motion**: Gravity-based animations. Use GSAP (GreenSock) for high-performance orchestration.
3. **Tool Aesthetic**: Interfaces should feel functional and precise, not just decorative. Use data-heavy layouts, monospaced accents, and "system status" indicators.

## Design Presets (Antigravity Core)

When starting a project, align with one of these high-fidelity systems:

- **Organic Tech (Clinical Boutique)**: Bridging research labs with high-end luxury. Palette: Deep Navy (`#26367b`), Bright Blue (`#2f9de5`), Light Cream, Carbon. Typography: Plus Jakarta Sans / Outfit + Cormorant Garamond Italic.
- **Midnight Luxe (Dark Editorial)**: Members-only club meets high-end watchmaker. Palette: Midnight Navy (`#1a2554`), Accent Azure, Ivory, Slate. Typography: Inter (tight tracking) + Playfair Display Italic.
- **Brutalist Signal (Raw Precision)**: Control room for the future. No decoration, pure density. Palette: Paper (`#E8E4DD`), JobCourier Blue, Off-white, Black. Typography: Space Grotesk + DM Serif Display Italic + Space Mono.
- **Vapor Clinic (Neon Biotech)**: Genomic sequencing in a Tokyo nightclub. Palette: Deep Void (`#0A0A14`), Plasma Purple, Ghost, Graphite. Typography: Sora + Instrument Serif Italic + Fira Code.

## Implementation Workflow

### 1. Visual Texture
- **SVG Noise Overlay**: Always implement a global noise overlay using `<feTurbulence>` (opacity 0.05) to eliminate flat digital gradients.
- **Progressive Radius**: Use a system of `rounded-[2rem]` to `rounded-[3rem]` for containers. Avoid sharp corners unless in Brutalist mode.

### 2. Micro-Interactions
- **Magnetic Buttons**: Subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- **Sliding Overlays**: Use `overflow-hidden` with a sliding background `<span>` for button hover transitions.
- **Y-Lift**: Interactive elements should have a subtle `translateY(-1px)` lift.

### 3. Animation Life-Cycle
- **GSAP Context**: Use `gsap.context()` for all React animations.
- **Standard Easing**: `power3.out` for entrances, `power2.inOut` for morphing.
- **Stagger Protocol**: `0.08` for text characters, `0.15` for cards/containers.

## Technical Requirements (Antigravity Stack)

- **Framework**: React 19 (preferred).
- **Styling**: Tailwind CSS v3.4+ with custom arbitrary values.
- **Animation**: GSAP 3 (with ScrollTrigger).
- **Icons**: Lucide React.
- **Typography**: Google Fonts loaded via `<link>` tags in `index.html`.

## Prohibited Patterns (AI Slop)
- Plain red/blue/green colors.
- Generic cards with standard shadows.
- Inter/Roboto defaults without custom tracking/weight.
- Purple-on-white gradients.
- "Placeholder" images (use real Unsplash URLs or `generate_image` tool).

Remember: Don't build a website; build a digital instrument. Every scroll must feel intentional.