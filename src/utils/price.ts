import { Currencies } from "../models/Order";

export function formatCurrency(value: number, currency: Currencies) {
	switch (currency) {
		case "CLP":
			return `$ ${Math.round(value).toLocaleString("es-CL")}`;
		case "PEN":
			return `$ ${Math.round(value).toLocaleString("es-PE")}`;
	}
}
