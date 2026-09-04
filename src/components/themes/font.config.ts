import { Inter } from 'next/font/google';

/**
 * DESIGN.md specifies Inter for the entire system — display, body, navigation,
 * captions. There is no second family. The marketing site's Playfair Display is
 * a marketing voice and deliberately does not appear in the portal.
 */
const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const fontVariables = fontInter.variable;
