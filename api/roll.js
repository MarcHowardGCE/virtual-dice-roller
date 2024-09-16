export default function handler(req, res) {
    if (req.method === 'POST') {
      const diceType = req.query.diceType;
      const nickname = req.query.nickname;
      const rollResult = Math.floor(Math.random() * diceType) + 1;
  
      const timestamp = new Date().toLocaleString();
      const rollData = { nickname, diceType, rollResult, timestamp };
      
      if (!global.rollArchive) {
        global.rollArchive = [];
      }
  
      global.rollArchive.push(rollData);
      
      res.status(200).json({ rollData });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  