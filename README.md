# Pondcrest punch list

Live website: https://bkpatri.github.io/Pondcrest/

127 final punch list items with georeferenced site-plan markers, JPEG photos, survey details, and shared completion saving in Supabase.

## Filters and colors

Filter category and responsible party independently or together. Categories come from the beginning of Description: Concrete, Grading, Storm, or Conduit. Codes identify the responsible party (Punch-JR or Punch-HLC). Open items use category colors; completion always overrides the category color with green. Filters apply to both the map and item list. Status and search filters can also be combined.

Hover previews and the item detail panel show Name, Code, Description, Easting, Northing, Elevation, in that order, alongside the photo. Hover previews let pointer events pass through to prevent flickering.

## CSV downloads

- Pondcrest-Trimble.csv: Name, Easting, Northing, Elevation, Code, Description. Includes a header. Map these columns when importing into the GPS software. Values remain in feet, EPSG:6570 (NAD83(2011) / South Carolina) with NAVD88/GEOID18 elevations, as supplied by the survey export.
- Pondcrest-Full.csv: unmodified original final CSV export, including the source coordinate-system metadata.
- punch-list.csv: website data with Name, Code, Description, Easting, Northing, Elevation, Point photos.

## Updating the list

Keep every Name unique and stable. Replace the complete cumulative website CSV, refresh both downloadable CSVs, and add the matching JPEG filenames under photos/. Existing completion statuses are stored separately and survive replacement. Do not reuse an old Name for another point. Prefix each Description with its category.

Prebuilt assets are under assets/. For application changes, run npm install and npm run build, then commit the source and rebuilt assets. CSV/photo-only changes need no rebuild.

config.json contains only the public Supabase URL and publishable key. Never put secret or service-role keys into browser files. setup/shared-completion.sql records the existing database setup.
