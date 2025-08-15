
const container = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #FAFAF5;
  padding: 40px 0;
  margin: 0;
  color: #111827;
`;

const contentBox = `
  background-color: #ffffff;
  max-width: 480px;
  margin: auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const header = `
  background-color: #10B981
;
  color: #ffffff;
  padding: 32px 20px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
`;

const section = `
  padding: 32px 24px;
  text-align: center;
`;

const paragraph = `
  font-size: 17px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const button = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #10B981
;
  color: #ffffff;
  text-decoration: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0;
`;

const footer = `
  background-color: #10B981
;
  color: #ffffff;
  text-align: center;
  padding: 20px;
  font-weight: 600;
  font-size: 16px;
`;


const h2Style = "font-size: 20px; color: #1f2937; margin-bottom: 16px;";
const pStyle = "margin-bottom: 12px; font-size: 16px; line-height: 1.5;";
const linkStyle = "color: #3b82f6; text-decoration: underline; font-weight: 500;";

export function adminOrderReceivedEmail(orderId: string) {
  return {
    subject: "New Order Received",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">New Order Received</div>
          <div style="${section}">
            <p style="${paragraph}">An order with ID <strong>ORD-${orderId}</strong> has been placed.</p>
            <a href="${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}" style="${button}">View Dashboard</a>
            <p style="font-size: 15px; color: #6B7280;">
              Click the button to manage the order in your admin dashboard.
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}


export function sellerOrderPlacedEmail(orderId: string, sellerName: string) {
  return {
    subject: "You Have a New Order!",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">New Order Received</div>
          <div style="${section}">
            <p style="${paragraph}">Hello <strong>${sellerName}</strong>,</p>
            <p style="${paragraph}">You just received a new order with ID <strong>ORD-${orderId}</strong>.</p>
            <a href="${process.env.NEXT_PUBLIC_API_URL}/vendor/orders" style="${button}">View Dashboard</a>
            <p style="font-size: 15px; color: #6B7280;">
              Click the button to view the order details in your seller dashboard.
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function adminOrderProblemReportEmail(
  orderId: string,
  buyerName: string,
  problemDescription: string
) {
  return {
    subject: `🚨 Problem Reported with Order #${orderId}`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header.replace('#10B981', '#EF4444')}">Problem Reported</div>
          <div style="${section}">
            <p style="${paragraph}">
              Buyer <strong>${buyerName}</strong> has reported a problem with order <strong>ORD-${orderId}</strong>.
            </p>
            
            <div style="background-color: #FEE2E2; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #B91C1C;">Reported Problem:</h3>
              <p style="${pStyle}">${problemDescription}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}" style="${button.replace('#10B981', '#EF4444')}">
              Review Order
            </a>
            
            <p style="font-size: 15px; color: #6B7280; margin-top: 20px;">
              Please take appropriate action and contact both buyer and seller.
            </p>
          </div>
          <div style="${footer.replace('#10B981', '#EF4444')}">Spriie Support</div>
        </div>
      </div>
    `,
  };
}

export function sellerOrderProblemReportEmail(
  orderId: string,
  sellerName: string,
  buyerName: string,
  problemDescription: string
) {
  return {
    subject: `Buyer Reported Problem with Order #${orderId}`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header.replace('#10B981', '#F59E0B')}">Problem Reported</div>
          <div style="${section}">
            <p style="${paragraph}">Hello <strong>${sellerName}</strong>,</p>
            <p style="${paragraph}">
              Buyer <strong>${buyerName}</strong> has reported a problem with order <strong>ORD-${orderId}</strong>.
            </p>
            
            <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #B45309;">Reported Problem:</h3>
              <p style="${pStyle}">${problemDescription}</p>
            </div>

            <p style="${paragraph}">
              Our support team has been notified and will contact you shortly to resolve this issue.
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_API_URL}/vendor/orders/${orderId}" style="${button.replace('#10B981', '#F59E0B')}">
              View Order
            </a>
          </div>
          <div style="${footer.replace('#10B981', '#F59E0B')}">Spriie Support</div>
        </div>
      </div>
    `,
  };
}

export function buyerOrderPlacedEmail(orderId: string, buyerName: string) {
  return {
    subject: "Your Order Was Placed Successfully!",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Order Confirmation</div>
          <div style="${section}">
            <p style="${paragraph}">Hi <strong>${buyerName}</strong>,</p>
            <p style="${paragraph}">Thank you for your purchase! Your order with ID <strong>ORD-${orderId}</strong> has been placed successfully.</p>
            <p style="font-size: 15px; color: #6B7280;">
              You can track your order status and see details in your buyer dashboard.
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}


export function buyerOrderUpdateEmail(orderId: string, buyerName: string, status: string, comfirmToken?: string | null) {
  return {
    subject: `Your Order has been ${status}!`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Order Update</div>
          <div style="${section}">
            <p style="${paragraph}">Hi <strong>${buyerName}</strong>,</p>
            <p style="${paragraph}">Your order with ID <strong>ORD-${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
            <p style="font-size: 15px; color: #6B7280;">
              You can track your order status and see details in your buyer dashboard.
            </p>
            ${status.toLowerCase() === 'shipped' ? `
            <p style="${paragraph}">
              Your items are on the way! You'll receive tracking information soon.
            </p>
            ` : ''}
            ${status.toLowerCase() === 'delivered' ? `
            <p style="${paragraph}">
              Your order has been delivered. We hope you're happy with your purchase!
            </p>
            ${comfirmToken ? `
            <p style="${paragraph}">
              <a href="${process.env.NEXT_PUBLIC_API_URL}/user/orders/${orderId}?comfirmToken=${comfirmToken}" 
                 style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Confirm Delivery
              </a>
            </p>
            ` : ''}
            ` : ''}
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function sellerFundsReleasedEmail(
  sellerName: string,
  orderId: string,
  amount: number,
  platformFee: number,
  netAmount: number
) {
  return {
    subject: "Funds Released for Your Order",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Payment Released</div>
          <div style="${section}">
            <p style="${paragraph}">Hello <strong>${sellerName}</strong>,</p>
            <p style="${paragraph}">
              The funds for order <strong>ORD-${orderId}</strong> have been successfully released to your account.
            </p>
            
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: left;">
              <p style="${pStyle}"><strong>Order ID:</strong> ORD-${orderId}</p>
              <p style="${pStyle}"><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
              <p style="${pStyle}"><strong>Platform Fee (5%):</strong> $${platformFee.toFixed(2)}</p>
              <p style="${pStyle}"><strong>Net Amount Credited:</strong> $${netAmount.toFixed(2)}</p>
            </div>

            <p style="${paragraph}">
              The amount has been added to your Spriie wallet balance and is available for withdrawal.
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_API_URL}/vendor/wallet" style="${button}">View Wallet</a>
            
            <p style="font-size: 15px; color: #6B7280; margin-top: 20px;">
              Thank you for selling with Spriie!
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function buyerFundsReleasedConfirmationEmail(
  buyerName: string,
  orderId: string,
  sellerName: string
) {
  return {
    subject: "Your Order is Complete",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Order Completed</div>
          <div style="${section}">
            <p style="${paragraph}">Hi <strong>${buyerName}</strong>,</p>
            <p style="${paragraph}">
              Thank you for confirming delivery of order <strong>ORD-${orderId}</strong>.
              The payment has been released to <strong>${sellerName}</strong>.
            </p>
            
            <p style="${paragraph}">
              We hope you're satisfied with your purchase! If you have any questions, 
              please don't hesitate to contact us.
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_API_URL}/user/orders/${orderId}" style="${button}">
              View Order Details
            </a>
            
            <p style="font-size: 15px; color: #6B7280; margin-top: 20px;">
              Thank you for shopping with Spriie!
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function sellerReturnRequestEmail(
  orderId: string,
  buyerName: string,
  reason: string
) {
  return {
    subject: `Return Request for Order #${orderId}`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Return Requested</div>
          <div style="${section}">
            <p style="${paragraph}">${buyerName} has requested to return an item from order <strong>ORD-${orderId}</strong>.</p>
            <p style="${paragraph}"><strong>Reason:</strong> ${reason}</p>
            <a href="${process.env.NEXT_PUBLIC_API_URL}/seller/orders/${orderId}" style="${button}">Review Request</a>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function passwordResetEmail(resetLink: string, expiresIn: string = "1 hour") {
  return {
    subject: "Password Reset Request",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Reset Your Password</div>
          <div style="${section}">
            <p style="${paragraph}">We received a request to reset your Spriie account password.</p>
            <p style="${paragraph}">This link will expire in <strong>${expiresIn}</strong>.</p>
            <a href="${resetLink}" style="${button}">Reset Password</a>
            <p style="font-size: 15px; color: #6B7280;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function passwordResetConfirmationEmail() {
  return {
    subject: "Your Password Has Been Reset",
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Password Updated</div>
          <div style="${section}">
            <p style="${paragraph}">Your Spriie account password has been successfully updated.</p>
            <p style="${paragraph}">If you didn't make this change, please <a href="${process.env.NEXT_PUBLIC_API_URL}/contact" style="${linkStyle}">contact us</a> immediately.</p>
          </div>
          <div style="${footer}">Spriie</div>
        </div>
      </div>
    `,
  };
}

export function teamInvitationEmail(
  inviterName: string,
  teamName: string,
  inviteLink: string,
  role: string,
  expiresIn: string
) {
  const container = `
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const contentBox = `
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  `;

  const header = `
    background-color: #10b981;
    color: #ffffff;
    padding: 20px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  `;

  const section = `
    padding: 30px;
  `;

  const paragraph = `
    font-size: 16px;
    margin-bottom: 20px;
  `;

  const button = `
    display: inline-block;
    background-color: #10b981;
    color: #ffffff;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    font-size: 16px;
    margin: 20px 0;
  `;

  const footer = `
    background-color: #f8f9fa;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #6c757d;
    border-top: 1px solid #e9ecef;
  `;

  return {
    subject: `You've been invited to join ${teamName}`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Team Invitation</div>
          <div style="${section}">
            <p style="${paragraph}">
              <strong>${inviterName}</strong> has invited you to join 
              <strong>${teamName}</strong> as a <strong>${role}</strong>.
            </p>
            
            <a href="${inviteLink}" style="${button}">Accept Invitation</a>

            <p style="${paragraph}">
              This invitation link will expire in ${expiresIn}. If you didn't request this invitation, please ignore this email.
            </p>
          </div>
          <div style="${footer}">${teamName}</div>
        </div>
      </div>
    `,
  };
}