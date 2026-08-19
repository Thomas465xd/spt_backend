export const formatDate = (date: Date, country: string) => {
	switch (country) {
		case "Chile": {
			return new Date(date).toLocaleDateString("es-CL", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}

		case "Perú": {
			return new Date(date).toLocaleDateString("es-PE", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}

		default: {
			return new Date(date).toLocaleDateString("es-CL", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
	}
};
