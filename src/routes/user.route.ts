import { Router } from "express";
import { prisma } from "../config/prisma.js";

const userRouter = Router();

userRouter.get("/users", async (req, res) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});

export default userRouter;