// const db = require("../config/db");
// const { Op } = require("sequelize");

// const Order = db.Order;
// const OrderItem = db.OrderItem;
// const Product = db.Product;
// const User = db.User;

// // ====================== SALES DASHBOARD ======================
// exports.getSalesDashboard = async (req, res) => {
//   try {
//     const { period = 'monthly' } = req.query;
    
//     // Current period stats
//     const currentStats = await getPeriodStats(period);
    
//     // Previous period stats for comparison
//     const previousStats = await getPreviousPeriodStats(period);
    
//     // Top performing products
//     const topProducts = await getTopProducts(period, 10);
    
//     // Sales trends
//     const salesTrend = await getSalesTrend(period);
    
//     // Customer metrics
//     const customerMetrics = await getCustomerMetrics(period);

//     res.status(200).json({
//       success: true,
//       data: {
//         currentPeriod: currentStats,
//         comparison: calculateGrowth(currentStats, previousStats),
//         topProducts,
//         salesTrend,
//         customerMetrics
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching sales dashboard:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== PRODUCT PERFORMANCE ======================
// exports.getProductPerformance = async (req, res) => {
//   try {
//     const { period = 'monthly', limit = 20, page = 1 } = req.query;
//     const offset = (page - 1) * limit;

//     const { count, rows: products } = await OrderItem.findAndCountAll({
//       attributes: [
//         'productId',
//         'productSku',
//         'productName',
//         [
//           db.sequelize.fn('SUM', db.sequelize.col('quantity')),
//           'totalQuantity'
//         ],
//         [
//           db.sequelize.fn('SUM', db.sequelize.col('totalPrice')),
//           'totalRevenue'
//         ],
//         [
//           db.sequelize.fn('SUM', db.sequelize.col('profit')),
//           'totalProfit'
//         ]
//       ],
//       include: [{
//         model: Order,
//         as: 'order',
//         where: getPeriodWhereClause(period),
//         attributes: []
//       }],
//       group: ['productId', 'productSku', 'productName'],
//       order: [[db.sequelize.literal('totalRevenue'), 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       subQuery: false
//     });

//     // Calculate additional metrics
//     const productPerformance = products.map(product => ({
//       productId: product.productId,
//       sku: product.productSku,
//       name: product.productName,
//       quantity: parseInt(product.get('totalQuantity')),
//       revenue: parseFloat(product.get('totalRevenue')),
//       profit: parseFloat(product.get('totalProfit')) || 0,
//       profitMargin: parseFloat(product.get('totalRevenue')) > 0 ? 
//         (parseFloat(product.get('totalProfit')) / parseFloat(product.get('totalRevenue'))) * 100 : 0
//     }));

//     res.status(200).json({
//       success: true,
//       data: productPerformance,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count.length,
//         pages: Math.ceil(count.length / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching product performance:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== CUSTOMER ANALYTICS ======================
// exports.getCustomerAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly' } = req.query;

//     // Customer acquisition
//     const customerAcquisition = await getCustomerAcquisition(period);
    
//     // Customer lifetime value
//     const customerLTV = await getCustomerLTV();
    
//     // Repeat customers
//     const repeatCustomers = await getRepeatCustomers(period);
    
//     // Top customers
//     const topCustomers = await getTopCustomers(period, 10);

//     res.status(200).json({
//       success: true,
//       data: {
//         acquisition: customerAcquisition,
//         lifetimeValue: customerLTV,
//         retention: repeatCustomers,
//         topCustomers
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching customer analytics:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== REAL-TIME SALES METRICS ======================
// exports.getRealTimeMetrics = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Today's sales
//     const todaySales = await Order.sum('totalAmount', {
//       where: {
//         status: 'delivered',
//         paymentStatus: 'paid',
//         completedAt: {
//           [Op.between]: [today, tomorrow]
//         }
//       }
//     });

//     // Today's orders
//     const todayOrders = await Order.count({
//       where: {
//         status: 'delivered',
//         paymentStatus: 'paid',
//         completedAt: {
//           [Op.between]: [today, tomorrow]
//         }
//       }
//     });

//     // Pending orders
//     const pendingOrders = await Order.count({
//       where: {
//         status: { [Op.in]: ['pending', 'confirmed', 'processing'] }
//       }
//     });

//     // Low stock products
//     const lowStockProducts = await Product.count({
//       where: {
//         quantity: { [Op.lte]: 10 }
//       }
//     });

