import type { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import { OrderEmail } from "../emails/OrderEmail";
import { ForbiddenError } from "../errors/forbidden-error";
import Order, { OrderStatus } from "../models/Order";
import { NotFoundError } from "../errors/not-found";
import { OrderStatusEmail } from "../emails/status";
import {
	findOrderForAdmin,
	findOrderForUser,
	findOrders,
} from "../services/OrderService";

interface OrderData {
	token: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	clientCountry: string;
	clientState: string;
	clientCityZone: string;
	clientStreet: string;
	clientPostcode: string;
	clientBuildingNumber: string;
	shippingCost: number;
	total: number;
	cartDetails: any[];
}

export class OrderController {
	//* Get all Registered Orders | ADMIN
	static getOrdersAdmin = async (req: Request, res: Response) => {
		// Get the page and perPage query parameters (default values if not provided)
		const page = parseInt(req.query.page as string) || 1;
		const perPage = parseInt(req.query.perPage as string) || 10;

		const { status, businessId, country, orderId } = req.query;

		const { orders, totalOrders, totalPages } = await findOrders({
			page,
			perPage,
			status: status as string,
			businessId: businessId as string,
			country: country as string,
			orderId: orderId as string,
			permission: "admin",
		});

		res.status(200).json({
			orders,
			totalOrders,
			totalPages,
			perPage,
			currentPage: page,
		});
	};

	//* Get ANY Specific Order by it's ID | ADMIN
	static getOrderByIdAdmin = async (req: Request, res: Response) => {
		const { orderId } = req.params;

		const order = await findOrderForAdmin(orderId);

		if (!order) {
			throw new NotFoundError("Orden no Encontrada");
		}

		res.status(200).json(order);
	};

	//*  Get all Registered Orders under the same businessId attached to the user
	static getOrdersUser = async (req: Request, res: Response) => {
		//! Get the current user
		const userBusinessId = req.user.businessId;

		// Get the page and perPage query parameters (default values if not provided)
		const page = parseInt(req.query.page as string) || 1;
		const perPage = parseInt(req.query.perPage as string) || 10;

		const { status, businessId, country, orderId } = req.query;

		const { orders, totalOrders, totalPages } = await findOrders({
			page,
			perPage,
			status: status as string,
			businessId: businessId as string,
			country: country as string,
			orderId: orderId as string,
			permission: "client",
		});

		res.status(200).json({
			orders,
			totalOrders,
			totalPages,
			businessId: userBusinessId,
			perPage,
			currentPage: page,
		});
	};

	//* Get a single order registered under the businessId attached to the current logged user
	static getOrderByIdUser = async (req: Request, res: Response) => {
		const { orderId } = req.params;
		const businessId = req.user.businessId;

		const order = await findOrderForUser(orderId, businessId);

		if (!order) {
			throw new NotFoundError("Orden no Encontrada");
		}

		res.status(200).json(order);
	};

	//^ CREATE ORDER
	static createOrder = async (req: Request, res: Response) => {
		const {
			items,
			paymentMethod,
			shipper,
			currency,
			trackingNumber,
			purchaseOrderNumber,
			country,
			user,
			businessName,
			businessId,
			total,
			estimatedDelivery,
		} = req.body;

		// Check if user exists
		const userExists = await User.findById(user);
		if (!userExists) {
			throw new NotFoundError("User not Found");
		}

		// Create the Order
		const order = Order.build({
			items,
			paymentMethod,
			currency,
			shipper,
			country,
			user,
			businessName,
			businessId,
			trackingNumber,
			purchaseOrderNumber,
			total,
			estimatedDelivery,
		});

		await order.save();

		//* Send email to user notifying for the new registered order
		await OrderStatusEmail.Pending.send(userExists, order);

		res.status(201).json({
			message: "Orden registrada Exitosamente",
			order,
		});
	};

	//~ UPDATE ORDER | Supports Partial Updates
	static updateOrder = async (req: Request, res: Response) => {
		const { orderId } = req.params;

		const order = await Order.findById(orderId).populate<{
			user: UserInterface;
		}>("user");
		if (!order) {
			throw new NotFoundError("Orden no Encontrada");
		}

		// Only update fields that are provided
		const allowedUpdates = [
			"items",
			"payment",
			"shipper",
			"trackingNumber",
			"country",
			"user",
			"businessId",
			"businessName",
			"total",
			"status",
			"estimatedDelivery",
			"deliveredAt",
			"purchaseOrderNumber",
			"currency",
		];

		const updates = Object.keys(req.body)
			.filter((key) => allowedUpdates.includes(key))
			.reduce((obj, key) => {
				obj[key] = req.body[key];
				return obj;
			}, {} as any);

		//! CRITICAL: IF STATUS IS BEING PROVIDED, MANAGE EMAIL SENDING
		// Check if status is being changed
		const statusChanged = updates.status && updates.status !== order.status;
		const oldStatus = order.status;
		const newStatus = updates.status;

		// Apply updates
		order.set(updates);
		await order.save();

		// Send email if status was changed
		if (statusChanged) {
			const userData = order.user;

			try {
				switch (newStatus) {
					case OrderStatus.Pending:
						await OrderStatusEmail.Pending.send(userData, order);
						break;
					case OrderStatus.Sent:
						await OrderStatusEmail.Sent.send(userData, order);
						break;
					case OrderStatus.Delivered:
						await OrderStatusEmail.Delivered.send(userData, order);
						break;
					case OrderStatus.Cancelled:
						await OrderStatusEmail.Cancelled.send(userData, order);
						break;
				}

				console.log(
					`Status email sent: ${oldStatus} → ${newStatus} for order ${orderId}`,
				);
			} catch (emailError) {
				// Log email error but don't fail the request
				console.error("Error sending status update email:", emailError);
				// Email failed but order was updated successfully
			}
		}

		res.status(200).json({
			message: "Orden Actualizada Exitosamente",
			order,
		});
	};

	//~ UPDATE ORDER STATUS
	static updateOrderStatus = async (req: Request, res: Response) => {
		const { orderId } = req.params;
		const { status } = req.body; // Validated in the router

		const order = await Order.findById(orderId).populate<{
			user: UserInterface;
		}>("user");
		if (!order) {
			throw new NotFoundError("Orden no Encontrada");
		}

		// Set order Status
		order.status = status;

		// Get the user info from the populted user info
		const userData = order.user;

		// Save before sending emails (in case email fails, status is still updated)
		await order.save();

		//! CRITICAL: EMAIL SENDING LOGIC DEPENDING ON THE STATUSES
		try {
			switch (status) {
				case OrderStatus.Pending:
					await OrderStatusEmail.Pending.send(userData, order);
					break;
				case OrderStatus.Sent:
					await OrderStatusEmail.Sent.send(userData, order);
					break;
				case OrderStatus.Delivered:
					await OrderStatusEmail.Delivered.send(userData, order);
					break;
				case OrderStatus.Cancelled:
					await OrderStatusEmail.Cancelled.send(userData, order);
					break;
			}
		} catch (emailError) {
			// Log email error but don't fail the request
			console.error("Error sending status update email:", emailError);
			// Email failed but order status was updated successfully
		}

		res.status(200).json({
			message: "Estado de la Orden Actualizado Exitosamente",
			order,
		});
	};

	//! DELETE ORDER
	static deleteOrder = async (req: Request, res: Response) => {
		const { orderId } = req.params;

		const order = await Order.findById(orderId);
		if (!order) {
			throw new NotFoundError("Orden no Encontrada");
		}

		await order.deleteOne();

		res.status(200).json({ message: "Orden Eliminada Correctamente" });
	};

	// TODO: This method is flagged for deletion, as BSALE orders are no longer being used in the frontend
	static sendOrderEmails = async (req: Request, res: Response) => {
		try {
			const orderData: OrderData = req.body;
			const { clientEmail } = orderData;

			const authUser = req.user; // Usuario autenticado

			// Validar que el email ingresado es el mismo que el del usuario autenticado
			const orderUser = await User.findOne({ email: clientEmail });

			if (!orderUser || orderUser.email !== authUser.email) {
				throw new ForbiddenError(
					"No tienes permiso para generar órdenes con este email.",
				);
			}

			// Enviar ambos correos en paralelo y manejar resultados
			const [clientEmailResult, adminEmailResult] =
				await Promise.allSettled([
					OrderEmail.sendOrderEmailToClient(orderData),
					OrderEmail.sendOrderEmailToAdmin(orderData),
				]);

			// Analizar resultados
			const clientEmailSuccess = clientEmailResult.status === "fulfilled";
			const adminEmailSuccess = adminEmailResult.status === "fulfilled";

			//* Debugging Console Logs
			if (!clientEmailSuccess) {
				console.error(
					"Failed to send client email:",
					clientEmailResult.reason,
				);
			}
			if (!adminEmailSuccess) {
				console.error(
					"Failed to send admin email:",
					adminEmailResult.reason,
				);
			}

			// Determinar respuesta basada en los resultados
			if (clientEmailSuccess && adminEmailSuccess) {
				// ✅ Ambos correos enviados exitosamente
				res.status(200).json({
					message: "Correos enviados exitosamente.",
					token: orderData.token,
					emailStatus: {
						client: "sent",
						admin: "sent",
					},
				});
			} else if (clientEmailSuccess && !adminEmailSuccess) {
				// ⚠️ Email del cliente enviado, pero falló el del admin
				res.status(207).json({
					// 207 Multi-Status
					message:
						"Email enviado al cliente. Notificación al administrador pendiente.",
					token: orderData.token,
					emailStatus: {
						client: "sent",
						admin: "failed",
					},
				});
			} else if (!clientEmailSuccess && adminEmailSuccess) {
				// ⚠️ Email del admin enviado, pero falló el del cliente
				res.status(207).json({
					message:
						"Notificación al administrador enviada. Email de confirmación al cliente pendiente.",
					token: orderData.token,
					emailStatus: {
						client: "failed",
						admin: "sent",
					},
				});
			} else {
				// ❌ Ambos correos fallaron
				res.status(500).json({
					message:
						"Error al enviar los correos de confirmación. La orden fue procesada pero los emails fallarón.",
					token: orderData.token,
					emailStatus: {
						client: "failed",
						admin: "failed",
					},
				});
			}
		} catch (error) {
			console.error("OrderController.sendOrderEmails error:", error);

			// Manejar errores específicos
			if (error.name === "ValidationError") {
				res.status(400).json({
					message: "Datos de la orden inválidos.",
				});
			} else if (error.name === "CastError") {
				res.status(400).json({
					message: "Formato de datos incorrecto.",
				});
			} else {
				// Error genérico sin exponer detalles internos
				res.status(500).json({
					message:
						"Error interno del servidor. Por favor, inténtalo de nuevo.",
				});
			}
			return;
		}
	};
}
