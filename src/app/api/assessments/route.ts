import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabase(request: NextRequest) {
  const response = NextResponse.next();
  return {
    supabase: createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    ),
    response,
  };
}

// GET: load user's assessments (in_progress or recent completed)
export async function GET(request: NextRequest) {
  const { supabase } = createSupabase(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get in-progress assessment
  const { data: inProgress } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  // Check weekly limit: any completed in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentCompleted } = await supabase
    .from("assessments")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", weekAgo)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  // Get past completed assessments for history
  const { data: history } = await supabase
    .from("assessments")
    .select("id, scores, interpretation, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    in_progress: inProgress || null,
    weekly_limit_reached: !!recentCompleted,
    next_available: recentCompleted
      ? new Date(
          new Date(recentCompleted.completed_at).getTime() +
            7 * 24 * 60 * 60 * 1000
        ).toISOString()
      : null,
    history: history || [],
  });
}

// POST: create new assessment or update existing
export async function POST(request: NextRequest) {
  const { supabase } = createSupabase(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, assessment_id, answers, scores, interpretation } = body;

  // ─── Create new assessment ───
  if (action === "create") {
    // Check weekly limit
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: recent } = await supabase
      .from("assessments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", weekAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: "你本週已完成過測評,每週限一次。" },
        { status: 429 }
      );
    }

    const { data, error } = await supabase
      .from("assessments")
      .insert({ user_id: user.id, answers: answers || {}, status: "in_progress" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ assessment: data });
  }

  // ─── Save progress (answers) ───
  if (action === "save_progress" && assessment_id) {
    const { error } = await supabase
      .from("assessments")
      .update({ answers, updated_at: new Date().toISOString() })
      .eq("id", assessment_id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // ─── Complete assessment ───
  if (action === "complete" && assessment_id) {
    const { error } = await supabase
      .from("assessments")
      .update({
        answers,
        scores,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessment_id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // ─── Save interpretation ───
  if (action === "save_interpretation" && assessment_id) {
    const { error } = await supabase
      .from("assessments")
      .update({ interpretation, updated_at: new Date().toISOString() })
      .eq("id", assessment_id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
