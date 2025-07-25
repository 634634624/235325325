const sharp = require('sharp');

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

    console.log(`Processing ${validCharts.length} charts`);

    // Convert base64 to buffers and resize
    const imageBuffers = [];
    for (let i = 0; i < validCharts.length; i++) {
      try {
        const buffer = Buffer.from(validCharts[i], 'base64');
        const resizedBuffer = await sharp(buffer)
          .resize(chartWidth, chartHeight, { fit: 'contain', background: '#ffffff' })
          .png()
          .toBuffer();
        imageBuffers.push(resizedBuffer);
        console.log(`Chart ${i + 1} processed`);
      } catch (error) {
        console.error(`Error processing chart ${i + 1}:`, error);
        throw error;
      }
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

    console.log('Creating merged image...');

    // Merge images horizontally
    const mergedBuffer = await sharp({
      create: {
        width: totalWidth,
        height: chartHeight,
        channels: 3,
        background: '#ffffff'
      }
    })
    .composite(composite)
    .png()
    .toBuffer();

    const mergedBase64 = mergedBuffer.toString('base64');

    console.log('Merge successful');

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
