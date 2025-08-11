import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { loginUserController, logoutUserController, registerUserController, refreshUserController, requestResetEmailController, resetPasswordController, getGoogleOAuthController, confirmOAuthController } from "../controllers/auth.js";
import { loginUserSchema, registerUserSchema, requestResetEmailSchema, resetPasswordSchema, confirmOAuthSchema } from "../validation/auth.js";

const router = Router();

router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerUserController));

router.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginUserController));

router.post('/logout', ctrlWrapper(logoutUserController));

router.post('/refresh', ctrlWrapper(refreshUserController));

router.post('/send-reset-email', validateBody(requestResetEmailSchema), ctrlWrapper(requestResetEmailController));

router.post('/reset-pwd', validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthController));

router.post('/confirm-oauth', validateBody(confirmOAuthSchema), ctrlWrapper(confirmOAuthController));

export default router;