import { createCanvas, loadImage } from 'canvas';

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

    const images = [];
    const chartWidth = 600;
    const chartHeight = 400;

    // Load all images
    for (const base64Chart of validCharts) {
      const buffer = Buffer.from(base64Chart, 'base64');
      const img = await loadImage(buffer);
      images.push(img);
    }

    // Create combined canvas
    const totalWidth = chartWidth * images.length;
    const canvas = createCanvas(totalWidth, chartHeight);
    const ctx = canvas.getContext('2d');

    // Draw each image side by side
    for (let i = 0; i < images.length; i++) {
      const x = i * chartWidth;
      ctx.drawImage(images[i], x, 0, chartWidth, chartHeight);
    }

    // Convert to base64
    const mergedBase64 = canvas.toBuffer('image/png').toString('base64');

    res.status(200).json({
      success: true,
      mergedChart: mergedBase64,
      chartsCount: images.length,
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