//     // Recent orders
//     const recentOrders = await Order.findAll({
//       where: {
//         completedAt: {
//           [Op.between]: [today, tomorrow]
//         }
//       },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['name', 'email']
//       }],
//       order: [['completedAt', 'DESC']],
//       limit: 5
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         todaySales: todaySales || 0,
//         todayOrders,
//         pendingOrders,
//         lowStockProducts,
//         recentOrders
//       },
//       lastUpdated: new Date()
//     });

//   } catch (error) {
//     console.error("Error fetching real-time metrics:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== HELPER FUNCTIONS ======================

// async function getPeriodStats(period) {
//   const whereClause = getPeriodWhereClause(period);
  
//   const totalSales = await Order.sum('totalAmount', {
//     where: whereClause
//   });

//   const totalOrders = await Order.count({
//     where: whereClause
//   });

//   const totalProducts = await OrderItem.sum('quantity', {
//     include: [{
//       model: Order,
//       as: 'order',
//       where: whereClause
//     }]
//   });

//   const totalProfit = await OrderItem.sum('profit', {
//     include: [{
//       model: Order,
//       as: 'order',
//       where: whereClause
//     }]
//   });

//   const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

//   return {
//     totalSales: totalSales || 0,
//     totalOrders,
//     totalProducts: totalProducts || 0,
//     totalProfit: totalProfit || 0,
//     averageOrderValue,
//     profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0
//   };
// }

// async function getPreviousPeriodStats(period) {
//   let startDate, endDate;
//   const now = new Date();

//   switch (period) {
//     case 'weekly':
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 14);
//       endDate = new Date(now);
//       endDate.setDate(now.getDate() - 7);
//       break;
//     case 'monthly':
//       startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
//       break;
//     case 'yearly':
//       startDate = new Date(now.getFullYear() - 1, 0, 1);
//       endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
//       break;
//     default: // daily
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(now);
//       endDate.setDate(now.getDate() - 1);
//       endDate.setHours(23, 59, 59, 999);
//   }

//   const whereClause = {
//     status: 'delivered',
//     paymentStatus: 'paid',
//     completedAt: {
//       [Op.between]: [startDate, endDate]
//     }
//   };

//   return await getPeriodStats(whereClause);
// }

// function getPeriodWhereClause(period) {
//   let startDate, endDate;
//   const now = new Date();

//   switch (period) {
//     case 'weekly':
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 7);
//       break;
//     case 'monthly':
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//       break;
//     case 'yearly':
//       startDate = new Date(now.getFullYear(), 0, 1);
//       endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
//       break;
//     default: // daily
//       startDate = new Date(now);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(now);
//       endDate.setHours(23, 59, 59, 999);
//   }

//   return {
//     status: 'delivered',
//     paymentStatus: 'paid',
//     completedAt: {
//       [Op.between]: [startDate, endDate]
//     }
//   };
// }

// async function getTopProducts(period, limit = 10) {
//   const whereClause = getPeriodWhereClause(period);

//   return await OrderItem.findAll({
//     attributes: [
//       'productId',
//       'productSku',
//       'productName',
//       [
//         db.sequelize.fn('SUM', db.sequelize.col('quantity')),
//         'totalQuantity'
//       ],
//       [
//         db.sequelize.fn('SUM', db.sequelize.col('totalPrice')),
//         'totalRevenue'
//       ]
//     ],
//     include: [{
//       model: Order,
//       as: 'order',
//       where: whereClause,
//       attributes: []
//     }],
//     group: ['productId', 'productSku', 'productName'],
//     order: [[db.sequelize.literal('totalQuantity'), 'DESC']],
//     limit: limit
//   });
// }

// async function getSalesTrend(period) {
//   const trends = [];
//   let currentDate = new Date();
//   let dataPoints = 7; // Default to 7 data points

//   switch (period) {
//     case 'weekly':
//       dataPoints = 7;
//       break;
//     case 'monthly':
//       dataPoints = 30;
//       break;
//     case 'yearly':
//       dataPoints = 12;
//       break;
//   }

//   for (let i = dataPoints - 1; i >= 0; i--) {
//     let startDate, endDate, label;

//     switch (period) {
//       case 'weekly':
//         startDate = new Date(currentDate);
//         startDate.setDate(currentDate.getDate() - i);
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate);
//         endDate.setHours(23, 59, 59, 999);
//         label = startDate.toLocaleDateString();
//         break;
//       case 'monthly':
//         startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i);
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate);
//         endDate.setHours(23, 59, 59, 999);
//         label = startDate.toLocaleDateString();
//         break;
//       case 'yearly':
//         startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
//         endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
//         label = startDate.toLocaleString('default', { month: 'short' });
//         break;
//     }

