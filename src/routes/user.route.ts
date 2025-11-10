import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { getUserByEmail } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/users", async (req, res) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});
userRouter.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }

    const user = await getUserByEmail(email);
    res.json(user);
});


export default userRouter;