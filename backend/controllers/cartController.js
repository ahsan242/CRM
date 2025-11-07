// // backend/controllers/cartController.js
// const db = require("../config/db");
// const Cart = db.Cart;
// const Product = db.Product;

// exports.getCart = async (req, res) => {
//   try {
//     const { userId, sessionId } = req.query;
    
//     let whereClause = {};
//     if (userId) {
//       whereClause.userId = userId;
//     } else if (sessionId) {
//       whereClause.sessionId = sessionId;
//     } else {
//       return res.status(400).json({
//         success: false,
//         error: "Either userId or sessionId is required"
//       });
//     }

//     const cart = await Cart.findOne({ 
//       where: whereClause,
//       include: [
//         {
//           model: db.User,
//           as: 'user',
//           attributes: ['id', 'name', 'email']
//         }
//       ]
//     });

//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           items: [],
//           totalAmount: 0,
//           itemCount: 0
//         }
//       });
//     }

//     // Calculate fresh totals
//     let totalAmount = 0;
//     let itemCount = 0;

//     if (cart.items && Array.isArray(cart.items)) {
//       for (const item of cart.items) {
//         const product = await Product.findByPk(item.productId);
//         if (product) {
//           item.currentPrice = product.price;
//           item.productDetails = {
//             title: product.title,
//             mainImage: product.mainImage,
//             sku: product.sku
//           };
//           totalAmount += item.quantity * item.unitPrice;
//           itemCount += item.quantity;
//         }
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         ...cart.toJSON(),
//         totalAmount,
//         itemCount
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching cart:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// exports.addToCart = async (req, res) => {
//   try {
//     const { userId, sessionId, productId, quantity = 1, sellerName } = req.body;

//     if (!productId) {
//       return res.status(400).json({
//         success: false,
//         error: "Product ID is required"
//       });
//     }

//     // Validate product exists and has sufficient stock
//     const product = await Product.findByPk(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: "Product not found"
//       });
//     }

//     if (product.quantity < quantity) {
//       return res.status(400).json({
//         success: false,
//         error: `Insufficient stock. Available: ${product.quantity}`
//       });
//     }

//     let cart;
//     if (userId) {
//       cart = await Cart.findOne({ where: { userId } });
//     } else if (sessionId) {
//       cart = await Cart.findOne({ where: { sessionId } });
//     }

//     // Create new cart if doesn't exist
//     if (!cart) {
//       const cartData = {
//         items: [],
//         totalAmount: 0
//       };
      
//       if (userId) cartData.userId = userId;
//       if (sessionId) cartData.sessionId = sessionId;
      
//       cart = await Cart.create(cartData);
//     }

//     // Check if product already in cart
//     const existingItemIndex = cart.items.findIndex(
//       item => item.productId === productId && item.sellerName === sellerName
//     );

//     let updatedItems;
//     if (existingItemIndex > -1) {
//       // Update existing item
//       updatedItems = [...cart.items];
//       updatedItems[existingItemIndex].quantity += quantity;
//       updatedItems[existingItemIndex].unitPrice = product.price;
//       updatedItems[existingItemIndex].totalPrice = 
//         updatedItems[existingItemIndex].quantity * product.price;
//     } else {
//       // Add new item
//       const newItem = {
//         productId,
//         quantity,
//         unitPrice: product.price,
//         totalPrice: quantity * product.price,
//         sellerName: sellerName || null,
//         addedAt: new Date()
//       };
      
//       updatedItems = cart.items ? [...cart.items, newItem] : [newItem];
//     }

//     // Calculate total amount
//     const totalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);

//     // Update cart
//     await cart.update({
//       items: updatedItems,
//       totalAmount
//     });

//     const updatedCart = await Cart.findByPk(cart.id, {
//       include: [
//         {
//           model: db.User,
//           as: 'user',
//           attributes: ['id', 'name', 'email']
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       message: "Product added to cart successfully",
//       data: updatedCart
//     });

//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// exports.updateCartItem = async (req, res) => {
//   try {
//     const { cartId } = req.params;
//     const { productId, quantity, sellerName } = req.body;

