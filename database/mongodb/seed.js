/**
 * AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM (AgriPulse)
 * MongoDB NoSQL Seed Script
 * Generates realistic agricultural advisories, crop observations, farming notes, and weather records.
 */

const sampleAdvisories = [
  {
    crop: "Tomato",
    topic: "Tomato Yellow Leaf Curl Virus (TYLCV) Vector Management",
    category: "VIRAL_DISEASE",
    severity_level: "HIGH",
    symptoms: [
      "Severe stunting of young tomato shoots",
      "Upward curling and yellowing (chlorosis) of leaf margins",
      "Reduction in leaf lamina size (shoestring appearance)",
      "Flower abortion and poor fruit set"
    ],
    recommendations: {
      cultural_practices: [
        "Use 40-mesh nylon insect-proof net in nursery beds",
        "Install yellow sticky traps @ 15 traps per acre to monitor whitefly vectors",
        "Eradicate weed hosts (Solanum nigrum, Parthenium) around field borders"
      ],
      fertilizer_advice: "Foliar spray of Micro-nutrients mixture @ 2.5g/L to improve plant physiological resilience",
      irrigation_advice: "Maintain regular drip irrigation intervals; avoid water stress during peak vegetative stage",
      biological_control: "Spray Neem oil 10,000 PPM @ 3ml/L or Verticillium lecanii @ 5g/L",
      chemical_control: "Spray Thiamethoxam 25% WG @ 0.3g/L or Diafenthiuron 50% WP @ 1g/L alternating every 10 days"
    },
    preventive_measures: [
      "Plant barrier crops like Maize or Sorghum around the tomato plot borders (3-4 rows)",
      "Transplant virus-free nursery seedlings with silver reflective mulch"
    ],
    tags: ["tomato", "leaf curl", "whitefly", "virus", "chlorosis", "ipm", "vector"],
    author: "Dr. Rajesh Sharma, Agricultural Extension Officer",
    verified: true,
    helpful_votes: 64,
    created_at: new Date("2025-01-10T08:00:00Z")
  },
  {
    crop: "Tomato",
    topic: "Tomato Early Blight (Alternaria solani) Remediation",
    category: "FUNGAL_DISEASE",
    severity_level: "MODERATE",
    symptoms: [
      "Brown to black concentric target-ring spots on older foliage",
      "Yellow halo surrounding necrotic spots leading to premature defoliation",
      "Sunscald damage to exposed fruits"
    ],
    recommendations: {
      cultural_practices: [
        "Avoid overhead sprinkler watering; prefer drip irrigation",
        "Prune bottom 15cm leaves touching soil surface to prevent soil splash inoculation"
      ],
      fertilizer_advice: "Balance N-P-K ratios; apply Potassium Nitrate (13:0:45) @ 5g/L foliar spray",
      irrigation_advice: "Irrigate early in morning hours to enable quick foliar drying",
      biological_control: "Trichoderma viride root drenching and bio-spray @ 5g/L",
      chemical_control: "Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L"
    },
    preventive_measures: [
      "Ensure minimum 2-year crop rotation with non-solanaceous crops",
      "Treat seeds with Carbendazim @ 2g/kg"
    ],
    tags: ["tomato", "early blight", "target spots", "fungal", "foliar disease"],
    author: "Dr. Rajesh Sharma, Agricultural Extension Officer",
    verified: true,
    helpful_votes: 42,
    created_at: new Date("2025-01-14T09:30:00Z")
  },
  {
    crop: "Rice (Basmati)",
    topic: "Paddy Blast (Magnaporthe oryzae) & Neck Blast Prevention",
    category: "FUNGAL_DISEASE",
    severity_level: "CRITICAL",
    symptoms: [
      "Spindle-shaped diamond lesions on leaves with grey centers and brown margins",
      "Blackish lesions at panicle neck nodes causing incomplete grain filling (Neck Blast)",
      "Chaffy panicles standing erect"
    ],
    recommendations: {
      cultural_practices: [
        "Avoid excessive nitrogenous fertilizer application in single doses",
        "Maintain proper field drainage during high humidity episodes"
      ],
      fertilizer_advice: "Apply Potash in split doses (50% basal + 50% panicle initiation); incorporate Silicon fertilizers",
      irrigation_advice: "Avoid continuous deep stagnation; follow Alternate Wetting and Drying (AWD)",
      biological_control: "Pseudomonas fluorescens seed treatment @ 10g/kg and foliar spray @ 2g/L",
      chemical_control: "Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L at boot leaf stage"
    },
    preventive_measures: [
      "Soak seeds in carbendazim solution (1g/L) for 24 hours prior to incubation",
      "Adopt resistant cultivars for blast-endemic zones"
    ],
    tags: ["rice", "paddy", "blast", "neck blast", "magnaporthe", "spindle spots", "basmati"],
    author: "Dr. Rajesh Sharma, Agricultural Extension Officer",
    verified: true,
    helpful_votes: 56,
    created_at: new Date("2024-11-20T11:00:00Z")
  },
  {
    crop: "Green Chilli",
    topic: "Chilli Murda Complex (Thrips & Mites Interventions)",
    category: "PEST_MANAGEMENT",
    severity_level: "HIGH",
    symptoms: [
      "Upward boat-shaped curling of leaves indicating Thrips feeding",
      "Downward inverted-cup leaf curling with elongated petiole indicating Broad Mites",
      "Stunted bushy apical growth and flower bud drop"
    ],
    recommendations: {
      cultural_practices: [
        "Install blue sticky traps for thrips and yellow sticky traps for whiteflies",
        "Intercrop with marigold or maize as trap/barrier crops"
      ],
      fertilizer_advice: "Avoid heavy basal nitrogen; supplement with zinc and boron micronutrients",
      irrigation_advice: "Micro-sprinklers help dislodge thrips populations during peak sunshine",
      biological_control: "Spray Beauveria bassiana @ 5g/L and pongamia oil 2%",
      chemical_control: "For thrips: Fipronil 5% SC @ 1.5ml/L; For mites: Spiromesifen 22.9% SC @ 1ml/L"
    },
    preventive_measures: [
      "Dip seedling roots in Imidacloprid 17.8% SL solution (0.5ml/L) for 15 minutes before transplanting"
    ],
    tags: ["chilli", "murda complex", "thrips", "mites", "curling", "vector", "capsicum"],
    author: "Dr. Rajesh Sharma, Agricultural Extension Officer",
    verified: true,
    helpful_votes: 38,
    created_at: new Date("2025-02-04T10:15:00Z")
  },
  {
    crop: "Wheat (Durum)",
    topic: "Yellow / Stripe Rust (Puccinia striiformis) Early Detection",
    category: "FUNGAL_DISEASE",
    severity_level: "HIGH",
    symptoms: [
      "Yellow pustules arranged in prominent parallel stripes along leaf veins",
      "Yellow powder (urediniospores) rubs off easily on fingers or clothes",
      "Premature leaf drying and shriveled grain development"
    ],
    recommendations: {
      cultural_practices: [
        "Survey field boundaries and low-lying foggy patches weekly during winter",
        "Adopt timely sowing to escape peak pathogen sporulation temperature window"
      ],
      fertilizer_advice: "Apply balanced N:P:K (120:60:40 kg/ha); avoid excess nitrogen",
      irrigation_advice: "Irrigate at critical growth stages: CRI, late tillering, and milk stage",
      biological_control: "Foliar bio-agents at first sighting",
      chemical_control: "Spray Propiconazole 25% EC (Tilt) @ 1ml/L immediately upon observing first yellow pustule stripe"
    },
    preventive_measures: [
      "Grow rust-resistant Durum cultivars HD-4728 or DBW-187"
    ],
    tags: ["wheat", "stripe rust", "yellow rust", "puccinia", "cereal", "rabi"],
    author: "Agronomy Research Directorate",
    verified: true,
    helpful_votes: 29,
    created_at: new Date("2024-12-10T14:20:00Z")
  }
];

