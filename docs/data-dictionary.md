# 7. Data Dictionary (PostgreSQL & MongoDB)
## Agriculture Resource and Farm Management System (AgriPulse)

---

# Part 1: PostgreSQL Relational Data Dictionary

### Table 1: `roles`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | SERIAL | Yes | No | No | Auto | - | Surrogate identifier for system security roles |
| `role_name` | VARCHAR(50) | No | No | No | None | UNIQUE | Role title (ADMIN, FARMER, OFFICER) |
| `description` | TEXT | No | No | Yes | None | - | Textual description of role privileges |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Audit creation timestamp |

### Table 2: `users`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | SERIAL | Yes | No | No | Auto | - | Unique system user primary key |
| `name` | VARCHAR(120) | No | No | No | None | - | Full legal or registered name |
| `email` | VARCHAR(150) | No | No | No | None | UNIQUE, CHECK regex | Unique authentication email address |
| `password_hash` | VARCHAR(255) | No | No | No | None | - | Bcrypt encrypted password digest |
| `phone` | VARCHAR(20) | No | No | Yes | None | - | Farmer mobile contact number |
| `role_id` | INT | No | Yes | No | None | REFERENCES `roles(role_id)` | Assigned security authorization role |
| `is_active` | BOOLEAN | No | No | No | TRUE | - | Account operational status |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Last profile modification timestamp |

### Table 3: `farms`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `farm_id` | SERIAL | Yes | No | No | Auto | - | Farm establishment identifier |
| `owner_id` | INT | No | Yes | No | None | REFERENCES `users(user_id)` ON DELETE CASCADE | Associated farmer owner |
| `farm_name` | VARCHAR(150) | No | No | No | None | - | Commercial or geographic farm title |
| `location` | VARCHAR(255) | No | No | No | None | - | Physical district / coordinates / village |
| `area` | NUMERIC(10,2) | No | No | No | None | CHECK (area > 0) | Total land area in acres |
| `soil_type` | VARCHAR(80) | No | No | No | None | - | Primary pedological classification |
| `ownership_type`| VARCHAR(50) | No | No | No | 'OWNED' | - | Title status (OWNED, LEASED, SHARED) |
| `status` | VARCHAR(30) | No | No | No | 'ACTIVE' | CHECK IN ('ACTIVE', 'INACTIVE', 'LEASED', 'FALLOW') | Farm operational state |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Record timestamp |
| `updated_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Last update timestamp |

### Table 4: `fields`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `field_id` | SERIAL | Yes | No | No | Auto | - | Individual parcel identifier |
| `farm_id` | INT | No | Yes | No | None | REFERENCES `farms(farm_id)` ON DELETE CASCADE | Parent farm identifier |
| `field_name` | VARCHAR(100) | No | No | No | None | - | Sub-parcel tag or block name |
| `area` | NUMERIC(10,2) | No | No | No | None | CHECK (area > 0) | Field area in acres |
| `soil_type` | VARCHAR(80) | No | No | Yes | None | - | Field-specific soil profile |
| `irrigation_type`| VARCHAR(50) | No | No | No | None | CHECK IN ('DRIP','SPRINKLER','FLOOD','CANAL','MANUAL','RAINFED') | Dedicated irrigation method |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Creation date |

### Table 5: `crops`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `crop_id` | SERIAL | Yes | No | No | Auto | - | Master crop catalog identifier |
| `crop_name` | VARCHAR(100) | No | No | No | None | UNIQUE | Commercial variety designation |
| `scientific_name`| VARCHAR(150)| No | No | Yes | None | - | Botanical binomen |
| `category` | VARCHAR(50) | No | No | No | None | CHECK IN ('CEREAL','PULSE','VEGETABLE','FRUIT','CASH_CROP','OILSEED','HORTICULTURE') | Agronomic classification |
| `standard_maturity_days`| INT | No | No | No | None | CHECK (> 0) | Typical life cycle duration in days |
| `water_requirement` | VARCHAR(50)| No | No | Yes | None | - | Low / Medium / High hydrologic need |
| `optimal_soil` | VARCHAR(100)| No | No | Yes | None | - | Agronomic soil preference |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Catalog entry timestamp |

### Table 6: `crop_cycles`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `cycle_id` | SERIAL | Yes | No | No | Auto | - | Cultivation cycle identifier |
| `field_id` | INT | No | Yes | No | None | REFERENCES `fields(field_id)` | Cultivated field parcel |
| `crop_id` | INT | No | Yes | No | None | REFERENCES `crops(crop_id)` | Sown crop variety |
| `sowing_date` | DATE | No | No | No | None | - | Calendar date of sowing/transplantation |
| `expected_harvest_date`| DATE | No | No | No | None | CHECK (expected >= sowing) | Projected harvest date |
| `actual_harvest_date` | DATE | No | No | Yes | None | CHECK (actual >= sowing) | Realized harvest date |
| `status` | VARCHAR(30) | No | No | No | 'PLANNED' | CHECK IN ('PLANNED','ACTIVE','HARVESTED','COMPLETED','CANCELLED') | Lifecycle state |
| `target_yield_kg` | NUMERIC(10,2)| No | No | Yes | None | CHECK (yield >= 0) | Estimated target yield in kg |
| `notes` | TEXT | No | No | Yes | None | - | Agronomist/Farmer observations |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Timestamp |
| `updated_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Last modification timestamp |

