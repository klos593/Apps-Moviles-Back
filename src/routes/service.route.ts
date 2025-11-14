import { Router } from "express";
import { get } from "http";
import { createService, getFinishedUsedServices } from "../controllers/service.controller.js";
import { create } from "domain";

const serviceRouter = Router();

serviceRouter.get("/finishedUsedServices/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }
    const services = await getFinishedUsedServices(email);
    res.json(services);
});

serviceRouter.post("/createService", createService)

export default serviceRouter;