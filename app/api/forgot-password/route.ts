import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({
        message: "If the email exists, a reset link will be sent",
      });

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const token = crypto.createHash("sha256").update(resetToken).digest("hex");

    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExp: expiry },
    });

    // Send email
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    return NextResponse.json({
      message: "If the email exists, a reset link will be sent",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
