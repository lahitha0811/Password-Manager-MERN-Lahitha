import React, { useState, useEffect } from "react";
import "./Login.css";
import { Link, useHistory } from "react-router-dom";
import img from "../../assets/images/login.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../axios/instance";
import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "../../redux/actions";

function Login() {
  const isAuthenticated = useSelector(state => state.isAuthenticated);
  const history = useHistory();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const res = await loginUser(userData);

      if (res.status === 200) {
        dispatch(setAuth(true));
        toast.success(res.data.message, { position: "top-right", autoClose: 3000 });
        history.push("/");
      }
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.error || "Login failed", { position: "top-right", autoClose: 5000 });
    }
  };

  useEffect(() => {
    if (isAuthenticated) history.replace("/");
  }, [isAuthenticated, history]);

  return (
    <div className="login">
      <ToastContainer />
      <div className="login__wrapper">
        <div className="login_left">
          <div className="inputs">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="inputs">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>

          <p>Don't have an account? <Link to="/signup">Signup</Link></p>

          <button type="button" onClick={handleLogin}>Login</button>
        </div>

        <div className="login_right">
          <img src={img} alt="login" />
          <div className="login__content">
            <h1>Login</h1>
            <h4>Get your password secured with us for free.</h4>
            <p>Don't have an account? <Link to="/signup">Signup</Link></p>
            <a className="attr" href="https://www.freepik.com/vectors/star" target="_blank" rel="noreferrer">
              Star vector created by vectorpouch - www.freepik.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
