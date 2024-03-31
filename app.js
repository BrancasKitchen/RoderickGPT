let newQueries = [];

const vlag1Queries = [
    "How important is video content on social media these days?",
    "Can you tell a social media joke?",
    "What is the best football club?",
    "How do you make a really good Carnival blast?",
    "Who is your favorite colleague?",
    "What is your life motto?",
    "How do you ensure that you get secret snacks at the canteen?",
    "Can you speak Papiamento well?",
    "What is your favorite Halloween movie?",
    "How many sneakers do you have?",
    "What are your favorite sneakers?",
    "Aren't you sad to be leaving?",
    "Masters of Hardcore or Thunderdome?",
    "How can small businesses compete with big players in innovation?",
    "What are some of the most exciting emerging technologies you see?",
    "How can innovation contribute to solving social problems?",
    "What are some key steps a company can take to foster a culture of innovation?",
    "How can companies integrate innovation into their business strategy?",
    "What role do leaders play in driving innovation within an organization?",
    "What are some ways companies can measure and evaluate innovation?"
];


const vlag2Queries = [
    "Kun je de ideale afmetingen voor een Instagram-video delen om de betrokkenheid te maximaliseren?",
    "Wat is de meest effectieve kleur voor een call-to-action (CTA) knop in sociale media advertenties?",
    "Hoe bepaal je de beste tijd om content te plaatsen op verschillende sociale media platforms?",
    "Welke strategieën raad je aan om organisch meer volgers op Instagram te krijgen?",
    "Wat zijn de belangrijkste elementen van een succesvolle Facebook-advertentiecampagne?",
    "Hoe meet je de ROI van influencer marketing op sociale media?",
    "Wat is jouw aanpak om virale content op TikTok te creëren?",
    "Als expert op het gebied van sociale media, hoe blijf je op de hoogte van de laatste platformwijzigingen en -functies?",
    "Wat is jouw advies voor het omgaan met sociale media burn-out terwijl je een consistente online aanwezigheid behoudt?",
    "Wat zijn de beste praktijken voor het gebruik van hashtags op Instagram om de zichtbaarheid te vergroten?",
    "Hoe pas je content aan voor verschillende sociale media platforms terwijl je de merkconsistentie behoudt?",
    "Wat is jouw strategie voor interactie met volgers in de reactiesectie van je berichten?",
    "Kun je een voorbeeld delen van een succesvolle LinkedIn-strategie voor B2B-marketing?",
    "Wat zijn enkele veelvoorkomende fouten die merken maken in hun sociale media marketing, en hoe kunnen deze worden vermeden?",
    "Hoe balanceer je tussen promotionele en educatieve content in je sociale media strategie?",
    "Welke rol spelen analyses bij het verfijnen van je sociale media content strategie?",
    "Kun je een casestudy delen van een merk dat sociale media effectief heeft gebruikt tijdens een crisis?",
    "Welk advies zou je geven aan een kleine onderneming die begint met sociale media met beperkte middelen?"
];

function setNewQueries(selectedFlag) {
    if (selectedFlag === 'vlag1') {
        newQueries = [...vlag1Queries];
    } else if (selectedFlag === 'vlag2') {
        newQueries = [...vlag2Queries];
    }
    updateButtonQueries(); // Make sure this is called here
}


function setButtonsEnabled(enabled) {
    const submitButton = document.querySelector('.query-input button');
    // Define buttons within the scope of this function
    const buttons = document.querySelectorAll('.button-section button');

    // Update the submit button
    submitButton.disabled = !enabled;
    submitButton.style.opacity = enabled ? '1' : '0.5';
    submitButton.style.pointerEvents = enabled ? 'auto' : 'none';

    // Update all populate buttons
    buttons.forEach(button => {
        button.disabled = !enabled;
        button.style.opacity = enabled ? '1' : '0.5';
        button.style.pointerEvents = enabled ? 'auto' : 'none';
    });
}



let lastDisplayedMedia = null;
let waveParams, waveAnimationInitialized = false;
let targetAmplitude = 0, targetSpeed = 0.1;


function initializeTalkingHead() {

    const headImage = document.createElement('img');
    headImage.id = 'talkingHead';
    headImage.src = 'images/neutral.gif'; // Replace with your default image path
}


function startTalking() {
    if (waveParams) {
        console.log("Starting to talk"); // Debugging
        waveParams.talking = true;
        setButtonsEnabled(false);
    }
}


function stopTalking() {
    if (waveParams) {
        waveParams.talking = false;

        // Disable buttons
        setButtonsEnabled(true);

        console.log("Wave animation stopped talking."); // Debug statement
    }
}

let buttonPressCount = 0;
const displayMediaThreshold = 6; // Threshold for displaying media content, adjust as needed

