# AgriPulse AI — API Documentation

Base URL: `/api/v1`

All responses follow the standard JSON response format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

---

## 1. Health Endpoint

### `GET /health`
Returns system status, active integrations, and uptime.

---

## 2. Profile Management

### `GET /profile`
Returns the authenticated farmer's profile.

### `PUT /profile`
Updates farmer profile information.
**Body:**
```json
{
  "full_name": "Kisan Patel",
  "phone": "+91 9876543210",
  "state": "Karnataka",
  "district": "Mandya",
  "village": "Keregodu",
  "preferred_language": "en",
  "farming_experience": 12,
  "total_agricultural_land": 5.5,
  "land_measurement_unit": "acres",
  "farming_type": "mixed"
}
```

---

## 3. Farm Plots

### `GET /plots`
Lists all plots belonging to the authenticated farmer.

### `POST /plots`
Creates a new farm plot.
**Body:**
```json
{
  "plot_name": "North Canal Field",
  "area": 3.5,
  "area_unit": "acres",
  "soil_type": "Clay Loam",
  "irrigation_source": "Canal & Borewell",
  "location": "Near Canal Bridge",
  "latitude": 12.5218,
  "longitude": 76.8951
}
```

### `GET /plots/:id`
Retrieves a single plot by UUID.

### `PUT /plots/:id`
Updates plot parameters.

### `DELETE /plots/:id`
Deletes a plot and associated soil records.

---

## 4. Soil Analysis

### `GET /plots/:id/soil-records`
Lists all historical soil test records for a plot.

### `POST /plots/:id/soil-records`
Saves a new soil test record.

### `POST /soil/analyze`
Submits soil parameters for AI fertility and deficiency analysis.
**Body:**
```json
{
  "plot_id": "uuid-optional",
  "nitrogen": 240,
  "phosphorus": 18,
  "potassium": 210,
  "ph": 6.8,
  "moisture": 38,
  "organic_carbon": 0.65,
  "soil_texture": "Clay Loam"
}
```

---

## 5. Crop Recommendation Engine

### `POST /crop-recommendations`
Generates personalized crop recommendations using soil, season, and real-time weather.
**Body:**
```json
{
  "plot_id": "uuid-optional",
  "season": "Kharif",
  "water_availability": "Moderate",
  "preferred_crop_category": "All",
  "budget_preference": "Moderate",
  "farming_objective": "Maximum Yield",
  "language": "en"
}
```

### `GET /crop-recommendations`
Retrieves historical crop recommendation reports.

---

## 6. Disease Identification

### `POST /disease/diagnose`
Accepts `multipart/form-data` with an image of the plant leaf or affected part.
**Fields:**
- `image`: File (JPG, PNG, WebP)
- `crop_name`: "Tomato"
- `plant_part`: "Leaf"
- `symptoms`: "Concentric dark brown rings on lower foliage"

### `GET /disease/history`
Retrieves previous disease diagnostic reports.

---

## 7. Fertilizer Advisory

### `POST /fertilizer/recommend`
Formulates 4R nutrient plans according to crop growth stage and soil test results.
**Body:**
```json
{
  "crop_name": "Rice (Paddy)",
  "growth_stage": "Basal / Sowing",
  "farm_area": 2.5,
  "area_unit": "acres",
  "nitrogen": 240,
  "phosphorus": 18,
  "potassium": 210,
  "ph": 6.8
}
```

### `GET /fertilizer/history`
Retrieves past fertilizer advisory plans.

---

## 8. Weather Integration

### `GET /weather/current`
Returns current temperature, humidity, wind speed, rainfall, and irrigation advisory.
**Query:** `latitude`, `longitude`, `plot_id`

### `GET /weather/forecast`
Returns a 7-day agricultural weather forecast.

### `GET /plots/:id/weather`
Returns weather specifically for the plot's coordinates.

---

## 9. AI Kisan Assistant (Chat)

### `GET /chat/conversations`
Lists the farmer's chat sessions.

### `POST /chat/conversations`
Creates a new conversation session.

### `GET /chat/conversations/:id`
Retrieves all messages in a conversation.

### `POST /chat/conversations/:id/messages`
Sends a query and generates an agricultural advisory response in the selected language.
**Body:**
```json
{
  "message": "Why are my maize leaves turning yellow?",
  "plot_id": "uuid-optional",
  "language": "en"
}
```
