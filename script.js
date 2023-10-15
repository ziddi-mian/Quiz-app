// Check if the quiz has already been opened
// if (localStorage.getItem("quizOpened")) {
//   // Quiz has already been opened, display a message or redirect to another page
//   alert("You have already taken the quiz.");
// } else {
//   // Quiz has not been opened yet, allow the user to proceed
//   // Set a flag indicating that the quiz has been opened
//   localStorage.setItem("quizOpened", true);

//   // Your code to display and handle the quiz goes here

//   // Load the Google Sheets API and fetch the quiz data
//   handleClientLoad();
// }



// Define the necessary variables
const spreadsheetId = "17sZ85BbeL22QllhJmKQQqpAnUHM306rfovaQN1TSm3s";
const range = "Sheet1!A2:E";
const nextButton = document.getElementById("next-btn");
const questionContainer = document.getElementById("question-container");
const quizContainer = document.getElementById("quiz-container");
const optionsContainer = document.getElementById("options-container");
const questionNumber = document.getElementById("question-number");
const currentuser = document.getElementById("currentuser");

// Get references to modal elements
const modal = document.getElementById("username-modal");
const usernameInput = document.getElementById("username-input");
const usernameSubmit = document.getElementById("username-submit");

let quizData = []; // Store the retrieved quiz data
let currentQuestionIndex = 0; // Track the current question index
let userAnswers = []; // Store the user's answers
let randomQuestions = [];
let username;

// Fetch the quiz data from the Google Sheet
function fetchQuizData() {
  // Check if the quiz has already been opened
  // if (!localStorage.getItem('quizOpened')) {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: range,
    })
    .then(
      function (response) {
        const values = response.result.values;
        if (values.length > 0) {
          // Process the retrieved quiz data
          processQuizData(values);
          //Display Random Questions
          displayRandomQuestions(10);
        } else {
          console.log("No data found in the Google Sheet.");
        }
      },
      function (error) {
        console.error("Error fetching quiz data from the Google Sheet:", error);
      }
    );
}
// }

// Process the retrieved quiz data
function processQuizData(data) {
  quizData = data.map(function (row) {
    return {
      question: row[0],
      options: row.slice(1, 4),
      answer: row[4],
    };
  });
}

//Display random questions from quiz data
function displayRandomQuestions(numQuestions) {
  const shuffledQuizData = shuffleArray(quizData);
  randomQuestions = shuffledQuizData.slice(0, numQuestions);

  // Display the first question
  displayQuestion(randomQuestions[0]);

  // Attach event listener to the next button

  nextButton.addEventListener("click", handleNextButtonClick);

  // let currentQuestionIndex = 0;

  function handleNextButtonClick() {
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );

    if (selectedOption) {
      userAnswers.push(selectedOption.value);
      selectedOption.checked = false;
      currentQuestionIndex++;

      if (currentQuestionIndex < randomQuestions.length) {
        displayQuestion(randomQuestions[currentQuestionIndex]);
      } else {
        questionContainer.style.display = "none";
        optionsContainer.style.display = "none";
        nextButton.style.display = "none";
        questionNumber.style.display = "none";
        // currentuser.style.display = "none";
        showQuizResults();
      }
    }
  }
}

// Display a question and its options
function displayQuestion(question) {
  // const questionContainer = document.getElementById('question-container');
  // const optionsContainer = document.getElementById('options-container');

  questionContainer.textContent = question.question;

  optionsContainer.innerHTML = "";
  question.options.forEach(function (option, index) {
    const optionElement = document.createElement("input");
    optionElement.type = "radio";
    optionElement.name = "option";
    optionElement.value = option;
    optionsContainer.appendChild(optionElement);

    const optionLabel = document.createElement("label");
    optionLabel.textContent = option;
    optionsContainer.appendChild(optionLabel);

    optionsContainer.appendChild(document.createElement("br"));
  });

  // Show the submit button on the last question
  if (currentQuestionIndex === randomQuestions.length - 1) {
    nextButton.innerText = "Submit";
  }

  // Update the question number
  questionNumber.textContent = `${
    currentQuestionIndex + 1
  } of ${randomQuestions.length}`;

  currentuser.textContent = `Name: ${username}`;
  
}

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Show the quiz results
function showQuizResults() {
  const scoreContainer = document.getElementById("score-container");
  let correctAnswers = 0;

  for (let i = 0; i < randomQuestions.length; i++) {
    const question = randomQuestions[i];
    const userAnswer = userAnswers[i];

    if (question.answer === userAnswer) {
      correctAnswers++;
    }
  }

  const percentage = (correctAnswers / randomQuestions.length) * 100;
  const message = `Your Score ${correctAnswers}/${
    randomQuestions.length
  } (${percentage.toFixed(1)}%)`;

  scoreContainer.textContent = message;
  // GeneratePDF(username, correctAnswers);
    generatePDF(username, message);
}

// Load the Google Sheets API
function handleClientLoad() {
  gapi.load("client", initClient);
}

// Initialize the API client
function initClient() {
  gapi.client
    .init({
      apiKey: "AIzaSyClywwH20Ec84c3jbTHQWHgHxF7Rx0ywCk",
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
    })
    .then(
      function () {
        // Fetch the quiz data from the Google Sheet
        fetchQuizData();
      },
      function (error) {
        console.error("Error initializing the API client:", error);
      }
    );
}

// Load the quiz when the page is loaded
window.addEventListener("DOMContentLoaded", function () {
    quizContainer.style.display = "none"
  modal.style.display = "block";
  // Load the Google Sheets API
  //  handleClientLoad();
});
usernameSubmit.addEventListener("click", function () {
  username = usernameInput.value.trim().toUpperCase();
  if (username !== "") {
    modal.style.display = "none";
    // Load the Google Sheets API
    handleClientLoad();

    quizContainer.style.display = "block"
  }
});

// Generate pdf of result
function generatePDF(username, score) {
    // Create a new PDF instance
    const doc = new jsPDF('p', 'mm', [210, 297]); 

    doc.setFont("courier");
  
    // Set the font size and text color
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
  
    // Add the username and score to the PDF
    doc.text(`Name: ${username}`, 5, 10);
    doc.text(`${score}`, 5, 15);
    doc.setFontSize(9);
    doc.text(`Designed by salik_sian`, 30, 25);
    doc.text(`03015778091`, 38, 30);
  
    // Save the PDF
    doc.save(`${username}_Result.pdf`);
    // Open PDF in new Tab
    // doc.output("dataurlnewwindow");
  }

  
  
  