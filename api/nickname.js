export default function handler(req, res) {
    if (req.method === 'POST') {
      let nickname = req.query.nickname;
      
      if (!global.users) {
        global.users = [];
      }
      
      if (!global.users.includes(nickname)) {
        global.users.push(nickname);
      }
      
      res.status(200).json({ users: global.users });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  