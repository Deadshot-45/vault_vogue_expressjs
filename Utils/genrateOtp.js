import createOtp from "otp-generator";

const generateOtp = () => {
  let otp = createOtp.generate(6, {
    upperCase: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  console.log(otp);
  return otp;
};

export default generateOtp;