function populateQuery(queryText) {
    console.log("populateQuery called with:", queryText); // Debugging
    submitQuery(queryText);
    setButtonsEnabled(false);

    buttonPressCount++; // Increment the button press counter

    // Check if the button has been pressed enough times to display media content
    if (buttonPressCount >= displayMediaThreshold) {
        displayRandomMedia(); // Display media content
        buttonPressCount = 0; // Reset counter after displaying media content
    } else {
        // Optional: Handle cases where media content is not displayed
        console.log("Button pressed, but not enough times to display media content.");
    }

    // Call cycleQueries to update the queries
    cycleQueries();
}




let lastUserQuery = ''; // Variable to store the last user query
// Add a flag to track whether a request is already in progress
let requestInProgress = false;

function submitQuery(queryText) {
    // Check if a request is already in progress
    if (requestInProgress) {
        return; // If a request is in progress, do nothing
    }

    // Increment button press count here as well, similar to populateQuery
    buttonPressCount++; // Increment the button press counter

    // Set the flag to indicate that a request is in progress
    requestInProgress = true;

    const userQueryInput = document.getElementById('userQuery');
    const userQuery = queryText !== undefined ? queryText : userQueryInput.value;
    lastUserQuery = userQuery; // Store the user query
    const responseArea = document.getElementById('responseArea');
    const mediaPlaceholder = document.querySelector('.media-placeholder');
    const submitButton = document.querySelector('.query-input button');

    // Disable submit button while sending the query
    submitButton.disabled = true;

    // Additional logic to display media if threshold is reached
    if (buttonPressCount >= displayMediaThreshold) {
        displayRandomMedia(); // Display media content
        buttonPressCount = 0; // Reset counter after displaying media content
    }

    // Create and display the user's query
    const userMessageDiv = document.createElement('div');
    userMessageDiv.innerHTML = `<strong>You:</strong> ${userQuery}`;
    responseArea.prepend(userMessageDiv);

    // Clear the input field after submitting the query
    userQueryInput.value = '';

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Prompt:', data.prompt);
            console.log(data); // Add this line to log the response data to the console

            const aiResponseDiv = document.createElement('div');
            aiResponseDiv.classList.add('ai-response');
            aiResponseDiv.innerHTML = `
            <div class="response-content">
                <strong>RoderickGPT:</strong> <span class="typewriter">${data.reply}</span>
            </div>`;
            responseArea.prepend(aiResponseDiv);

            const typewriterSpan = aiResponseDiv.querySelector('.typewriter');

            // Typing animation starts (and starts talking animation)
            typewriter(typewriterSpan);
            responseArea.scrollTop = responseArea.scrollHeight;
        })
        .catch(error => {
            console.error('Error:', error);
            // Display error message in the response area
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `<strong>Error:</strong> Could not get a response`;
            responseArea.prepend(errorDiv);
        })
        .finally(() => {
            // Reset the flag when the request is complete
            requestInProgress = false;

            // Re-enable the submit button after the request is complete
            submitButton.disabled = false;
        });
}

function displayRandomMedia() {
    if (shuffledMediaPaths.length === 0) {
        shuffledMediaPaths = [...mediaPaths];
        shuffleArray(shuffledMediaPaths);
    }

    // Randomly select a media path and remove it from the list
    const randomIndex = Math.floor(Math.random() * shuffledMediaPaths.length);
    const mediaPath = shuffledMediaPaths.splice(randomIndex, 1)[0];

    displayMedia(mediaPath, document.querySelector('.media-placeholder'));
}


const letterToImageMap = {
    'AEI': 'AEI.png',
    'BMP': 'BMP.png',
    'CDGKNSTXYZ': 'CDGKNSTXYZ.png',
    'EUCJS': 'EUCJS.png',
    'FVO': 'FV.png',
    'QWR': 'QWR.png',
    'THGL': 'TH.png'
};

function getImageForLetter(letter) {
    letter = letter.toUpperCase();
    for (const key in letterToImageMap) {
        if (key.split('').some(k => k === letter)) {
            return letterToImageMap[key];
        }
    }
    return 'neutral.gif'; // Replace with your default image path or keep null
}

function updateTalkingHead(imageFileName) {
    const headImage = document.getElementById('talkingHead');
    if (headImage) {
        headImage.src = `images/${imageFileName}`; // Update the image path
        headImage.classList.add('talking-head-animation');
    }
}


function typewriter(element) {
    startTalking();
    const text = element.textContent;
    element.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            const currentChar = text.charAt(i);
            element.textContent += currentChar;
            i++;

            const imageName = getImageForLetter(currentChar);
            console.log('Current Char:', currentChar, 'Image:', imageName); // Debug log
            if (imageName) {
                updateTalkingHead(imageName); // Update the talking head with the corresponding image
            }

            setTimeout(type, 50); // Adjust typing speed if necessary
        } else {
            stopTalking();
            setButtonsEnabled(true);
        }
    }

    type();
}



