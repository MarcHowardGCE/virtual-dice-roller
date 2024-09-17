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
let currentRoller = null; // Track which player is currently rolling

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

  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.nickname;  // Ensure user.nickname is being used
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
