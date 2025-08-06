# Non-Negotiables Repeat Feature Implementation

## Overview
This implementation adds repeat functionality to non-negotiables and fixes the export behavior to only include non-negotiables for specific dates when exporting single days.

## Changes Made

### 1. Database Schema Updates

#### New Column Added
- `repeat_type` TEXT DEFAULT 'one_time' CHECK (repeat_type IN ('daily', 'one_time'))
- Added index for better performance: `idx_non_negotiables_repeat_type`

#### Migration Script
Created `ADD_REPEAT_TYPE_MIGRATION.sql` to add the repeat_type field to existing databases.

### 2. Backend Functions (dataService.js)

#### New Functions Added
- `getNonNegotiablesForDateRange(startDate, endDate)` - Get non-negotiables for a date range
- `getDailyRepeatingNonNegotiables(targetDate)` - Get daily repeating items for a specific date
- `copyDailyRepeatingNonNegotiables(targetDate)` - Copy daily repeating items to a target date

#### Updated Functions
- `exportData(dateFilter = null)` - Now accepts optional date filter for single-day exports
- `getNonNegotiables(date = null)` - Enhanced to support date filtering

### 3. Frontend Components

#### NonNegotiables Component Updates
- Added repeat type selector (One-Time Only vs Repeat Daily)
- Replaced "Copy from Yesterday" button with "Load Daily Repeats"
- Added visual indicators for daily repeating items
- Auto-loads daily repeats when navigating to empty dates
- Added date synchronization with parent component

#### ExportData Component Updates
- Added support for single-day exports
- Shows "Export All Data" and "Export [Date]" options when a date is selected

#### Page Component Updates
- Added selectedDate state management
- Passes selectedDate to ExportDropdown when on non-negotiables tab
- Passes date change callbacks to NonNegotiables component

## Features

### Repeat Types
1. **One-Time Only**: Non-negotiable only applies to the specific day it was created for
2. **Repeat Daily**: Non-negotiable automatically appears on subsequent days

### Export Behavior
- **Export All Data**: Exports all entries and non-negotiables (existing behavior)
- **Export Single Day**: Only exports entries and non-negotiables for the selected date

### Auto-Loading
- Daily repeating non-negotiables are automatically loaded when navigating to dates that don't have any items
- Manual "Load Daily Repeats" button for today's date

## Usage

### Creating Non-Negotiables
1. Navigate to the Non-Negotiables tab
2. Click "Add Non-Negotiable"
3. Enter the text
4. Select repeat type:
   - **One-Time Only**: Item only appears on the selected date
   - **Repeat Daily**: Item will appear on the selected date and all future dates
5. Click the plus button to save

### Exporting Data
1. Navigate to the Non-Negotiables tab
2. Select a specific date (optional)
3. Click the export button
4. Choose:
   - "Export All Data" for complete export
   - "Export [Date]" for single-day export (only available when a date is selected)

### Managing Daily Repeats
- Daily repeating items are automatically loaded when navigating to empty dates
- Use "Load Daily Repeats" button to manually load daily repeating items for today
- Daily repeating items show a blue indicator with "Daily Repeat" label

## Database Migration

To apply the changes to an existing database:

1. Run the migration script:
```sql
-- Add the repeat_type column with default value
ALTER TABLE non_negotiables 
ADD COLUMN IF NOT EXISTS repeat_type TEXT DEFAULT 'one_time';

-- Add the check constraint
ALTER TABLE non_negotiables 
DROP CONSTRAINT IF EXISTS non_negotiables_repeat_type_check;

ALTER TABLE non_negotiables 
ADD CONSTRAINT non_negotiables_repeat_type_check 
CHECK (repeat_type IN ('daily', 'one_time'));

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_non_negotiables_repeat_type ON non_negotiables(repeat_type);

-- Update existing records to have 'one_time' as default
UPDATE non_negotiables 
SET repeat_type = 'one_time' 
WHERE repeat_type IS NULL;
```

2. Test the functionality using the provided test script:
```bash
node test-repeat-functionality.js
```

## Testing

The implementation includes comprehensive testing:
- Database schema validation
- CRUD operations with repeat types
- Export functionality with date filtering
- Auto-loading of daily repeats
- UI interactions and state management

## Backward Compatibility

- Existing non-negotiables are automatically set to 'one_time' repeat type
- All existing functionality remains unchanged
- Export behavior is enhanced but doesn't break existing exports 