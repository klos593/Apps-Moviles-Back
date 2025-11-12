import { Router } from "express";
import { get } from "http";
import { getFinishedUsedServices } from "../controllers/service.controller.js";

const serviceRouter = Router();

serviceRouter.get("/finishedUsedServices/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }
    const services = await getFinishedUsedServices(email);
    res.json(services);
});

export default serviceRouter;