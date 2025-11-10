// const db = require("../config/db");
// const stripeService = require("../services/stripeService");

// const Order = db.Order;
// const OrderItem = db.OrderItem;
// const OrderHistory = db.OrderHistory;
// const Product = db.Product;
// const Cart = db.Cart;
// const User = db.User;
// const UserProfile = db.UserProfile;

// // ====================== CREATE PAYMENT INTENT ======================
// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const userId = req.user.id;

//     // Check if Stripe is configured
//     if (!stripeService.isConfigured()) {
//       return res.status(503).json({
//         success: false,
//         error: "Payment system is currently unavailable. Please try again later."
//       });
//     }

//     // Verify order belongs to user
//     const order = await Order.findOne({
//       where: { id: orderId, userId },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['id', 'name', 'email']
//       }]
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     if (order.paymentStatus === 'paid') {
//       return res.status(400).json({
//         success: false,
//         error: "Order is already paid"
//       });
//     }

//     // Create payment intent with Stripe
//     const paymentResult = await stripeService.createPaymentIntent(
//       order.totalAmount,
//       'usd',
//       {
//         orderId: order.id.toString(),
//         userId: userId.toString(),
//         orderNumber: order.orderNumber
//       }
//     );

//     if (!paymentResult.success) {
//       return res.status(400).json({
//         success: false,
//         error: paymentResult.error
//       });
//     }

//     // Update order with payment intent ID
//     await order.update({
//       paymentIntentId: paymentResult.paymentIntentId
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         clientSecret: paymentResult.clientSecret,
//         paymentIntentId: paymentResult.paymentIntentId,
//         amount: order.totalAmount,
//         order: order
//       }
//     });

//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CONFIRM PAYMENT ======================
// exports.confirmPayment = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { orderId, paymentIntentId } = req.body;
//     const userId = req.user.id;

//     // Check if Stripe is configured
//     if (!stripeService.isConfigured()) {
//       await transaction.rollback();
//       return res.status(503).json({
//         success: false,
//         error: "Payment system is currently unavailable."
//       });
//     }

//     // Verify order belongs to user
//     const order = await Order.findOne({
//       where: { id: orderId, userId },
//       transaction
//     });

//     if (!order) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Confirm payment with Stripe
//     const paymentResult = await stripeService.confirmPaymentIntent(paymentIntentId);

//     if (!paymentResult.success) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: paymentResult.error
//       });
//     }

//     if (paymentResult.status === 'succeeded') {
//       // Update order status
//       await order.update({
//         paymentStatus: 'paid',
//         status: 'confirmed'
//       }, { transaction });

//       // Add to order history
//       await OrderHistory.create({
//         orderId: order.id,
//         status: 'confirmed',
//         notes: 'Payment confirmed successfully'
//       }, { transaction });

//       await transaction.commit();

//       res.status(200).json({
//         success: true,
//         message: "Payment confirmed successfully",
//         data: order
//       });
//     } else {
//       await transaction.rollback();
//       res.status(400).json({
//         success: false,
//         error: `Payment not completed. Status: ${paymentResult.status}`
//       });
//     }

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error confirming payment:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CREATE ORDER ======================
// exports.createOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const {
//       userId,
//       cartId,
//       shippingAddress,
//       billingAddress,
//       paymentMethod,
//       shippingMethod,
//       notes,
//       useProfileAddress = false
//     } = req.body;

//     // Get user profile for address if requested
//     let userProfile = null;
//     if (useProfileAddress) {
//       userProfile = await UserProfile.findOne({ 
//         where: { userId },
//         transaction 
//       });
      
//       if (!userProfile || !userProfile.address) {
//         await transaction.rollback();
//         return res.status(400).json({
//           success: false,
//           error: "No address found in user profile"
//         });
//       }
//     }

//     // Get cart
//     const cart = await Cart.findByPk(cartId, { transaction });
//     if (!cart || !cart.items || cart.items.length === 0) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Cart is empty or not found"
//       });
//     }

//     // Validate stock and prepare order items
//     const orderItems = [];
//     let subtotal = 0;
//     const productQuantities = [];

//     for (const cartItem of cart.items) {
//       const product = await Product.findByPk(cartItem.productId, { transaction });
      
//       if (!product) {
//         await transaction.rollback();
//         return res.status(404).json({
//           success: false,
//           error: `Product not found: ${cartItem.productId}`
//         });
//       }

//       if (product.quantity < cartItem.quantity) {
//         await transaction.rollback();
//         return res.status(400).json({
//           success: false,
//           error: `Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${cartItem.quantity}`
//         });
//       }

//       const itemTotal = cartItem.quantity * cartItem.unitPrice;
//       subtotal += itemTotal;

//       orderItems.push({
//         productId: cartItem.productId,
//         productName: product.title,
//         productSku: product.sku,
//         productImage: product.mainImage,
//         quantity: cartItem.quantity,
//         unitPrice: cartItem.unitPrice,
//         totalPrice: itemTotal,
//         sellerName: cartItem.sellerName
//       });

//       productQuantities.push({
//         productId: cartItem.productId,
//         quantity: cartItem.quantity
//       });
//     }

//     // Calculate totals
//     const taxRate = 0.1; // 10% tax
//     const shippingCost = 10.00; // Fixed shipping cost
//     const taxAmount = subtotal * taxRate;
//     const totalAmount = subtotal + taxAmount + shippingCost;

//     // Use profile address if requested
//     const finalShippingAddress = useProfileAddress ? {
//       name: userProfile.user?.name || '',
//       phone: userProfile.phone || '',
//       address: userProfile.address,
//       city: userProfile.city,
//       country: userProfile.country,
//       postalCode: userProfile.postalCode
//     } : shippingAddress;

//     const finalBillingAddress = billingAddress || finalShippingAddress;

//     // Create order
//     const order = await Order.create({
//       userId,
//       subtotal,
//       taxAmount,
//       shippingAmount: shippingCost,
//       totalAmount,
//       shippingAddress: finalShippingAddress,
//       billingAddress: finalBillingAddress,
//       paymentMethod,
//       shippingMethod,
//       notes,
//       status: 'pending',
//       paymentStatus: 'pending'
//     }, { transaction });

//     // Create order items
//     for (const itemData of orderItems) {
//       await OrderItem.create({
//         ...itemData,
//         orderId: order.id
//       }, { transaction });
//     }

//     // Reduce product quantities
//     for (const { productId, quantity } of productQuantities) {
//       const product = await Product.findByPk(productId, { transaction });
//       product.quantity -= quantity;
//       await product.save({ transaction });
//     }

//     // Create order history entry
//     await OrderHistory.create({
//       orderId: order.id,
//       status: 'pending',
//       notes: 'Order created successfully'
//     }, { transaction });

//     // Clear cart
//     await cart.update({
//       items: [],
//       totalAmount: 0,
//       itemCount: 0
//     }, { transaction });

//     await transaction.commit();

//     // Fetch complete order with relations
//     const completeOrder = await Order.findByPk(order.id, {
//       include: [
//         {
//           model: OrderItem,
//           as: 'items',
//           include: [{
//             model: Product,
//             as: 'product',
//             attributes: ['id', 'title', 'sku', 'mainImage']
//           }]
//         },
//         {
//           model: OrderHistory,
//           as: 'history',
//           order: [['createdAt', 'DESC']]
//         },
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'name', 'email']
//         }
//       ]
//     });

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: completeOrder
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error creating order:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CREATE PAYMENT INTENT ======================
// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const userId = req.user.id;

