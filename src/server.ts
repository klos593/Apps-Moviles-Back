import express from "express";
import professionalRouter from "./routes/professional.route.js";
import userRouter from "./routes/user.route.js";
import professionRouter from "./routes/profession.route.js";
import authRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json())

app.use("/FixIt/auth", authRouter);
app.use("/FixIt", professionalRouter);
app.use("/FixIt", userRouter);
app.use("/FixIt", professionRouter);

app.listen(3000 , () => {
    console.log("Server is running on port 3000");
});