# Hero and Navbar Refinements Design

## Overview
This design document details the visual refinements for the Job Courier Hero and Navbar components, specifically focusing on color palette adjustments and the implementation of a modern slider navigation system. The goal is to achieve a more "Clinical Boutique" aesthetic with distinct but complementary white tones, and an enhanced interactive experience for the image slider.

## 1. Palette Adjustments
We are implementing a dual-white system to create a subtle hierarchy and separation between the global navigation and the candidate-focused content area.

*   **Navbar Background**: `#FAFAFA` (Pure white, slightly warm)
    *   *Rationale*: Creates a crisp, lightweight top boundary that feels editorial.
*   **Candidates Section Background (Left Hero)**: `#F4F6F8` (Cool/Digital white)
    *   *Rationale*: Slightly darker and cooler than the navbar, providing a "tool-like" functional backdrop that makes the navbar appear to float above it.

## 2. Companies Slider Navigation (Right Hero)
The current automated image slider will be upgraded with interactive "Pill Style" navigation dots.

*   **Placement**: Bottom center of the companies (right) panel, resting above the dark gradient overlay.
*   **Style**:
    *   **Inactive State**: `6px` circular dot, white color with `40%` opacity.
    *   **Active State**: `24px` by `6px` horizontal pill, white color at `100%` opacity.
*   **Animation**:
    *   Width transition using GSAP's `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing for a magnetic, fluid feel.
*   **Behavior**:
    *   Clicking a dot manually changes the slide and resets the automatic timer.
    *   The auto-advance timer will be reduced from 5 seconds to 4 seconds for a slightly faster pace.

## 3. Preserved Elements
Per explicit request, the following elements will *not* be modified in this update:
*   The `LOGIN` button color will remain red (`#e63946`).
*   The `border-radius` of the AdSlots will remain unchanged (rounded).
