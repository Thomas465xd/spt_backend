import mongoose, { Schema } from "mongoose";

interface TransformObject extends Record<string, unknown> {
	_id?: unknown;
	__v?: unknown;
}

export default function toJSON(model: Schema, ...fields: string[]) {
	model.set("toJSON", {
		transform: (_document, returnedObject: TransformObject) => {
			if (returnedObject._id) {
				returnedObject.id = returnedObject._id.toString();
			}
			delete returnedObject._id;
			delete returnedObject.__v;

			fields.forEach((field) => delete returnedObject[field]);
		},
	});
}

// When .lean() is used...
export function formatLean<T>(value: T): T {
	const visited = new WeakSet<object>();
	return formatLeanInternal(value, visited);
}

function formatLeanInternal<T>(value: T, visited: WeakSet<object>): T {
	// Arrays
	if (Array.isArray(value)) {
		if (visited.has(value)) return value as T;
		visited.add(value);
		return value.map((item) => formatLeanInternal(item, visited)) as T;
	}

	// Dates → keep intact
	if (value instanceof Date) {
		return value;
	}

	// ObjectId → string
	if (value instanceof mongoose.Types.ObjectId) {
		return value.toString() as T;
	}

	// Plain objects only
	if (value && typeof value === "object") {
		if (visited.has(value as object)) return value as T;
		visited.add(value as object);

		let obj = value as Record<string, unknown>;

		// If it's a Mongoose document, convert to plain object
		if (typeof (obj as any).toObject === "function") {
			obj = (obj as any).toObject();
		}

		const { _id, ...rest } = obj;

		const formatted: Record<string, unknown> = {};

		if (_id !== undefined) {
			formatted.id =
				_id instanceof mongoose.Types.ObjectId ? _id.toString() : _id;
		}

		for (const key in rest) {
			// Skip Mongoose internal properties
			if (
				key === "__v" ||
				key === "_doc" ||
				key === "$__" ||
				key.startsWith("$")
			)
				continue;
			formatted[key] = formatLeanInternal(rest[key], visited);
		}

		return formatted as T;
	}

	return value;
}
