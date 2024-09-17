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
const myTurnButton = document.getElementById('my-turn-button'); // MY TURN button

let isRolling = false; // Track if the current user is rolling
let currentTurnPlayer = null; // Track whose turn it is to roll

// Show nickname modal when the page loads
window.addEventListener('load', () => {
  nicknameModal.style.display = 'block';  // Show the nickname modal on page load
  pollServer();  // Start polling the server for updates
});

// Submit nickname when clicking the submit button or pressing Enter
function submitNickname() {
  nickname = nicknameInput.value.trim();
  if (nickname) {
    nicknameModal.style.display = 'none';  // Hide the nickname modal
    console.log('Submitting nickname:', nickname);
    
    // Send nickname to the server
    fetch(`/api/nickname?nickname=${nickname}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log('Nickname submission response:', data);
        updateUserList(data.users);
      })
      .catch(error => console.error('Error submitting nickname:', error));
  } else {
    alert('Please enter a valid nickname.');
  }
}

// Event listener for nickname submission via button click
submitNicknameBtn.addEventListener('click', submitNickname);

// Event listener for pressing Enter to submit nickname
nicknameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    submitNickname();
  }
});

// Event listener to open the archive modal
archiveLink.addEventListener('click', (event) => {
  event.preventDefault();
  archiveModal.style.display = 'block';  // Show the archive modal
  // Fetch archive from the server
  fetch('/api/archive')
    .then(response => response.json())
    .then(data => {
      console.log('Archive data:', data);
      updateRollArchive(data.rolls);
    })
    .catch(error => console.error('Error fetching archive:', error));
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

// Handle "MY TURN" Button Click
myTurnButton.addEventListener('click', () => {
  if (currentTurnPlayer === nickname) {
    alert('It is already your turn!');
    return;
  }

  // Set the current player who is taking the turn
  currentTurnPlayer = nickname;
  updateTurnForAllPlayers(nickname);
  enableButtons(); // Enable buttons for the player whose turn it is
});

// Function to update the current player's turn for all players
function updateTurnForAllPlayers(player) {
  fetch('/api/update-turn', {  // Create an API to update the current player's turn in the backend
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: player })
  })
    .then(() => {
      console.log(`${player}'s turn has been set`);
    })
    .catch(error => console.error('Error updating turn:', error));
}

// Poll the server for game state and current turn every 2-3 seconds
setInterval(() => {
  fetch('/api/game-state')
    .then(response => response.json())
    .then(data => {
      if (data.nickname && data.diceType && data.rollResult) {
        // Check if another player is rolling
        if (data.nickname !== nickname) {
          simulateRollingAnimation(data.nickname, data.diceType, data.rollResult);
          disableButtons(); // Disable buttons while another player is rolling
        } else {
          enableButtons(); // Enable buttons for the current player
        }
      }

      // Handle current turn
      if (data.currentTurnPlayer && data.currentTurnPlayer !== nickname) {
        disableButtons(); // Disable dice rolling for others while it's not their turn
      }
    })
    .catch(error => console.error('Error fetching game state:', error));
}, 3000); // Poll every 3 seconds

// Function to simulate rolling animation for other players
function simulateRollingAnimation(playerNickname, diceType, finalRoll) {
  let rollCount = 0;
  const rollingInterval = setInterval(() => {
    const randomRoll = getRandomRoll(diceType); // Simulate random dice roll
    latestRollSpan.textContent = `${playerNickname} is rolling a d${diceType}: ${randomRoll}`;
    
    rollCount++;
    
    // Stop after a few iterations (about 1 second) and display the final result
    if (rollCount >= 10) {
      clearInterval(rollingInterval);
      latestRollSpan.textContent = `${playerNickname} rolled a d${diceType}: ${finalRoll}`;
    }
  }, 100); // Update every 100ms to simulate rolling animation
}

// Function to handle dice rolling
function rollDice(diceType) {
  if (currentTurnPlayer !== nickname || isRolling) {
    return; // Only allow rolling if it's the player's turn
  }
  
  isRolling = true;
  disableButtons(); // Disable dice buttons while rolling
  
  const rollResult = Math.floor(Math.random() * diceType) + 1;
  
  // Simulate rolling animation and update game state on the server
  setTimeout(() => {
    latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;
    
    // Send the roll to the server to update the game state
    fetch('/api/game-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, diceType, rollResult })
    })
    .then(() => {
      isRolling = false; // Reset rolling flag after roll is completed
      enableButtons(); // Re-enable buttons after the roll is complete
    })
    .catch(error => {
      console.error('Error updating game state:', error);
      isRolling = false; // Reset rolling flag in case of error
      enableButtons(); // Re-enable buttons in case of error
    });
  }, 1000); // Rolling animation takes 1 second
}

// Helper function to get a random number for rolling animation
function getRandomRoll(diceType) {
  return Math.floor(Math.random() * diceType) + 1;
}

// Function to disable all dice buttons
function disableButtons() {
  diceButtons.forEach(button => {
    button.disabled = true;
  });
}

// Function to enable all dice buttons
function enableButtons() {
  diceButtons.forEach(button => {
    button.disabled = false;
  });
}

// Function to update the list of logged-in users
function updateUserList(users) {
  console.log('Updating user list:', users);
  loggedUsersList.innerHTML = '';  // Clear the user list
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.nickname || JSON.stringify(user); // Access the 'nickname' property

    // If the user is not the current user, show the KICK button
    if (user.nickname !== nickname) {
      const kickButton = document.createElement('button');
      kickButton.textContent = 'KICK';
      kickButton.classList.add('kick-button'); // Add styles to the KICK button
      kickButton.addEventListener('click', () => kickUser(user.nickname));

      li.appendChild(kickButton);
    }
    
    loggedUsersList.appendChild(li);
  });
}

// Function to kick a user
function kickUser(userNickname) {
  fetch(`/api/disconnect?nickname=${userNickname}`, { method: 'POST' })
    .then(() => {
      console.log(`${userNickname} has been kicked`);
    })
    .catch(error => console.error('Error kicking user:', error));
}

// Function to update the roll archive
function updateRollArchive(rolls) {
  console.log('Updating roll archive:', rolls);
  archiveList.innerHTML = '';  // Clear the archive list
  rolls.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nickname} rolled a d${item.diceType}: ${item.rollResult} at ${item.timestamp}`;
    archiveList.appendChild(li);
  });
}

// Poll the server every 5 seconds for updates on users and rolls
function pollServer() {
  setInterval(() => {
    // Fetch users
    fetch('/api/users')
      .then(response => response.json())
      .then(data => updateUserList(data.users))
      .catch(error => console.error('Error fetching users:', error));

    // Fetch archive
    fetch('/api/archive')
      .then(response => response.json())
      .then(data => updateRollArchive(data.rolls))
      .catch(error => console.error('Error fetching archive:', error));
  }, 5000);  // Poll every 5 seconds
}

// Disconnect user on window/tab close
window.addEventListener('beforeunload', (event) => {
  if (nickname) {
    navigator.sendBeacon(`/api/disconnect?nickname=${nickname}`); // Use sendBeacon to ensure it works during unload
  }
});
