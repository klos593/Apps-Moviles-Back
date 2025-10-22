import { Router } from "express";
import { getProfessionalById, getProfessionals } from "../controllers/professionals.controller.js";

const professionalRouter = Router();

professionalRouter.get("/professionals", async (req, res) => {
    const allProfessionals = await getProfessionals();
    res.json(allProfessionals);
});

professionalRouter.get("/professional/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Missing id parameter" });
    }
    const professionalId = parseInt(id, 10);
    if (Number.isNaN(professionalId)) {
        return res.status(400).json({ error: "Invalid id parameter" });
    }
    const professional = await getProfessionalById(professionalId);
    res.json(professional);
});

export default professionalRouter;