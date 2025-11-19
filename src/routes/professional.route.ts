import { Router } from "express";
import { createUserProfession, deleteUserProfession, getAvailableProfessionsById, getProfessionalById, getProfessionals, getProfessionalsByProfession, getProfessionsById, updateRating } from "../controllers/professionals.controller.js";

const professionalRouter = Router();

professionalRouter.get("/professionals/:id", async (req, res) => {
    const {id} = req.params
    const userId = parseInt(id)
    const allProfessionals = await getProfessionals(userId);
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

professionalRouter.get("/professionalsWithProfession/:profession/:id", async (req, res) => {
    const { profession , id} = req.params;
    const userId = parseInt(id, 10)
    const allProfessionals = await getProfessionalsByProfession(profession, userId);
    res.json(allProfessionals);
});

professionalRouter.get("/professionalProfessions/:id", async (req, res) => {
    const { id } = req.params;
    const professionalId = parseInt(id, 10);
    const professions = await getProfessionsById(professionalId);
    res.json(professions);
});

professionalRouter.get("/professionalAvailableProfessions/:id", async (req, res) => {
    const { id } = req.params;
    const professionalId = parseInt(id, 10);
    const professions = await getAvailableProfessionsById(professionalId);
    res.json(professions);
});

professionalRouter.post("/addProfession", createUserProfession);
professionalRouter.post("/deleteProfession", deleteUserProfession)
professionalRouter.post("/professional/updateRating", updateRating)

export default professionalRouter;