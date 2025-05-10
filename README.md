Run with npm run dev


Test user to login: test@hiddenstudios.com & GBu_V2S9D.aY6pc

Tried requests library, then playwright, and playwright stealth to pull fortnite data, none worked. No other APIs (that I found) were sufficient for this exact purpose. Decided to pull data from a few maps instead, and then run statistical analysis on them to determine future forecasts. Here are the IDs: 6155-1398-4059, 4366-9611-6988, and 2744-5526-2967. 


Setup Instructions: 
git clone the repo, cd the repo, npm install, add env vars

npm run dev to run

Approach & Assumptions

- Authentication is handled via Supabase email/password.
- Profile data is stored in a Supabase Postgres table with row-level security.
- Map stats are fetched from a Supabase table populated with synthetic/mock data, as Fortnite.gg does not provide a public API and blocks scraping.
- Forecasting is performed client-side using three simple, interpretable algorithms.
- UI is built with shadcn/ui and Recharts for a modern, accessible experience.

Data Collection & Forecasting Technique

Data Collection

- Historical map data is synthetic/mock, manually transcribed from Fortnite.gg screenshots.
- No official or hidden API was available; scraping was blocked by Cloudflare.
- All data is clearly labeled as synthetic/mock in the UI and README.

  
Forecasting Algorithms

- Linear Regression: Captures the overall trend in player counts. If the map is gaining or losing popularity, this method will show a rising or falling forecast based on the best-fit line through the historical data.
- Moving Average: Smooths out short-term fluctuations by averaging the last 7 days. This produces a flat forecast, representing a “typical” value, but ignores trends and seasonality.
- Seasonal Naive: Repeats the last week’s pattern for the next 30 days, capturing weekly cycles (e.g., weekends). Useful for maps with strong weekly seasonality.

Discrepancies:
- Linear regression may diverge from the moving average if there’s a strong trend.
- Seasonal naive will show repeating ups and downs, while the moving average is flat and linear regression is a straight line.

Usage
- Sign in with your test credentials.
- Go to /dashboard (from /login)
- Enter a Fortnite map code (e.g., 6155-1398-4059) and fetch stats.
- View the forecast table and chart for the next 30 days, with all three methods.
- Optionally, view historical data by clicking “Fetch Historical Data.”
