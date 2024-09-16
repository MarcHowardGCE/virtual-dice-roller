export default function handler(req, res) {
  if (req.method === 'POST') {
    let nickname = req.query.nickname;

    if (global.users) {
      global.users = global.users.filter(user => user !== nickname);
    }
    
    res.status(200).json({ users: global.users });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