const sampleObservations = [
  {
    farmer_id: 2,
    farmer_name: "Ravi Kumar",
    farm_id: 1,
    farm_name: "Green Valley Farm",
    field_id: 1,
    crop: "Tomato",
    observation_date: new Date("2025-02-18T09:30:00Z"),
    crop_stage: "FLOWERING_AND_EARLY_FRUITING",
    symptoms_observed: [
      "Yellowing of lower leaf margins",
      "Slight upward leaf curl on apical shoots"
    ],
    dynamic_attributes: {
      leaf_color: "Pale Yellowish Green",
      spots_detected: false,
      whitefly_count_per_trap: 14,
      soil_moisture_status: "Adequate (Drip Line Active)",
      canopy_coverage_percent: 85,
      foliar_vigor_score: "4/5"
    },
    notes: "Scouted North Tomato parcel at 8:30 AM. Observed light whitefly clusters under new foliage. Sticky traps renewed. Scheduled neem spray.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22525?auto=format&fit=crop&w=600&q=80",
        caption: "Tomato foliage with light interveinal chlorosis"
      }
    ],
    weather_context: {
      temperature_c: 28.5,
      humidity_pct: 62,
      sky_condition: "Sunny and Warm"
    }
  },
  {
    farmer_id: 2,
    farmer_name: "Ravi Kumar",
    farm_id: 1,
    farm_name: "Green Valley Farm",
    field_id: 1,
    crop: "Tomato",
    observation_date: new Date("2025-03-12T08:00:00Z"),
    crop_stage: "FRUIT_DEVELOPMENT",
    symptoms_observed: [
      "Healthy vigorous fruit clusters",
      "No pest infestation detected"
    ],
    dynamic_attributes: {
      average_fruit_diameter_mm: 58,
      clusters_per_plant_avg: 7,
      blossom_end_rot_present: false,
      soil_moisture_status: "Optimal",
      canopy_coverage_percent: 92
    },
    notes: "Potash booster fertigation showing excellent results. Fruit set is uniform and sizing is superior.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=600&q=80",
        caption: "Cluster of healthy Arka Rakshak tomatoes sizing up"
      }
    ],
    weather_context: {
      temperature_c: 31.0,
      humidity_pct: 54,
      sky_condition: "Clear Sky"
    }
  },
  {
    farmer_id: 3,
    farmer_name: "Sunita Devi",
    farm_id: 2,
    farm_name: "Sunrise Organic Estate",
    field_id: 3,
    crop: "Rice (Basmati)",
    observation_date: new Date("2024-12-28T08:15:00Z"),
    crop_stage: "ACTIVE_TILLERING",
    symptoms_observed: [
      "Dead hearts in scattered tillers",
      "Leaf tip browning"
    ],
    dynamic_attributes: {
      standing_water_depth_cm: 4.5,
      panicle_initiation_started: false,
      stem_borer_egg_masses_per_sqm: 2,
      weed_density: "Low",
      tillers_per_hill_avg: 22
    },
    notes: "Water depth maintained at 4-5cm. Installing pheromone traps for yellow stem borer control.",
    images: [],
    weather_context: {
      temperature_c: 24.0,
      humidity_pct: 78,
      sky_condition: "Overcast / Morning Mist"
    }
  }
];

