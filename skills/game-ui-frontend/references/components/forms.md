# Forms and settings: fields, toggles, steppers, sliders

Working code: [templates/overlay.html](../../templates/overlay.html) (settings rows with an exterior marker,
latch switch, Previous and Next buttons, explanation field). Placement: [screen-map.md](../layout/screen-map.md#settings-and-forms--options-settings-name-entry-text_entry).

## What games teach about settings

1. **Label | value columns** with fine dividers; the focused row brightens its text, marker *and* rules together.
   Evidence: `hi-fi-rush-options-anatomy`, `colin-mcrae-rally-2-0-options-anatomy`, `sh2r-setup`
2. **A separate explanation field** describes whatever is focused, so labels can stay short.
   Evidence: `hi-fi-rush-options-anatomy`, `sh2r-setup`
3. **These games use arrows to change short option sets in place.** Carry the in-place change to the web with labelled Previous and Next buttons.
   Evidence: `colin-mcrae-rally-2-0-options-anatomy`, `sh2r-setup`
4. **Text entry can be open and typographic**, with entered characters shown large above.
   Evidence: `colin-mcrae-rally-2-0-tag-entry-anatomy`
5. **The calm field around a small list reads as intentional.** Evidence: `dbfz-brush-scene-options`

## Controls

| Control | Use when | Markup | Notes |
| --- | --- | --- | --- |
| **Latch switch** | On/off that applies immediately | `<button role="switch" aria-checked>` | The latch travels on the site's angle; the label is a separate element linked by `aria-labelledby` |
| **Stepper** | 2–6 ordered options, changes apply immediately | `role="group"` + two buttons + `<output aria-live="polite">` | Give Previous and Next their own visible plates and ≥44px targets. Consider `<select>` for >6 options |
| **Segmented choice** | 2–4 exclusive options visible at once | Native radios in a fieldset | Enclose each choice and give the selected plate a distinct contour or fill |
| **Slider** | Continuous values | Native `<input type="range">` restyled | Pattern: `paint-rake-range`; dragging must stay immediate, never eased |
| **Text field** | Free text | `<label>` + `<input>`; errors with `aria-describedby` | Pattern: `marginalia-field-focus`. Focus art outside the field, not a glow ring |
| **Submit** | Ending a form | `<button type="submit">` | Pattern: `type-stamp-submit`. A stamp or ceremony on success, not just a spinner |

## Layout

- When a setting has a consequence worth explaining, use one shared field beside the list (220–300px).
  On phones put that explanation below the list or focused row. A self-explanatory control needs only its label and value.
- Forms: one column of fields, labels above inputs, max 60ch wide; group related fields with a drawn
  section mark rather than a bordered card.
- Row height ≥ 56px for settings; field height ≥ 44px.

## Rules

- **Labels are always visible text.** Placeholders are not labels.
- Errors: text near the field, linked with `aria-describedby`, plus a colour change, plus an icon or mark.
  Never rely on colour alone.
- Immediate-apply controls (switch, stepper) need no submit button. Mixed forms do need one, so be consistent.
- Draw shapes on pseudo-elements; `clip-path` on the control clips its hit area and focus ring.
- Inputs must still work with browser autofill, password managers and zoom to 200%.

## Generic tells to avoid

- iOS-style rounded pill toggles on a game-directed site.
- Bordered rounded input boxes with a blue focus glow.
- Helper captions under every setting that repeat its label or value.

## Checklist

- [ ] Aligned labels and values, visible focus, and readable guidance wherever a setting changes the user's decision.
- [ ] Correct native element or ARIA role for each control; every control ≥ 44px.
- [ ] Visible labels; errors described in text and linked.
- [ ] Shapes on pseudo-elements; focus ring visible.
- [ ] `verify.mjs --selector ".switch" --selector ".stepper button" --context ".settings__row"` passes.