//     // Verify order belongs to user
//     const order = await Order.findOne({
//       where: { id: orderId, userId },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['id', 'name', 'email']
//       }]
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     if (order.paymentStatus === 'paid') {
//       return res.status(400).json({
//         success: false,
//         error: "Order is already paid"
//       });
//     }

//     // Create payment intent with Stripe
//     const paymentResult = await stripeService.createPaymentIntent(
//       order.totalAmount,
//       'usd',
//       {
//         orderId: order.id.toString(),
//         userId: userId.toString(),
//         orderNumber: order.orderNumber
//       }
//     );

//     if (!paymentResult.success) {
//       return res.status(400).json({
//         success: false,
//         error: paymentResult.error
//       });
//     }

//     // Update order with payment intent ID
//     await order.update({
//       paymentIntentId: paymentResult.paymentIntentId
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         clientSecret: paymentResult.clientSecret,
//         paymentIntentId: paymentResult.paymentIntentId,
//         amount: order.totalAmount,
//         order: order
//       }
//     });

//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CONFIRM PAYMENT ======================
// exports.confirmPayment = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { orderId, paymentIntentId } = req.body;
//     const userId = req.user.id;

//     // Verify order belongs to user
//     const order = await Order.findOne({
//       where: { id: orderId, userId },
//       transaction
//     });

//     if (!order) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Confirm payment with Stripe
//     const paymentResult = await stripeService.confirmPaymentIntent(paymentIntentId);

//     if (!paymentResult.success) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: paymentResult.error
//       });
//     }

//     if (paymentResult.status === 'succeeded') {
//       // Update order status
//       await order.update({
//         paymentStatus: 'paid',
//         status: 'confirmed'
//       }, { transaction });

//       // Add to order history
//       await OrderHistory.create({
//         orderId: order.id,
//         status: 'confirmed',
//         notes: 'Payment confirmed successfully'
//       }, { transaction });

//       await transaction.commit();

//       res.status(200).json({
//         success: true,
//         message: "Payment confirmed successfully",
//         data: order
//       });
//     } else {
//       await transaction.rollback();
//       res.status(400).json({
//         success: false,
//         error: `Payment not completed. Status: ${paymentResult.status}`
//       });
//     }

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error confirming payment:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== GET ORDERS ======================
// exports.getOrders = async (req, res) => {
//   try {
//     const { userId, page = 1, limit = 10, status } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = {};
//     if (userId) whereClause.userId = userId;
//     if (status) whereClause.status = status;

//     const { count, rows: orders } = await Order.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: OrderItem,
//           as: 'items',
//           include: [{
//             model: Product,
//             as: 'product',
//             attributes: ['id', 'title', 'sku', 'mainImage']
//           }]
//         },
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'name', 'email']
//         }
//       ],
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       distinct: true
//     });

