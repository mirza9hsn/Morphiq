export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;700&family=Space+Grotesk:wght@400;700&family=Syne:wght@400;800&display=swap';

export const SYSTEM_FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Geist Sans', value: 'var(--font-geist-sans), sans-serif' },
    { name: 'Geist Mono', value: 'var(--font-geist-mono), monospace' },
    { name: 'System Sans', value: 'system-ui, sans-serif' },
    { name: 'System Serif', value: 'serif' },
    { name: 'System Mono', value: 'monospace' },
];

export const getAvailableFonts = () => {
    // Note: URL parsing on the client side needs a valid base if relative, 
    // but here we use an absolute Google Fonts URL.
    try {
        const url = new URL(GOOGLE_FONTS_URL);
        const families = url.searchParams.getAll('family');

        const googleFonts = families.map(f => {
            const name = f.split(':')[0].replace(/\+/g, ' ');
            // Determine fallback
            let fallback = 'sans-serif';
            if (name === 'Playfair Display') fallback = 'serif';

            const cssValue = name.includes(' ') ? `"${name}", ${fallback}` : `${name}, ${fallback}`;
            return { name, value: cssValue };
        });

        // Filter out duplicates (e.g. if a system font is also in Google Fonts)
        const allFonts = [...SYSTEM_FONTS];

        googleFonts.forEach(gf => {
            if (!allFonts.find(f => f.name.toLowerCase() === gf.name.toLowerCase())) {
                allFonts.push(gf);
            }
        });

        return allFonts;
    } catch (e) {
        console.error('Failed to parse fonts URL', e);
        return SYSTEM_FONTS;
    }
};
