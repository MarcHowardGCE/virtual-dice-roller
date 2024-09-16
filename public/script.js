const ws = new WebSocket(`wss://${window.location.host}`);

let nickname = '';
const diceButtons = document.querySelectorAll('.dice-button');
const latestRollSpan = document.getElementById('latest-roll');
const archiveList = document.getElementById('archive-list');
const archiveLink = document.getElementById('archive-link');
const archiveModal = document.getElementById('archive-modal');
const nicknameModal = document.getElementById('nickname-modal');
const nicknameInput = document.getElementById('nickname-input');
const submitNicknameBtn = document.getElementById('submit-nickname');
const closeModal = document.querySelector('.close');
const loggedUsersList = document.getElementById('user-list');

// Show nickname modal when the page loads
window.addEventListener('load', () => {
  nicknameModal.style.display = 'block';  // Show the nickname modal on page load
});

// Event listener for nickname submission
submitNicknameBtn.addEventListener('click', () => {
  nickname = nicknameInput.value.trim();
  if (nickname) {
    // Hide the nickname modal
    nicknameModal.style.display = 'none';

    // Send the nickname to the server
    ws.send(JSON.stringify({ action: 'nickname', nickname }));
  } else {
    alert('Please enter a valid nickname.');
  }
});

// Event listener to open the archive modal
archiveLink.addEventListener('click', (event) => {
  event.preventDefault();
  archiveModal.style.display = 'block';  // Show the archive modal
  ws.send(JSON.stringify({ action: 'requestArchive' }));  // Request archive from server
});

// Close the archive modal when clicking the 'X' button
closeModal.addEventListener('click', () => {
  archiveModal.style.display = 'none';  // Hide the archive modal
});

// Close the archive modal when clicking outside the modal
window.addEventListener('click', (event) => {
  if (event.target === archiveModal) {
    archiveModal.style.display = 'none';
  }
});

// WebSocket message handler
ws.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.action === 'roll') {
    const { diceType, rollResult, nickname } = data;
    latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;
  } else if (data.action === 'archive') {
    archiveList.innerHTML = '';  // Clear the archive list
    data.rolls.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.nickname} rolled a d${item.diceType}: ${item.rollResult} at ${item.timestamp}`;
      archiveList.appendChild(li);
    });
  } else if (data.action === 'updateUserList') {
    // Update the list of logged-in users
    loggedUsersList.innerHTML = '';  // Clear the user list
    data.users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      loggedUsersList.appendChild(li);
    });
  }
};

// Function to handle dice rolling with animation
function rollDice(diceType) {
  let rollResult = Math.floor(Math.random() * diceType) + 1;

  // Simulate rolling effect for 1 second
  let rollCount = 0;
  const interval = setInterval(() => {
    latestRollSpan.textContent = `${nickname} is rolling a d${diceType}: ${getRandomRoll(diceType)}`;
    rollCount++;

    // Stop after 10 rolling iterations (~1 second)
    if (rollCount >= 10) {
      clearInterval(interval);
      latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;

      // Send the final result to the WebSocket server
      ws.send(JSON.stringify({ action: 'roll', diceType, rollResult, nickname }));
    }
  }, 100);
}

// Helper function to get a random number for the rolling animation
function getRandomRoll(diceType) {
  return Math.floor(Math.random() * diceType) + 1;
}

// Dice button event listeners
diceButtons.forEach(button => {
  button.addEventListener('click', () => {
    const diceType = button.getAttribute('data-dice');
    rollDice(diceType);
  });
});