//     res.status(200).json({
//       success: true,
//       data: orders,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count,
//         pages: Math.ceil(count / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== GET ORDER ======================
// exports.getOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const order = await Order.findByPk(id, {
//       include: [
//         {
//           model: OrderItem,
//           as: 'items',
//           include: [{
//             model: Product,
//             as: 'product',
//             attributes: ['id', 'title', 'sku', 'mainImage']
//           }]
//         },
//         {
//           model: OrderHistory,
//           as: 'history',
//           order: [['createdAt', 'DESC']]
//         },
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'name', 'email']
//         }
//       ]
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Users can only view their own orders unless admin
//     if (order.userId !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: "Access denied"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order
//     });

//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== UPDATE ORDER STATUS ======================
// exports.updateOrderStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { status, notes } = req.body;

//     const order = await Order.findByPk(id, { transaction });
//     if (!order) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Update order status
//     await order.update({ status }, { transaction });

//     // Add to order history
//     await OrderHistory.create({
//       orderId: id,
//       status,
//       notes: notes || `Order status updated to ${status}`
//     }, { transaction });

//     await transaction.commit();

//     res.status(200).json({
//       success: true,
//       message: "Order status updated successfully",
//       data: order
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error updating order status:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CANCEL ORDER ======================
// exports.cancelOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { reason } = req.body;
//     const userId = req.user.id;

//     const order = await Order.findByPk(id, {
//       include: [{
//         model: OrderItem,
//         as: 'items'
//       }]
//     }, { transaction });

//     if (!order) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Users can only cancel their own orders unless admin
//     if (order.userId !== userId && req.user.role !== 'admin') {
//       await transaction.rollback();
//       return res.status(403).json({
//         success: false,
//         error: "Access denied"
//       });
//     }

//     // Only pending or confirmed orders can be cancelled
//     if (!['pending', 'confirmed'].includes(order.status)) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: `Cannot cancel order with status: ${order.status}`
//       });
//     }

//     // Restore product quantities
//     for (const item of order.items) {
//       const product = await Product.findByPk(item.productId, { transaction });
//       if (product) {
//         product.quantity += item.quantity;
//         await product.save({ transaction });
//       }
//     }

//     // Update order status
//     await order.update({ 
//       status: 'cancelled',
//       paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
//     }, { transaction });

//     // Add to order history
//     await OrderHistory.create({
//       orderId: id,
//       status: 'cancelled',
//       notes: reason || 'Order cancelled by user'
//     }, { transaction });

//     // Process refund if payment was made
//     if (order.paymentStatus === 'paid' && order.paymentIntentId) {
//       try {
//         await stripeService.createRefund(order.paymentIntentId);
//       } catch (refundError) {
//         console.error("Error processing refund:", refundError);
//         // Continue with cancellation even if refund fails
//       }
//     }

//     await transaction.commit();

//     res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully",
//       data: order
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error cancelling order:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== UPDATE PAYMENT STATUS ======================
// exports.updatePaymentStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { paymentStatus, paymentDetails } = req.body;

