// functions/api/comment.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { diary_id, email, content, avatar_url } = await request.json();
    const DB = env.DB;
    const id = Date.now().toString();

    await DB.prepare(
      "INSERT INTO comments (id, diary_id, email, content, avatar_url) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, diary_id, email, content, avatar_url).run();

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// 统一拉取所有评论供前端渲染
export async function onRequestGet(context) {
  try {
    const { env } = context;
    const DB = env.DB;
    const { results } = await DB.prepare("SELECT * FROM comments ORDER BY created_at ASC").all();
    
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}