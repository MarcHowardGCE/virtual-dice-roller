// Connect to the WebSocket server
const socket = io();

let nickname = '';
const diceButtons = document.querySelectorAll('.dice-button');
const latestRollSpan = document.getElementById('latest-roll');
const archiveList = document.getElementById('archive-list');
const archiveLink = document.getElementById('archive-link');
const archiveModal = document.getElementById('archive-modal');
const closeModal = document.querySelector('.close');
const loggedUsersList = document.getElementById('user-list');
const appDiv = document.getElementById('app');
const nicknameModal = document.getElementById('nickname-modal');
const nicknameInput = document.getElementById('nickname-input');
const submitNicknameBtn = document.getElementById('submit-nickname');

// Ensure the nickname modal is shown when the page loads
window.addEventListener('load', () => {
  nicknameModal.style.display = 'block';
  appDiv.style.display = 'none';
});

// Event listener for nickname submission
submitNicknameBtn.addEventListener('click', () => {
  nickname = nicknameInput.value.trim();
  if (nickname) {
    // Emit an event to notify the server of a new user
    socket.emit('userJoined', nickname);

    // Show the app and hide the nickname modal
    appDiv.style.display = 'block';
    nicknameModal.style.display = 'none';
  } else {
    alert('Please enter a valid nickname.');
  }
});

// Function to disable all dice buttons
function disableButtons() {
  diceButtons.forEach(button => {
    button.disabled = true; // Disable button
  });
}

// Function to enable all dice buttons
function enableButtons() {
  diceButtons.forEach(button => {
    button.disabled = false; // Enable button
  });
}

// Event listener for dice roll buttons
diceButtons.forEach(button => {
  button.addEventListener('click', () => {
    const diceType = button.getAttribute('data-dice');

    // Disable all buttons for everyone
    disableButtons();
    socket.emit('disableButtons'); // Notify server to disable buttons for all clients

    // Create a rolling effect by updating the number every 100ms
    let interval = setInterval(() => {
      latestRollSpan.textContent = `${nickname} is rolling a d${diceType}: ${getRandomRoll(diceType)}`;
    }, 100); // Update every 100ms

    // Stop the rolling after 1 second and show the final result
    setTimeout(() => {
      clearInterval(interval); // Stop the rolling effect

      const rollResult = rollDice(diceType); // Final result

      // Emit the result along with the nickname to the server
      socket.emit('diceRolled', { diceType, rollResult, nickname });

      // Show the final roll result
      latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;

      // Re-enable buttons after rolling
      enableButtons();
      socket.emit('enableButtons'); // Notify server to enable buttons for all clients
    }, 1000); // 1 second rolling duration
  });
});

// Helper function to get a random number for the rolling effect
function getRandomRoll(diceType) {
  return Math.floor(Math.random() * diceType) + 1;
}

// Dice rolling function (final result)
function rollDice(diceType) {
  return Math.floor(Math.random() * diceType) + 1;
}

// Disable buttons for all clients when someone starts rolling
socket.on('disableButtons', () => {
  disableButtons();
});

// Enable buttons for all clients after rolling is complete
socket.on('enableButtons', () => {
  enableButtons();
});

// Display the dice roll from the server, including nickname
socket.on('diceRolled', data => {
  const { diceType, rollResult, nickname } = data;
  latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;
});

// Display logged-in users
socket.on('updateUserList', users => {
  loggedUsersList.innerHTML = ''; // Clear current list
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    loggedUsersList.appendChild(li);
  });
});

// Fetch archived rolls from the server when the user clicks "ARCHIVE"
archiveLink.addEventListener('click', (event) => {
  event.preventDefault();
  socket.emit('requestArchive');
});

// Display the archived rolls inside the modal, with timestamp
socket.on('rollArchive', archive => {
  archiveList.innerHTML = ''; // Clear the archive list

  archive.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nickname} rolled a d${item.diceType}: ${item.rollResult} at ${item.timestamp}`;
    archiveList.appendChild(li);
  });

  archiveModal.style.display = 'block'; // Open the modal
});

// Close the modal when the "X" is clicked
closeModal.addEventListener('click', () => {
  archiveModal.style.display = 'none';
});

// Close the modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === archiveModal) {
    archiveModal.style.display = 'none';
  }
});

// Notify server when user disconnects
window.addEventListener('beforeunload', () => {
  socket.emit('userLeft', nickname);
});
