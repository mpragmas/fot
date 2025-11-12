import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/authOptions";
import { sendEmail } from "@/app/lib/email";
import { passwordSchema } from "@/app/lib/validationSchema";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = session.user.role;

    // Only admin or super-admin can create accounts
    if (!["ADMIN", "SUPER_ADMIN"].includes(currentUserRole)) {
      return NextResponse.json(
        { error: "Forbidden: You cannot create accounts" },
        { status: 403 },
      );
    }

    // Data from request
    const { name, email, password, role, Image } = await request.json();

    // Validate requested role
    if (!["REPORTER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Allowed roles: REPORTER, ADMIN" },
        { status: 400 },
      );
    }

    // Validate role creation rules
    if (role === "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can create ADMIN accounts" },
        { status: 403 },
      );
    }
    if (currentUserRole === "ADMIN" && role !== "REPORTER") {
      return NextResponse.json(
        { error: "ADMIN can only create REPORTER accounts" },
        { status: 403 },
      );
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password required" },
        { status: 400 },
      );
    }

    // Validate password with Zod schema
    const pwd = passwordSchema.safeParse(password);
    if (!pwd.success) {
      return NextResponse.json(
        { error: pwd.error.issues[0]?.message || "Invalid password" },
        { status: 400 },
      );
    }

    // Prevent creating super admins from API
    if (role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot create SUPER_ADMIN through this route" },
        { status: 403 },
      );
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role, // reporter or admin
        Image: Image || null,
      },
    });
    // Send notification email
    await sendEmail({
      to: email,
      subject: `Your ${role} account has been created`,
      html: `
        <p>Hello ${name || ""},</p>
        <p>Your ${role} account has been created successfully.</p>
        <p>Please sign in and change your password immediately for security.</p>
        <p>If you did not expect this email, you can ignore it.</p>
      `,
    });

    return NextResponse.json(
      {
        message: `${role} account created successfully`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", details: error.message || error },
      { status: 500 },
    );
  }
}
