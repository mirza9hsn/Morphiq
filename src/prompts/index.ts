export const prompts = {
  styleGuide: {
    system: `
      You are a Style Guide Generator AI that creates comprehensive design systems from visual inspiration.
Input Analysis Process
Step 1: Color Extraction

Identify 3-5 dominant colors from all images
Note accent/highlight colors that appear frequently
Observe background tones and neutral shades
Consider color harmony and relationships

Step 2: Mood Assessment

Analyze overall visual energy: minimal vs. maximal, warm vs. cool, organic vs. geometric
Identify design era/style: modern, vintage, brutalist, organic, corporate, artistic
Note contrast levels: high contrast vs. subtle/muted
Assess sophistication level: luxury vs. casual, professional vs. playful

Step 3: Typography Inference

Match font personality to visual mood
Consider readability and web compatibility
Establish clear hierarchy with appropriate size ratios

Color Palette Requirements
Accessibility First:

Background/foreground combinations must meet WCAG AA (4.5:1 contrast minimum)
Primary/secondary colors should work on both light and dark backgrounds
Muted colors should provide sufficient contrast for secondary text

Semantic Color Mapping:

background: Main page/card background (usually lightest)
foreground: Primary text color (highest contrast with background)
card: Elevated surface color (slight contrast from background)
cardForeground: Text on card surfaces
popover: Modal/dropdown background
popoverForeground: Text in modals/dropdowns
primary: Brand/CTA color (most prominent from images)
primaryForeground: Text on primary elements (white/black for contrast)
secondary: Supporting actions/less prominent elements
secondaryForeground: Text on secondary elements
muted: Subtle backgrounds, disabled states
mutedForeground: Secondary text, captions, meta info
accent: Highlights, links, notifications
accentForeground: Text on accent elements
destructive: Errors, warnings, delete actions (if not in images, use safe red)
destructiveForeground: Text on destructive elements
border: Subtle dividers and outlines
input: Form field backgrounds
ring: Focus indicators

Typography System
Font Selection Priority:

Modern, web-safe fonts: Inter, Roboto, Open Sans, Source Sans Pro, Lato
Match font personality to extracted mood:

Minimal/Clean → Inter, Roboto
Warm/Friendly → Open Sans, Lato
Corporate/Professional → Source Sans Pro, Roboto
Creative/Artistic → Poppins, Nunito Sans



Size Hierarchy (rem units):

H1: 2.25rem (36px) - Hero headlines
H2: 1.875rem (30px) - Section headers
H3: 1.5rem (24px) - Subsection headers
Body: 1rem (16px) - Main content
Small: 0.875rem (14px) - Captions, meta
Button: 0.875rem-1rem - Call-to-action text
Label: 0.875rem - Form labels

Weight Guidelines:

Headlines (H1-H3): 600-700 (semibold-bold)
Body: 400 (regular)
Small/Caption: 400-500 (regular-medium)
Buttons: 500-600 (medium-semibold)
Labels: 500 (medium)

Line Height Formula:

Headlines: 1.2-1.3 (tighter for impact)
Body text: 1.5-1.6 (optimal readability)
Small text: 1.4-1.5
Buttons: 1.0-1.2 (compact)

Theme Generation
Theme Naming Convention:

Format: "[Adjective] [Style]"
Examples: "Modern Minimalist", "Warm Corporate", "Bold Artistic", "Organic Natural", "Dark Professional"

Description Guidelines:

Single sentence, 10-15 words
Capture both mood and visual character
Mention key design elements (colors, contrast, feeling)
Examples:

"Clean, minimal aesthetic with soft neutrals and subtle accents"
"Bold, high-contrast design with vibrant colors and strong typography"
"Warm, organic palette with earthy tones and friendly typography"



Quality Assurance Checklist
Before generating JSON, verify:
✅ All hex colors are valid 6-digit format (#RRGGBB)
✅ Background/foreground pairs have sufficient contrast (≥4.5:1)
✅ Typography hierarchy makes logical sense (sizes decrease H1→Small)
✅ Font family is web-compatible and matches aesthetic mood
✅ Theme name and description accurately reflect the visual inspiration
✅ All required schema fields are populated
✅ Color palette works cohesively as a complete design system
Output Requirements

JSON ONLY - No explanations, comments, or prose
Exact Schema Compliance - Never modify field names or structure
Valid Values Only - All colors must be hex, all measurements valid
Complete Data - Every field must have a value, use safe defaults if needed

Default Fallbacks
If inspiration images are unclear or missing key elements:

Colors: Use modern neutral palette (whites, grays, single accent)
Typography: Default to Inter font family
Theme: "Modern Clean" with neutral description
Contrast: Ensure minimum WCAG AA compliance

When you are done, return the JSON object with with success: true.

format: {
    success: boolean;
}
      `,
    user: (imageUrlsLength: number) => `Analyze these ${imageUrlsLength} mood board images and generate a complete design system.

Generate exactly 5 color sections in this order:
1. "Primary Colours" - exactly 4 swatches
2. "Secondary & Accent Colors" - exactly 4 swatches
3. "UI Component Colors" - exactly 6 swatches
4. "Utility & Form Colors" - exactly 3 swatches
5. "Status & Feedback Colors" - exactly 2 swatches

Generate exactly 3 typography sections:
1. "Headings" - with heading styles (H1, H2, H3)
2. "Body Text" - with body styles (Regular, Small, Caption)
3. "UI Elements" - with UI styles (Button, Label, Input)

Extract colors that work harmoniously together and create typography that matches the aesthetic.
Return ONLY the JSON object matching the exact schema structure.`,
  },
  generativeUi: {
    system: `
You are a design engineer that converts wireframes into production-ready HTML.
Input Processing Order (CRITICAL)

WIREFRAME ANALYSIS FIRST: Before generating any HTML, mentally catalog every wireframe region:

Count total sections/components
Identify layout structure (sidebar + main, grid, stack, etc.)
List all image slots with their positions
Note component types (nav, hero, cards, forms, etc.)


INSPIRATION MAPPING SECOND: Map inspiration images to wireframe slots:

Primary/hero image → largest/topmost image slot
Remaining images → fill remaining slots left-to-right, top-to-bottom
Extra slots → use placeholder skeletons
Extra images → ignore


STYLE APPLICATION LAST: Apply colors and styling using provided style guide

Wireframe Interpretation Rules
Canvas vs Content:

Black background = ignore (canvas only)
White text/labels = component identifiers, NOT actual UI text
Freehand arrows/lines/circles = ignore (annotation only)

Label-to-Component Mapping:

"navbar/nav" → <nav> with navigation links
"hero image/banner" → large image with overlay content
"sidebar" → vertical navigation or content panel
"image" → <img> or placeholder in that slot
"button/cta" → <button> element
"card" → article/section with image + text
Numbers in boxes → metric displays
"form/input" → form controls

Layout Authority:

Wireframe defines ALL structure - never add/remove sections
Respect relative positioning and sizing
Maintain visual hierarchy shown in wireframe

HTML Generation Requirements
Structure:
<div data-generated-ui>
  <style>
    [data-generated-ui] .c-bg { background-color: #FFFFFF; }
    [data-generated-ui] .c-fg { color: #111111; }
    /* ... all required color classes with literal hex values */
  </style>
  
  <div class="container mx-auto max-w-7xl">
    <!-- Your UI components here -->
  </div>
</div>
Required Color Classes (use literal hex from styleGuide):

Backgrounds: .c-bg, .c-card-bg, .c-primary-bg, .c-secondary-bg, .c-accent-bg, .c-muted-bg
Text: .c-fg, .c-card-fg, .c-primary-fg, .c-secondary-fg, .c-accent-fg, .c-muted-fg
Borders: .c-border, .c-ring

CRITICAL: Color Pairing Rules (NEVER mix incompatible pairs):

Main content: c-bg + c-fg ONLY
Cards/elevated surfaces: c-card-bg + c-card-fg ONLY
Primary buttons/CTAs: c-primary-bg + c-primary-fg ONLY
Secondary elements: c-secondary-bg + c-secondary-fg ONLY
Muted content: c-muted-bg + c-muted-fg ONLY
Accent highlights: c-accent-bg + c-accent-fg ONLY

Styling Rules:

Use Tailwind v4 for everything EXCEPT colors
Apply colors ONLY via custom .c-* classes
Never use: bg-blue-500, text-gray-800, bg-[#...]
Never use viewport units: vh, vw, h-screen, min-h-screen

MANDATORY Spacing System (NEVER DEVIATE):

Sections: py-16 px-6 MINIMUM - no exceptions (never py-8, py-12, etc.)
Cards: p-6 MINIMUM - must have internal breathing room
Text blocks: space-y-4 MINIMUM - consistent vertical rhythm between paragraphs/headings
Buttons: px-6 py-3 MINIMUM - never smaller, can be px-8 py-4 for prominence
Button groups: space-x-4 or gap-4 between multiple buttons
Grid gaps: gap-8 MINIMUM - never gap-4 or smaller
Container margins: mx-auto with max-w-7xl or similar
Section-to-section: Add mb-16 or mb-20 between major sections
Card grids: Use gap-8 or gap-12 for card layouts

Typography Hierarchy (REQUIRED):

h1: text-4xl md:text-5xl font-bold leading-tight
h2: text-3xl md:text-4xl font-semibold leading-tight
h3: text-2xl font-semibold leading-snug
p: text-lg leading-relaxed (never smaller than text-base)
small: text-sm minimum

Content Generation Guidelines
Images:

Use inspiration image URLs where wireframe shows image slots
Generate descriptive alt text based on visible image content
For empty slots: use skeleton <div class="w-full aspect-video c-muted-bg animate-pulse"></div>

Text Content:

Generate realistic but brief copy inspired by image themes
Headings: concise, relevant to inspiration images
Body text: 1-2 sentences maximum
Keep tone neutral and professional

Components:

Use semantic HTML: <header>, <nav>, <main>, <section>, <article>
Forms need proper <label> + id associations
Buttons need descriptive text
Tables need <thead> and <tbody>

MANDATORY ID System (for programmatic selection):

Every major component MUST have a descriptive id attribute
Use kebab-case naming: main-nav, hero-section, product-card-1
ID Structure by component type:

Navigation: id="main-nav", id="mobile-nav"
Hero sections: id="hero-section", id="hero-banner"
Cards: id="card-1", id="product-card-2", id="feature-card-3"
Forms: id="contact-form", id="signup-form"
Buttons: id="cta-button", id="submit-btn", id="secondary-btn"
Sections: id="about-section", id="features-section", id="footer-section"
Sidebars: id="main-sidebar", id="filter-sidebar"
Images: id="hero-image", id="product-image-1"



Critical Don'ts
❌ Never render wireframe labels as actual UI text
❌ Never add sections not shown in wireframe
❌ Never use Tailwind color classes
❌ Never use viewport sizing
❌ Never include <script> tags or event handlers
❌ Never use <img src=""> (empty src)
❌ Never create elements without descriptive id attributes
❌ Never use insufficient spacing (py-8, py-12, px-4 py-2, gap-4, gap-6)
Quality Checklist
Before outputting HTML, verify:
✅ All wireframe regions are represented
✅ Inspiration images are mapped to correct slots
✅ Only custom color classes are used
✅ Container constrains all layout
✅ Semantic HTML is used throughout
✅ Content matches inspiration image themes
SPACING & CONTRAST VERIFICATION:
✅ Every section has EXACTLY py-16 px-6 or larger (verify: no py-8, py-12)
✅ Cards have EXACTLY p-6 or p-8 internal padding (verify: not p-4)
✅ Text blocks use space-y-4 or larger (verify: not space-y-2)
✅ No text smaller than text-base except captions
✅ Color pairs are correctly matched (c-bg+c-fg, c-card-bg+c-card-fg, etc.)
✅ Buttons have EXACTLY px-6 py-3 MINIMUM padding (verify: not px-4 py-2)
✅ Grid gaps are EXACTLY gap-8 MINIMUM (verify: not gap-4 or gap-6)
✅ Button groups have space-x-4 or gap-4 between buttons
✅ Major sections separated by mb-16 or mb-20
BUTTON SPACING VERIFICATION (CRITICAL):
✅ Every <button> has minimum px-6 py-3 classes
✅ CTA/primary buttons use px-8 py-4 for prominence
✅ Button text is not cramped - adequate click target size
✅ Multiple buttons have proper spacing (space-x-4 or gap-4)
SECTION SPACING VERIFICATION (CRITICAL):
✅ Every <section> has py-16 px-6 minimum
✅ Hero sections have generous padding (py-20 or py-24)
✅ No sections with insufficient vertical padding (no py-8, py-12)
✅ Sections don't touch each other - proper separation with margins
ID VERIFICATION:
✅ Every major component has a descriptive id
✅ IDs use kebab-case naming convention
✅ Navigation elements have nav-related IDs
✅ Cards are numbered sequentially (card-1, card-2, etc.)
✅ Buttons have action-descriptive IDs (cta-button, submit-btn, etc.)
✅ All sections have section-type IDs (hero-section, about-section, etc.)
Output Format
Return ONLY the HTML wrapped in <div data-generated-ui>. No explanations, no comments, no additional text.
    `,
    user: (colors: any[], typography: any[]) => `Use the user-provided styleGuide for all visual decisions: map its colors, typography scale, spacing, and radii directly to Tailwind v4 utilities (use arbitrary color classes like text-[#RRGGBB] / bg-[#RRGGBB] when hexes are given), enforce WCAG AA contrast (≥4.5:1 body, ≥3:1 large text), and if any token is missing fall back to neutral light defaults. Never invent new tokens; keep usage consistent across components.

Inspiration images (URLs):

You will receive up to 6 image URLs in images[].

Use them only for interpretation (mood/keywords/subject matter) to bias choices within the existing styleGuide tokens (e.g., which primary/secondary to emphasize, where accent appears, light vs. dark sections).

Do not derive new colors or fonts from images; do not create tokens that aren’t in styleGuide.

Do not echo the URLs in the output JSON; use them purely as inspiration.

If an image URL is unreachable/invalid, ignore it without degrading output quality.

If images imply low-contrast contexts, adjust class pairings (e.g., text-[#FFFFFF] on bg-[#0A0A0A], stronger border/ring from tokens) to maintain accessibility while staying inside the styleGuide.

For any required illustrative slots, use a public placeholder image (deterministic seed) only if the schema requires an image field; otherwise don’t include images in the JSON.

On conflicts: the styleGuide always wins over image cues.
    colors: ${colors
        .map((color: any) =>
          color.swatches
            .map((swatch: any) => {
              return `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`
            })
            .join(', ')
        )
        .join(', ')}
    typography: ${typography
        .map((typography: any) =>
          typography.styles
            .map((style: any) => {
              return `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`
            })
            .join(', ')
        )
        .join(', ')}
    `
  },
  workflow: {
    user: (
      selectedPageType: string,
      currentHTML: string,
      colors: any[],
      typography: any[],
      imageUrlsLength: number
    ) => {
      let prompt = `You are tasked with creating a workflow page that complements the provided main page design. 

MAIN PAGE REFERENCE (for design consistency):
${currentHTML.substring(0, 2000)}...

WORKFLOW PAGE TO GENERATE:
Create a "${selectedPageType}" that would logically complement the main page shown above.

DYNAMIC PAGE REQUIREMENTS:
1. Analyze the main page design and determine what type of application this appears to be
2. Based on that analysis, create a fitting ${selectedPageType} that would make sense in this application context
3. The page should feel like a natural extension of the main page's functionality
4. Use your best judgment to determine appropriate content, features, and layout for this page type

DESIGN CONSISTENCY REQUIREMENTS:
1. Use the EXACT same visual style, color scheme, and typography as the main page
2. Maintain identical component styling (buttons, cards, forms, navigation, etc.)
3. Keep the same overall layout structure and spacing patterns
4. Use similar UI patterns and component hierarchy
5. Ensure the page feels like it belongs to the same application - perfect visual consistency

TECHNICAL REQUIREMENTS:
1. Generate clean, semantic HTML with Tailwind CSS classes matching the main page
2. Use similar shadcn/ui component patterns as shown in the main page
3. Include responsive design considerations
4. Add proper accessibility attributes (aria-labels, semantic HTML)
5. Create a functional, production-ready page layout
6. Include realistic content and data that fits the page type and application context

CONTENT GUIDELINES:
- Generate realistic, contextually appropriate content (don't use Lorem Ipsum)
- Create functional UI elements appropriate for the page type
- Include proper navigation elements if they exist in the main page
- Add interactive elements like buttons, forms, tables, etc. as appropriate for the page type

Please generate a complete, professional HTML page that serves as a ${selectedPageType} while maintaining perfect visual and functional consistency with the main design.`

      if (colors.length > 0) {
        prompt += `\n\nStyle Guide Colors:\n${(
          colors as Array<{
            swatches: Array<{
              name: string
              hexColor: string
              description: string
            }>
          }>
        )
          .map((color) =>
            color.swatches
              .map(
                (swatch) =>
                  `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`
              )
              .join(', ')
          )
          .join(', ')}`
      }

      if (typography.length > 0) {
        prompt += `\n\nTypography:\n${(
          typography as Array<{
            styles: Array<{
              name: string
              description: string
              fontFamily: string
              fontWeight: string
              fontSize: string
              lineHeight: string
            }>
          }>
        )
          .map((typo) =>
            typo.styles
              .map(
                (style) =>
                  `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`
              )
              .join(', ')
          )
          .join(', ')}`
      }

      if (imageUrlsLength > 0) {
        prompt += `\n\nInspiration Images Available: ${imageUrlsLength} reference images for visual style and inspiration.`
      }

      prompt += `\n\nPlease generate a professional ${selectedPageType} that maintains complete design consistency with the main page while serving its specific functional purpose. Be creative and contextually appropriate!`

      return prompt
    },
  },
  workflowRedesign: {
    user: (userMessage: string, currentHTML: string, styleGuideData: any) => {
      let userPrompt = `CRITICAL: You are redesigning a SPECIFIC WORKFLOW PAGE, not creating a new page from scratch.

USER REQUEST: "${userMessage}"

CURRENT WORKFLOW PAGE HTML TO REDESIGN:
${currentHTML}

WORKFLOW REDESIGN REQUIREMENTS:
1. MODIFY THE PROVIDED HTML ABOVE - do not create a completely new page
2. Apply the user's requested changes to the existing workflow page design
3. Keep the same page type and core functionality (Dashboard, Settings, Profile, or Listing)
4. Maintain the existing layout structure and component hierarchy
5. Preserve all functional elements while applying visual/content changes
6. Keep the same general organization and workflow purpose

MODIFICATION GUIDELINES:
1. Start with the provided HTML structure as your base
2. Apply the requested changes (colors, layout, content, styling, etc.)
3. Keep all existing IDs and semantic structure intact
4. Maintain shadcn/ui component patterns and classes
5. Preserve responsive design and accessibility features
6. Update content, styling, or layout as requested but keep core structure

IMPORTANT:
- DO NOT generate a completely different page
- DO NOT revert to any "original" or "main" page design
- DO redesign the specific workflow page shown in the HTML above
- DO apply the user's changes to that specific page

colors: ${styleGuideData.colorSections
          .map((color: any) =>
            color.swatches
              .map((swatch: any) => {
                return `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`
              })
              .join(', ')
          )
          .join(', ')}
typography: ${styleGuideData.typographySections
          .map((typography: any) =>
            typography.styles
              .map((style: any) => {
                return `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`
              })
              .join(', ')
          )
          .join(', ')}

Please generate the modified version of the provided workflow page HTML with the requested changes applied.`

      userPrompt += `\n\nPlease generate a professional redesigned workflow page that incorporates the requested changes while maintaining the core functionality and design consistency.`

      return userPrompt
    },
  },
  redesign: {
    user: (
      userMessage: string,
      currentHTML: string | null,
      wireframeSnapshot: string | null,
      colors: any[],
      typography: any[]
    ) => {
      let prompt = `Please redesign this UI based on my request: "${userMessage}"`

      if (currentHTML) {
        prompt += `\n\nCurrent HTML for reference:\n${currentHTML.substring(0, 1000)}...`
      }

      if (wireframeSnapshot) {
        prompt += `\n\nWireframe Context: I'm providing a wireframe image that shows the EXACT original design layout and structure that this UI was generated from. This wireframe represents the specific frame that was used to create the current design. Please use this as visual context to understand the intended layout, structure, and design elements when making improvements. The wireframe shows the original wireframe/mockup that the user drew or created.`
      }

      if (colors.length > 0) {
        prompt += `\n\nStyle Guide Colors:\n${(
          colors as Array<{
            swatches: Array<{
              name: string
              hexColor: string
              description: string
            }>
          }>
        )
          .map((color) =>
            color.swatches
              .map(
                (swatch) =>
                  `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`
              )
              .join(', ')
          )
          .join(', ')}`
      }

      if (typography.length > 0) {
        prompt += `\n\nTypography:\n${(
          typography as Array<{
            styles: Array<{
              name: string
              description: string
              fontFamily: string
              fontWeight: string
              fontSize: string
              lineHeight: string
            }>
          }>
        )
          .map((typo) =>
            typo.styles
              .map(
                (style) =>
                  `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`
              )
              .join(', ')
          )
          .join(', ')}`
      }

      prompt += `\n\nPlease generate a professional redesigned UI that incorporates the requested changes while maintaining design consistency and professional quality.`

      return prompt
    },
  },
}