### Table 7: `crop_status_history`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `history_id` | SERIAL | Yes | No | No | Auto | - | Audit trail primary key |
| `cycle_id` | INT | No | Yes | No | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE CASCADE | Associated cycle |
| `previous_status` | VARCHAR(30) | No | No | Yes | None | - | State prior to update |
| `new_status` | VARCHAR(30) | No | No | No | None | - | Transitioned state |
| `changed_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Automatic trigger timestamp |
| `remarks` | TEXT | No | No | Yes | None | - | System or manual transition remarks |

### Table 8: `farming_activities`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `activity_id` | SERIAL | Yes | No | No | Auto | - | Operational log primary key |
| `cycle_id` | INT | No | Yes | No | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE CASCADE | Cultivation cycle |
| `field_id` | INT | No | Yes | No | None | REFERENCES `fields(field_id)` ON DELETE CASCADE | Target field parcel |
| `activity_date` | DATE | No | No | No | None | - | Execution calendar date |
| `activity_type` | VARCHAR(50) | No | No | No | None | CHECK IN ('PLOUGHING','SOWING','FERTILIZER_APPLICATION','IRRIGATION','PEST_CONTROL','WEED_CONTROL','HARVESTING','PRUNING','SOIL_TESTING','OTHER') | Task classification |
| `description` | TEXT | No | No | No | None | - | Detailed description of fieldwork |
| `labour_hours` | NUMERIC(6,2) | No | No | No | 0.00 | CHECK (hours >= 0) | Total human labour effort hours |
| `cost` | NUMERIC(10,2) | No | No | No | 0.00 | CHECK (cost >= 0) | Operational expense incurred |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Creation date |

### Table 9: `resources`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `resource_id` | SERIAL | Yes | No | No | Auto | - | Inventory item identifier |
| `resource_name` | VARCHAR(120) | No | No | No | None | - | Trade name of agricultural input |
| `category` | VARCHAR(50) | No | No | No | None | CHECK IN ('FERTILIZER','PESTICIDE','SEED','EQUIPMENT','FUEL','PACKAGING','OTHER') | Material category |
| `unit` | VARCHAR(30) | No | No | No | None | - | Unit of measurement (KG, BAG, LTR) |
| `purchase_price` | NUMERIC(10,2) | No | No | No | None | CHECK (price >= 0) | Unit acquisition cost |
| `available_quantity`| NUMERIC(10,2)| No | No | No | 0.00 | CHECK (qty >= 0) | Live warehouse inventory count |
| `minimum_stock` | NUMERIC(10,2) | No | No | No | 0.00 | CHECK (min >= 0) | Safety reorder threshold |
| `supplier` | VARCHAR(150) | No | No | Yes | None | - | Distributor or vendor entity |
| `purchase_date` | DATE | No | No | Yes | None | - | Inward receipt date |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Record timestamp |
| `updated_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Last modification timestamp |

