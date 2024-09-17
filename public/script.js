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
      console.log('Submitting roll:', { nickname, diceType, rollResult });
      
      fetch(`/api/roll?nickname=${nickname}&diceType=${diceType}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          const { diceType, rollResult } = data.rollData;
          console.log('Roll submission response:', data);
          latestRollSpan.textContent = `${nickname} rolled a d${diceType}: ${rollResult}`;
          enableButtons();  // Re-enable buttons after the roll is complete
        })
        .catch(error => {
          console.error('Error submitting roll:', error);
          enableButtons();  // Re-enable buttons even if there's an error
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
    console.log('Rolling dice:', diceType);
    rollDice(diceType);
  });
});

// Function to update the list of logged-in users
function updateUserList(users) {
  console.log('Updating user list:', users); // Log the users to see their structure
  loggedUsersList.innerHTML = '';  // Clear the user list

  users.forEach(user => {
    // Assuming 'user' is an object with a 'nickname' property, adjust accordingly
    const li = document.createElement('li');
    li.textContent = user.nickname || JSON.stringify(user); // Access the 'nickname' property
    loggedUsersList.appendChild(li);
  });
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
