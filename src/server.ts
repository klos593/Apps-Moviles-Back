import express from "express";
import professionalRouter from "./routes/professional.route.js";
import userRouter from "./routes/user.route.js";
import professionRouter from "./routes/profession.route.js";

const app = express();
app.use(express.json())

app.use("/FixIt", professionalRouter);
app.use("/FixIt", userRouter);
app.use("/FixIt", professionRouter);

app.listen(3000 , () => {
    console.log("Server is running on port 3000");
});