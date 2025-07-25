export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { charts } = req.body;
    
    if (!charts || !Array.isArray(charts) || charts.length === 0) {
      return res.status(400).json({ error: 'No charts provided' });
    }

    // Filter out empty charts
    const validCharts = charts.filter(chart => chart && chart.length > 100);
    
    if (validCharts.length === 0) {
      return res.status(400).json({ error: 'No valid charts provided' });
    }

    console.log(`Processing ${validCharts.length} charts`);

    // Just return the first chart for now (temporary solution)
    // TODO: Implement proper image merging
    const mergedChart = validCharts[0];

    res.status(200).json({
      success: true,
      mergedChart: mergedChart,
      chartsCount: validCharts.length,
      dimensions: {
        width: 600 * validCharts.length,
        height: 400
      },
      note: 'Temporary: returning first chart only'
    });

  } catch (error) {
    console.error('Chart merge error:', error);
    res.status(500).json({ 
      error: 'Failed to merge charts',
      details: error.message 
    });
  }
}
