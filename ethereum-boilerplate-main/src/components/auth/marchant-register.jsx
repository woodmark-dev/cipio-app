import { useReducer, useState } from "react";
import baseUrl from "api/base-url";
import { validatePassword, validateEmail } from "./regex";
import Spinner from "components/spinner/spinner.component";
import { useNavigate } from "react-router-dom-v5-compat";

const initialState = {
  displayName: "",
  email: "",
  walletAddress: "",
  password: "",
  confirmPassword: "",
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case "displayName":
      return { ...state, displayName: payload };
    case "email":
      return { ...state, email: payload };
    case "walletAddress":
      return { ...state, walletAddress: payload };
    case "password":
      return { ...state, password: payload };
    case "confirm-password":
      return { ...state, confirmPassword: payload };
    default:
      throw new Error();
  }
};

export default function MarchantSignUp() {
  const [newErr, setNewErr] = useState(null);
  const [successMesssage, setSuccessMessage] = useState(null);
  const [emailErr, setEmailErr] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(false);

  let navigate = useNavigate();

  const navigateToUserLogin = () => {
    navigate("/", { replace: true });
  };

  const navigateToMarchantLogin = () => {
    navigate("/marchant-login", { replace: true });
  };

  const navigateToUserSignUp = () => {
    navigate("/sign-up", { replace: true });
  };

  const navigateToForgotPassword = () => {
    navigate("/marchant-enter-email", { replace: true });
  };

  const handleSignUp = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

  const { email, password, walletAddress, displayName, confirmPassword } =
    state;

  const signUpBody = {
    name: displayName,
    email,
    password,
    walletAddress,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signUpBody),
  };

  const signUpUser = async () => {
    try {
      const userData = await fetch(
        `${baseUrl()}/auth/register-marchant`,
        options,
      );
      if (!userData.ok) {
        setNewErr(() => "Unable to register marchant. Please try again");
        setLoading(false);
        return false;
      }
      await userData.json();
    } catch (error) {
      console.log(error);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const fetchUser = await fetch(
        `${baseUrl()}/auth/get-marchant?email=${email}`,
      );
      if (!fetchUser.ok) {
        const error = await fetchUser.json();
        setLoading(false);
        setNewErr(error.msg);
        return false;
      }
      const fetchResults = await fetchUser.json();
      const userData = await fetch(
        `${baseUrl()}/send-marchant-verification-email?email=${email}&verificationToken=${
          fetchResults.verificationToken
        }`,
      );
      if (!userData.ok) {
        const error = await userData.json();
        setLoading(false);
        setNewErr(error.msg);
        return false;
      }
      await userData.json();
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setNewErr(null);
    setEmailErr(null);
    setPwdError(null);
    setLoading(true);
    if (!check) {
      setLoading(false);
      setNewErr("You haven't agreed to the terms of use");
      return;
    }
    if (!walletAddress) {
      setLoading(false);
      setNewErr("Please provide your wallet address to sign up");
      return;
    }
    if (!validateEmail.test(email)) {
      setLoading(false);
      setEmailErr("Please provide a valid email");
      return;
    }
    if (!validatePassword.test(password)) {
      setLoading(false);
      setPwdError(
        "Please provide a password with at least 8 characters with at least 1 uppercase letter, 1 lowercase letter and one special character",
      );
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setNewErr("password and confirm password did not match");
      return;
    }

    if (password === confirmPassword) {
      setNewErr(null);
      setEmailErr(null);
      setPwdError(null);
      setSuccessMessage(null);
      const response = await signUpUser();
      if (response !== false) {
        setTimeout(async () => {
          const result = await sendVerificationEmail();
          if (result === true) {
            setLoading(false);
            setSuccessMessage(
              "You,ve successfully registered. Check your email to verify account",
            );
          } else {
            setLoading(false);
            setNewErr(
              "Registration failed. Try again later with another email",
            );
          }
        }, 3000);
      }
    }
  };

  function navigateToTermsOfUse() {
    navigate("/terms-of-use", { replace: true });
  }

  function readCheckBox(e) {
    setCheck(e.target.checked);
  }

  return (
    <div className="bg-blue-500 w-screen h-full flex justify-center items-center pt-64">
      <div className="flex flex-col gap-8 bg-white p-10 rounded-xl">
        <h1 className="text-lg text-center font-bold">
          Sign Up Form for Marchants
        </h1>
        <div className="w-64 md:w-80">
          <form onSubmit={submitHandler}>
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                onChange={handleSignUp}
                className="shadow appearance-none border-b rounded w-64 md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="displayName"
                type="text"
                placeholder="Name"
                required
              ></input>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                onChange={handleSignUp}
                className="shadow appearance-none border-b rounded w-64 md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="email"
                type="email"
                placeholder="Email"
                required
              ></input>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Your Wallet Address
              </label>
              <input
                onChange={handleSignUp}
                className="shadow appearance-none border-b rounded w-64 md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="walletAddress"
                type="text"
                placeholder="Wallet Address"
                required
              ></input>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                onChange={handleSignUp}
                className="shadow appearance-none border-b rounded w-64 md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="password"
                type="password"
                placeholder="Password"
                required
              ></input>
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                onChange={handleSignUp}
                className="shadow appearance-none border-b rounded w-64 md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="confirm-password"
                type="password"
                placeholder="Confirm Password"
                required
              ></input>
            </div>

            <div className="flex items-center py-5">
              <input
                onChange={readCheckBox}
                id="disabled-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="disabled-checkbox"
                className="ml-2 text-sm font-medium"
              >
                I have read and agreed to the{" "}
                <span
                  onClick={navigateToTermsOfUse}
                  className="cursor-pointer underline hover:font-bold"
                  target="_blank"
                >
                  Terms of Use
                </span>
              </label>
            </div>

            <div className="flex gap-8 items-center">
              <div>
                <input
                  className="mt-4 w-20 h-10 border font-bold text-white bg-zinc-700 rounded-lg transition-all duration-500 hover:text-black hover:bg-white"
                  type="submit"
                  disabled={loading && true}
                />
              </div>
              <div className="pt-4">{loading && <Spinner />}</div>
            </div>
            {newErr && (
              <p className="text-red-500 text-center font-bold">{newErr}</p>
            )}
            {emailErr && (
              <p className="text-red-500 text-center font-bold">{emailErr}</p>
            )}
            {pwdError && (
              <p className="text-red-500 text-center font-bold">{pwdError}</p>
            )}
            {successMesssage && <p>{successMesssage}</p>}
            <div className="flex flex-col justify-center items-center gap-4 pt-8">
              <div className="flex flex-col justify-center items-center">
                <p>Already have an account?</p>
                <p
                  className="pl-4 cursor-pointer font-bold"
                  onClick={navigateToMarchantLogin}
                >
                  Login
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p>Forgot password?</p>
                <p
                  className="pl-4 cursor-pointer font-bold"
                  onClick={navigateToForgotPassword}
                >
                  Reset password
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p>Want to login as a user?</p>
                <p
                  className="pl-4 cursor-pointer font-bold"
                  onClick={navigateToUserLogin}
                >
                  Login as user
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p>Want to register as a user?</p>
                <p
                  className="pl-4 cursor-pointer font-bold"
                  onClick={navigateToUserSignUp}
                >
                  Register as user
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
