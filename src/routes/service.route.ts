import { Router } from "express";
import { createService, getFinishedProvidedServices, getFinishedUsedServices, getProviderActiveServices, getServiceInfoById, getUserActiveServices, getProfessionalReviews, updateService } from "../controllers/service.controller.js";

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

serviceRouter.get("/serviceInfo/:id", async (req, res) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({ error: "Missing id parameter" });
    }
    const userId = parseInt(id,10)
    const services = await getServiceInfoById(userId);
    res.json(services);
})

serviceRouter.get("/providerReviews/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Missing id parameter" });
    }
    const professionalId = parseInt(id,10);
    const reviews = await getProfessionalReviews(professionalId);
    res.json(reviews);
});

serviceRouter.put("/serviceInfo", updateService);

export default serviceRouter;