// API untuk membuat notifikasi manual (event-based)
// Digunakan oleh sistem lain seperti Telegram bot, admin actions, dll

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-admin";
import { verifyAuthRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      target, // 'all_teachers', 'specific_user', 'all_users'
      user_id, // Required if target is 'specific_user'
      type, // 'alert', 'system', 'summary'
      priority, // 'urgent', 'high', 'normal', 'low'
      title,
      message,
      metadata,
    } = body;

    // Validation
    if (!target || !type || !priority || !title || !message) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: target, type, priority, title, message",
        },
        { status: 400 }
      );
    }

    if (target === "specific_user" && !user_id) {
      return NextResponse.json(
        { error: "user_id is required when target is specific_user" },
        { status: 400 }
      );
    }

    // Get target users
    let targetUsers: { id: string }[] = [];

    if (target === "all_teachers") {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("role", "teacher")
        .eq("is_active", true);
      targetUsers = data || [];
    } else if (target === "all_users") {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("is_active", true);
      targetUsers = data || [];
    } else if (target === "specific_user") {
      targetUsers = [{ id: user_id }];
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid target. Must be: all_teachers, all_users, or specific_user",
        },
        { status: 400 }
      );
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: "No target users found" },
        { status: 404 }
      );
    }

    // Create notifications
    const notifications = targetUsers.map((u) => ({
      user_id: u.id,
      type,
      priority,
      title,
      message,
      metadata: {
        ...metadata,
        created_by: user.id,
        created_by_role: user.role,
        source: "manual",
      },
    }));

    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} user(s)`,
      count: targetUsers.length,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
