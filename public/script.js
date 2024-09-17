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

let isRolling = false; // Track if any player is rolling

// Show nickname modal when the page loads
window.addEventListener('load', () => {
  nicknameModal.style.display = 'block';  // Show the nickname modal on page load
  pollServer();  // Start polling the server for updates
});

// Submit nickname when clicking the submit button or pressing Enter
submitNicknameBtn.addEventListener('click', submitNickname);
nicknameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitNickname();
});

function submitNickname() {
  nickname = nicknameInput.value.trim();
  if (nickname) {
    nicknameModal.style.display = 'none';  // Hide the nickname modal
    console.log('Submitting nickname:', nickname);

    // Send nickname to the server
    fetch(`/api/nickname?nickname=${nickname}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if (data && data.users && Array.isArray(data.users)) {
          console.log('Nickname submission response:', data.users);
          updateUserList(data.users);  // Update user list
          enableButtons();  // Enable dice buttons after nickname submission
        } else {
          console.error('Invalid user data returned:', data);
        }
      })
      .catch(error => console.error('Error submitting nickname:', error));
  } else {
    alert('Please enter a valid nickname.');
  }
}

// Function to update the list of logged-in users
function updateUserList(users) {
  loggedUsersList.innerHTML = ''; // Clear existing users

  if (!Array.isArray(users) || users.length === 0) {
    loggedUsersList.innerHTML = '<li>No users currently logged in.</li>';  // Show if no users
    return;
  }

  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.nickname;  // Use user.nickname since users should be an array of objects
    loggedUsersList.appendChild(li);
  });
}

// Show the archive modal when the archive link is clicked
archiveLink.addEventListener('click', () => {
  fetch('/api/archive')
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error('Archive data is not an array');
        return;
      }

      archiveList.innerHTML = '';  // Clear previous entries

      if (data.length === 0) {
        archiveList.innerHTML = '<li>No rolls have been made yet.</li>';  // Show message if empty
        return;
      }

      data.forEach(roll => {
        const li = document.createElement('li');
        li.textContent = `${roll.nickname} rolled a d${roll.diceType}: ${roll.rollResult} at ${roll.timestamp}`;
        archiveList.appendChild(li);
      });

      archiveModal.style.display = 'block';  // Show the archive modal
    })
    .catch(error => console.error('Error fetching archive:', error));
});

// Close the archive modal
closeModal.addEventListener('click', () => {
  archiveModal.style.display = 'none';
});

// Disable buttons during rolling
function disableButtons() {
  diceButtons.forEach(button => {
    button.disabled = true;
  });
}

// Enable buttons after rolling
function enableButtons() {
  if (!isRolling) {
    diceButtons.forEach(button => {
      button.disabled = false;
    });
  }
}

// Function to roll the dice
function rollDice(diceType) {
  if (isRolling) {
    return;  // Prevent multiple rolls while rolling is in progress
  }

  isRolling = true;  // Set rolling flag to true
  disableButtons();  // Disable dice buttons during rolling

  let rollCount = 0;
  const rollingInterval = setInterval(() => {
    const randomRoll = Math.floor(Math.random() * diceType) + 1;
    latestRollSpan.textContent = `${nickname} is rolling a d${diceType}: ${randomRoll}`;
    rollCount++;

    // Stop after 1 second (10 intervals at 100ms each)
    if (rollCount >= 10) {
      clearInterval(rollingInterval);

      const rollResult = Math.floor(Math.random() * diceType) + 1;
      latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;

      // Send the roll result to the server
      fetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, diceType, rollResult })
      })
      .then(() => {
        isRolling = false;  // Reset rolling flag after the roll is completed
        enableButtons();    // Re-enable buttons after rolling
      })
      .catch(error => {
        console.error('Error updating roll state:', error);
        isRolling = false;  // Reset in case of error
        enableButtons();    // Ensure buttons are re-enabled in case of error
      });
    }
  }, 100);  // Update every 100ms to simulate the dice rolling
}

// Add click event listeners for each dice button
diceButtons.forEach(button => {
  button.addEventListener('click', () => {
    const diceType = parseInt(button.getAttribute('data-dice'), 10);
    rollDice(diceType);
  });
});

// Poll the server every few seconds for updates on rolling state
function pollServer() {
  setInterval(() => {
    fetch('/api/game-state')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch game state');
        }
        return response.json();
      })
      .then(data => {
        if (data.isRolling && data.nickname !== nickname) {
          latestRollSpan.textContent = `${data.nickname} is rolling...`;
          disableButtons();  // Disable dice buttons while another player is rolling
        } else if (!data.isRolling) {
          enableButtons();  // Enable buttons if no one is rolling
        }
      })
      .catch(error => console.error('Error polling game state:', error));
  }, 3000);  // Poll every 3 seconds
}
