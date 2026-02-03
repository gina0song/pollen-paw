// ============================================
// GET /analysis/correlation - Correlation Analysis Handler
// Calculates Pearson correlation between symptoms and pollen types
// ============================================

import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../services/db';

interface CorrelationResponse {
  status: "success" | "insufficient_data";
  daysLogged: number;
  daysNeeded?: number;
  petName?: string;  // ✅ NEW: Include pet name
  
  correlations?: {
    treeCorr: number;
    grassCorr: number;
    weedCorr: number;
    topTrigger: "tree" | "grass" | "weed";
    topTriggerValue: number;
  };
  
  chartData?: ChartDataPoint[];
  
  insights?: {
    topTriggerInsight: string;
    thresholdInsight: string;
    actionRecommendation: string;
  };
  
  message?: string;
}

interface ChartDataPoint {
  date: string;
  symptomSeverity: number;
  treePollen: number;
  grassPollen: number;
  weedPollen: number;
}

/**
 * Calculate Pearson correlation coefficient
 * Measures linear relationship between two variables (-1 to 1)
 * Formula: r = (n∑xy - ∑x∑y) / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]
 */
const pearson = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  // If denominator is 0, correlation is undefined (return 0)
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Find top trigger among tree, grass, weed pollen
 * Returns the pollen type with highest absolute correlation
 */
const findTopTrigger = (treeCorr: number, grassCorr: number, weedCorr: number) => {
  const triggers = [
    { type: "tree" as const, value: treeCorr },
    { type: "grass" as const, value: grassCorr },
    { type: "weed" as const, value: weedCorr }
  ];

  // Sort by absolute value to find strongest correlation
  const sorted = triggers.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return sorted[0];
};

/**
 * Format pollen type for display
 */
const formatPollenName = (type: "tree" | "grass" | "weed"): string => {
  const names = {
    tree: "Tree Pollen",
    grass: "Grass Pollen",
    weed: "Weed Pollen"
  };
  return names[type];
};

/**
 * Calculate dynamic average symptom severity
 * Only includes symptoms with non-zero values (actual observations)
 * Avoids bias from default 0 values
 */
const calculateSymptomSeverity = (
  eyeSymptoms: number,
  furQuality: number,
  skinIrritation: number,
  respiratory: number
): number => {
  const values = [eyeSymptoms, furQuality, skinIrritation, respiratory]
    .filter(v => v > 0); // Only include observed (non-zero) symptoms

  if (values.length === 0) {
    return 0; // No symptoms observed
  }

  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const petId = event.queryStringParameters?.petId;

    if (!petId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: "petId is required" })
      };
    }

    console.log('📊 Analyzing pet:', petId);

    // ✅ FIXED: First, fetch the pet name
    const petResult = await query(
      'SELECT name FROM pets WHERE id = $1',
      [petId]
    );
    const petName = petResult.rows[0]?.name || "Your pet";
    console.log('🐾 Pet name:', petName);

    // ✅ Query all symptom types + all pollen types
    const result = await query(`
      SELECT
        s.log_date,
        s.eye_symptoms,
        s.fur_quality,
        s.skin_irritation,
        s.respiratory,
        COALESCE(e.tree_pollen, 0) as tree_pollen,
        COALESCE(e.grass_pollen, 0) as grass_pollen,
        COALESCE(e.weed_pollen, 0) as weed_pollen,
        COALESCE(e.air_quality, 0) as air_quality
      FROM symptom_logs s
      LEFT JOIN environmental_data e ON s.zip_code = e.zip_code AND s.log_date = e.date
      WHERE s.pet_id = $1
      ORDER BY s.log_date ASC
    `, [petId]);

    const logs = result.rows;
    const daysLogged = logs.length;

    console.log(`Found ${daysLogged} symptom logs for pet ${petId}`);

    // ✅ Cold start protection: require minimum 3 days
    if (daysLogged < 3) {
      const daysNeeded = 3 - daysLogged;
      console.log(`⚠️ Insufficient data: need ${daysNeeded} more days`);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          status: "insufficient_data",
          daysLogged,
          daysNeeded,
          petName,
          message: `📊 Need more data. Have ${daysLogged} day(s), need 3 days for accurate analysis`
        } as CorrelationResponse)
      };
    }

    // ✅ Calculate symptom severity using dynamic average (only non-zero symptoms)
    const chartData: ChartDataPoint[] = logs.map(log => ({
      date: log.log_date,
      symptomSeverity: calculateSymptomSeverity(
        Number(log.eye_symptoms) || 0,
        Number(log.fur_quality) || 0,
        Number(log.skin_irritation) || 0,
        Number(log.respiratory) || 0
      ),
      treePollen: Number(log.tree_pollen) || 0,
      grassPollen: Number(log.grass_pollen) || 0,
      weedPollen: Number(log.weed_pollen) || 0
    }));

    const symptomSeverities = chartData.map(d => d.symptomSeverity);

    // ✅ Extract pollen arrays
    const treePollenArray = chartData.map(d => d.treePollen);
    const grassPollenArray = chartData.map(d => d.grassPollen);
    const weedPollenArray = chartData.map(d => d.weedPollen);

    // ✅ Calculate Pearson correlations for all three pollen types
    const treeCorr = pearson(symptomSeverities, treePollenArray);
    const grassCorr = pearson(symptomSeverities, grassPollenArray);
    const weedCorr = pearson(symptomSeverities, weedPollenArray);

    console.log(`📈 Correlations - Tree: ${treeCorr.toFixed(2)}, Grass: ${grassCorr.toFixed(2)}, Weed: ${weedCorr.toFixed(2)}`);

    // ✅ Find top trigger
    const topTrigger = findTopTrigger(treeCorr, grassCorr, weedCorr);
    const topTriggerName = formatPollenName(topTrigger.type);

    console.log(`🎯 Top trigger: ${topTriggerName} (r=${topTrigger.value.toFixed(2)})`);

    // ✅ Generate insights based on top trigger (using fetched pet name)
    const topTriggerInsight = `${petName}'s symptoms highly correlate with ${topTriggerName} (r=${topTrigger.value.toFixed(2)})`;
    
    const thresholdInsight = `Symptoms appear when ${topTriggerName.toLowerCase()} > 7.0`;
    
    const actionRecommendation = `Recommend closing windows when ${topTriggerName.toLowerCase()} index > 7.0`;

    const response: CorrelationResponse = {
      status: "success",
      daysLogged,
      petName,  // ✅ Include pet name in response
      correlations: {
        treeCorr: parseFloat(treeCorr.toFixed(2)),
        grassCorr: parseFloat(grassCorr.toFixed(2)),
        weedCorr: parseFloat(weedCorr.toFixed(2)),
        topTrigger: topTrigger.type,
        topTriggerValue: parseFloat(topTrigger.value.toFixed(2))
      },
      chartData,
      insights: {
        topTriggerInsight,
        thresholdInsight,
        actionRecommendation
      }
    };

    console.log('✅ Analysis complete');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Analysis error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        status: "insufficient_data",
        message: "Analysis failed. Please try again."
      })
    };
  }
};
