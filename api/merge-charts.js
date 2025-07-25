export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'API működik!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
