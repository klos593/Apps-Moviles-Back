import { Router } from "express";
import { getProfessionals } from "../controllers/professionals.controller.js";

const professionalRouter = Router();

professionalRouter.get("/professionals", async (req, res) => {
    const allProfessionals = await getProfessionals();
    res.json(allProfessionals);
});

export default professionalRouter;