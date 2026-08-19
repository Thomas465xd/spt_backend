import "dotenv/config";
import * as env from "env-var";

enum Environemnts {
	Production = "production",
	Development = "development",
	CI = "ci",
	Testing = "testing",
}

export const envs = {
	NODE_ENV: env
		.get("NODE_ENV")
		.required()
		.asEnum(Object.values(Environemnts)),
	PORT: env.get("PORT").required().asPortNumber(),
	DATABASE_URL: env.get("DATABASE_URL").required().asUrlString(),
	FRONTEND_URL: env.get("FRONTEND_URL").required().asUrlString(),
	LOGO_URL: env.get("LOGO_URL").required().asUrlString(),
	ADMIN_EMAIL: env.get("ADMIN_EMAIL").required().asEmailString(),
	JWT_SECRET: env.get("JWT_SECRET").required().asString(),
	ADMIN_SECRET: env.get("ADMIN_SECRET").required().asString(),
	RESEND_API_KEY: env.get("RESEND_API_KEY").required().asString(),
	CONFIRMATION_SECRET: env.get("CONFIRMATION_SECRET").required().asString(),
	PASSWORD_RESET_SECRET: env
		.get("PASSWORD_RESET_SECRET")
		.required()
		.asString(),
};
