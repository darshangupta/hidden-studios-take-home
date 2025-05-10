# Fortnite Map Insights Dashboard

## Running the App

Run with:

```
npm run dev
```

## Test User

Test user to login: `test@hiddenstudios.com` & `GBu_V2S9D.aY6pc`

## Data Collection Approach (Updated)

This app now fetches **real player count data** for Fortnite Creative maps using a two-step process:

1. **Numeric Map ID Extraction:**
   - Given a public map code (e.g., `6155-1398-4059`), the app scrapes the numeric map ID from the Fortnite.gg island page (e.g., `data-id="218"`).
2. **Player Count Data Fetching:**
   - Using the numeric ID, the app queries the hidden Fortnite.gg API endpoint (`player-count-graph`) to retrieve raw player count data at the most granular interval available (10 minutes, 1 hour, etc.).
   - The app then aggregates this interval data into **daily peak and average player counts** for each day in the past month.

## API Usage

To fetch daily stats for a map, use:

```
GET /api/map-stats?map_code=YOUR_MAP_CODE
```

- Example: `/api/map-stats?map_code=6155-1398-4059`
- The response is an array of objects: `{ date, peak_players, avg_players }` for each day.

## Statistical Methods

The dashboard provides forecasts for future player counts using the following statistical methods:

- **Linear Regression:** Captures the overall trend in player counts by fitting a best-fit line to the historical data and projecting it forward.
- **Moving Average:** Smooths out short-term fluctuations by averaging the last 7 days, providing a stable forecast that ignores trends and seasonality.
- **Seasonal Naive:** Repeats the last week's pattern for the next 30 days, capturing weekly cycles and seasonality in player activity.

These methods are implemented in `src/lib/forecast.ts` and are used to generate the forecast tables and charts in the dashboard.

## Source of Fortnite.gg Data

The logic for scraping the numeric map ID and fetching/aggregating player count data from the hidden Fortnite.gg API is implemented in:

- `src/app/api/map-stats/route.ts`

This file handles the entire process: extracting the numeric ID, fetching the raw interval data, and aggregating it into daily stats for use in the dashboard.

## Notes
- No data is mocked; all stats are fetched live from Fortnite.gg.
- The app does not use Supabase for map stats anymore—everything is pulled and processed on demand.
- If the numeric ID cannot be found or the map is not tracked by Fortnite.gg, the API will return an error.




