/**
 * AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM (AgriPulse)
 * Advanced MongoDB Aggregation Pipelines & Document Queries
 * Demonstrates: $match, $group, $unwind, $lookup, $project, $sort, $facet, $regex text search
 */

// ============================================================================
// 1. Text & Symptom Search across Agricultural Advisories
// Demonstrates: Regex text match, projection, and helpful votes sorting
// ============================================================================
const searchAdvisoriesBySymptom = (db, searchQuery) => {
  return db.collection('agricultural_advisories').find({
    $or: [
      { crop: { $regex: searchQuery, $options: 'i' } },
      { topic: { $regex: searchQuery, $options: 'i' } },
      { symptoms: { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
      { tags: { $in: [new RegExp(searchQuery, 'i')] } }
    ]
  }).project({
    crop: 1,
    topic: 1,
    category: 1,
    severity_level: 1,
    symptoms: 1,
    recommendations: 1,
    tags: 1,
    helpful_votes: 1
  }).sort({ helpful_votes: -1 });
};

// ============================================================================
// 2. Aggregation Pipeline: Topic & Advisory Distribution Grouped by Crop
// Demonstrates: $group, $addToSet, $sum, $sort
// ============================================================================
const getAdvisoryDistributionByCrop = async (db) => {
  return await db.collection('agricultural_advisories').aggregate([
    {
      $group: {
        _id: "$crop",
        total_advisories: { $sum: 1 },
        categories: { $addToSet: "$category" },
        avg_helpful_rating: { $avg: "$helpful_votes" }
      }
    },
    {
      $project: {
        _id: 0,
        crop: "$_id",
        total_advisories: 1,
        categories: 1,
        avg_helpful_rating: { $round: ["$avg_helpful_rating", 1] }
      }
    },
    { $sort: { total_advisories: -1 } }
  ]).toArray();
};

// ============================================================================
// 3. Aggregation Pipeline: Symptom Frequency Analysis across Crop Observations
// Demonstrates: $unwind, $group, $sort
// ============================================================================
const getSymptomFrequencies = async (db) => {
  return await db.collection('crop_observations').aggregate([
    { $unwind: "$symptoms_observed" },
    {
      $group: {
        _id: {
          crop: "$crop",
          symptom: "$symptoms_observed"
        },
        occurrences: { $sum: 1 },
        farms_reporting: { $addToSet: "$farm_name" }
      }
    },
    {
      $project: {
        _id: 0,
        crop: "$_id.crop",
        symptom: "$_id.symptom",
        occurrences: 1,
        farms_count: { $size: "$farms_reporting" }
      }
    },
    { $sort: { occurrences: -1 } }
  ]).toArray();
};

// ============================================================================
// 4. Aggregation Pipeline: Multi-Faceted Advisory & Observation Health Dashboard
// Demonstrates: $facet for parallel aggregation stages
// ============================================================================
const getAgriIntelligenceFacet = async (db) => {
  return await db.collection('agricultural_advisories').aggregate([
    {
      $facet: {
        "severity_breakdown": [
          { $group: { _id: "$severity_level", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        "category_breakdown": [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        "top_rated_advisories": [
          { $sort: { helpful_votes: -1 } },
          { $limit: 3 },
          { $project: { topic: 1, crop: 1, helpful_votes: 1, severity_level: 1 } }
        ]
      }
    }
  ]).toArray();
};

module.exports = {
  searchAdvisoriesBySymptom,
  getAdvisoryDistributionByCrop,
  getSymptomFrequencies,
  getAgriIntelligenceFacet
};
