import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { getProfessions } from "../controllers/professions.controller.js";
import { de } from "@faker-js/faker";

const professionRouter = Router();

professionRouter.get("/professions", async (req, res) => {
    const allProfessions = await getProfessions()
    res.json(allProfessions);
});

export default professionRouter;