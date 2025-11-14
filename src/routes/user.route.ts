import { Router } from "express";
import { getUserByEmail, getUserIdAndAddressByEmail, updateUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }

    const user = await getUserByEmail(email);
    res.json(user);
});

userRouter.get("/userIdAndAddress/:email", async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Missing email parameter" });
    }

    const user = await getUserIdAndAddressByEmail(email);
    res.json(user);
});

userRouter.put("/user/:email", updateUser);


export default userRouter;