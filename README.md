# Pondcrest punch list

Interactive georeferenced site plan with 37 initial punch items, JPEG photo previews, and shared completion saving in Supabase.

Orange means open. Green means complete. Anyone with access to the website can mark an item complete or reopen it.

## Website

Once GitHub Pages is enabled: https://bkpatri.github.io/Pondcrest/

## Add points or update descriptions

1. Replace `punch-list.csv` with your complete cumulative CSV export.
2. Add matching JPEG files under `photos/`, keeping filenames identical to the CSV’s `Point photos` values.
3. Commit the changes. GitHub Pages publishes the updated files.

Keep every point’s `Name` unique and stable. Do not reuse an old Name for a new item. Completion statuses are stored separately from the CSV and remain saved when the CSV is replaced.

Required CSV columns: `Name`, `Code`, `Description`, `Easting`, `Northing`, `Point photos`. Use the same EPSG:6570 coordinate system as the current dataset.

## Maintenance

Prebuilt browser assets are included under `assets/`; CSV and photo updates need no build. For application source changes, run `npm install` and `npm run build`, then commit the updated assets with the source.

`config.json` contains only the public Supabase project URL and publishable key. Never place a secret or service-role key in browser files. `setup/shared-completion.sql` records the database setup already applied to the Pondcrest Supabase project.
