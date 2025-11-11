const db = require("../config/db");
const emailService = require("../services/emailService");

const ProductInquiry = db.ProductInquiry;
const Product = db.Product;

// ====================== CREATE PRODUCT INQUIRY ======================
exports.createInquiry = async (req, res) => {
  try {
    const {
      firstName,
      email,
      country,
      inquiryType,
      message,
      productId,
      productSku,
      productName
    } = req.body;

    // Validate required fields
    if (!firstName || !email || !country || !inquiryType) {
      return res.status(400).json({
        success: false,
        error: "First name, email, country, and inquiry type are required"
      });
    }

    // Validate inquiry type
    const validInquiryTypes = ['pricing', 'shipping', 'specs', 'availability', 'other'];
    if (!validInquiryTypes.includes(inquiryType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid inquiry type"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }

    // If productId is provided, verify product exists
    let product = null;
    if (productId) {
      product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found"
        });
      }
    }

    // Create inquiry
    const inquiry = await ProductInquiry.create({
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      country: country.trim(),
      inquiryType,
      message: message ? message.trim() : null,
      productId: productId || null,
      productSku: productSku || (product ? product.sku : null),
      productName: productName || (product ? product.title : null),
      status: 'new'
    });

    // Prepare data for emails
    const inquiryData = {
      firstName: inquiry.firstName,
      email: inquiry.email,
      country: inquiry.country,
      inquiryType: inquiry.inquiryType,
      message: inquiry.message,
      productId: inquiry.productId,
      productSku: inquiry.productSku,
      productName: inquiry.productName
    };

    // Send notification email to admin
    const adminEmailResult = await emailService.sendProductInquiryEmail(inquiryData);
    
    if (!adminEmailResult.success) {
      console.error('Failed to send admin notification:', adminEmailResult.error);
      // Continue anyway, don't fail the request
    }

    // Send confirmation email to customer
    const customerEmailResult = await emailService.sendInquiryConfirmationEmail(inquiryData);
    
    if (!customerEmailResult.success) {
      console.error('Failed to send customer confirmation:', customerEmailResult.error);
      // Continue anyway, don't fail the request
    }

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully. We'll contact you soon.",
      data: {
        inquiry: inquiry,
        emails: {
          adminNotification: adminEmailResult.success ? 'sent' : 'failed',
          customerConfirmation: customerEmailResult.success ? 'sent' : 'failed'
        }
      }
    });

  } catch (error) {
    console.error("Error creating product inquiry:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to submit inquiry"
    });
  }
};

// ====================== GET ALL INQUIRIES (ADMIN) ======================
exports.getAllInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      inquiryType,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by status
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by inquiry type
    if (inquiryType && inquiryType !== 'all') {
      whereClause.inquiryType = inquiryType;
    }

    // Filter by date range
    if (startDate && endDate) {
      whereClause.createdAt = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [db.Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [db.Sequelize.Op.lte]: new Date(endDate)
      };
    }

    // Search filter
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { firstName: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { productName: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { productSku: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: inquiries } = await ProductInquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku', 'mainImage', 'brandId']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      filters: {
        status: status || 'all',
        inquiryType: inquiryType || 'all',
        dateRange: {
          start: startDate || 'any',
          end: endDate || 'any'
        },
        search: search || 'none'
      }
    });

  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch inquiries"
    });
  }
};

// ====================== GET INQUIRY BY ID ======================
exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await ProductInquiry.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku', 'mainImage', 'brandId', 'price']
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch inquiry"
    });
  }
};

// ====================== UPDATE INQUIRY STATUS (ADMIN) ======================
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });
    }

    const inquiry = await ProductInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Inquiry not found"
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    await inquiry.update(updateData);

    const updatedInquiry = await ProductInquiry.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku', 'mainImage']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: updatedInquiry
    });

  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update inquiry"
    });
  }
};

// ====================== GET INQUIRY STATISTICS (ADMIN) ======================
exports.getInquiryStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total counts by status
    const statusCounts = await ProductInquiry.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: startDate
        }
      },
      group: ['status'],
      raw: true
    });

    // Counts by inquiry type
    const typeCounts = await ProductInquiry.findAll({
      attributes: [
        'inquiryType',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: startDate
        }
      },
      group: ['inquiryType'],
      raw: true
    });

    // Recent inquiries count
    const recentInquiries = await ProductInquiry.count({
      where: {
        status: 'new',
        createdAt: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    // Total inquiries in period
    const totalInquiries = await ProductInquiry.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    const stats = {
      summary: {
        total: totalInquiries,
        new: recentInquiries,
        period: `${days} days`
      },
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byType: typeCounts.reduce((acc, item) => {
        acc[item.inquiryType] = parseInt(item.count);
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch inquiry statistics"
    });
  }
};

// ====================== GET INQUIRIES BY PRODUCT ======================
exports.getInquiriesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    const { count, rows: inquiries } = await ProductInquiry.findAndCountAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product.id,
          title: product.title,
          sku: product.sku
        },
        inquiries: inquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching product inquiries:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch product inquiries"
    });
  }
};