import bcrypt from "bcryptjs";

const encryptedData = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const hashedEncData = await bcrypt.hash(data, salt);
  return hashedEncData;
};

export default encryptedData;