### Table 10: `fertilizer_usages`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `usage_id` | SERIAL | Yes | No | No | Auto | - | Application record identifier |
| `cycle_id` | INT | No | Yes | No | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE CASCADE | Associated crop cycle |
| `resource_id` | INT | No | Yes | No | None | REFERENCES `resources(resource_id)` ON DELETE RESTRICT | Consumed fertilizer resource |
| `field_id` | INT | No | Yes | No | None | REFERENCES `fields(field_id)` ON DELETE CASCADE | Field receiving input |
| `application_date`| DATE | No | No | No | None | - | Date of dosing |
| `quantity_applied`| NUMERIC(10,2)| No | No | No | None | CHECK (qty > 0) | Units deducted from stock |
| `cost` | NUMERIC(10,2) | No | No | No | None | CHECK (cost >= 0) | Total financial cost |
| `application_method`| VARCHAR(60) | No | No | Yes | None | - | Method (Drip Fertigation, Basal, Foliar) |
| `notes` | TEXT | No | No | Yes | None | - | Agronomic dosing notes |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Creation timestamp |

### Table 11: `irrigation_records`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `irrigation_id` | SERIAL | Yes | No | No | Auto | - | Watering log identifier |
| `cycle_id` | INT | No | Yes | No | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE CASCADE | Associated crop cycle |
| `field_id` | INT | No | Yes | No | None | REFERENCES `fields(field_id)` ON DELETE CASCADE | Irrigated field parcel |
| `irrigation_date` | DATE | No | No | No | None | - | Date of irrigation |
| `water_quantity_liters`| NUMERIC(12,2)| No | No | No | None | CHECK (water > 0) | Total water delivered in liters |
| `duration_minutes`| INT | No | No | No | None | CHECK (duration > 0) | System pump run time in minutes |
| `irrigation_method`| VARCHAR(50) | No | No | No | None | CHECK IN ('DRIP','SPRINKLER','FLOOD','CANAL','MANUAL') | Irrigation delivery mechanism |
| `notes` | TEXT | No | No | Yes | None | - | Water source or pressure notes |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Creation timestamp |

### Table 12: `expenses`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `expense_id` | SERIAL | Yes | No | No | Auto | - | Financial ledger primary key |
| `farm_id` | INT | No | Yes | No | None | REFERENCES `farms(farm_id)` ON DELETE CASCADE | Associated farm unit |
| `cycle_id` | INT | No | Yes | Yes | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE SET NULL | Optional specific crop cycle allocation |
| `expense_date` | DATE | No | No | No | None | - | Transaction billing date |
| `category` | VARCHAR(50) | No | No | No | None | CHECK IN ('SEEDS','FERTILIZER','PESTICIDES','LABOUR','IRRIGATION','EQUIPMENT','TRANSPORTATION','MAINTENANCE','OTHER') | Expenditure classification |
| `amount` | NUMERIC(10,2) | No | No | No | None | CHECK (amount >= 0) | Monetary sum in INR / Currency |
| `payment_mode` | VARCHAR(30) | No | No | No | 'CASH' | CHECK IN ('CASH','UPI','BANK_TRANSFER','CHEQUE','CREDIT') | Transaction payment method |
| `receipt_number` | VARCHAR(80) | No | No | Yes | None | - | External voucher or invoice reference |
| `description` | TEXT | No | No | No | None | - | Itemized expense description |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Entry timestamp |

### Table 13: `harvests`
| Column Name | Data Type | PK | FK | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `harvest_id` | SERIAL | Yes | No | No | Auto | - | Harvest yield identifier |
| `cycle_id` | INT | No | Yes | No | None | REFERENCES `crop_cycles(cycle_id)` ON DELETE RESTRICT | Associated crop cycle |
| `harvest_date` | DATE | No | No | No | None | - | Realized harvest calendar date |
| `quantity_kg` | NUMERIC(10,2) | No | No | No | None | CHECK (qty > 0) | Total harvested physical output |
| `unit` | VARCHAR(20) | No | No | No | 'KG' | - | Measurement standard |
| `quality_grade` | VARCHAR(30) | No | No | No | None | CHECK IN ('GRADE_A','GRADE_B','GRADE_C','EXPORT_QUALITY','STANDARD') | Commodity quality sorting tier |
| `selling_price_per_unit`| NUMERIC(10,2)| No | No | No | None | CHECK (price >= 0) | Realized market selling price |
| `total_revenue` | NUMERIC(12,2) | No | No | No | None | CHECK (revenue >= 0) | Auto-calculated (Qty * Price) |
| `buyer_name` | VARCHAR(120) | No | No | Yes | None | - | APMC trader or wholesale merchant |
| `notes` | TEXT | No | No | Yes | None | - | Moisture, packaging, or market notes |
| `created_at` | TIMESTAMPTZ | No | No | Yes | CURRENT_TIMESTAMP | - | Record timestamp |