//     const sales = await Order.sum('totalAmount', {
//       where: {
//         status: 'delivered',
//         paymentStatus: 'paid',
//         completedAt: {
//           [Op.between]: [startDate, endDate]
//         }
//       }
//     });

//     trends.push({
//       period: label,
//       sales: sales || 0
//     });
//   }

//   return trends;
// }

// async function getCustomerAcquisition(period) {
//   const whereClause = getPeriodWhereClause(period);

//   const newCustomers = await User.count({
//     where: {
//       createdAt: whereClause.completedAt
//     }
//   });

//   const returningCustomers = await Order.count({
//     distinct: true,
//     col: 'userId',
//     where: whereClause
//   });

//   return {
//     newCustomers,
//     returningCustomers,
//     totalCustomers: newCustomers + returningCustomers
//   };
// }

// async function getCustomerLTV() {
//   // Simplified LTV calculation
//   const customerStats = await Order.findAll({
//     attributes: [
//       'userId',
//       [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
//       [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalSpent']
//     ],
//     where: {
//       status: 'delivered',
//       paymentStatus: 'paid'
//     },
//     group: ['userId'],
//     having: db.sequelize.literal('COUNT(id) > 0')
//   });

//   const totalLTV = customerStats.reduce((sum, stat) => sum + parseFloat(stat.get('totalSpent')), 0);
//   const averageLTV = customerStats.length > 0 ? totalLTV / customerStats.length : 0;

//   return {
//     averageLTV,
//     totalCustomers: customerStats.length,
//     highValueCustomers: customerStats.filter(stat => parseFloat(stat.get('totalSpent')) > 1000).length
//   };
// }

// async function getRepeatCustomers(period) {
//   const whereClause = getPeriodWhereClause(period);

//   const customerOrders = await Order.findAll({
//     attributes: [
//       'userId',
//       [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount']
//     ],
//     where: whereClause,
//     group: ['userId'],
//     having: db.sequelize.literal('COUNT(id) > 1')
//   });

//   return {
//     repeatCustomers: customerOrders.length,
//     averageOrdersPerCustomer: await getAverageOrdersPerCustomer(whereClause)
//   };
// }

// async function getAverageOrdersPerCustomer(whereClause) {
//   const customerOrders = await Order.findAll({
//     attributes: [
//       'userId',
//       [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount']
//     ],
//     where: whereClause,
//     group: ['userId']
//   });

//   const totalOrders = customerOrders.reduce((sum, customer) => sum + parseInt(customer.get('orderCount')), 0);
//   return customerOrders.length > 0 ? totalOrders / customerOrders.length : 0;
// }

// async function getTopCustomers(period, limit = 10) {
//   const whereClause = getPeriodWhereClause(period);

//   return await Order.findAll({
//     attributes: [
//       'userId',
//       [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
//       [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalSpent']
//     ],
//     include: [{
//       model: User,
//       as: 'user',
//       attributes: ['name', 'email']
//     }],
//     where: whereClause,
//     group: ['userId', 'user.id'],
//     order: [[db.sequelize.literal('totalSpent'), 'DESC']],
//     limit: limit
//   });
// }

// function calculateGrowth(current, previous) {
//   const growth = {};
  
//   for (const key in current) {
//     if (previous[key] && previous[key] !== 0) {
//       growth[key] = ((current[key] - previous[key]) / previous[key]) * 100;
//     } else {
//       growth[key] = current[key] > 0 ? 100 : 0;
//     }
//   }
  
//   return growth;
// }

const db = require("../config/db");
const { Op } = require("sequelize");

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const User = db.User;

