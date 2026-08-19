let flashcards = [];
let currentIndex = 0;
let isFlipped = false;
let editingIndex = -1;

const flashcard = document.getElementById('flashcard');
const flashcardInner = document.getElementById('flashcardInner');
const questionText = document.getElementById('questionText');
const answerText = document.getElementById('answerText');
const cardCounter = document.getElementById('cardCounter');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addBtn = document.getElementById('addBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const cardForm = document.getElementById('cardForm');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const cancelBtn = document.getElementById('cancelBtn');

function loadCards() {
  const saved = localStorage.getItem('flashcards');
  if (saved) {
    flashcards = JSON.parse(saved);
  }
}

function saveCards() {
  localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

function updateDisplay() {
  if (flashcards.length === 0) {
    questionText.textContent = 'Click "Add Card" to create your first flashcard!';
    answerText.textContent = '...';
    cardCounter.textContent = 'No cards yet';
  } else {
    questionText.textContent = flashcards[currentIndex].question;
    answerText.textContent = flashcards[currentIndex].answer;
    cardCounter.textContent = `Card ${currentIndex + 1} of ${flashcards.length}`;
  }
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= flashcards.length - 1;
  flipCard(false);
}

function flipCard(show) {
  isFlipped = show;
  if (show) {
    flashcard.classList.add('flipped');
    showAnswerBtn.textContent = 'Show Question';
  } else {
    flashcard.classList.remove('flipped');
    showAnswerBtn.textContent = 'Show Answer';
  }
}

function openModal(isEdit) {
  editingIndex = isEdit ? currentIndex : -1;
  modalTitle.textContent = isEdit ? 'Edit Flashcard' : 'Add New Flashcard';
  if (isEdit && flashcards.length > 0) {
    questionInput.value = flashcards[currentIndex].question;
    answerInput.value = flashcards[currentIndex].answer;
  } else {
    questionInput.value = '';
    answerInput.value = '';
  }
  modal.classList.add('active');
  questionInput.focus();
}

function closeModal() {
  modal.classList.remove('active');
  cardForm.reset();
}

showAnswerBtn.addEventListener('click', () => flipCard(!isFlipped));
flashcard.addEventListener('click', () => flipCard(!isFlipped));

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateDisplay();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    updateDisplay();
  }
});

addBtn.addEventListener('click', () => openModal(false));
editBtn.addEventListener('click', () => {
  if (flashcards.length > 0) openModal(true);
});
deleteBtn.addEventListener('click', () => {
  if (flashcards.length === 0) return;
  if (confirm('Delete this flashcard?')) {
    flashcards.splice(currentIndex, 1);
    if (currentIndex >= flashcards.length) currentIndex = Math.max(0, flashcards.length - 1);
    saveCards();
    updateDisplay();
  }
});

cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

cardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  if (!question || !answer) return;

  if (editingIndex >= 0) {
    flashcards[editingIndex] = { question, answer };
  } else {
    flashcards.push({ question, answer });
    currentIndex = flashcards.length - 1;
  }
  saveCards();
  updateDisplay();
  closeModal();
});

document.addEventListener('keydown', (e) => {
  if (modal.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === ' ') { e.preventDefault(); showAnswerBtn.click(); }
});

loadCards();
updateDisplay();
