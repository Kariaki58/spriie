import { resend } from "./resend";
import {
  adminOrderReceivedEmail,
  sellerOrderPlacedEmail,
  // sellerOrderStatusUpdateEmail,
  sellerReturnRequestEmail,
} from "./email-templates";

// Send email to admin when a new order is placed
export async function sendAdminEmail(orderId: string) {
  return resend.emails.send({
    from: "Spriie <contact@spriie.com>",
    to: "contact@spriie.com",
    ...adminOrderReceivedEmail(orderId),
  });
}

// Send email to seller when an order is placed
export async function sendSellerOrderEmail(orderId: string, email: string, sellerName: string) {
  return resend.emails.send({
    from: "Spriie <contact@spriie.com>",
    to: email,
    ...sellerOrderPlacedEmail(orderId, sellerName),
  });
}

// Send email to seller when return is requested
export async function sendReturnRequestEmail(orderId: string, reason: string, email: string, buyerName: string) {
  return resend.emails.send({
    from: "Spriie <contact@spriie.com>",
    to: email,
    ...sellerReturnRequestEmail(orderId, buyerName, reason),
  });
}

// Optional: Send status update email to seller
// export async function sendSellerStatusEmail(
//   orderId: string,
//   status: "shipped" | "delivered" | "cancelled",
//   email: string,
//   reason?: string
// ) {
//   return resend.emails.send({
//     from: "Spriie <contact@spriie.com>",
//     to: email,
//     ...sellerOrderStatusUpdateEmail(orderId, status, reason),
//   });
// }

// Subscribe a contact to Resend audience
export async function subscribeContact(email: string, firstName: string, lastName: string) {
  return resend.contacts.create({
    email,
    firstName,
    lastName,
    unsubscribed: false,
    audienceId: "045c6c19-ba2a-41f6-8cef-2b1db18df75c",
  });
}