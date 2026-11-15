import nodemailer from 'nodemailer';
import { config } from '../config/env';

export class EmailService {
  private transporter: any = null;

  constructor() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    }
  }

  async sendRideConfirmation(email: string, details: { rideId: string; pickup: string; dropoff: string; fare: number }): Promise<void> {
    if (!this.transporter) {
      console.log(`[Email Mock] Ride Confirmation to ${email}: Ride #${details.rideId}, Fare: ₹${details.fare}`);
      return;
    }
    await this.transporter.sendMail({
      from: `"Uber Clone Support" <${config.email.user}>`,
      to: email,
      subject: `Your Ride Booking Confirmation - #${details.rideId.slice(0, 8)}`,
      html: `
        <h2>Ride Confirmed!</h2>
        <p><strong>Pickup:</strong> ${details.pickup}</p>
        <p><strong>Dropoff:</strong> ${details.dropoff}</p>
        <p><strong>Estimated Fare:</strong> ₹${details.fare.toFixed(2)}</p>
        <p>Thank you for choosing our service!</p>
      `,
    });
  }

  async sendRideReceipt(email: string, receipt: { rideId: string; pickup: string; dropoff: string; fare: number; date: string }): Promise<void> {
    if (!this.transporter) {
      console.log(`[Email Mock] Ride Receipt to ${email}: Ride #${receipt.rideId}, Total: ₹${receipt.fare}`);
      return;
    }
    await this.transporter.sendMail({
      from: `"Uber Clone" <${config.email.user}>`,
      to: email,
      subject: `Trip Receipt: #${receipt.rideId.slice(0, 8)}`,
      html: `
        <h2>Trip Receipt</h2>
        <p><strong>Date:</strong> ${receipt.date}</p>
        <p><strong>From:</strong> ${receipt.pickup}</p>
        <p><strong>To:</strong> ${receipt.dropoff}</p>
        <hr/>
        <h3>Total Paid: ₹${receipt.fare.toFixed(2)}</h3>
      `,
    });
  }

  async sendDriverApproval(email: string, name: string): Promise<void> {
    if (!this.transporter) {
      console.log(`[Email Mock] Driver Approval Email sent to ${email} for ${name}`);
      return;
    }
    await this.transporter.sendMail({
      from: `"Uber Clone Partner" <${config.email.user}>`,
      to: email,
      subject: `Welcome to the Fleet, ${name}! Your Account is Approved`,
      html: `
        <h2>Congratulations, ${name}!</h2>
        <p>Your driver documents have been reviewed and approved by our admin team.</p>
        <p>You can now open your Driver Dashboard, toggle your status to <strong>Online</strong>, and start accepting ride requests.</p>
      `,
    });
  }
}

export const emailService = new EmailService();
