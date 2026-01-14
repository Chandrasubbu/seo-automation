# Region-Based Technical Audit Implementation

## Overview
The technical audit system has been enhanced to perform audits from the customer's website region, ensuring performance metrics reflect the user experience in the server's actual geographic location.

## Features Implemented

### 1. **Automatic Server Location Detection**
- Detects the server location using:
  - Domain TLD analysis (e.g., .ca → Canada)
  - CloudFlare IP country headers
  - Default detection based on hosting patterns
- Stores detected location: country, region code, city, and timezone

### 2. **Region-Specific Audit Requests**
- Fetches website from the detected (or specified) region
- Adds region-specific headers to simulate requests from different geographic locations:
  - `Accept-Language` headers based on region
  - `CloudFlare-IPCountry` headers
  - Custom region identifiers for accurate testing

### 3. **Region Selection Options**
Available regions for manual override:
- **Auto-Detect** (from server location) - Default
- United States (US)
- Canada (CA)
- United Kingdom (UK)
- Australia (AU)
- Germany (DE)
- Japan (JP)
- Singapore (SG)
- India (IN)

### 4. **Results Display**
Audit results now include:
- **Audit Region**: The region from which the audit was performed
- **Server Location**: 
  - City and Country
  - Region code
  - Timezone

### 5. **Database Changes**
Added `region` field to `TechnicalAudit` model to track which region the audit was performed from.

## API Changes

### POST /api/technical-audit
**New Parameter:**
```json
{
  "url": "https://example.com",
  "region": "CA"  // Optional: specify region (defaults to auto-detect)
}
```

**Response includes:**
```json
{
  "auditRegion": "CA",
  "serverLocation": {
    "country": "Canada",
    "region": "CA-MB",
    "city": "Winnipeg",
    "timezone": "America/Winnipeg"
  },
  ...
}
```

## Code Changes

### Files Modified:

1. **lib/services/technical-audit.ts**
   - Added `auditRegion` and `serverLocation` to `TechnicalAuditResult` interface
   - Added `detectServerLocation()` method to identify server location
   - Added region-specific headers for fetch requests
   - Modified `runFullAudit()` to accept optional `targetRegion` parameter
   - Updated `fetchPage()` to include region headers

2. **app/api/technical-audit/route.ts**
   - Added `region` parameter handling in POST request
   - Updated database save to store `region` field
   - Passes region to `technicalAuditService.runFullAudit()`

3. **components/TechnicalAudit.tsx**
   - Added region selection dropdown with 8 regional options
   - Updated UI to display audit region and server location info
   - Enhanced report generation to include location data
   - Added location info card to results display

4. **prisma/schema.prisma**
   - Added `region` field to `TechnicalAudit` model

## Example Usage

### Auto-Detect (Canada-based website)
```typescript
const result = await technicalAuditService.runFullAudit("https://www.eastsideventilation.ca")
// Automatically detects Canada, performs audit from CA region
// Returns: auditRegion: "CA", serverLocation: {country: "Canada", region: "CA-MB", city: "Winnipeg", ...}
```

### Manual Region Override
```typescript
const result = await technicalAuditService.runFullAudit("https://www.eastsideventilation.ca", "US")
// Forces audit from United States region
// Useful for testing cross-region performance
```

## Benefits

1. **Accurate Performance Metrics**: Get realistic speed and performance data from the server's actual region
2. **Regional Testing**: Compare how your site performs across different geographic regions
3. **Server Location Detection**: Automatically identifies where a website is hosted
4. **Better Insights**: Helps identify regional performance issues
5. **SEO Optimization**: Test how search engines in different regions experience your site

## Technical Details

### Region Detection Logic
1. **Check domain TLD** - Fast, reliable for country-specific domains
2. **Parse response headers** - CloudFlare header indicates hosting location
3. **Default fallback** - Uses US if unable to detect

### Supported Timezones by Region
- US → America/New_York
- CA → America/Winnipeg (customizable by region)
- UK → Europe/London
- AU → Australia/Sydney
- DE → Europe/Berlin
- JP → Asia/Tokyo
- SG → Asia/Singapore
- IN → Asia/Kolkata

## Future Enhancements

1. **Real Proxy Support**: Integrate with actual proxy services for true regional requests
2. **Regional CDN Testing**: Test CDN performance from different regions
3. **Advanced Analytics**: Compare audit results across multiple regions
4. **Scheduled Regional Audits**: Automate audits from different regions on schedule
5. **Regional Reports**: Generate comparative reports across regions
