import { Router } from "express";
import { prisma } from "../config/prisma.js";

const userRouter = Router();

userRouter.get("/users", async (req, res) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});

userRouter.get("/professions", async (req, res) => {
    const allProfessions = await prisma.profession.findMany();
    res.json(allProfessions);
});

export default userRouter;