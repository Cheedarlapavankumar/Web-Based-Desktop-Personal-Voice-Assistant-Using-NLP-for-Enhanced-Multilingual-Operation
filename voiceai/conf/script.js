const personalInfoForm = document.getElementById('personalInfoForm');
const languageSelect = document.getElementById('language');
const nameInput = document.getElementById('name');
const genderInputs = document.querySelectorAll('input[name="gender"]');
const ageInput = document.getElementById('age');
const aboutInput = document.getElementById('about');

const getSelectedGender = () => {
  const selectedGender = Array.from(genderInputs).find(input => input.checked);
  return selectedGender ? selectedGender.value : '';
};

const setSelectedGender = (gender) => {
  const selectedGender = document.querySelector(`input[name="gender"][value="${gender}"]`);
  if (selectedGender) {
    selectedGender.checked = true;
  }
};

const populateFields = (personalInfo) => {
  languageSelect.value = personalInfo.language;
  nameInput.value = personalInfo.name;
  setSelectedGender(personalInfo.gender);
  ageInput.value = personalInfo.age;
  aboutInput.value = personalInfo.about;
};

const savePersonalInfo = (e) => {
  e.preventDefault();

  const language = languageSelect.value;
  const name = nameInput.value.trim();
  const gender = getSelectedGender();
  const age = ageInput.value.trim();
  const about = aboutInput.value.trim();

  const personalInfo = {
    language,
    name,
    gender,
    age,
    about
  };

  localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
  alert('Personal information saved successfully!');
};

const populateFormFields = () => {
  const personalInfo = localStorage.getItem('personalInfo');

  if (personalInfo) {
    const personalInfoData = JSON.parse(personalInfo);
    populateFields(personalInfoData);
  }
};

personalInfoForm.addEventListener('submit', savePersonalInfo);
window.addEventListener('load', populateFormFields);