// controllers/orderController.js
const db = require("../config/db");
const Order = db.Order;
const OrderItem = db.OrderItem;
const OrderHistory = db.OrderHistory;
const Product = db.Product;
const Cart = db.Cart;

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
      notes
    } = req.body;

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
    let totalAmount = 0;
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
      totalAmount += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
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

    // Create order
    const order = await Order.create({
      userId,
      totalAmount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
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
      totalAmount: 0
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

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

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
          model: db.User,
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

exports.cancelOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;

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