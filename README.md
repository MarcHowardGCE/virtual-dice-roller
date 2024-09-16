
# D&D Virtual Dice Roller

This is a real-time virtual dice roller built for Dungeons & Dragons (D&D) 5e using web technologies. It allows multiple players to log in and view the dice rolls in real time.

## Features
- Roll all the standard D&D dice (d4, d6, d8, d10, d12, d20).
- Real-time dice rolls visible to all connected users.
- Built using HTML, CSS, JavaScript (Socket.io for real-time communication), and Node.js.

## How to Run

1. Clone the repository or download the ZIP file.
2. Install dependencies by running:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the app.
5. Share the URL with others to allow them to join and roll dice in real time.

## Project Structure

- `public/`: Contains static assets (HTML, CSS, JS).
- `server.js`: Backend server using Express and Socket.io.
- `package.json`: Lists dependencies and project configuration.

## License
This project is licensed under the MIT License.
