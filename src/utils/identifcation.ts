export function formatChileanRUT(input: string): string {
	if (!input) return "";

	// Remove dots, spaces and hyphen
    // e.g. 23165774-6
	const clean = input.replace(/[.\-\s]/g, "").toUpperCase();

	if (clean.length < 2) return input;

    // Slice from first char up to penultimate char 
    // e.g. body = 23.165.774 (Sliced the 6 out)
	const body = clean.slice(0, -1);
	const dv = clean.slice(-1); // Get the last character, since it requires special formatting

	// Add thousands separators
	const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Concatenate the formatted body with the last char
	return `${formattedBody}-${dv}`;
}

export function formatPeruvianRUC(input: string): string {
	if (!input) return "";

	// Remove all non-numeric characters
	const clean = input.replace(/\D/g, "");

	return clean.slice(0, 11);
}

export function formatColombianNIT(input: string): string {
	if (!input) return "";

	const clean = input.replace(/[.\-\s]/g, "");

	if (clean.length < 2) return input;

	const body = clean.slice(0, -1);
	const dv = clean.slice(-1);

	const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

	return `${formattedBody}-${dv}`;
}
