import { Currencies } from "@/types";

export function formatCurrency(value: number, currency: Currencies) {
	switch (currency) {
		case "CLP":
			return `$ ${Math.round(value).toLocaleString("es-CL")}`;
		case "PEN":
			return `$ ${Math.round(value).toLocaleString("es-PE")}`;
		case "USD":
			return `$ ${Math.round(value).toLocaleString("en-US")}`;
		case "COP":
			return `$ ${Math.round(value).toLocaleString("es-CO")}`;
	}
}
