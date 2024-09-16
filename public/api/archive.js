export default function handler(req, res) {
    if (req.method === 'GET') {
      res.status(200).json({ rolls: global.rollArchive || [] });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  