//     const order = await Order.findByPk(id, { transaction });
//     if (!order) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Order not found"
//       });
//     }

//     // Update payment status
//     await order.update({ 
//       paymentStatus,
//       ...(paymentStatus === 'paid' && { status: 'confirmed' })
//     }, { transaction });

//     // Add to order history
//     await OrderHistory.create({
//       orderId: id,
//       status: paymentStatus === 'paid' ? 'confirmed' : order.status,
//       notes: `Payment status updated to ${paymentStatus}`
//     }, { transaction });

//     await transaction.commit();

//     res.status(200).json({
//       success: true,
//       message: "Payment status updated successfully",
//       data: order
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error updating payment status:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== GET ORDER STATISTICS ======================
// exports.getOrderStatistics = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const totalOrders = await Order.count({ where: { userId } });
//     const pendingOrders = await Order.count({ 
//       where: { userId, status: 'pending' } 
//     });
//     const deliveredOrders = await Order.count({ 
//       where: { userId, status: 'delivered' } 
//     });
//     const totalSpent = await Order.sum('totalAmount', { 
//       where: { userId, paymentStatus: 'paid' } 
//     });

//     // Recent orders
//     const recentOrders = await Order.findAll({
//       where: { userId },
//       order: [['createdAt', 'DESC']],
//       limit: 5,
//       attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt']
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         totalOrders,
//         pendingOrders,
//         deliveredOrders,
//         totalSpent: totalSpent || 0,
//         recentOrders
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching order statistics:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

const db = require("../config/db");
const stripeService = require("../services/stripeService");

const Order = db.Order;
const OrderItem = db.OrderItem;
const OrderHistory = db.OrderHistory;
const Product = db.Product;
const Cart = db.Cart;
const User = db.User;
const UserProfile = db.UserProfile;
const Invoice = db.Invoice;

