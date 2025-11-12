const xml2js = require('xml2js');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const User = db.User;
const PunchoutToken = db.PunchoutToken;

// XML Parser configuration
const parser = new xml2js.Parser({ 
  explicitArray: false,
  mergeAttrs: true,
  explicitRoot: false 
});

const builder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
  renderOpts: { pretty: true }
});

// ====================== PUNCHOUT SETUP REQUEST ======================
const handleSetupRequest = async (req, res) => {
  try {
    console.log('📦 Received PunchOut Setup Request');
    
    // Parse XML Request
    const xmlContent = req.body;
    
    if (!xmlContent) {
      return res.status(400).send('Empty XML body');
    }

    const xml = await parser.parseStringPromise(xmlContent);
    console.log('📋 Parsed XML:', JSON.stringify(xml, null, 2));

    // Extract sender info
    const header = xml.Header;
    if (!header || !header.Sender) {
      return res.status(400).send('Invalid XML: Missing Header or Sender');
    }

    const senderIdentity = header.Sender.Credential.Identity;
    const sharedSecret = header.Sender.Credential.SharedSecret;

    console.log(`🔐 Sender: ${senderIdentity}, Secret: ${sharedSecret}`);

    // Validate shared secret (uncomment to enable in production)
    // if (senderIdentity !== 'sourcewell@vcloudtech.com' || sharedSecret !== 'ddfvsdfsgdgdg') {
    //   console.log('❌ Invalid credentials');
    //   return res.status(403).send('Unauthorized');
    // }

    // Extract email from extrinsics or fallback to senderIdentity
    let email = senderIdentity;

    const request = xml.Request;
    if (request && request.PunchOutSetupRequest) {
      const punchoutRequest = request.PunchOutSetupRequest;
      
      // Extract BrowserFormPost URL (where we'll send the cart back)
      const browserFormPost = punchoutRequest.BrowserFormPost;
      if (browserFormPost && browserFormPost.URL) {
        console.log(`🎯 BrowserFormPost URL: ${browserFormPost.URL}`);
      }

      // Extract BuyerCookie
      const buyerCookie = punchoutRequest.BuyerCookie;
      if (buyerCookie) {
        console.log(`🍪 BuyerCookie: ${buyerCookie}`);
      }

      // Extract email from Extrinsics
      const extrinsics = punchoutRequest.Extrinsic;
      if (extrinsics) {
        if (Array.isArray(extrinsics)) {
          const userEmailExtrinsic = extrinsics.find(e => e.name === 'UserEmail' || e.name === 'userEmail');
          if (userEmailExtrinsic) email = userEmailExtrinsic._;
        } else if (extrinsics.name === 'UserEmail' || extrinsics.name === 'userEmail') {
          email = extrinsics._;
        }
      }

      console.log(`📧 Extracted email: ${email}`);
    }

    if (!email) {
      return res.status(400).send('UserEmail missing');
    }

    // Find or create user automatically
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`👤 User not found, creating new user: ${email}`);
      
      // Generate random password for auto-created users
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(12).toString('hex');
      
      // Create user with customer role and auto-verified
      user = await User.create({
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        password: randomPassword,
        role: "customer",
        isVerified: true // Auto-verify punchout users
      });
      
      console.log(`✅ Created new user: ${user.id}`);
    }

    // Generate and store punchout token
    const token = uuidv4();
    const payloadId = `payload-${token.substring(0, 8)}`;
    const expiresAt = moment().add(15, 'minutes').toDate();

    await PunchoutToken.create({
      token,
      user_id: user.id,
      expires_at: expiresAt,
      payload_id: payloadId,
      buyer_cookie: xml.Request?.PunchOutSetupRequest?.BuyerCookie,
      browser_form_post_url: xml.Request?.PunchOutSetupRequest?.BrowserFormPost?.URL,
      supplier_setup_url: xml.Request?.PunchOutSetupRequest?.SupplierSetupURL,
    });

    console.log(`🔑 Created punchout token: ${token} for user: ${user.id}`);

    // Build redirect URL
    const redirectUrl = `${process.env.APP_URL || 'http://localhost:3000'}/punchout/login?token=${token}`;

    // Create PunchOutSetupResponse XML
    const responseObj = {
      cXML: {
        payloadID: payloadId,
        timestamp: new Date().toISOString(),
        Response: {
          Status: { code: '200', text: 'OK' },
          PunchOutSetupResponse: {
            StartPage: {
              URL: redirectUrl
            }
          }
        }
      }
    };

    const responseXml = builder.buildObject(responseObj);

    console.log(`✅ Sending PunchOut Setup Response`);
    console.log(`🔗 Redirect URL: ${redirectUrl}`);

    res.set('Content-Type', 'text/xml');
    return res.status(200).send(responseXml);

  } catch (error) {
    console.error('❌ Error in handleSetupRequest:', error);
    
    // Send error response in XML format
    const errorResponse = builder.buildObject({
      cXML: {
        payloadID: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        Response: {
          Status: { code: '500', text: 'Internal Server Error' }
        }
      }
    });
    
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(errorResponse);
  }
};

