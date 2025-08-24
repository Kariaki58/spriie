import connectToDatabase from "@/lib/mongoose";
import EmailJob from "@/models/emailJob";
import { resend } from "@/lib/email/resend";
import { NextRequest } from "next/server";

const MAX_ATTEMPTS = 5; 

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

  let deadJobs;
  try {
    console.log("🔄 Resurrecting failed email jobs...");
    deadJobs = await EmailJob.find({ failed: true })
      .sort({ failedAt: 1 })
      .limit(20);
  } catch (queryErr) {
    console.error("❌ Failed to fetch failed email jobs:", queryErr);
    return Response.json(
      { error: "Failed to fetch failed jobs" },
      { status: 500 }
    );
  }

  if (!deadJobs.length) {
    return Response.json({
      message: "No failed jobs to retry",
    });
  }

  let retriedCount = 0;
  let permanentlyDead = 0;
  let revivedCount = 0;

  for (const job of deadJobs) {
    try {
      // Reset dead job before retry
      job.failed = false;

      const { error } = await resend.emails.send({
        from: job.from,
        to: job.to,
        subject: job.subject,
        html: job.html,
      });

      if (error) {
        throw new Error("error occurred while sending emails");
      }

      job.sent = true;
      job.sentAt = new Date();
      await job.save();

      revivedCount++;
    } catch (sendErr) {
      console.error(`❌ Retry failed for ${job.to}:`, sendErr);

      job.attempts += 1;

      if (job.attempts >= MAX_ATTEMPTS) {
        // Permanently dead
        job.failed = true;
        job.failedAt = new Date();
        permanentlyDead++;
        console.error(`💀 Email to ${job.to} permanently dead.`);
      } else {
        // Return back to queue for future retries
        job.failed = false;
      }

      await job.save();
      retriedCount++;
    }
  }

  return Response.json({
    retried: retriedCount,
    revived: revivedCount,
    permanentlyDead,
    remainingDead: await EmailJob.countDocuments({ failed: true }),
  });
}
