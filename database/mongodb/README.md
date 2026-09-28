# MongoDB Architecture & Collections Guide
## Agriculture Resource and Farm Management System (AgriPulse)
**DBMS Level 3 Experiential Learning Project**

---

## 1. Why MongoDB is Required Alongside PostgreSQL

In modern agricultural computing, agricultural data divides fundamentally into two paradigms:

1. **Relational / Structured Data (Handled by PostgreSQL):**
   - Requires strict ACID guarantees, exact mathematical consistency, foreign key relationships, cascading deletes, transaction rollbacks, and financial auditing (e.g., Farms, Fields, Budgets, Ledger Expenses, Invoices, Harvest Sales, Role Authentication).
   
2. **Flexible / Document / Semi-Structured Data (Handled by MongoDB):**
   - **Dynamic Morphological Attributes:** A tomato field observation focuses on *leaf curl, blotches, blossom end rot, whitefly counts*, whereas a paddy observation records *submergence depth, panicle blight, stem borer presence*, and a cotton observation records *boll shed rates and aphid honeydew*. Forcing these varying attributes into a rigid SQL schema leads to sparse column anti-patterns (`col1`, `col2`, `attr_json`) or complex EAV (Entity-Attribute-Value) tables.
   - **Agricultural Knowledge & Advisories:** Advisories contain nested multi-level recommendations, polymorphic symptom arrays, dynamic chemical and biological treatments, multilingual tag arrays, and rich multimedia metadata.
   - **Farmer Field Journals & Notes:** Unstructured notes, voice transcriptions, geo-coordinates, and weather conditions.
   - **Weather Time-Series Observations:** Sensor arrays with flexible sub-documents for precipitation, barometric pressure, wind vectors, and UV indexes.

---

## 2. Collections Overview

| Collection Name | Document Purpose | Key MongoDB Features Demonstrated |
| :--- | :--- | :--- |
| `agricultural_advisories` | Agricultural agronomic knowledge base & pest advisories | Nested arrays, Full-Text indexing, Tag filtering, Multi-crop aggregation |
| `crop_observations` | Dynamic farmer observations per crop | Flexible schema, Polymorphic document modeling, Date indexing |
| `farming_notes` | Freeform farmer journals, quick voice logs | Unstructured text, GeoJSON points, Dynamic tags |
| `weather_records` | Micro-climate weather time-series records | Nested sub-documents, Aggregation pipeline ($avg, $max, $facet) |

---

## 3. Collections & Document Schemas

### A. `agricultural_advisories`
```json
{
  "_id": "ObjectId(...)",
  "crop": "Tomato",
  "topic": "Tomato Early Blight (Alternaria solani) Management",
  "category": "DISEASE_MANAGEMENT",
  "severity_level": "MODERATE",
  "symptoms": [
    "Concentric dark brown rings on older leaves ('target board' appearance)",
    "Yellow halo surrounding dark necrotic leaf spots",
    "Stem lesions near soil line in young seedlings"
  ],
  "recommendations": {
    "cultural_practices": [
      "Maintain minimum 60cm plant spacing for adequate air circulation",
      "Avoid overhead sprinkler watering; switch to drip irrigation",
      "Remove and destroy lower infected leaves"
    ],
    "fertilizer_advice": "Avoid excess Nitrogen; apply Potassium sulphate and Calcium nitrate to enhance cell wall strength",
    "irrigation_advice": "Water early in the morning so foliage dries quickly",
    "biological_control": "Foliar spray of Trichoderma harzianum @ 5g/L",
    "chemical_control": "Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L on initial symptom onset"
  },
  "preventive_measures": [
    "Treat seeds with Thiram @ 3g/kg before nursery sowing",
    "Follow 3-year crop rotation with non-solanaceous crops"
  ],
  "tags": ["tomato", "early blight", "fungal", "leaf spots", "solanum", "monsoon"],
  "author": "Dr. Rajesh Sharma, Senior Agronomist",
  "verified": true,
  "helpful_votes": 48,
  "created_at": "2025-01-15T10:00:00Z"
}
```

### B. `crop_observations` (Demonstrating Crop-Specific Flexible Schemas)

#### Tomato Observation:
```json
{
  "_id": "ObjectId(...)",
  "farmer_id": 2,
  "farmer_name": "Ravi Kumar",
  "farm_id": 1,
  "farm_name": "Green Valley Farm",
  "field_id": 1,
  "crop": "Tomato",
  "observation_date": "2025-02-18T09:30:00Z",
  "crop_stage": "FLOWERING_AND_EARLY_FRUITING",
  "symptoms_observed": ["Yellowing of lower leaf margins", "Slight leaf curl on apical shoots"],
  "dynamic_attributes": {
    "leaf_color": "Pale Yellow / Chlorotic",
    "spots_detected": false,
    "whitefly_count_per_trap": 12,
    "soil_moisture_status": "Optimal",
    "canopy_coverage_percent": 82
  },
  "notes": "Observed whitefly movement on upper foliage during morning walk. Applied bio-spray.",
  "images": [
    {"url": "/uploads/obs_tomato_leaf_01.jpg", "caption": "Lower leaves showing mild interveinal chlorosis"}
  ],
  "weather_context": {
    "temperature_c": 28.4,
    "humidity_pct": 65,
    "sky_condition": "Partly Cloudy"
  }
}
```

#### Rice / Paddy Observation (Notice differing dynamic attributes):
```json
{
  "_id": "ObjectId(...)",
  "farmer_id": 3,
  "farmer_name": "Sunita Devi",
  "farm_id": 2,
  "farm_name": "Sunrise Organic Estate",
  "field_id": 3,
  "crop": "Rice (Basmati)",
  "observation_date": "2024-12-28T08:15:00Z",
  "crop_stage": "ACTIVE_TILLERING",
  "symptoms_observed": ["Dead hearts observed in scattered tillers"],
  "dynamic_attributes": {
    "standing_water_depth_cm": 4.5,
    "panicle_initiation_started": false,
    "stem_borer_egg_masses_per_sqm": 2,
    "weed_density": "Low",
    "tillers_per_hill_avg": 24
  },
  "notes": "Water depth maintained at 4-5cm. Installing pheromone traps for yellow stem borer.",
  "images": []
}
```

---

## 4. MongoDB Aggregation Pipelines

Demonstrates `$match`, `$group`, `$unwind`, `$lookup`, `$project`, and `$sort`.

### Pipeline 1: Count Advisories and Symptoms Grouped by Crop
```javascript
db.agricultural_advisories.aggregate([
  { $unwind: "$tags" },
  { 
    $group: {
      _id: "$crop",
      total_advisories: { $sum: 1 },
      distinct_tags: { $addToSet: "$tags" },
      avg_helpful_votes: { $avg: "$helpful_votes" }
    }
  },
  { $sort: { total_advisories: -1 } }
]);
```

### Pipeline 2: Observation Frequency and Symptom Distribution Analysis
```javascript
db.crop_observations.aggregate([
  { $unwind: "$symptoms_observed" },
  {
    $group: {
      _id: { crop: "$crop", symptom: "$symptoms_observed" },
      incident_count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      crop: "$_id.crop",
      symptom: "$_id.symptom",
      incident_count: 1
    }
  },
  { $sort: { incident_count: -1 } }
]);
```