// ====================== SALES DASHBOARD ======================
exports.getSalesDashboard = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Current period stats
    const currentStats = await getPeriodStats(period);
    
    // Previous period stats for comparison
    const previousStats = await getPreviousPeriodStats(period);
    
    // Top performing products
    const topProducts = await getTopProducts(period, 10);
    
    // Sales trends
    const salesTrend = await getSalesTrend(period);
    
    // Customer metrics
    const customerMetrics = await getCustomerMetrics(period);

    res.status(200).json({
      success: true,
      data: {
        currentPeriod: currentStats,
        comparison: calculateGrowth(currentStats, previousStats),
        topProducts,
        salesTrend,
        customerMetrics
      }
    });

  } catch (error) {
    console.error("Error fetching sales dashboard:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== PRODUCT PERFORMANCE ======================
exports.getProductPerformance = async (req, res) => {
  try {
    const { period = 'monthly', limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await OrderItem.findAndCountAll({
      attributes: [
        'productId',
        'productSku',
        'productName',
        [
          db.sequelize.fn('SUM', db.sequelize.col('quantity')),
          'totalQuantity'
        ],
        [
          db.sequelize.fn('SUM', db.sequelize.col('totalPrice')),
          'totalRevenue'
        ],
        [
          db.sequelize.fn('SUM', db.sequelize.col('profit')),
          'totalProfit'
        ]
      ],
      include: [{
        model: Order,
        as: 'order',
        where: getPeriodWhereClause(period),
        attributes: []
      }],
      group: ['productId', 'productSku', 'productName'],
      order: [[db.sequelize.literal('totalRevenue'), 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false
    });

    // Calculate additional metrics
    const productPerformance = products.map(product => ({
      productId: product.productId,
      sku: product.productSku,
      name: product.productName,
      quantity: parseInt(product.get('totalQuantity')),
      revenue: parseFloat(product.get('totalRevenue')),
      profit: parseFloat(product.get('totalProfit')) || 0,
      profitMargin: parseFloat(product.get('totalRevenue')) > 0 ? 
        (parseFloat(product.get('totalProfit')) / parseFloat(product.get('totalRevenue'))) * 100 : 0
    }));

    res.status(200).json({
      success: true,
      data: productPerformance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count.length,
        pages: Math.ceil(count.length / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching product performance:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== CUSTOMER ANALYTICS ======================
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Customer acquisition
    const customerAcquisition = await getCustomerAcquisition(period);
    
    // Customer lifetime value
    const customerLTV = await getCustomerLTV();
    
    // Repeat customers
    const repeatCustomers = await getRepeatCustomers(period);
    
    // Top customers
    const topCustomers = await getTopCustomers(period, 10);

    res.status(200).json({
      success: true,
      data: {
        acquisition: customerAcquisition,
        lifetimeValue: customerLTV,
        retention: repeatCustomers,
        topCustomers
      }
    });

  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== REAL-TIME SALES METRICS ======================
exports.getRealTimeMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySales = await Order.sum('totalAmount', {
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        completedAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    // Today's orders
    const todayOrders = await Order.count({
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        completedAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    // Pending orders
    const pendingOrders = await Order.count({
      where: {
        status: { [Op.in]: ['pending', 'confirmed', 'processing'] }
      }
    });

    // Low stock products
    const lowStockProducts = await Product.count({
      where: {
        quantity: { [Op.lte]: 10 }
      }
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      where: {
        completedAt: {
          [Op.between]: [today, tomorrow]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['completedAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      data: {
        todaySales: todaySales || 0,
        todayOrders,
        pendingOrders,
        lowStockProducts,
        recentOrders
      },
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error("Error fetching real-time metrics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== HELPER FUNCTIONS ======================

async function getPeriodStats(period) {
  const whereClause = getPeriodWhereClause(period);
  
  const totalSales = await Order.sum('totalAmount', {
    where: whereClause
  });

  const totalOrders = await Order.count({
    where: whereClause
  });

  const totalProducts = await OrderItem.sum('quantity', {
    include: [{
      model: Order,
      as: 'order',
      where: whereClause
    }]
  });

  const totalProfit = await OrderItem.sum('profit', {
    include: [{
      model: Order,
      as: 'order',
      where: whereClause
    }]
  });

  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return {
    totalSales: totalSales || 0,
    totalOrders,
    totalProducts: totalProducts || 0,
    totalProfit: totalProfit || 0,
    averageOrderValue,
    profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0
  };
}

async function getPreviousPeriodStats(period) {
  let startDate, endDate;
  const now = new Date();

  switch (period) {
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 14);
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    default: // daily
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
  }

  const whereClause = {
    status: 'delivered',
    paymentStatus: 'paid',
    completedAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  return await getPeriodStats(whereClause);
}

function getPeriodWhereClause(period) {
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

  return {
    status: 'delivered',
    paymentStatus: 'paid',
    completedAt: {
      [Op.between]: [startDate, endDate]
    }
  };
}

async function getTopProducts(period, limit = 10) {
  const whereClause = getPeriodWhereClause(period);

  return await OrderItem.findAll({
    attributes: [
      'productId',
      'productSku',
      'productName',
      [
        db.sequelize.fn('SUM', db.sequelize.col('quantity')),
        'totalQuantity'
      ],
      [
        db.sequelize.fn('SUM', db.sequelize.col('totalPrice')),
        'totalRevenue'
      ]
    ],
    include: [{
      model: Order,
      as: 'order',
      where: whereClause,
      attributes: []
    }],
    group: ['productId', 'productSku', 'productName'],
    order: [[db.sequelize.literal('totalQuantity'), 'DESC']],
    limit: limit
  });
}

async function getSalesTrend(period) {
  const trends = [];
  let currentDate = new Date();
  let dataPoints = 7; // Default to 7 data points

  switch (period) {
    case 'weekly':
      dataPoints = 7;
      break;
    case 'monthly':
      dataPoints = 30;
      break;
    case 'yearly':
      dataPoints = 12;
      break;
  }

  for (let i = dataPoints - 1; i >= 0; i--) {
    let startDate, endDate, label;

    switch (period) {
      case 'weekly':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        label = startDate.toLocaleDateString();
        break;
      case 'monthly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        label = startDate.toLocaleDateString();
        break;
      case 'yearly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
        label = startDate.toLocaleString('default', { month: 'short' });
        break;
    }

    const sales = await Order.sum('totalAmount', {
      where: {
        status: 'delivered',
        paymentStatus: 'paid',
        completedAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    trends.push({
      period: label,
      sales: sales || 0
    });
  }

  return trends;
}

async function getCustomerAcquisition(period) {
  const whereClause = getPeriodWhereClause(period);

  const newCustomers = await User.count({
    where: {
      createdAt: whereClause.completedAt
    }
  });

  const returningCustomers = await Order.count({
    distinct: true,
    col: 'userId',
    where: whereClause
  });

  return {
    newCustomers,
    returningCustomers,
    totalCustomers: newCustomers + returningCustomers
  };
}

async function getCustomerLTV() {
  // Simplified LTV calculation
  const customerStats = await Order.findAll({
    attributes: [
      'userId',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
      [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalSpent']
    ],
    where: {
      status: 'delivered',
      paymentStatus: 'paid'
    },
    group: ['userId'],
    having: db.sequelize.literal('COUNT(id) > 0')
  });

  const totalLTV = customerStats.reduce((sum, stat) => sum + parseFloat(stat.get('totalSpent')), 0);
  const averageLTV = customerStats.length > 0 ? totalLTV / customerStats.length : 0;

  return {
    averageLTV,
    totalCustomers: customerStats.length,
    highValueCustomers: customerStats.filter(stat => parseFloat(stat.get('totalSpent')) > 1000).length
  };
}

async function getRepeatCustomers(period) {
  const whereClause = getPeriodWhereClause(period);

  const customerOrders = await Order.findAll({
    attributes: [
      'userId',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount']
    ],
    where: whereClause,
    group: ['userId'],
    having: db.sequelize.literal('COUNT(id) > 1')
  });

  return {
    repeatCustomers: customerOrders.length,
    averageOrdersPerCustomer: await getAverageOrdersPerCustomer(whereClause)
  };
}

async function getAverageOrdersPerCustomer(whereClause) {
  const customerOrders = await Order.findAll({
    attributes: [
      'userId',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount']
    ],
    where: whereClause,
    group: ['userId']
  });

  const totalOrders = customerOrders.reduce((sum, customer) => sum + parseInt(customer.get('orderCount')), 0);
  return customerOrders.length > 0 ? totalOrders / customerOrders.length : 0;
}

async function getTopCustomers(period, limit = 10) {
  const whereClause = getPeriodWhereClause(period);

  return await Order.findAll({
    attributes: [
      'userId',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
      [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalSpent']
    ],
    include: [{
      model: User,
      as: 'user',
      attributes: ['name', 'email']
    }],
    where: whereClause,
    group: ['userId', 'user.id'],
    order: [[db.sequelize.literal('totalSpent'), 'DESC']],
    limit: limit
  });
}

function calculateGrowth(current, previous) {
  const growth = {};
  
  for (const key in current) {
    if (previous[key] && previous[key] !== 0) {
      growth[key] = ((current[key] - previous[key]) / previous[key]) * 100;
    } else {
      growth[key] = current[key] > 0 ? 100 : 0;
    }
  }
  
  return growth;
}