function updateButtonQueries() {
    const buttons = document.querySelectorAll('.button-section button');

    buttons.forEach((button, index) => {
        if (index < newQueries.length) {
            button.innerText = newQueries[index];
            button.onclick = () => populateQuery(newQueries[index]);
        } else {
            button.disabled = true;
        }
    });
}





function cycleQueries() {
    if (newQueries.length > 1) {
        const movedQuery = newQueries.shift();
        newQueries.push(movedQuery);
    }
    updateButtonQueries(); // Update the button texts
}


const mediaPaths = [
    'videos/party1.mp4',
    'videos/party2.mp4',
    'videos/party3.mp4',
    'videos/party4.mp4',
    'videos/party5.mp4',
    'videos/party6.mp4',
    'videos/party7.mp4',
    'videos/party8.mp4',
    'videos/party9.mp4',
    'images/roderick1.jpg',
    'images/roderick2.jpg',
    'images/roderick3.png',
    'images/roderick4.jpg',
    'images/roderick5.jpg',
    'images/roderick6.jpg',
    'images/roderick7.jpg',
    'images/roderick8.jpg',
    'images/werk1.png',
    'images/werk2.png',
    'images/werk3.png',
    'images/werk4.jpg',
    'images/werk5.jpg',
    'images/werk6.jpg'
];



let shuffledMediaPaths = [...mediaPaths];
shuffleArray(shuffledMediaPaths);
let currentMediaIndex = 0;



// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function cycleMedia() {
    if (currentMediaIndex >= shuffledMediaPaths.length) {
        currentMediaIndex = 0;
        shuffleArray(shuffledMediaPaths);
    }

    const mediaPath = shuffledMediaPaths[currentMediaIndex];
    displayMedia(mediaPath, document.querySelector('.media-placeholder'));
    currentMediaIndex++;
}

function displayMedia(mediaPath, placeholder) {
    placeholder.innerHTML = '';
    const mediaType = mediaPath.includes('.mp4') ? 'video' : 'image';
    const mediaElement = document.createElement(mediaType === 'video' ? 'video' : 'img');
    mediaElement.src = mediaPath;

    if (mediaType === 'video') {
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.muted = true;
        mediaElement.onended = cycleMedia;
    } else {
        // Set a timeout for images
        setTimeout(cycleMedia, 5000); // Change to how long you want the image to display
    }

    mediaElement.style.objectFit = 'contain';
    mediaElement.style.width = '100%';
    mediaElement.style.height = '100%';
    placeholder.appendChild(mediaElement);
}


window.cycleTimeout = null; // Global variable for the cycling timeout

document.getElementById('userQuery').value = '';


const particleContainer = document.getElementById('particle-container');

function createParticle() {
    const particle = document.createElement('img');

    // Array of particle image paths
    const particleImages = ['images/heartro.png', 'images/twitterro.png', 'images/likero.png'];

    // Randomly select a particle image
    const randomImage = particleImages[Math.floor(Math.random() * particleImages.length)];
    particle.src = randomImage;

    particle.style.position = 'absolute';
    particle.style.top = '-50px';
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.width = '30px';
    particleContainer.appendChild(particle);

    // Animate the particle
    let yPosition = -50;
    const interval = setInterval(() => {
        yPosition += 5;
        particle.style.top = `${yPosition}px`;

        if (yPosition > window.innerHeight) {
            clearInterval(interval);
            particleContainer.removeChild(particle);
        }
    }, 50);
}

function startParticleEffect() {
    setInterval(createParticle, 1000); // Adjust the 1000ms interval to your preference
}

window.onload = function () {

    startParticleEffect();
    initializeTalkingHead();
    determineQueriesAndSet(); // Determine and set new queries first
    updateButtonQueries(); // Then update button queries based on the set queries

    // Event listener for Enter key on the input field
    document.getElementById('userQuery').addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault(); // Prevent the default Enter key action
            submitQuery(); // Call the submitQuery function
        }
    });

    function determineQueriesAndSet() {
        const headerDiv = document.querySelector('.media-button-section');
        const backgroundImageUrl = window.getComputedStyle(headerDiv).backgroundImage;

        // Check if the backgroundImageUrl includes a specific part of the image file name
        if (backgroundImageUrl.includes('arms4.png')) {
            setNewQueries('vlag2');
        } else if (backgroundImageUrl.includes('arms3.png')) {
            setNewQueries('vlag1');
        } else {
            // Default case if the image doesn't match
            setNewQueries('vlag1'); // or 'vlag2' based on your default preference
        }
    }
    updateButtonQueries(); // Then update button queries based on the set queries

    setInterval(createParticle, 1000);
};