//     const cart = await Cart.findByPk(cartId);
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: "Cart not found"
//       });
//     }

//     // Find the item in cart
//     const itemIndex = cart.items.findIndex(
//       item => item.productId === productId && item.sellerName === sellerName
//     );

//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         error: "Item not found in cart"
//       });
//     }

//     // Validate product stock if quantity is being increased
//     if (quantity > cart.items[itemIndex].quantity) {
//       const product = await Product.findByPk(productId);
//       const quantityIncrease = quantity - cart.items[itemIndex].quantity;
      
//       if (product.quantity < quantityIncrease) {
//         return res.status(400).json({
//           success: false,
//           error: `Insufficient stock. Available: ${product.quantity}`
//         });
//       }
//     }

//     // Update item quantity
//     const updatedItems = [...cart.items];
//     updatedItems[itemIndex].quantity = quantity;
//     updatedItems[itemIndex].totalPrice = quantity * updatedItems[itemIndex].unitPrice;

//     // Calculate total amount
//     const totalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);

//     await cart.update({
//       items: updatedItems,
//       totalAmount
//     });

//     res.status(200).json({
//       success: true,
//       message: "Cart item updated successfully",
//       data: cart
//     });

//   } catch (error) {
//     console.error("Error updating cart item:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// exports.removeFromCart = async (req, res) => {
//   try {
//     const { cartId } = req.params;
//     const { productId, sellerName } = req.body;

//     const cart = await Cart.findByPk(cartId);
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: "Cart not found"
//       });
//     }

//     // Filter out the item to remove
//     const updatedItems = cart.items.filter(
//       item => !(item.productId === productId && item.sellerName === sellerName)
//     );

//     // Calculate total amount
//     const totalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);

//     await cart.update({
//       items: updatedItems,
//       totalAmount
//     });

//     res.status(200).json({
//       success: true,
//       message: "Item removed from cart successfully",
//       data: cart
//     });

//   } catch (error) {
//     console.error("Error removing from cart:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// exports.clearCart = async (req, res) => {
//   try {
//     const { cartId } = req.params;

//     const cart = await Cart.findByPk(cartId);
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: "Cart not found"
//       });
//     }

//     await cart.update({
//       items: [],
//       totalAmount: 0
//     });

//     res.status(200).json({
//       success: true,
//       message: "Cart cleared successfully",
//       data: cart
//     });

//   } catch (error) {
//     console.error("Error clearing cart:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

const db = require("../config/db");
const Cart = db.Cart;
const Product = db.Product;

