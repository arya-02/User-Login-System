import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "testdb",
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Error: "You are not logged in" });
  } else {
    jwt.verify(token, "jwt-security-key", (err, decoded) => {
      if (err) {
        return res.json({ Error: "Wrong token" });
      } else {
        req.name = decoded.name;
        next();
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  return res.json({ Status: "Success", name: req.name });
});

app.post("/register", (req, res) => {
  const sql = "insert into login (name,email,password) values (?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) {
      return res.json({ Error: "Password error" });
    }
    const values = [req.body.name, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) {
        return res.json({ Error: "Could not register" });
      }
      return res.json({ Status: "Success" });
    });
  });
});

app.post("/login", (req, res) => {
  const sql = "select * from login where email = ?";
  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      return res.json({ Error: "Server Error" });
    }
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          if (err) {
            return res.json({ Error: "Wrong password" });
          }
          if (response) {
            const name = data[0].name;
            const token = jwt.sign({ name }, "jwt-secret-key", {
              expiresIn: "1d",
            });
            res.cookie("token", token);
            return res.json({ Status: "Success" });
          } else {
            return res.json({ Error: "Wrong password" });
          }
        }
      );
    } else {
      return res.json({ Error: "Account not found" });
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

app.listen(8080, () => {
  console.log("Server Running...");
});
