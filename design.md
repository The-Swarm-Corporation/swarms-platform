# Modern Glassmorphic UI Design System

## Core Design Principles

### 1. Glassmorphic Effects
The foundation of our design system is built on modern glass-like effects that create depth while maintaining readability.

```css
/* Base glassmorphic card */
.glass-card {
  @apply bg-white/[0.04]        /* Subtle background */
         backdrop-blur-sm       /* Glass effect */
         border-white/[0.06]    /* Subtle border */
         shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.06)];
}

/* Enhanced hover state */
.glass-card:hover {
  @apply bg-white/[0.08]
         border-white/20
         transform
         scale-[1.02];
}
```

### 2. Typography Hierarchy

Our type system is designed for maximum readability on dark backgrounds:

```css
/* Headings */
h1 {
  @apply text-3xl               /* Base size */
         sm:text-4xl           /* Tablet */
         lg:text-5xl           /* Desktop */
         font-bold
         tracking-tighter
         text-white;
}

/* Subheadings */
h2 {
  @apply text-xl
         sm:text-2xl
         font-semibold
         text-white;
}

/* Body text */
p {
  @apply text-base
         sm:text-lg
         text-gray-300;        /* Improved readability */
}

/* Secondary text */
.secondary-text {
  @apply text-sm
         text-gray-400
         group-hover:text-gray-300;
}
```

### 3. Interactive Elements

Buttons and interactive elements follow a consistent pattern:

```css
/* Base button */
.interactive-element {
  @apply transition-all
         duration-300
         ease-out
         hover:scale-110
         active:scale-90;
}

/* Icon container */
.icon-container {
  @apply w-12
         h-12
         rounded-xl
         bg-white/[0.06]
         group-hover:bg-white/[0.1]
         flex
         items-center
         justify-center;
}
```

### 4. Layout & Spacing

Consistent spacing and layout rules:

```css
/* Grid layouts */
.grid-layout {
  @apply grid
         grid-cols-1
         sm:grid-cols-2
         lg:grid-cols-3
         gap-4;
}

/* Section spacing */
.section {
  @apply mb-16
         sm:mb-20
         last:mb-0;
}

/* Content padding */
.content-wrapper {
  @apply p-6
         sm:p-8;
}
```

## Component Patterns

### 1. Card Components

Cards are a fundamental building block of the interface:

```jsx
<div className="group relative flex flex-col p-6 sm:p-8 rounded-2xl border border-white/[0.06] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 ease-out cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.06)]">
  {/* Card content */}
</div>
```

Key features:
- Subtle background with hover state
- Soft border with increased opacity on hover
- Scale transform on interaction
- Layered shadows for depth
- Backdrop blur for glass effect

### 2. Input Fields

Search and input elements follow this pattern:

```jsx
<input
  className="w-full bg-white/[0.04] text-white placeholder-gray-400 rounded-2xl px-5 py-4 focus:outline-none border border-white/[0.06] hover:border-white/[0.12] focus:border-white/20 transition-all duration-200 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] focus:bg-white/[0.08]"
/>
```

Features:
- Subtle background with hover/focus states
- Inset shadow for depth
- Lighter placeholder text
- Smooth transitions

### 3. Icon Buttons

Interactive icon elements:

```jsx
<button className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm">
  <Icon size={22} className="transform hover:scale-110 active:scale-90 transition-transform duration-300" />
</button>
```

## Background Effects

### 1. Gradient Background

```jsx
<div className="min-h-screen bg-[#000000] bg-gradient-to-b from-black via-black/95 to-black/90">
  {/* Content */}
</div>
```

### 2. Ambient Glow

```jsx
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-radial from-white/[0.05] to-transparent rounded-full blur-2xl pointer-events-none" />
```

## Best Practices

1. **Contrast & Readability**
   - Use `text-white` for primary text
   - `text-gray-300` for secondary text
   - `text-gray-400` for tertiary text
   - Increase font weights for better visibility

2. **Interactive Feedback**
   - Consistent hover/active states
   - Scale transforms for buttons
   - Color transitions for text
   - Background opacity changes

3. **Responsive Design**
   - Mobile-first approach
   - Consistent breakpoints (sm, lg)
   - Fluid typography
   - Adaptive spacing

4. **Performance**
   - Use `transform` for animations
   - Implement `will-change` for heavy animations
   - Optimize backdrop-blur usage
   - Manage shadow complexity

## Implementation Tips

1. **Setup Requirements**
   - Tailwind CSS with JIT mode
   - PostCSS for advanced features
   - Modern browser support

2. **Color Management**
   - Use white with opacity for consistency
   - Maintain contrast ratios
   - Test in different lighting conditions

3. **Animation Guidelines**
   - Keep durations at 200-300ms
   - Use `ease-out` for natural feel
   - Combine transforms for smooth effects

4. **Accessibility**
   - Maintain WCAG contrast requirements
   - Ensure keyboard navigation
   - Provide hover/focus indicators
   - Test with screen readers

## Common Patterns

```css
/* Common utility classes */

.glass-effect {
  @apply backdrop-blur-sm
         bg-white/[0.04]
         border-white/[0.06]
         shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.06)];
}

.interactive-hover {
  @apply hover:bg-white/[0.08]
         hover:border-white/20
         transform
         hover:scale-[1.02]
         active:scale-[0.98];
}

.text-gradient {
  @apply bg-gradient-to-r
         from-white
         to-white/70
         bg-clip-text
         text-transparent;
}
```

This design system emphasizes:
- Visual hierarchy through typography and spacing
- Interactive feedback through consistent hover states
- Depth through subtle shadows and transforms
- Accessibility through proper contrast and readability
- Responsive design through systematic breakpoints
- Performance through optimized effects