---

# Part 2: MongoDB NoSQL Document Schema Dictionary

### Collection: `agricultural_advisories`
| Field | Type | Description | Requirement | Example |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB unique document identifier | Required | `ObjectId("65f12a...")` |
| `crop` | String | Target crop name | Required | `"Tomato"` |
| `topic` | String | Agronomic subject or disease name | Required | `"Tomato Early Blight Management"` |
| `category` | String | Advisory category (`DISEASE_MANAGEMENT`, `PEST_CONTROL`, `NUTRIENT_DEFICIENCY`) | Required | `"FUNGAL_DISEASE"` |
| `severity_level`| String | Urgency tier (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) | Required | `"HIGH"` |
| `symptoms` | Array[String]| Polymorphic list of diagnostic physical signs | Required | `["Target-board concentric brown rings"]` |
| `recommendations`| Object | Nested multi-faceted actionable interventions | Required | `{ "cultural_practices": [...], "chemical_control": "..." }` |
| `recommendations.cultural_practices`| Array[String]| Non-chemical management techniques | Optional | `["Maintain 60cm plant spacing"]` |
| `recommendations.fertilizer_advice` | String | Nutrient modifications to aid recovery | Optional | `"Apply Potassium Nitrate @ 5g/L"` |
| `recommendations.irrigation_advice` | String | Water schedule alterations | Optional | `"Irrigate early morning to dry foliage"` |
| `recommendations.biological_control`| String | Organic / Bio-agent applications | Optional | `"Trichoderma viride spray @ 5g/L"` |
| `recommendations.chemical_control`  | String | Approved chemical active ingredients & dosage | Optional | `"Mancozeb 75% WP @ 2.5g/L"` |
| `preventive_measures`| Array[String]| Proactive seasonal countermeasures | Optional | `["2-year non-solanaceous rotation"]` |
| `tags` | Array[String]| Indexable keywords for text and regex queries | Required | `["tomato", "early blight", "fungal"]` |
| `author` | String | Agronomist or extension officer name | Required | `"Dr. Rajesh Sharma"` |
| `verified` | Boolean | Peer-review or officer validation status | Required | `true` |
| `helpful_votes` | Integer | Community utility rating | Optional | `42` |
| `created_at` | ISODate | Document creation date | Required | `ISODate("2025-01-14T09:30:00Z")` |

### Collection: `crop_observations`
| Field | Type | Description | Requirement | Example |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Unique observation document ID | Required | `ObjectId("65f13b...")` |
| `farmer_id` | Integer | Relational reference to PostgreSQL `users.user_id` | Required | `2` |
| `farmer_name` | String | Farmer denormalized display name | Required | `"Ravi Kumar"` |
| `farm_id` | Integer | Relational reference to PostgreSQL `farms.farm_id` | Required | `1` |
| `farm_name` | String | Farm denormalized display name | Required | `"Green Valley Farm"` |
| `field_id` | Integer | Relational reference to PostgreSQL `fields.field_id` | Required | `1` |
| `crop` | String | Crop variety observed | Required | `"Tomato"` |
| `observation_date`| ISODate | Date and time of field scouting | Required | `ISODate("2025-02-18T09:30:00Z")` |
| `crop_stage` | String | Phenological growth stage | Required | `"FLOWERING_AND_EARLY_FRUITING"` |
| `symptoms_observed`| Array[String]| Observed morphological abnormalities or signs | Required | `["Yellowing lower margins", "Leaf curl"]` |
| `dynamic_attributes`| Object | Flexible crop-specific morphological and sensor attributes | Required | `{ "leaf_color": "Chlorotic", "spots": false }` |
| `notes` | String | Farmer free-text narrative | Optional | `"Whiteflies scouted under foliage"` |
| `images` | Array[Object]| Uploaded evidence photos with captions | Optional | `[{"url": "/img.jpg", "caption": "..."}]` |
| `weather_context` | Object | Ambient temperature, humidity, and weather condition | Optional | `{"temperature_c": 28.5, "humidity_pct": 62}` |
