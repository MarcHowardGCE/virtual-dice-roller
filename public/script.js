let nickname = '';  // Ensure nickname is declared and initialized
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

// Submit nickname when clicking the submit button or pressing Enter
function submitNickname() {
  nickname = nicknameInput.value.trim();  // Get the value from input
  if (nickname) {
    nicknameModal.style.display = 'none';  // Hide the nickname modal
    // Send nickname to the server
    fetch(`/api/nickname?nickname=${nickname}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => updateUserList(data.users));
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
      archiveList.innerHTML = '';  // Clear the archive list
      data.rolls.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.nickname} rolled a d${item.diceType}: ${item.rollResult} at ${item.timestamp}`;
        archiveList.appendChild(li);
      });
    });
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

// Function to handle dice rolling with animation and result
function rollDice(diceType) {
  let rollResult = Math.floor(Math.random() * diceType) + 1;

  // Disable buttons during the roll animation
  disableButtons();

  // Simulate rolling effect for 1 second
  let rollCount = 0;
  const interval = setInterval(() => {
    latestRollSpan.textContent = `${nickname} is rolling a d${diceType}: ${getRandomRoll(diceType)}`;
    rollCount++;

    // Stop after 10 rolling iterations (~1 second)
    if (rollCount >= 10) {
      clearInterval(interval);

      // Send the roll to the server
      fetch(`/api/roll?nickname=${nickname}&diceType=${diceType}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          const { diceType, rollResult } = data.rollData;
          latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;
          enableButtons();  // Re-enable buttons after the roll is complete
        });
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

// Function to update the list of logged-in users
function updateUserList(users) {
  loggedUsersList.innerHTML = '';  // Clear the user list
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    loggedUsersList.appendChild(li);
  });
}

// Poll server for updated list of logged-in users
setInterval(() => {
  fetch('/api/users')
    .then(response => response.json())
    .then(data => updateUserList(data.users));
}, 5000); // Poll every 5 seconds for updated users list
