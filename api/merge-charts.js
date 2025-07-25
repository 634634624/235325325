import sharp from 'sharp';

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

    const chartWidth = 600;
    const chartHeight = 400;
    const totalWidth = chartWidth * validCharts.length;

    // Convert base64 to buffers and resize
    const imageBuffers = [];
    for (const base64Chart of validCharts) {
      const buffer = Buffer.from(base64Chart, 'base64');
      const resizedBuffer = await sharp(buffer)
        .resize(chartWidth, chartHeight)
        .png()
        .toBuffer();
      imageBuffers.push(resizedBuffer);
    }

    // Create composite image
    const composite = [];
    for (let i = 0; i < imageBuffers.length; i++) {
      composite.push({
        input: imageBuffers[i],
        left: i * chartWidth,
        top: 0
      });
    }

    // Merge images horizontally
    const mergedBuffer = await sharp({
      create: {
        width: totalWidth,
        height: chartHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite(composite)
    .png()
    .toBuffer();

    const mergedBase64 = mergedBuffer.toString('base64');

    res.status(200).json({
      success: true,
      mergedChart: mergedBase64,
      chartsCount: validCharts.length,
      dimensions: {
        width: totalWidth,
        height: chartHeight
      }
    });

  } catch (error) {
    console.error('Chart merge error:', error);
    res.status(500).json({ 
      error: 'Failed to merge charts',
      details: error.message 
    });
  }
}
