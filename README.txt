PONDCREST PUNCH LIST

This website shows the site plan, points, descriptions and JPEG photos.
Anyone with access can mark an item complete (green) or reopen it (orange).
Completion is shared through Supabase and refreshes every 20 seconds.

To add points later:
1. Replace punch-list.csv with the complete cumulative CSV export.
2. Add the new JPEGs in photos/, using exactly the filenames from Point photos.
3. Commit the changes in GitHub. Pages publishes the update automatically.
Keep Name identifiers unique and stable. Never reuse an old Name for a new item.
The CSV needs Name, Code, Description, Easting, Northing, and Point photos.
Coordinates must use the same South Carolina feet system as the current plan.

To replace the site plan, its georeferencing configuration must also be updated.
Completion states live in Supabase, not in the CSV or local browser storage.

config.json contains only a public Supabase publishable key, not a secret key.
The database limits public writes to completion and new item identifiers.
Photo/map files and punch-list data are visible to visitors of this website.

The prebuilt assets are included; changing CSV/photos needs no local build.
To change application code: npm install, npm run build, commit assets too.
