import connectToDatabase from "@/lib/mongoose";
import EmailJob from "@/models/emailJob";
import { resend } from "@/lib/email/resend";
import { NextRequest } from "next/server";

const MAX_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
  } catch (dbErr) {
    console.error("❌ Failed to connect to MongoDB:", dbErr);
    return Response.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  let jobs;
  try {
    console.log("running........JOBS....")
    jobs = await EmailJob.find({ sent: false, failed: false })
      .sort({ createdAt: 1 })
      .limit(20);
  } catch (queryErr) {
    console.error("❌ Failed to fetch email jobs:", queryErr);
    return Response.json(
      { error: "Failed to fetch email jobs" },
      { status: 500 }
    );
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const job of jobs) {
    try {
      const { error } = await resend.emails.send({
        from: job.from,
        to: job.to,
        subject: job.subject,
        html: job.html,
      });

      if (error) {
        throw new Error("error occurred while sending emails")
      }

      job.sent = true;
      job.sentAt = new Date();
      await job.save();

      sentCount++;
    } catch (sendErr) {
      console.error(`❌ Failed to send email to ${job.to}:`, sendErr);

      job.attempts += 1;

      if (job.attempts >= MAX_ATTEMPTS) {
        job.failed = true;
        job.failedAt = new Date();
        failedCount++;
        console.error(`⚠️ Email to ${job.to} moved to dead-letter queue.`);
      }

      await job.save();
    }
  }

  return Response.json({
    processed: jobs.length,
    sentCount,
    failedCount,
    remainingInQueue: await EmailJob.countDocuments({ sent: false, failed: false }),
  });
}
