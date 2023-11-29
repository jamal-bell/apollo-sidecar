// In this file, you must perform all client-side validation for every single form input (and the role dropdown) on your pages. The constraints for those fields are the same as they are for the data functions and routes. Using client-side JS, you will intercept the form's submit event when the form is submitted and If there is an error in the user's input or they are missing fields, you will not allow the form to submit to the server and will display an error on the page to the user informing them of what was incorrect or missing.  You must do this for ALL fields for the register form as well as the login form. If the form being submitted has all valid data, then you will allow it to submit to the server for processing. Don't forget to check that password and confirm password match on the registration form!
const helpers = {
  checkString(strVal, varName) {
    if (!strVal) throw `You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `${varName} cannot be an empty string or string with just spaces`;
    if (strVal.length < 2 || strVal.length > 25)
      throw `${varName} length should be between 2 and 25 characters.`;
    if (/[0-9]/.test(strVal)) throw `${varName} can not have any number.`;
    if (/[!@#$%^&*(),.?":{}|<>_]/.test(strVal))
      throw `${varName} cam not have any special character.`;
    return strVal;
  },

  checkEmail(email) {
    if (!email) throw "You must provide the Email address.";
    if (typeof email !== "string" || email.trim().length === 0)
      throw "Email must be valid strings.";

    email = email.trim().toLowerCase();

    const emailPrefixFormat = /^[a-zA-Z0-9_.-]+$/;
    const emailDomainFormat = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/;
    if (!email.includes("@")) throw "Invalid email.";
    const emailCheck = email.split("@");
    if (
      emailCheck.length !== 2 ||
      emailCheck[0].length === 0 ||
      emailCheck[1].length === 0 ||
      !emailCheck[1].includes(".")
    )
      throw "Invalid email.";
    if (
      !emailPrefixFormat.test(emailCheck[0]) ||
      !emailDomainFormat.test(emailCheck[1])
    )
      throw "Invalid email.";

    return email;
  },
  checkPassword(password) {
    if (!password) throw "Password is not provided.";
    password = password.trim();
    if (password.length === 0 || typeof password !== "string")
      throw "Passwrod must be a valid string.";
    if (password.length < 8) throw "Password must be at least 8 characters.";
    if (/\s/.test(password)) throw "Password can not have space in it.";
    if (!/[A-Z]/.test(password))
      throw "Password must have at least one uppercase character.";
    if (!/[0-9]/.test(password))
      throw "Password must have at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password))
      throw "Password must have at least one special character.";

    return password;
  },
  checkRole(role) {
    if (!role) throw "You must provide the role.";
    if (typeof role !== "string" || role.trim().length === 0)
      throw "Role must be valid strings.";
    role = role.trim().toLowerCase();
    if (role !== "admin" && role !== "user")
      throw "Role can only be admin or user.";
    return role;
  },
};

let loginForm = document.getElementById("login-form");
let registerForm = document.getElementById("registration-form");
let updateForm = document.getElementById("update-form");
let passwordForm = document.getElementById("password-form");

if (loginForm) {
  const emailAddressInput = document.getElementById("emailAddressInput");
  const passwordInput = document.getElementById("passwordInput");
  const errorContainer = document.getElementById("errors");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let emailAddress = emailAddressInput.value.trim();
    let password = passwordInput.value.trim();
    let errorList = "";
    errorContainer.hidden = true;

    try {
      emailAddress = helpers.checkEmail(emailAddress);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      password = helpers.checkPassword(password);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
      loginForm.reset();
    } else {
      errorContainer.hidden = true;
      loginForm.submit();
    }
  });
}

if (registerForm) {
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const emailAddressInput = document.getElementById("emailAddressInput");
  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const roleInput = document.getElementById("roleInput");
  const errorContainer = document.getElementById("errors");

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstName = firstNameInput.value.trim();
    let lastName = lastNameInput.value.trim();
    let emailAddress = emailAddressInput.value.trim();
    let password = passwordInput.value.trim();
    let confirmPassword = confirmPasswordInput.value.trim();
    let role = roleInput.value.trim();
    let errorList = "";

    try {
      firstName = helpers.checkString(firstName, "First Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      lastName = helpers.checkString(lastName, "Last Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      emailAddress = helpers.checkEmail(emailAddress);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      password = helpers.checkPassword(password);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (password !== confirmPassword) {
      errorList += `<li>Password and confirm password do not match.</li>`;
    }

    try {
      role = helpers.checkRole(role);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
    } else {
      errorContainer.hidden = true;
      registerForm.submit();
    }
  });
}

if (updateForm) {
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const emailAddressInput = document.getElementById("emailAddressInput");
  const bioInput = document.getElementById("bioInput");
  const gitHubInput = document.getElementById("gitHubInput");
  const roleInput = document.getElementById("roleInput");

  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstName = firstNameInput.value.trim();
    let lastName = lastNameInput.value.trim();
    let emailAddress = emailAddressInput.value.trim();
    let bio = bioInput.value.trim();
    let gitHub = gitHubInput.value.trim();
    let role = roleInput.value.trim();

    try {
      firstName = helpers.checkString(firstName, "First Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      lastName = helpers.checkString(lastName, "Last Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      emailAddress = helpers.checkEmail(emailAddress);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      if (gitHub.trim().length !== 0) {
        gitHub = new URL(gitHub);
      }
    } catch (e) {
      errorList += `<li>Invalid url for GitHub Link.</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
    } else {
      errorContainer.hidden = true;
      updateForm.submit();
    }
  });
}

if (passwordForm) {
  const currentPasswordInput = document.getElementById("currentPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const errorContainer = document.getElementById("errors");

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let currentPassword = currentPasswordInput.value.trim();
    let newPassword = newPasswordInput.value.trim();
    let confirmPassword = confirmPasswordInput.value.trim();
    let errorList = "";
    errorContainer.hidden = true;

    try {
      currentPassword = helpers.checkPassword(currentPassword);
    } catch (e) {
      errorList += `<li>Current ${e}</li>`;
    }

    try {
      newPassword = helpers.checkPassword(newPassword);
    } catch (e) {
      errorList += `<li>New ${e}</li>`;
    }

    try {
      if (newPassword !== confirmPassword)
        throw "New Password and confirm password do not match.";
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
      passwordForm.reset();
    } else {
      errorContainer.hidden = true;
      passwordForm.submit();
    }
  });
}
