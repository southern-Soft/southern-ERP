# TCX Color Codes Implementation

## Summary

Added comprehensive Pantone TCX (Textile Color eXchange) color code support to the Color Master system.

## What Was Added

### 1. Backend Endpoint
**File:** `backend/modules/settings/routes/settings.py`
- **Endpoint:** `POST /api/v1/settings/color-master/seed-tcx`
- **Function:** Seeds all TCX colors into the Color Master table
- **Features:**
  - Automatically creates color families if they don't exist
  - Maps TCX colors to appropriate color families (RED, BLUE, GREEN, etc.)
  - Updates existing TCX colors if they already exist
  - Returns statistics (inserted, updated, total count)

### 2. TCX Color Database
**File:** `backend/modules/settings/routes/seed_tcx_colors.py`
- **Total Colors:** 340+ Pantone TCX colors
- **Categories:**
  - 30 Red colors
  - 30 Pink colors
  - 30 Orange colors (including 2024 Color of the Year: Peach Fuzz)
  - 30 Yellow colors
  - 40 Green colors
  - 50 Blue colors
  - 40 Purple colors
  - 40 Brown colors
  - 30 Neutral/Gray/Black/White colors
  - 20 Beige colors

### 3. Frontend Integration
**File:** `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx`
- Added "Seed All TCX Colors" button in the TCX Color Code tab
- Button shows a confirmation dialog before seeding
- Displays success message with statistics after seeding
- Automatically refreshes the color master list after seeding

**File:** `frontend/services/api.ts`
- Added `seedTcx()` method to `settingsService.colorMaster`

## How to Use

### Step 1: Navigate to Color Master
1. Go to: `http://localhost:2222/dashboard/erp/settings/colors`
2. Click on the **"Color Master"** tab
3. Click on the **"TCX Color Code"** sub-tab

### Step 2: Seed TCX Colors
1. You'll see a blue info card at the top with a **"Seed All TCX Colors"** button
2. Click the button
3. Confirm the action in the dialog
4. Wait for the seeding to complete (may take a few seconds)
5. You'll see a success message showing:
   - Number of colors inserted
   - Number of colors updated
   - Total TCX colors in the system

### Step 3: View TCX Colors
- All seeded TCX colors will appear in the TCX Color Code tab
- You can search, filter, and manage them like any other color master entries
- Each color includes:
  - Color name (e.g., "Fiery Red")
  - TCX code (e.g., "18-1664")
  - Hex value (e.g., "#CE2939")
  - Color family mapping

## Technical Details

### Color Master Structure
Each TCX color is stored as a `ColorMaster` entry with:
- `color_code_type`: "TCX"
- `color_code`: The TCX code (e.g., "18-1664")
- `color_name`: Descriptive name (e.g., "Fiery Red")
- `hex_value`: Hex color code (e.g., "#CE2939")
- `color_family_id`: Mapped to appropriate family (RED, BLUE, etc.)
- `color_id`: Base color for the family
- `is_active`: True

### Color Family Mapping
TCX colors are automatically mapped to these color families:
- RED → Red family
- PINK → Pink family
- ORANGE → Orange family
- YELLOW → Yellow family
- GREEN → Green family
- BLUE → Blue family
- PURPLE → Purple family
- BROWN → Brown family
- WHITE → White family
- BLACK → Black family
- GREY → Grey family
- BEIGE → Beige family

## API Endpoint

**POST** `/api/v1/settings/color-master/seed-tcx`

**Response:**
```json
{
  "message": "TCX colors seeded successfully",
  "inserted": 340,
  "updated": 0,
  "skipped": 0,
  "total_tcx_colors": 340
}
```

## Notes

- The seeding process is **idempotent** - you can run it multiple times safely
- Existing TCX colors will be updated if they already exist
- The process automatically creates color families and base colors if they don't exist
- All colors are set as active by default
- Colors include remarks indicating they are Pantone TCX colors

## Future Enhancements

To add more TCX colors:
1. Edit `backend/modules/settings/routes/seed_tcx_colors.py`
2. Add more entries to `COMPREHENSIVE_TCX_COLORS` list
3. Format: `("Color Name", "TCX-CODE", "#HEXCODE", "FAMILY")`
4. Run the seed endpoint again

## Testing

To test the endpoint manually:
```bash
curl -X POST http://localhost:8000/api/v1/settings/color-master/seed-tcx \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```
