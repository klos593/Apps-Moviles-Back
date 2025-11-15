import { Router } from "express";
import { get } from "http";
import { createService, getFinishedProvidedServices, getFinishedUsedServices, getProviderActiveServices, getUserActiveServices } from "../controllers/service.controller.js";
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

serviceRouter.get("/finishedProvidedServices/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }
    const services = await getFinishedProvidedServices(email);
    res.json(services);
});

serviceRouter.get("/userActiveServices/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }
    const services = await getUserActiveServices(email);
    res.json(services);
});

serviceRouter.get("/providerActiveServices/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }
    const services = await getProviderActiveServices(email);
    res.json(services);
});


serviceRouter.post("/createService", createService)

export default serviceRouter;