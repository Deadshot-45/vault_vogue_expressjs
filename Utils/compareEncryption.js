import bcrypt from "bcryptjs";

const compareEncryptedData = async (plainText, encryptedText) => {
  if (typeof plainText !== "string" || typeof encryptedText !== "string") {
    throw new Error("Both inputs must be strings");
  }

  if (!plainText || !encryptedText) {
    throw new Error("Both inputs must not be empty");
  }

  try {
    const isValid = await bcrypt.compare(plainText, encryptedText);
    return isValid;
  } catch (error) {
    throw new Error(`Error comparing encrypted data: ${error.message}`);
  }
};

export default compareEncryptedData;
