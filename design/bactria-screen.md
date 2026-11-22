# Bactria exploration screen

First layout proposal. See [the desktop wireframe](bactria-wireframe.svg). The drawing is a schematic interaction sketch, not a geographical reconstruction or working application.

## Opening view

Show the selected event, “Alexander enters Bactria”, and its date, “Spring 329 BCE”. The large map area sits beside a compact details panel; the time controls remain below the map. Start with a regional view and offer “World view” to restore broader context.

The map has separate layers for physical geography, historical places, an evidence-backed historical area when available, and modern borders and labels. Keep historical features visually distinct from modern comparison lines. Do not show a person marker just because an event is associated with that person.

## Then and now

Label the control “Compare with today”, with “Historical view” and “Modern borders visible” at its endpoints. At zero, modern borders and modern country labels are hidden. At full opacity, the historical area remains visible beneath them. The date and map position never change when this control moves. Provide a numeric value and keyboard support.

Use a dashed edge and light fill for a reviewed approximate historical extent. The legend says “Approximate historical extent” and links to its interpretation. If no reviewed geometry exists, replace this layer with an explicit unavailable state. A dotted edge does not make an invented shape acceptable.

## Date navigation

Begin with a short 330–326 BCE viewport around the scenario. Selecting the year 329 BCE shows events recorded within that year; it does not imply they lasted all year. Selecting the arrival event preserves its seasonal label. Changing year clears any event that is no longer in view and updates the details panel to the selected period.

Use previous/next event buttons as an alternative to dragging. Empty years say “No events in this collection for this year”. Keep timeline and map selections synchronised.

## Details and sources

The panel explains the selected record in a few sentences, distinguishes a place from an event, and exposes its supporting sources. Selecting Bactra shows its ancient and modern names. Selecting Bactria explains the region and the status of its outline. The first fixture has no exact personal location, so do not display one.

## Small screens

Keep the selected date and event title at the top. Offer Map and Events tabs instead of compressing two views side by side. Open details below the selected feature and preserve selection when switching tabs. Keep the comparison slider in the Map tab and provide the event list as a text alternative to map navigation.

## Review task

Ask a first-time visitor to locate Bactra, reveal modern borders, explain what the shaded area means, and open the source for the arrival date. If they interpret the shape as an exact frontier or the event as a continuously tracked location, revise the labels and interaction before expanding the dataset.
