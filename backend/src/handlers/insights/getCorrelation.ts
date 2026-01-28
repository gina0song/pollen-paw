import { APIGatewayProxyHandler } from 'aws-lambda';
import { query } from '../../services/db';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const petId = event.queryStringParameters?.petId;
    if (!petId) return { statusCode: 400, body: JSON.stringify({ message: "petId is required" }) };

    const result = await query(`
      SELECT 
        s.log_date,
        s.eye_symptoms,
        COALESCE(e.tree_pollen, 0) as tree_pollen,
        COALESCE(e.air_quality, 0) as air_quality
      FROM symptom_logs s
      JOIN environmental_data e ON s.zip_code = e.zip_code AND s.log_date = e.date
      WHERE s.pet_id = $1
      ORDER BY s.log_date ASC
    `, [petId]);

    const logs = result.rows;
    if (logs.length < 3) {
      return { statusCode: 200, body: JSON.stringify({ message: "Need at least 3 days of data for analysis." }) };
    }

    const calcCorr = (x: number[], y: number[]) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      const sumY2 = y.reduce((a, b) => a + b * b, 0);

      const num = n * sumXY - sumX * sumY;
      const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      return den === 0 ? 0 : num / den;
    };

    const eyeScores = logs.map(l => Number(l.eye_symptoms));
    const treeCorr = calcCorr(eyeScores, logs.map(l => Number(l.tree_pollen)));
    const aqiCorr = calcCorr(eyeScores, logs.map(l => Number(l.air_quality)));

    let suggestion = "No strong environmental triggers identified yet.";
    if (treeCorr > aqiCorr && treeCorr > 0.5) {
      suggestion = "Tree pollen shows the strongest link to symptoms.";
    } else if (aqiCorr > treeCorr && aqiCorr > 0.5) {
      suggestion = "Poor air quality seems to be the primary trigger.";
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        daysAnalyzed: logs.length,
        correlations: {
          treePollen: parseFloat(treeCorr.toFixed(2)),
          airQuality: parseFloat(aqiCorr.toFixed(2))
        },
        suggestion
      })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: "Analysis failed" }) };
  }
};