const validation = {
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
  checkHandle(handle) {
    if (!handle) throw "You must provide unique handle.";
    handle = handle.trim();
    if (handle.length === 0 || typeof handle !== "string")
      throw "Handle must be a valid string.";
    if (handle.length < 3 || handle.length > 10)
      throw "Handle must be 3 - 10 unique characters.";
    if (/\s/.test(handle)) throw "Handle can not have space in it.";
    if (/[!@#$%^&*(),.?":{}|<>_]/.test(handle))
      throw "Handle can not have special characters.";

    return handle;
  },
};

let loginForm = document.getElementById("login-form");
let registerForm = document.getElementById("registration-form");
let updateForm = document.getElementById("update-form");
let passwordForm = document.getElementById("password-form");
let cancelAccount = document.getElementById("cancelAccountButton");
let profile = document.getElementById("profile");
let uploadPhotoButton = document.getElementById("uploadPhotoButton");

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
      emailAddress = validation.checkEmail(emailAddress);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      password = validation.checkPassword(password);
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
  const handleInput = document.getElementById("handleInput");
  const errorContainer = document.getElementById("errors");

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstName = firstNameInput.value.trim();
    let lastName = lastNameInput.value.trim();
    let emailAddress = emailAddressInput.value.trim();
    let handle = handleInput.value.trim();
    let password = passwordInput.value.trim();
    let confirmPassword = confirmPasswordInput.value.trim();
    let role = roleInput.value.trim();
    let errorList = "";

    try {
      firstName = validation.checkString(firstName, "First Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      lastName = validation.checkString(lastName, "Last Name");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      emailAddress = validation.checkEmail(emailAddress);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      handle = validation.checkHandle(handle);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      password = validation.checkPassword(password);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (password !== confirmPassword) {
      errorList += `<li>Password and confirm password do not match.</li>`;
    }

    try {
      role = validation.checkRole(role);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
    } else {
      errorContainer.hidden = true;
      alert("Account registered! Login now.");
      registerForm.submit();
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
      currentPassword = validation.checkPassword(currentPassword);
    } catch (e) {
      errorList += `<li>Current ${e}</li>`;
    }

    try {
      newPassword = validation.checkPassword(newPassword);
    } catch (e) {
      errorList += `<li>New ${e}</li>`;
    }

    try {
      if (newPassword !== confirmPassword)
        throw "New and confirm password do not match.";
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

if (cancelAccount) {
  cancelAccount.addEventListener("click", function (event) {
    event.preventDefault();
    var confirmCancel = confirm(
      "Are you sure you want to cancel your account?"
    );
    if (confirmCancel) {
      window.location.href = "/user/cancel";
    }
  });
}

if (profile) {
  (function ($) {
    const editProfileButton = $("#editProfileButton");
    const saveProfileButton = $("#saveProfileButton");
    const firstNameInput = $("#firstNameInput");
    const lastNameInput = $("#lastNameInput");
    const emailAddressInput = $("#emailAddressInput");
    const handleInput = $("#handleInput");
    const bioInput = $("#bioInput");
    const githubInput = $("#githubInput");
    const errorContainer = $("#errors");
    const userProfileContainer = $("#userProfileContainer");
    const profileForm = $("#profile-form");

    profileForm.hide();
    userProfileContainer.show();

    function saveProfileClick(event) {
      event.preventDefault();
      let errorList = "";

      let firstName = firstNameInput.val().trim();
      let lastName = lastNameInput.val().trim();
      let emailAddress = emailAddressInput.val().trim();
      let handle = handleInput.val().trim();
      let bio = bioInput.val().trim();
      let github = githubInput.val().trim();

      try {
        firstName = validation.checkString(firstName, "First Name");
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        lastName = validation.checkString(lastName, "Last Name");
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        emailAddress = validation.checkEmail(emailAddress);
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        handle = validation.checkHandle(handle);
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        if (github.length !== 0 && !new URL(github)) {
          throw "Invalid Github Link.";
        }
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      if (errorList !== "") {
        errorContainer.html(errorList);
        errorContainer.show();
      } else {
        errorContainer.hide();

        let requestConfig = {
          method: "POST",
          url: "/user/profile",
          contentType: "application/json",
          data: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            emailAddress: emailAddress,
            handle: handle,
            bio: bio,
            github: github,
          }),
        };

        $.ajax(requestConfig)
          .then(function (response) {
            if (response.hasErrors) {
              errorContainer.html(response.errors);
              errorContainer.show();
            } else if (response.updated) {
              firstName = response.user.firstName;
              lastName = response.user.lastName;
              email = response.user.emailAddress;
              handle = response.user.handle;
              bio = response.user.bio;
              github = response.user.github;

              firstNameInput.val(firstName);
              lastNameInput.val(lastName);
              emailAddressInput.val(email);
              handleInput.val(handle);
              bioInput.val(bio);
              githubInput.val(github);

              profileForm.hide();
              userProfileContainer.show();

              editProfileButton.show();
              saveProfileButton.hide();
              alert("Profile Updated!");
              location.reload();
            }
          })
          .catch(function (e) {
            errorList.push(`<li>${e}</li>`);
            errorContainer.show();
          });
      }
    }

    function editProfileClick(event) {
      event.preventDefault();
      errorContainer.hide();
      profileForm.show();
      userProfileContainer.hide();

      editProfileButton.hide();
      saveProfileButton.show();
    }

    editProfileButton.click(function (event) {
      event.preventDefault();
      errorContainer.hide();
      editProfileClick.call(this, event);
    });

    saveProfileButton.click(function (event) {
      event.preventDefault();
      errorContainer.hide();
      saveProfileClick.call(this, event);
    });
  })(jQuery);
}

// //Cloudinary Photo Uploading
// if (uploadPhotoButton) {
//   const api_key = "913344915682151";
//   const cloud_name = "dcl4odxgu";
//   const userPhotoDisplay = document.getElementById("userPhotoDisplay");

//   uploadPhotoButton.addEventListener("click", async function (event) {
//     event.preventDefault();
//     const file = document.getElementById("photoInput");
//     if (file.files.length === 0) {
//       return alert("Please choose a photo to upload");
//     }

//     const data = new FormData();
//     data.append("file", file.files[0]);
//     data.append("upload_preset", "bll8wiq3");
//     data.append("cloud_name", cloud_name);
//     data.append("api_key", api_key);

//     const config = {
//       headers: { "X-Requested-With": "XMLHttpRequest" },
//       onUploadProgress: function (e) {
//         console.log(e.loaded / e.total);
//       },
//     };

//     const url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

//     await axios
//       .post(url, data, config)
//       .then(async function (res) {
//         const photoData = {
//           public_id: res.data.public_id,
//           version: res.data.version,
//           signature: res.data.signature,
//         };

//         const photoUpdated = await axios.post("/user/photo", photoData);

//         if (photoUpdated.data.updated) {
//           userPhotoDisplay.src = photoUpdated.data.user.photo;
//           alert("Photo Updated!");
//         } else {
//           alert("Error Updating Photo: " + photoUpdated.data.photoErrors);
//         }
//         file.value = "";
//       })
//       .catch(function (error) {
//         alert("Error Updating Photo: " + error);
//       });
//   });
// }

//AWS S3 Photo Uploading
if (uploadPhotoButton) {
  const userPhotoDisplay = document.getElementById("userPhotoDisplay");
  const file = document.getElementById("photoInput");
  const photoUploadMessage = document.getElementById("photoMessage");

  uploadPhotoButton.addEventListener("click", async function (event) {
    event.preventDefault();

    if (file.files.length === 0) {
      photoUploadMessage.style.color = "red";
      photoUploadMessage.textContent = "Please choose a photo to upload";
      file.value = "";
      return;
    }
    const maxSize = 3 * 1024 * 1024;
    if (file.files[0].size > maxSize) {
      photoUploadMessage.style.color = "red";
      photoUploadMessage.textContent =
        "The file is too large. Please select a file smaller than 5MB.";
      file.value = "";
      return;
    }

    let url;

    try {
      //get secure url from our servier
      const response = await axios.get("/user/s3Url");
      url = response.data.url;
    } catch (e) {
      console.error("Error fetching the S3 URL:", e);
    }

    try {
      //post the image directly to the s3 bucket
      await axios.put(url, file.files[0], {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: file.files[0],
      });
      const imageUrl = url.split("?")[0];
      //post url server to save into database

      const photoUpdated = await axios.post("/user/s3", { url: imageUrl });

      if (photoUpdated.data.updated) {
        userPhotoDisplay.src = photoUpdated.data.user.photo;
        photoUploadMessage.style.color = "green";
        photoUploadMessage.textContent = "Photo Updated!";
      } else {
        photoUploadMessage.style.color = "red";
        photoUploadMessage.textContent =
          "Error Updating Photo: " + photoUpdated.data.photoErrors;
      }
      file.value = "";
    } catch (e) {
      photoUploadMessage.style.color = "red";
      photoUploadMessage.textContent = "Error Updating Photo: " + e;
    }
  });
}
