# Hero and Navbar Refinements Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Refine the color palette of the Hero and Navbar for a "Clinical Boutique" feel, and add interactive pill-style navigation dots to the company slider.

**Architecture:** We will modify the existing `Navbar.jsx` and `Hero.jsx` React components. Tailwind CSS classes will handle the static color changes, while React state and Framer Motion will manage the slider dot interactions and animations.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Update Navbar Background Color

**Files:**
- Modify: `webapp/src/components/Navbar.jsx`

**Step 1: Write the minimal implementation**

Update the header background color inline style.

```jsx
// In webapp/src/components/Navbar.jsx
// Find:
<header
    className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 transition-all duration-300"
    style={{
        height: navHeight,
        backgroundColor: '#F7F8F6',
// Replace with:
<header
    className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 transition-all duration-300"
    style={{
        height: navHeight,
        backgroundColor: '#FAFAFA',
```

**Step 2: Commit**

```bash
git add webapp/src/components/Navbar.jsx
git commit -m "style: update navbar background color to #FAFAFA"
```

### Task 2: Update Hero Candidates Background

**Files:**
- Modify: `webapp/src/components/Hero.jsx`

**Step 1: Write the minimal implementation**

Update the background color class for the candidates section container.

```jsx
// In webapp/src/components/Hero.jsx
// Find:
<motion.div
    onMouseEnter={() => !isMobile && setHoveredSide('candidates')}
    onMouseLeave={() => !isMobile && setHoveredSide(null)}
    initial={{ width: isMobile ? '100%' : '60%' }}
    animate={{
        width: isMobile ? '100%' : (hoveredSide === 'companies' ? '40%' : '60%')
    }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="relative min-h-[50vh] md:min-h-screen bg-[#EAECEE] flex flex-col justify-start px-8 md:px-12 lg:px-16 pt-32 md:pt-48 pb-24 text-slate-900 border-b md:border-b-0 md:border-r border-slate-200"
>
// Replace with:
<motion.div
    onMouseEnter={() => !isMobile && setHoveredSide('candidates')}
    onMouseLeave={() => !isMobile && setHoveredSide(null)}
    initial={{ width: isMobile ? '100%' : '60%' }}
    animate={{
        width: isMobile ? '100%' : (hoveredSide === 'companies' ? '40%' : '60%')
    }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="relative min-h-[50vh] md:min-h-screen bg-[#F4F6F8] flex flex-col justify-start px-8 md:px-12 lg:px-16 pt-32 md:pt-48 pb-24 text-slate-900 border-b md:border-b-0 md:border-r border-slate-200"
>
```

**Step 2: Commit**

```bash
git add webapp/src/components/Hero.jsx
git commit -m "style: update hero candidates background to #F4F6F8"
```

### Task 3: Implement Pill-Style Slider Dots

**Files:**
- Modify: `webapp/src/components/Hero.jsx`

**Step 1: Write the minimal implementation for timer and dots rendering**

Update the timer to 4000ms and add the dot rendering logic inside the companies slider section.

```jsx
// In webapp/src/components/Hero.jsx
// Find:
useEffect(() => {
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
}, []);
// Replace with:
useEffect(() => {
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
}, [sliderImages.length]); // Added dependency to reset timer on manual click (if we add a state trigger later, but simpler is to just let it loop, or we can handle it inside click)

// For manual click reset:
const [timerKey, setTimerKey] = useState(0);
useEffect(() => {
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
}, [timerKey, sliderImages.length]);

const handleDotClick = (index) => {
    setCurrentImageIndex(index);
    setTimerKey(prev => prev + 1); // Reset timer
};
```

And in the JSX for the right panel:
```jsx
// In webapp/src/components/Hero.jsx
// Add before the closing tag of the companies motion.div:
{/* Slider Dots */}
<div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 z-30">
    {sliderImages.map((_, idx) => (
        <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className="rounded-full bg-white transition-all duration-300 focus:outline-none"
            style={{
                width: currentImageIndex === idx ? '24px' : '6px',
                height: '6px',
                opacity: currentImageIndex === idx ? 1 : 0.4,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            aria-label={`Go to slide ${idx + 1}`}
        />
    ))}
</div>
```

Note: Ensure `timerKey` state is added near the other states at the top of the component: `const [timerKey, setTimerKey] = useState(0);`

**Step 2: Commit**

```bash
git add webapp/src/components/Hero.jsx
git commit -m "feat: add pill-style interactive navigation dots to hero slider"
```
