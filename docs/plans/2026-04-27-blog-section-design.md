# Blog Section Split Redesign

## Overview
This design document details the complete redesign of the "Blog / Risorse & Suggerimenti" section for Job Courier. The goal is to move away from the current dark theme and static layout to a clean, "Clinical Boutique" white design featuring a 50/50 horizontal split separating content for Candidates and Companies, complete with automated, independent sliders.

## 1. Architecture and Layout
*   **Background**: Pure white (`#FFFFFF`) to ensure the section feels like a continuous, clean editorial space.
*   **Split Structure**: On desktop, the layout is divided into two equal 50% width columns. 
    *   **Left Column**: Dedicated to Candidates with the heading "Suggerimenti per la Carriera".
    *   **Right Column**: Dedicated to Companies with the heading "Suggerimenti per il Recruiting".
*   **Mobile Behavior**: The split stacks vertically on mobile devices, with Candidates appearing first.

## 2. Card Aesthetics
*   **Styling**: Cards will have a white background, a very thin border (`border-slate-200`), and a subtle shadow (`shadow-sm`) to distinguish them from the white section background.
*   **Layout**: Each card features an image at the top (with clean, rounded corners), a bold sans-serif title, a brief text excerpt in slate/gray, and a stylized "Leggi l'articolo →" call-to-action.
*   **No Dark/Colored Backgrounds**: The cards will remain strictly white-based to conform to the "Clinical Boutique" aesthetic.

## 3. Interaction and Animation
*   **Dual Sliders**: Each column features its own independent horizontal slider showing one or two cards at a time depending on viewport width.
*   **Automation**: Sliders will auto-advance every 5 seconds. The timers for the two sliders will be slightly offset to prevent a synchronized "windshield wiper" visual effect.
*   **Hover Pause**: Hovering over a card will pause the automated slider to allow for reading.
*   **Controls**: The navigation dots will use the exact same "Pill-style" interaction developed for the Hero section, placed at the bottom center of each respective slider block.
