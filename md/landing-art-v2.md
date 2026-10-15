# Landing Art V2

Updated: 2026-10-13. Generated with the built-in image generation tool, using the
user-supplied adventure landing reference. Original source artwork was preserved.
No background blur or full-image white overlay is applied. All logo text, labels
and buttons are HTML. Decorative characters are part of the bitmap, not animated layers.

## Assets

- `public/assets/adventure-hero-v2.png`: desktop scene.
- `public/assets/adventure-hero-mobile-v2.png`: portrait scene selected at 900px and below.

## Desktop Prompt

Edit this reference into a clean website background asset, wide landscape 16:9.
Preserve the bright crisp colorful polished cartoon adventure style, the schoolboy
and friendly round white-blue robot together at lower left, castle at upper left,
floating islands, hot air balloon upper right, treasure chest lower right. Remove ALL
website UI: top navigation bar, central logo, swords, ribbon, text, feature badges,
buttons, footer copy. Remove text on balloon and wooden signs; replace wooden sign
assembly with natural foliage and floating island scenery. Fill removed areas seamlessly
with clean light blue sky and sparse soft white clouds. Keep center 40% width mostly
open clear pale blue sky for real HTML overlay; NO white fog overlay on whole image,
no blur, no fake controls, no text or letters anywhere. Characters entirely confined
leftmost 27%, chest rightmost 23%. This is the production background, not a screenshot
or mockup.

## Mobile Prompt

Create a portrait 9:16 mobile responsive variant of this exact production game website
background. Preserve boy and round white blue robot, castle, treasure chest, blue sky
and vivid polished cartoon art. TOP 72% of image must be clean bright pale blue sky,
only sparse clouds at outer margins, no objects or text; real HTML logo and buttons
will overlay here. Confine small boy and robot together to BOTTOM LEFT 25% height and
castle behind them. Treasure chest BOTTOM RIGHT. Tiny hot air balloon bottom right
above chest, below 72% line. Bottom landscape fills bottom 25%. Continuous beautiful
sky from top to bottom, NO dividing line. No text, no interface, no logo, no signs,
no fog wash, crisp illustration. Portrait 9:16.

## Verification

Production build and browser smoke tests passed. Tested widths: 320, 390, 768, 1366,
1920. Checks include decoded responsive assets, first-screen CTA, visible next band,
no horizontal overflow, reduced motion, tab visibility pause and working navigation.
Generated artwork may differ in placement from exact prompt percentages; screenshots
were inspected for final composition. The existing bundle-size warning remains.
