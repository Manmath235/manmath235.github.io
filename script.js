// Age Calculation
const birthDate = '1998-12-23';
const ageElement = document.getElementById('age');
const calculateAge = (birthDate) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};
ageElement.textContent = calculateAge(birthDate);

// Load More Button
document.getElementById('load-more-btn').addEventListener('click', function () {
  const hiddenExperiences = document.getElementById('hidden-experiences');
  const experienceContainer = document.getElementById('experience-container');
  experienceContainer.innerHTML += hiddenExperiences.innerHTML;
  hiddenExperiences.style.display = 'none';
  this.style.display = 'none';
});

// Modal Functionality
function openModal(url, event) {
  event.preventDefault();
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal__inner">
      <div class="modal__top">
        <div class="modal__title">Project Details</div>
        <button class="modal__close" type="button"><span class="material-icons">close</span></button>
      </div>
      <div class="modal__content">
        <iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
      </div>
    </div>
  `;
  modal.querySelector('.modal__close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  document.body.appendChild(modal);
}

// Form Submission
document.getElementById('contactForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const submitButton = this.querySelector('button[type="submit"]');
  submitButton.innerHTML = '<i class="bx bx-loader bx-spin"></i> Sending...';
  submitButton.disabled = true;

  fetch(this.action, {
    method: 'POST',
    body: new FormData(this),
  })
    .then(response => {
      if (response.ok) {
        document.querySelector('.sent-message').innerHTML = 'Message sent successfully. Thank you!';
        this.reset();
      } else {
        throw new Error('Failed to send message');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.querySelector('.sent-message').innerHTML = 'Failed to send message. Please try again.';
    })
    .finally(() => {
      submitButton.innerHTML = 'Send Message';
      submitButton.disabled = false;
    });
});