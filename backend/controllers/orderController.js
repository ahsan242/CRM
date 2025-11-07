// // controllers/orderController.js
// const db = require("../config/db");
// const Order = db.Order;
// const OrderItem = db.OrderItem;
// const OrderHistory = db.OrderHistory;
// const Product = db.Product;
// const Cart = db.Cart;

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
//       notes
//     } = req.body;

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
//     let totalAmount = 0;
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
//       totalAmount += itemTotal;

//       orderItems.push({
//         productId: cartItem.productId,
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

//     // Create order
//     const order = await Order.create({
//       userId,
//       totalAmount,
//       shippingAddress,
//       billingAddress: billingAddress || shippingAddress,
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
//       totalAmount: 0
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

// exports.getOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

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
//           model: db.User,
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

// exports.cancelOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { id } = req.params;
//     const { reason } = req.body;

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



const db = require("../config/db");
const stripeService = require("../services/stripeService");

const Order = db.Order;
const OrderItem = db.OrderItem;
const OrderHistory = db.OrderHistory;
const Product = db.Product;
const Cart = db.Cart;
const User = db.User;
const UserProfile = db.UserProfile;

// ====================== CREATE PAYMENT INTENT ======================
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Check if Stripe is configured
    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: "Payment system is currently unavailable. Please try again later."
      });
    }

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

    // Check if Stripe is configured
    if (!stripeService.isConfigured()) {
      await transaction.rollback();
      return res.status(503).json({
        success: false,
        error: "Payment system is currently unavailable."
      });
    }

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
        status: 'confirmed'
      }, { transaction });

      // Add to order history
      await OrderHistory.create({
        orderId: order.id,
        status: 'confirmed',
        notes: 'Payment confirmed successfully'
      }, { transaction });

      await transaction.commit();

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

// ... rest of the orderController code remains the same ...


// const db = require("../config/db");
// const stripeService = require("../services/stripeService");

// const Order = db.Order;
// const OrderItem = db.OrderItem;
// const OrderHistory = db.OrderHistory;
// const Product = db.Product;
// const Cart = db.Cart;
// const User = db.User;
// const UserProfile = db.UserProfile;

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
      useProfileAddress = false
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

      orderItems.push({
        productId: cartItem.productId,
        productName: product.title,
        productSku: product.sku,
        productImage: product.mainImage,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: itemTotal,
        sellerName: cartItem.sellerName
      });

      productQuantities.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity
      });
    }

    // Calculate totals
    const taxRate = 0.1; // 10% tax
    const shippingCost = 10.00; // Fixed shipping cost
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
      shippingAmount: shippingCost,
      totalAmount,
      shippingAddress: finalShippingAddress,
      billingAddress: finalBillingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
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
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: completeOrder
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
        status: 'confirmed'
      }, { transaction });

      // Add to order history
      await OrderHistory.create({
        orderId: order.id,
        status: 'confirmed',
        notes: 'Payment confirmed successfully'
      }, { transaction });

      await transaction.commit();

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
    const { userId, page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (userId) whereClause.userId = userId;
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
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
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
            attributes: ['id', 'title', 'sku', 'mainImage']
          }]
        },
        {
          model: OrderHistory,
          as: 'history',
          order: [['createdAt', 'DESC']]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
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

    await transaction.commit();

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
      ...(paymentStatus === 'paid' && { status: 'confirmed' })
    }, { transaction });

    // Add to order history
    await OrderHistory.create({
      orderId: id,
      status: paymentStatus === 'paid' ? 'confirmed' : order.status,
      notes: `Payment status updated to ${paymentStatus}`
    }, { transaction });

    await transaction.commit();

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