// ====================== PUNCHOUT LOGIN ======================
const punchoutLogin = async (req, res) => {
  try {
    const { token } = req.query;

    console.log(`🔐 PunchOut login attempt with token: ${token}`);

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required"
      });
    }

    // Find valid punchout token
    const punchoutToken = await PunchoutToken.findOne({
      where: { 
        token,
        is_used: false,
        expires_at: { [db.Sequelize.Op.gt]: new Date() }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role', 'isVerified']
      }]
    });

    if (!punchoutToken) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired punchout token"
      });
    }

    const user = punchoutToken.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Mark token as used
    await punchoutToken.update({
      is_used: true,
      used_at: new Date()
    });

    // Generate JWT token (1 day expiry)
    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`✅ PunchOut login successful for user: ${user.email}`);

    // Return success with user data and token
    res.json({
      success: true,
      message: "PunchOut login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token: jwtToken,
        punchout: {
          token: punchoutToken.token,
          buyer_cookie: punchoutToken.buyer_cookie,
          browser_form_post_url: punchoutToken.browser_form_post_url
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in punchoutLogin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== PUNCHOUT ORDER MESSAGE ======================
const handleOrderMessage = async (req, res) => {
  try {
    console.log('📦 Received PunchOut Order Message');
    
    // Parse XML Request
    const xmlContent = req.body;
    const xml = await parser.parseStringPromise(xmlContent);

    // Extract order details
    const orderRequest = xml.Request?.OrderRequest;
    if (!orderRequest) {
      throw new Error('Invalid OrderRequest');
    }

    // Process order items
    const items = [];
    const orderItems = orderRequest.ItemOut;
    
    if (Array.isArray(orderItems)) {
      orderItems.forEach(item => {
        items.push({
          product_id: item.ItemID?.SupplierPartID,
          quantity: item.Quantity,
          price: item.ItemDetail?.UnitPrice?.Money,
          description: item.ItemDetail?.Description
        });
      });
    } else if (orderItems) {
      items.push({
        product_id: orderItems.ItemID?.SupplierPartID,
        quantity: orderItems.Quantity,
        price: orderItems.ItemDetail?.UnitPrice?.Money,
        description: orderItems.ItemDetail?.Description
      });
    }

    console.log('🛒 Processed order items:', items);

    // Create order in your system (you'll need to implement this based on your Order model)
    // const order = await createOrderFromPunchout(items, xml);

    // Send success response
    const responseObj = {
      cXML: {
        payloadID: `order-response-${Date.now()}`,
        timestamp: new Date().toISOString(),
        Response: {
          Status: { code: '200', text: 'OK' }
        }
      }
    };

    const responseXml = builder.buildObject(responseObj);

    res.set('Content-Type', 'text/xml');
    return res.status(200).send(responseXml);

  } catch (error) {
    console.error('❌ Error in handleOrderMessage:', error);
    
    const errorResponse = builder.buildObject({
      cXML: {
        payloadID: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        Response: {
          Status: { code: '500', text: 'Internal Server Error' }
        }
      }
    });
    
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(errorResponse);
  }
};

// ====================== VALIDATE PUNCHOUT TOKEN ======================
const validatePunchoutToken = async (req, res) => {
  try {
    const { token } = req.query;

    const punchoutToken = await PunchoutToken.findOne({
      where: { 
        token,
        is_used: false,
        expires_at: { [db.Sequelize.Op.gt]: new Date() }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    if (!punchoutToken) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired punchout token"
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        user: punchoutToken.user,
        punchout: {
          token: punchoutToken.token,
          buyer_cookie: punchoutToken.buyer_cookie,
          browser_form_post_url: punchoutToken.browser_form_post_url,
          expires_at: punchoutToken.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Error validating punchout token:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  handleSetupRequest,
  punchoutLogin,
  handleOrderMessage,
  validatePunchoutToken
};