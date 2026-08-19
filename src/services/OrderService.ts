import { NotFoundError } from "../errors/not-found";
import Order, { OrderInterface, OrderStatus } from "../models/Order";
import { formatLean } from "../utils";

/** Order Service */
//* Each method is a pure data operation with NO HTTP CONCERNS.
//* Controllers will call these methods.

/**
 * @description Fetch a single order document for an admin user.
 * @param {string} orderId MongoDB order document ObjectId
 */
export async function findOrderForAdmin(
	orderId: string,
): Promise<OrderInterface | null> {
	const order = await Order.findById(orderId).populate("user");

	if (!order) return null;

	return formatLean(order);
}

/**
 * @description Fetch a single order for an authenticated user. Enforces order belonging to same business as the user.
 * @param {string} orderId MongoDB order document ObjectId
 * @param {string} businessId Identification Number (RUT, RUC, etc...)
 */
export async function findOrderForUser(
	orderId: string,
	businessId: string,
): Promise<OrderInterface | null> {
	const order = await Order.findOne({
		_id: orderId,
		businessId,
	}).populate("user");

	if (!order) return null;

	return formatLean(order);
}

type SearchParameters = {
	page: number;
	perPage: number;
	businessId: string;
	orderId: string;
	status: string; // will be transformed during processing
	country: string;
	permission: "client" | "admin";
};

export async function findOrders({
	page,
	perPage,
	businessId,
	status,
	country,
	permission,
	orderId,
}: SearchParameters): Promise<{
	orders: OrderInterface[];
	totalOrders: number;
	totalPages: number;
	filters: any;
}> {
	// Search Filters
	const filters: any = {};

	//* For admins, businessId filtering is optional
	if (permission === "admin") {
		if (businessId) {
			filters.businessId = {
				$regex: new RegExp(
					String(businessId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
					"i",
				),
			};
		}
	}

	//! For clients filtering orders by their businessId is CRITICAL
	if (permission === "client") {
		filters.businessId = {
			$regex: new RegExp(
				String(businessId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
				"i",
			),
		};
	}

	//* ?status="cancelled"
	if (status) {
		const statusMap: Record<string, string> = {
			pendiente: "Pendiente",
			"en transito": "En Transito",
			entregado: "Entregado",
			cancelado: "Cancelado",
		};

		const normalizedStatus = statusMap[String(status).toLowerCase()];
		if (normalizedStatus) {
			filters.status = normalizedStatus;
		}
	}

	//* ?country=chile
	if (country) {
		filters.country = {
			$regex: new RegExp(`^${country}$`, "i"),
		};
	}

	//* ej. ?orderId={ObjectId}
	if (orderId) {
		filters._id = orderId;
	}

	// Calculate skip and limit for pagination
	const skip = (page - 1) * perPage;
	const limit = perPage;

	// Get the total number of unconfirmed orders
	const totalOrders = await Order.countDocuments(filters);

	// Fetch the orders for the current page with pagination
	const orders = await Order.find(filters)
		.skip(skip)
		.limit(limit)
		.sort({ createdAt: -1 }) // Sort by createdAt in descending order
		.populate("user")
		.lean(); //! If not present will now work with formatLean()

	// Calculate the total number of pages
	const totalPages = Math.ceil(totalOrders / perPage);

	return {
		orders: orders.map(formatLean),
		totalOrders,
		totalPages,
		filters,
	};
}
