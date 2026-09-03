const passwordInput =
  document.getElementById("password");

const copyBtn =
  document.getElementById("copyBtn");

const copyMessage =
  document.getElementById("copyMessage");

const generateBtn =
  document.getElementById("generateBtn");

const lengthSlider =
  document.getElementById("lengthSlider");

const lengthValue =
  document.getElementById("lengthValue");

const uppercaseCheckbox =
  document.getElementById("uppercase");

const lowercaseCheckbox =
  document.getElementById("lowercase");

const numbersCheckbox =
  document.getElementById("numbers");

const symbolsCheckbox =
  document.getElementById("symbols");

const errorMessage =
  document.getElementById("errorMessage");

const strengthText =
  document.getElementById("strengthText");

const strengthFill =
  document.getElementById("strengthFill");


const uppercaseCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lowercaseCharacters =
  "abcdefghijklmnopqrstuvwxyz";

const numberCharacters =
  "0123456789";

const symbolCharacters =
  "!@#$%^&*()_+-=[]{}|;:,.<>?";


// -----------------------------
// Secure random number
// -----------------------------

function getSecureRandomIndex(max) {

  if (max <= 0) {
    return 0;
  }

  /*
    Rejection sampling prevents modulo bias.

    crypto.getRandomValues() gives us
    cryptographically secure random numbers.
  */

  const maxUint32 =
    0xFFFFFFFF;

  const limit =
    maxUint32 -
    (maxUint32 % max);

  let randomNumber;

  do {

    const array =
      new Uint32Array(1);

    crypto.getRandomValues(array);

    randomNumber =
      array[0];

  } while (randomNumber >= limit);

  return randomNumber % max;
}


// -----------------------------
// Shuffle password securely
// -----------------------------

function secureShuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const randomIndex =
      getSecureRandomIndex(i + 1);

    [
      array[i],
      array[randomIndex]
    ] = [
      array[randomIndex],
      array[i]
    ];

  }

  return array;
}


// -----------------------------
// Generate password
// -----------------------------

function generatePassword() {

  errorMessage.textContent = "";

  copyMessage.textContent = "";

  const length =
    Number(lengthSlider.value);

  const selectedGroups = [];

  /*
    Instead of just building one giant
    character string, we keep each enabled
    character category separately.

    This allows us to GUARANTEE the password
    contains at least one character from
    every selected category.
  */

  if (uppercaseCheckbox.checked) {

    selectedGroups.push(
      uppercaseCharacters
    );

  }

  if (lowercaseCheckbox.checked) {

    selectedGroups.push(
      lowercaseCharacters
    );

  }

  if (numbersCheckbox.checked) {

    selectedGroups.push(
      numberCharacters
    );

  }

  if (symbolsCheckbox.checked) {

    selectedGroups.push(
      symbolCharacters
    );

  }


  // No options selected

  if (selectedGroups.length === 0) {

    passwordInput.value = "";

    errorMessage.textContent =
      "Select at least one character type.";

    updateStrength("");

    return;

  }


  /*
    Example:

    If all four character groups are enabled,
    a length of 4 is the minimum required to
    guarantee one of each.
  */

  if (length < selectedGroups.length) {

    passwordInput.value = "";

    errorMessage.textContent =
      `Password must be at least ${selectedGroups.length} characters for the selected options.`;

    updateStrength("");

    return;

  }


  const passwordCharacters = [];

  let allCharacters = "";


  // Guarantee one from every selected group

  selectedGroups.forEach(group => {

    const randomIndex =
      getSecureRandomIndex(
        group.length
      );

    passwordCharacters.push(
      group[randomIndex]
    );

    allCharacters += group;

  });


  // Fill the rest of the password

  while (
    passwordCharacters.length <
    length
  ) {

    const randomIndex =
      getSecureRandomIndex(
        allCharacters.length
      );

    passwordCharacters.push(
      allCharacters[randomIndex]
    );

  }


  // Shuffle to prevent predictable positions

  secureShuffle(
    passwordCharacters
  );


  const password =
    passwordCharacters.join("");


  passwordInput.value =
    password;


  updateStrength(password);

}


// -----------------------------
// Password strength
// -----------------------------

function updateStrength(password) {

  if (!password) {

    strengthText.textContent =
      "None";

    strengthFill.style.width =
      "0%";

    strengthFill.style.background =
      "transparent";

    return;

  }


  let score = 0;


  // Length scoring

  if (password.length >= 8)
    score++;

  if (password.length >= 12)
    score++;

  if (password.length >= 16)
    score++;


  // Variety scoring

  if (/[A-Z]/.test(password))
    score++;

  if (/[a-z]/.test(password))
    score++;

  if (/[0-9]/.test(password))
    score++;

  if (
    /[^A-Za-z0-9]/.test(password)
  )
    score++;


  // Strength categories

  if (score <= 2) {

    strengthText.textContent =
      "Weak";

    strengthFill.style.width =
      "25%";

    strengthFill.style.background =
      "#e85d5d";

  }

  else if (score <= 4) {

    strengthText.textContent =
      "Fair";

    strengthFill.style.width =
      "50%";

    strengthFill.style.background =
      "#e5a83c";

  }

  else if (score <= 6) {

    strengthText.textContent =
      "Strong";

    strengthFill.style.width =
      "75%";

    strengthFill.style.background =
      "#56a86d";

  }

  else {

    strengthText.textContent =
      "Very Strong";

    strengthFill.style.width =
      "100%";

    strengthFill.style.background =
      "#26945a";

  }

}


// -----------------------------
// Copy password
// -----------------------------

async function copyPassword() {

  const password =
    passwordInput.value;


  if (!password) {

    copyMessage.textContent =
      "";

    errorMessage.textContent =
      "Generate a password before copying.";

    return;

  }


  try {

    await navigator.clipboard.writeText(
      password
    );

    errorMessage.textContent =
      "";

    copyMessage.textContent =
      "Password copied!";

    copyBtn.textContent =
      "Copied";


    setTimeout(() => {

      copyBtn.textContent =
        "Copy";

      copyMessage.textContent =
        "";

    }, 1500);

  }

  catch (error) {

    errorMessage.textContent =
      "Your browser blocked clipboard access. Select and copy the password manually.";

  }

}


// -----------------------------
// Length slider
// -----------------------------

lengthSlider.addEventListener(
  "input",
  () => {

    lengthValue.textContent =
      lengthSlider.value;

    generatePassword();

  }
);


// -----------------------------
// Option changes
// -----------------------------

const optionCheckboxes = [
  uppercaseCheckbox,
  lowercaseCheckbox,
  numbersCheckbox,
  symbolsCheckbox
];


optionCheckboxes.forEach(
  checkbox => {

    checkbox.addEventListener(
      "change",
      generatePassword
    );

  }
);


// -----------------------------
// Buttons
// -----------------------------

generateBtn.addEventListener(
  "click",
  generatePassword
);


copyBtn.addEventListener(
  "click",
  copyPassword
);


// -----------------------------
// Initial password
// -----------------------------

generatePassword();