import { ObjectId } from "mongodb";

const helperFunctions = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }
    return arr;
  },

  checkIsPositiveNum(val, varName) {
    if (!val) throw `Error: You must supply a ${varName}!`;
    if (typeof val !== "number" || val < 0) {
      throw `${varName || "provided variable"} needs to be a positive integer`;
    }
    if (isNaN(val)) {
      throw `${varName || "provided variable"} is NaN`;
    }
    return val;
  },

  checkEmail(email) {
    if (!email) throw "You must provide contactEmail.";
    if (typeof email !== "string" || email.trim().length === 0)
      throw "Contact email must be valid strings.";

    email = email.trim();

    const emailPrefixFormat = /^[a-zA-Z0-9_.-]+$/;
    const emailDomainFormat = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/;
    if (!email.includes("@")) throw "Invalid email input.";
    const emailCheck = email.split("@");
    if (
      emailCheck.length !== 2 ||
      emailCheck[0].length === 0 ||
      emailCheck[1].length === 0 ||
      !emailCheck[1].includes(".")
    )
      throw "Invalid email input.";
    if (
      !emailPrefixFormat.test(emailCheck[0]) ||
      !emailDomainFormat.test(emailCheck[1])
    )
      throw "Invalid email input.";

    return email;
  },
  checkPassword(password) {
    if (!password) throw "You must provide password.";
    password = password;
    if (password.length === 0 || password !== "string")
      throw "Passwrod must be a valid string.";
    if (password.length < 8) throw "Password must be at least 8 characters.";
    if (/\s/.test(password)) throw "Password can not have space in it.";
    if (!/[A-Z]/.test(password))
      throw "Password must have at least one uppercase character.";
    if (!/[0-9]/.test(password))
      throw "Password must have at least one number.";
    if (!/W/.test(password))
      throw "Password must have at least one special character.";

    return password;
  },
};

export default helperFunctions;