// ====================== CREATE ORDER ======================
exports.createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      userId,
      cartId,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      customerNotes,
      useProfileAddress = false,
      taxRate = 0.1, // Default 10% tax
      shippingCost = 10.00 // Default shipping cost
    } = req.body;

    // Get user profile for address if requested
    let userProfile = null;
    if (useProfileAddress) {
      userProfile = await UserProfile.findOne({ 
        where: { userId },
        transaction 
      });
      
      if (!userProfile || !userProfile.address) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: "No address found in user profile"
        });
      }
    }

    // Get cart
    const cart = await Cart.findByPk(cartId, { transaction });
    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Cart is empty or not found"
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let subtotal = 0;
    const productQuantities = [];

    for (const cartItem of cart.items) {
      const product = await Product.findByPk(cartItem.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: `Product not found: ${cartItem.productId}`
        });
      }

      if (product.quantity < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${cartItem.quantity}`
        });
      }

      const itemTotal = cartItem.quantity * cartItem.unitPrice;
      subtotal += itemTotal;

      // Calculate cost price and profit
      const costPrice = await getProductCostPrice(product.id, cartItem.sellerName);
      const profit = costPrice ? (cartItem.unitPrice - costPrice) * cartItem.quantity : null;

      orderItems.push({
        productId: cartItem.productId,
        productName: product.title,
        productSku: product.sku,
        productImage: product.mainImage,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: itemTotal,
        sellerName: cartItem.sellerName,
        costPrice: costPrice,
        profit: profit
      });

      productQuantities.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity
      });
    }

    // Calculate totals
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Use profile address if requested
    const finalShippingAddress = useProfileAddress ? {
      name: userProfile.user?.name || '',
      phone: userProfile.phone || '',
      address: userProfile.address,
      city: userProfile.city,
      country: userProfile.country,
      postalCode: userProfile.postalCode
    } : shippingAddress;

    const finalBillingAddress = billingAddress || finalShippingAddress;

    // Create order
    const order = await Order.create({
      userId,
      subtotal,
      taxAmount,
      taxRate: taxRate * 100, // Store as percentage
      shippingAmount: shippingCost,
      totalAmount,
      shippingAddress: finalShippingAddress,
      billingAddress: finalBillingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      customerNotes,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: new Date()
    }, { transaction });

    // Create order items
    for (const itemData of orderItems) {
      await OrderItem.create({
        ...itemData,
        orderId: order.id
      }, { transaction });
    }

    // Reduce product quantities
    for (const { productId, quantity } of productQuantities) {
      const product = await Product.findByPk(productId, { transaction });
      product.quantity -= quantity;
      await product.save({ transaction });
    }

    // Create order history entry
    await OrderHistory.create({
      orderId: order.id,
      status: 'pending',
      notes: 'Order created successfully'
    }, { transaction });

    // Create invoice
    const invoice = await Invoice.create({
      orderId: order.id,
      userId: userId,
      amount: totalAmount,
      taxAmount: taxAmount,
      billingAddress: finalBillingAddress,
      shippingAddress: finalShippingAddress,
      items: orderItems,
      paymentTerms: 'Due on receipt',
      status: 'draft'
    }, { transaction });

    // Clear cart
    await cart.update({
      items: [],
      totalAmount: 0,
      itemCount: 0
    }, { transaction });

    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'sku', 'mainImage']
          }]
        },
        {
          model: OrderHistory,
          as: 'history',
          order: [['createdAt', 'DESC']]
        },
        {
          model: Invoice,
          as: 'invoices',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Update sales analytics
    await updateSalesAnalytics();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: completeOrder,
        invoice: invoice
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== CREATE PAYMENT INTENT ======================
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Verify order belongs to user
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: "Order is already paid"
      });
    }

    // Create payment intent with Stripe
    const paymentResult = await stripeService.createPaymentIntent(
      order.totalAmount,
      'usd',
      {
        orderId: order.id.toString(),
        userId: userId.toString(),
        orderNumber: order.orderNumber
      }
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: paymentResult.error
      });
    }

    // Update order with payment intent ID
    await order.update({
      paymentIntentId: paymentResult.paymentIntentId
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
        amount: order.totalAmount,
        order: order
      }
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== CONFIRM PAYMENT ======================
exports.confirmPayment = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { orderId, paymentIntentId } = req.body;
    const userId = req.user.id;

    // Verify order belongs to user
    const order = await Order.findOne({
      where: { id: orderId, userId },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Confirm payment with Stripe
    const paymentResult = await stripeService.confirmPaymentIntent(paymentIntentId);

    if (!paymentResult.success) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: paymentResult.error
      });
    }

    if (paymentResult.status === 'succeeded') {
      // Update order status
      await order.update({
        paymentStatus: 'paid',
        status: 'confirmed',
        completedAt: new Date()
      }, { transaction });

      // Update invoice status
      await Invoice.update({
        status: 'paid'
      }, {
        where: { orderId: order.id },
        transaction
      });

      // Add to order history
      await OrderHistory.create({
        orderId: order.id,
        status: 'confirmed',
        notes: 'Payment confirmed successfully'
      }, { transaction });

      await transaction.commit();

      // Update sales analytics
      await updateSalesAnalytics();

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: order
      });
    } else {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        error: `Payment not completed. Status: ${paymentResult.status}`
      });
    }

  } catch (error) {
    await transaction.rollback();
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== GET ORDERS ======================
exports.getOrders = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10, status, paymentStatus, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    
    // Date range filter
    if (startDate && endDate) {
      whereClause.orderDate = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.orderDate = {
        [db.Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.orderDate = {
        [db.Sequelize.Op.lte]: new Date(endDate)
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'sku', 'mainImage']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Invoice,
          as: 'invoices',
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== GET ORDER ======================
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'sku', 'mainImage', 'brandId', 'categoryId']
          }]
        },
        {
          model: OrderHistory,
          as: 'history',
          order: [['createdAt', 'DESC']]
        },
        {
          model: Invoice,
          as: 'invoices',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          include: [{
            model: UserProfile,
            as: 'profile',
            attributes: ['phone', 'address', 'city', 'country', 'postalCode']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Users can only view their own orders unless admin
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== UPDATE ORDER STATUS ======================
exports.updateOrderStatus = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Update order status
    await order.update({ status }, { transaction });

    // Add to order history
    await OrderHistory.create({
      orderId: id,
      status,
      notes: notes || `Order status updated to ${status}`
    }, { transaction });

    // If order is delivered, mark as completed
    if (status === 'delivered' && !order.completedAt) {
      await order.update({
        completedAt: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Update sales analytics if order is completed
    if (status === 'delivered') {
      await updateSalesAnalytics();
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== CANCEL ORDER ======================
exports.cancelOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    }, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Users can only cancel their own orders unless admin
    if (order.userId !== userId && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    // Only pending or confirmed orders can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (product) {
        product.quantity += item.quantity;
        await product.save({ transaction });
      }
    }

    // Update order status
    await order.update({ 
      status: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
    }, { transaction });

    // Update invoice status
    await Invoice.update({
      status: 'cancelled'
    }, {
      where: { orderId: order.id },
      transaction
    });

    // Add to order history
    await OrderHistory.create({
      orderId: id,
      status: 'cancelled',
      notes: reason || 'Order cancelled by user'
    }, { transaction });

    // Process refund if payment was made
    if (order.paymentStatus === 'paid' && order.paymentIntentId) {
      try {
        await stripeService.createRefund(order.paymentIntentId);
      } catch (refundError) {
        console.error("Error processing refund:", refundError);
        // Continue with cancellation even if refund fails
      }
    }

    await transaction.commit();

    // Update sales analytics
    await updateSalesAnalytics();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== UPDATE PAYMENT STATUS ======================
exports.updatePaymentStatus = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentStatus, paymentDetails } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Update payment status
    await order.update({ 
      paymentStatus,
      ...(paymentStatus === 'paid' && { status: 'confirmed', completedAt: new Date() })
    }, { transaction });

    // Update invoice status
    if (paymentStatus === 'paid') {
      await Invoice.update({
        status: 'paid'
      }, {
        where: { orderId: order.id },
        transaction
      });
    }

    // Add to order history
    await OrderHistory.create({
      orderId: id,
      status: paymentStatus === 'paid' ? 'confirmed' : order.status,
      notes: `Payment status updated to ${paymentStatus}`
    }, { transaction });

    await transaction.commit();

    // Update sales analytics if payment is completed
    if (paymentStatus === 'paid') {
      await updateSalesAnalytics();
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== GET ORDER STATISTICS ======================
exports.getOrderStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalOrders = await Order.count({ where: { userId } });
    const pendingOrders = await Order.count({ 
      where: { userId, status: 'pending' } 
    });
    const deliveredOrders = await Order.count({ 
      where: { userId, status: 'delivered' } 
    });
    const totalSpent = await Order.sum('totalAmount', { 
      where: { userId, paymentStatus: 'paid' } 
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt']
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalSpent: totalSpent || 0,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== GET USER ORDER HISTORY ======================
exports.getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'sku', 'mainImage']
          }]
        },
        {
          model: Invoice,
          as: 'invoices',
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching user order history:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== SALES ANALYTICS ======================
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let analytics;
    
    if (startDate && endDate) {
      // Custom date range
      analytics = await getCustomSalesAnalytics(new Date(startDate), new Date(endDate));
    } else {
      // Predefined periods
      analytics = await getPeriodSalesAnalytics(period);
    }

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== FINANCIAL REPORTS ======================
exports.getFinancialReports = async (req, res) => {
  try {
    const { reportType = 'monthly', year, month } = req.query;

    const financialReport = await generateFinancialReport(reportType, year, month);

    res.status(200).json({
      success: true,
      data: financialReport
    });

  } catch (error) {
    console.error("Error generating financial report:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== HELPER FUNCTIONS ======================

// Get product cost price from seller prices
async function getProductCostPrice(productId, sellerName) {
  try {
    if (!sellerName) return null;

    const SellerPriceModel = await db.getSellerPriceModel(sellerName);
    const priceRecord = await SellerPriceModel.findOne({
      where: { productId }
    });

    return priceRecord ? priceRecord.price : null;
  } catch (error) {
    console.error("Error getting product cost price:", error);
    return null;
  }
}

// Update sales analytics
async function updateSalesAnalytics() {
  try {
    const now = new Date();
    
    // Update daily analytics
    await updateDailySalesAnalytics(now);
    
    // Update weekly analytics (on Sundays)
    if (now.getDay() === 0) {
      await updateWeeklySalesAnalytics(now);
    }
    
    // Update monthly analytics (on last day of month)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (now.getDate() === lastDay.getDate()) {
      await updateMonthlySalesAnalytics(now);
    }
    
    // Update yearly analytics (on December 31st)
    if (now.getMonth() === 11 && now.getDate() === 31) {
      await updateYearlySalesAnalytics(now);
    }
    
  } catch (error) {
    console.error("Error updating sales analytics:", error);
  }
}

async function updateDailySalesAnalytics(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  await calculateAndStoreAnalytics(startOfDay, endOfDay, 'daily');
}

async function updateWeeklySalesAnalytics(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  await calculateAndStoreAnalytics(startOfWeek, endOfWeek, 'weekly');
}

async function updateMonthlySalesAnalytics(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  await calculateAndStoreAnalytics(startOfMonth, endOfMonth, 'monthly');
}

async function updateYearlySalesAnalytics(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);

  await calculateAndStoreAnalytics(startOfYear, endOfYear, 'yearly');
}

async function calculateAndStoreAnalytics(startDate, endDate, periodType) {
  try {
    // Get completed orders in the period
    const orders = await Order.findAll({
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        completedAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku', 'brandId', 'categoryId']
        }]
      }]
    });

    // Calculate analytics
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalOrders = orders.length;
    const totalProductsSold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalProfit = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + (parseFloat(item.profit) || 0), 0), 0);
    const totalTax = orders.reduce((sum, order) => sum + parseFloat(order.taxAmount), 0);
    const totalShipping = orders.reduce((sum, order) => sum + parseFloat(order.shippingAmount), 0);
    const totalDiscount = orders.reduce((sum, order) => sum + parseFloat(order.discountAmount), 0);

    // Calculate top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productSku]) {
          productSales[item.productSku] = {
            sku: item.productSku,
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productSku].quantity += item.quantity;
        productSales[item.productSku].revenue += parseFloat(item.totalPrice);
      });
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Calculate unique customers
    const customerIds = [...new Set(orders.map(order => order.userId))];
    const customerCount = customerIds.length;

    // Store in SalesAnalytics
    await db.SalesAnalytics.upsert({
      period: startDate,
      periodType,
      totalSales,
      totalOrders,
      totalProductsSold,
      averageOrderValue,
      totalProfit,
      totalTax,
      totalShipping,
      totalDiscount,
      topSellingProducts,
      customerCount
    });

  } catch (error) {
    console.error("Error calculating analytics:", error);
    throw error;
  }
}

async function getPeriodSalesAnalytics(period) {
  let startDate, endDate;
  const now = new Date();

  switch (period) {
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default: // daily
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
  }

  return await getCustomSalesAnalytics(startDate, endDate);
}

async function getCustomSalesAnalytics(startDate, endDate) {
  const orders = await Order.findAll({
    where: {
      status: 'delivered',
      paymentStatus: 'paid',
      completedAt: {
        [db.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product',
        include: [{
          model: db.Brand,
          as: 'brand'
        }, {
          model: db.Category,
          as: 'category'
        }]
      }]
    }]
  });

  // Calculate comprehensive analytics
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = orders.length;
  const totalProductsSold = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalProfit = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + (parseFloat(item.profit) || 0), 0), 0);
  const totalTax = orders.reduce((sum, order) => sum + parseFloat(order.taxAmount), 0);
  const totalShipping = orders.reduce((sum, order) => sum + parseFloat(order.shippingAmount), 0);
  const totalDiscount = orders.reduce((sum, order) => sum + parseFloat(order.discountAmount), 0);
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Product analytics
  const productAnalytics = {};
  const categoryAnalytics = {};
  const brandAnalytics = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      // Product analytics
      if (!productAnalytics[item.productSku]) {
        productAnalytics[item.productSku] = {
          sku: item.productSku,
          name: item.productName,
          quantity: 0,
          revenue: 0,
          profit: 0
        };
      }
      productAnalytics[item.productSku].quantity += item.quantity;
      productAnalytics[item.productSku].revenue += parseFloat(item.totalPrice);
      productAnalytics[item.productSku].profit += parseFloat(item.profit) || 0;

      // Category analytics
      const category = item.product?.category;
      if (category) {
        if (!categoryAnalytics[category.id]) {
          categoryAnalytics[category.id] = {
            id: category.id,
            name: category.title,
            quantity: 0,
            revenue: 0
          };
        }
        categoryAnalytics[category.id].quantity += item.quantity;
        categoryAnalytics[category.id].revenue += parseFloat(item.totalPrice);
      }

      // Brand analytics
      const brand = item.product?.brand;
      if (brand) {
        if (!brandAnalytics[brand.id]) {
          brandAnalytics[brand.id] = {
            id: brand.id,
            name: brand.title,
            quantity: 0,
            revenue: 0
          };
        }
        brandAnalytics[brand.id].quantity += item.quantity;
        brandAnalytics[brand.id].revenue += parseFloat(item.totalPrice);
      }
    });
  });

  const topProducts = Object.values(productAnalytics)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const salesByCategory = Object.values(categoryAnalytics)
    .sort((a, b) => b.revenue - a.revenue);

  const salesByBrand = Object.values(brandAnalytics)
    .sort((a, b) => b.revenue - a.revenue);

  // Customer analytics
  const customerIds = [...new Set(orders.map(order => order.userId))];
  const customerCount = customerIds.length;

  return {
    period: {
      start: startDate,
      end: endDate
    },
    summary: {
      totalSales,
      totalOrders,
      totalProductsSold,
      averageOrderValue,
      totalProfit,
      totalTax,
      totalShipping,
      totalDiscount,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      customerCount
    },
    products: {
      topSelling: topProducts,
      totalUniqueProducts: Object.keys(productAnalytics).length
    },
    categories: {
      salesByCategory,
      totalCategories: Object.keys(categoryAnalytics).length
    },
    brands: {
      salesByBrand,
      totalBrands: Object.keys(brandAnalytics).length
    }
  };
}

async function generateFinancialReport(reportType, year, month) {
  let startDate, endDate;
  const now = new Date();
  
  const reportYear = year || now.getFullYear();
  const reportMonth = month || now.getMonth() + 1;

  switch (reportType) {
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = new Date(now);
      break;
    case 'monthly':
      startDate = new Date(reportYear, reportMonth - 1, 1);
      endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(reportYear, 0, 1);
      endDate = new Date(reportYear, 11, 31, 23, 59, 59, 999);
      break;
    default: // daily
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
  }

  const analytics = await getCustomSalesAnalytics(startDate, endDate);

  // Calculate additional financial metrics
  const totalRevenue = analytics.summary.totalSales;
  const totalCost = totalRevenue - analytics.summary.totalProfit;
  const netProfit = analytics.summary.totalProfit; // In a real scenario, subtract expenses
  const profitMargin = analytics.summary.profitMargin;

  // Sales by period (for charts)
  const salesByPeriod = await getSalesByPeriod(startDate, endDate, reportType);

  const financialReport = {
    reportType,
    period: {
      start: startDate,
      end: endDate
    },
    revenue: {
      total: totalRevenue,
      byProduct: analytics.products.topSelling,
      byCategory: analytics.categories.salesByCategory,
      byBrand: analytics.brands.salesByBrand
    },
    costs: {
      total: totalCost,
      productCosts: totalCost,
      shipping: analytics.summary.totalShipping,
      tax: analytics.summary.totalTax
    },
    profit: {
      total: netProfit,
      margin: profitMargin,
      byProduct: analytics.products.topSelling.map(product => ({
        ...product,
        margin: product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
      }))
    },
    metrics: {
      orderCount: analytics.summary.totalOrders,
      productCount: analytics.summary.totalProductsSold,
      customerCount: analytics.summary.customerCount,
      averageOrderValue: analytics.summary.averageOrderValue
    },
    trends: {
      salesByPeriod
    }
  };

  // Store financial report
  await db.FinancialReport.create({
    reportType,
    startDate,
    endDate,
    totalRevenue,
    totalCost,
    totalProfit: netProfit,
    netProfit,
    taxCollected: analytics.summary.totalTax,
    shippingRevenue: analytics.summary.totalShipping,
    discountGiven: analytics.summary.totalDiscount,
    orderCount: analytics.summary.totalOrders,
    productCount: analytics.summary.totalProductsSold,
    customerCount: analytics.summary.customerCount,
    topPerformingProducts: analytics.products.topSelling,
    salesByPeriod,
    profitMargin,
    averageOrderValue: analytics.summary.averageOrderValue
  });

  return financialReport;
}

async function getSalesByPeriod(startDate, endDate, periodType) {
  const salesData = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let periodStart, periodEnd, periodLabel;
    
    switch (periodType) {
      case 'daily':
        periodStart = new Date(currentDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(currentDate);
        periodEnd.setHours(23, 59, 59, 999);
        periodLabel = currentDate.toISOString().split('T')[0];
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
        periodLabel = `Week ${getWeekNumber(currentDate)}`;
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        periodLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        return salesData;
    }

    if (periodEnd > endDate) {
      periodEnd = new Date(endDate);
    }

    const periodSales = await Order.sum('totalAmount', {
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        completedAt: {
          [db.Sequelize.Op.between]: [periodStart, periodEnd]
        }
      }
    });

    salesData.push({
      period: periodLabel,
      sales: periodSales || 0,
      start: periodStart,
      end: periodEnd
    });

    if (periodType === 'monthly' && currentDate.getMonth() === 0) {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }

  return salesData;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}