// ====================== GET CART ======================
exports.getCart = async (req, res) => {
  try {
    const { userId, sessionId } = req.query;
    
    let whereClause = {};
    if (userId) {
      whereClause.userId = userId;
    } else if (sessionId) {
      whereClause.sessionId = sessionId;
    } else {
      return res.status(400).json({
        success: false,
        error: "Either userId or sessionId is required"
      });
    }

    const cart = await Cart.findOne({ 
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          itemCount: 0
        }
      });
    }

    // Calculate fresh totals and enrich with product data
    let totalAmount = 0;
    let itemCount = 0;
    const enrichedItems = [];

    if (cart.items && Array.isArray(cart.items)) {
      for (const item of cart.items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          const enrichedItem = {
            ...item,
            currentPrice: product.price,
            productDetails: {
              title: product.title,
              mainImage: product.mainImage,
              sku: product.sku,
              brandId: product.brandId,
              categoryId: product.categoryId,
              stockQuantity: product.quantity
            }
          };
          
          enrichedItems.push(enrichedItem);
          totalAmount += item.quantity * item.unitPrice;
          itemCount += item.quantity;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart.toJSON(),
        items: enrichedItems,
        totalAmount,
        itemCount
      }
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== ADD TO CART ======================
exports.addToCart = async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity = 1, sellerName } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required"
      });
    }

    // Validate product exists and has sufficient stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.quantity}`
      });
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ where: { userId } });
    } else if (sessionId) {
      cart = await Cart.findOne({ where: { sessionId } });
    }

    // Create new cart if doesn't exist
    if (!cart) {
      const cartData = {
        items: [],
        totalAmount: 0,
        itemCount: 0
      };
      
      if (userId) cartData.userId = userId;
      if (sessionId) cartData.sessionId = sessionId;
      
      cart = await Cart.create(cartData);
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.sellerName === sellerName
    );

    let updatedItems;
    if (existingItemIndex > -1) {
      // Update existing item
      updatedItems = [...cart.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      // Check stock again for updated quantity
      if (product.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${product.quantity}, Requested: ${newQuantity}`
        });
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].unitPrice = product.price;
      updatedItems[existingItemIndex].totalPrice = newQuantity * product.price;
    } else {
      // Add new item
      const newItem = {
        productId,
        quantity,
        unitPrice: product.price,
        totalPrice: quantity * product.price,
        sellerName: sellerName || null,
        productName: product.title,
        productImage: product.mainImage,
        productSku: product.sku,
        addedAt: new Date()
      };
      
      updatedItems = cart.items ? [...cart.items, newItem] : [newItem];
    }

    // Update cart with new items (triggers beforeSave hook to calculate totals)
    await cart.update({
      items: updatedItems
    });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: updatedCart
    });

  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== UPDATE CART ITEM ======================
exports.updateCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity, sellerName } = req.body;

    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.sellerName === sellerName
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
    }

    // Validate product stock if quantity is being increased
    if (quantity > cart.items[itemIndex].quantity) {
      const product = await Product.findByPk(productId);
      const quantityIncrease = quantity - cart.items[itemIndex].quantity;
      
      if (product.quantity < quantityIncrease) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${product.quantity}`
        });
      }
    }

    // Update item quantity
    const updatedItems = [...cart.items];
    updatedItems[itemIndex].quantity = quantity;
    updatedItems[itemIndex].totalPrice = quantity * updatedItems[itemIndex].unitPrice;

    // Update cart (triggers beforeSave hook to calculate totals)
    await cart.update({
      items: updatedItems
    });

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart
    });

  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== REMOVE FROM CART ======================
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, sellerName } = req.body;

    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    // Filter out the item to remove
    const updatedItems = cart.items.filter(
      item => !(item.productId === productId && item.sellerName === sellerName)
    );

    // Update cart (triggers beforeSave hook to calculate totals)
    await cart.update({
      items: updatedItems
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart
    });

  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== CLEAR CART ======================
exports.clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }

    await cart.update({
      items: [],
      totalAmount: 0,
      itemCount: 0
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });

  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== MERGE CARTS ======================
exports.mergeCarts = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Session ID and User ID are required"
      });
    }

    // Find session cart and user cart
    const sessionCart = await Cart.findOne({ where: { sessionId } });
    const userCart = await Cart.findOne({ where: { userId } });

    if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No session cart to merge",
        data: userCart
      });
    }

    let mergedItems = userCart ? [...userCart.items] : [];

    // Merge items from session cart
    for (const sessionItem of sessionCart.items) {
      const existingItemIndex = mergedItems.findIndex(
        item => item.productId === sessionItem.productId && item.sellerName === sessionItem.sellerName
      );

      if (existingItemIndex > -1) {
        // Update quantity for existing item
        mergedItems[existingItemIndex].quantity += sessionItem.quantity;
        mergedItems[existingItemIndex].totalPrice = 
          mergedItems[existingItemIndex].quantity * mergedItems[existingItemIndex].unitPrice;
      } else {
        // Add new item
        mergedItems.push(sessionItem);
      }
    }

    // Update or create user cart
    let finalCart;
    if (userCart) {
      await userCart.update({ items: mergedItems });
      finalCart = userCart;
    } else {
      finalCart = await Cart.create({
        userId,
        items: mergedItems
      });
    }

    // Delete session cart
    await sessionCart.destroy();

    res.status(200).json({
      success: true,
      message: "Carts merged successfully",
      data: finalCart
    });

  } catch (error) {
    console.error("Error merging carts:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};