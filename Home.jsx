import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, redirect } from "react-router-dom";
import { Link } from "react-router-dom";

const Home = () => {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get("http://localhost:8080/")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.name);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      })
      .then((err) => console.log(err));
  });

  const handleLogout = () => {
    axios
      .get("http://localhost:8080/logout")
      .then((res) => {
        <redirect to="/"></redirect>;
      })
      .catch((err) => {
        console.log("Error");
      });
  };

  return (
    <div className="container mt-4">
      {auth ? (
        <div>
          <h3>You are logged in -{name}</h3>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h3>You are not logged in</h3>
          <h3>Login to continue</h3>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
