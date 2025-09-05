# Manual QA Testing Checklist

## Setup Screen Tests
- [ ] Navigate to `/` - Setup screen loads
- [ ] All radio button groups work (Width, Height, Mirror, Font Size, Colors)
- [ ] "Continue" button navigates to `/prompter` with URL parameters
- [ ] URL parameters correctly reflect selected options
- [ ] Settings persist when navigating back from prompter

## Script Editor Tests
- [ ] Textarea accepts text input
- [ ] Word count and character count update correctly
- [ ] Estimated reading time displays
- [ ] Import button opens file dialog
- [ ] Import accepts `.txt` files and loads content
- [ ] Large file warning appears for files >300k characters
- [ ] Download button creates and downloads `.txt` file
- [ ] Clear button removes text after confirmation
- [ ] Auto-save works (refresh page to verify)

## Prompter Viewport Tests
- [ ] Script text displays in the viewport
- [ ] Font size changes apply immediately
- [ ] Text color changes apply immediately
- [ ] Background color changes apply immediately
- [ ] Margin adjustments work (0% to 40%)
- [ ] Mirror toggle flips text horizontally
- [ ] Default text shows when no script is present

## Scrolling Engine Tests
- [ ] Play button starts scrolling
- [ ] Pause button stops scrolling
- [ ] Stop button resets position to top
- [ ] Speed slider (1-10) affects scroll speed
- [ ] Speed buttons (+/-) work correctly
- [ ] Scrolling is smooth and frame-accurate
- [ ] Position indicator updates during scroll

## Keyboard Controls Tests
- [ ] Space key toggles play/pause
- [ ] Up arrow increases speed (max 10)
- [ ] Down arrow decreases speed (min 1)
- [ ] Home key jumps to top
- [ ] Page Up key jumps to top
- [ ] End key jumps to end
- [ ] Page Down key jumps to end
- [ ] F key toggles app fullscreen
- [ ] F11 key works for browser fullscreen (browser dependent)
- [ ] Keyboard controls work when focused on different elements

## Fullscreen Tests
- [ ] Fullscreen button enters fullscreen mode
- [ ] F key shortcut works for fullscreen
- [ ] Exit fullscreen button appears in fullscreen mode
- [ ] Controls hidden in fullscreen mode
- [ ] Floating controls appear in fullscreen
- [ ] ESC key exits fullscreen

## UI State Tests
- [ ] Maximize button hides script editor
- [ ] Restore button brings back script editor
- [ ] Play/Pause button changes icon and text
- [ ] Speed display shows current speed and WPM
- [ ] Position counter updates during playback
- [ ] Large text performance warning appears when appropriate

## Settings & Accessibility Tests
- [ ] High contrast mode applies correctly
- [ ] Focus indicators visible and clear
- [ ] Tab navigation works through all controls
- [ ] Screen reader labels present (test with screen reader if available)
- [ ] Reduced motion preference respected
- [ ] Color choices accessible (sufficient contrast)

## Performance Tests
- [ ] Large script (>100k chars) shows performance warning
- [ ] Smooth scrolling maintained with large scripts
- [ ] Memory usage reasonable (check DevTools)
- [ ] No memory leaks during extended use
- [ ] GPU acceleration working (check DevTools Performance tab)

## Persistence Tests
- [ ] Settings saved to localStorage
- [ ] Script content saved to localStorage
- [ ] Language preference saved
- [ ] Theme preference saved
- [ ] Settings restore after page refresh
- [ ] URL parameters update when settings change

## Internationalization Tests
- [ ] Default language detected from browser
- [ ] Language switcher works (if implemented)
- [ ] French translations display correctly
- [ ] Language preference persists

## Error Handling Tests
- [ ] Invalid file imports handled gracefully
- [ ] Large file import warnings work
- [ ] Network errors handled (if applicable)
- [ ] JavaScript errors caught by error boundary
- [ ] Fallback UI displays for errors

## Browser Compatibility Tests
Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (if available)

## Mobile Responsiveness Tests
- [ ] Layout adapts to smaller screens
- [ ] Touch controls work on mobile
- [ ] Pinch-to-zoom disabled appropriately
- [ ] Mobile keyboard shortcuts work

## Build & Deployment Tests
- [ ] `npm run build` completes successfully
- [ ] Production build loads without errors
- [ ] All assets load correctly
- [ ] Service worker caching works (if implemented)
- [ ] Security headers present

## Sample Test Script

```
This is a sample teleprompter script for testing purposes.

It contains multiple paragraphs with various lengths of text to test the scrolling functionality.

You can adjust the speed using the keyboard arrows or the speed control slider.

The mirror mode flips this text horizontally for use with teleprompter hardware.

This script should demonstrate smooth scrolling at various speeds from 1 to 10.

Test the keyboard shortcuts:
- Space to play/pause
- Up/Down arrows for speed
- Home/End for navigation
- F for fullscreen

The word count and reading time estimates should update as you modify this text.

Performance warnings should appear if you paste a very large script.

Try different themes and accessibility settings to ensure everything works correctly.
```