const sampleFarmingNotes = [
  {
    farmer_id: 2,
    farm_id: 1,
    title: "Polyhouse Soil Test Observations",
    content: "Soil test from UAS Bangalore indicates pH of 6.6, Electrical Conductivity 0.42 dS/m. Organic Carbon is 0.78%. Recommended addition of 5 tons FYM per acre before next cycle.",
    tags: ["soil test", "pH", "polyhouse", "organic carbon"],
    category: "SOIL_HEALTH",
    created_at: new Date("2025-01-04T11:00:00Z")
  },
  {
    farmer_id: 2,
    farm_id: 1,
    title: "Drip Lateral Flush & Filter Maintenance",
    content: "Flushed secondary sub-mains with 0.1% phosphoric acid solution to remove carbonate precipitate build-up. Disc filter mesh inspected and cleaned thoroughly.",
    tags: ["irrigation", "maintenance", "drip", "acid treatment"],
    category: "INFRASTRUCTURE",
    created_at: new Date("2025-02-22T16:00:00Z")
  }
];

const sampleWeatherRecords = [
  {
    location: "Kolar Agricultural Zone, Karnataka",
    station_id: "WTH-KLR-001",
    recorded_at: new Date("2025-02-18T06:00:00Z"),
    metrics: {
      temperature_c: { min: 18.2, max: 32.4, current: 28.5 },
      humidity_percent: 62,
      rainfall_mm: 0.0,
      solar_radiation_mj_m2: 21.4,
      wind_speed_kmh: 9.5,
      soil_temperature_10cm_c: 22.8
    },
    forecast_24h: {
      outlook: "Sunny with afternoon dry breeze",
      et0_evapotranspiration_mm: 5.2,
      frost_risk: false
    }
  },
  {
    location: "Mysuru Organic Belt, Karnataka",
    station_id: "WTH-MYS-002",
    recorded_at: new Date("2024-12-28T06:00:00Z"),
    metrics: {
      temperature_c: { min: 16.5, max: 29.1, current: 24.0 },
      humidity_percent: 78,
      rainfall_mm: 2.4,
      solar_radiation_mj_m2: 17.8,
      wind_speed_kmh: 6.2,
      soil_temperature_10cm_c: 20.5
    },
    forecast_24h: {
      outlook: "Scattered morning mist with high relative humidity",
      et0_evapotranspiration_mm: 3.8,
      frost_risk: false
    }
  }
];

module.exports = {
  sampleAdvisories,
  sampleObservations,
  sampleFarmingNotes,
  sampleWeatherRecords
};
