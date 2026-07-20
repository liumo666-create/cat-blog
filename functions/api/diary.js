// functions/api/diary.js (Cloudflare 原生函数语法 - 带密码锁)

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();
    
    // 👇 1. 在这里增加 password 的提取
    const { content, images, password } = data;
    
    // 👇 2. 增加拦截器：密码不对，直接打回！
    if (password !== '1472580369') {
      return new Response(JSON.stringify({ success: false, error: '权限拒绝：你不是博主！' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // 直接从 env 中读取你的数据库和 Token
    const DB = env.DB;
    const GITHUB_TOKEN = env.GITHUB_TOKEN;
    const REPO = 'liumo666-create/blog-assets'; 
    
    let uploadedImageUrls = [];
    
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
        const fileName = `diary/${Date.now()}-${i}.png`; 
        
        const ghResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Astro-Pixel-Blog'
          },
          body: JSON.stringify({
            message: `Upload diary image ${fileName} via API`,
            content: base64Data
          })
        });
        
        if (ghResponse.ok) {
          const cdnUrl = `https://fastly.jsdelivr.net/gh/${REPO}@main/${fileName}`;
          uploadedImageUrls.push(cdnUrl);
        } else {
          console.error("GitHub Upload Error:", await ghResponse.text());
        }
      }
    }
    
    const id = Date.now().toString();
    const imagesJson = JSON.stringify(uploadedImageUrls);
    const type = uploadedImageUrls.length > 0 ? 'photo' : 'note';
    
    await DB.prepare(
      "INSERT INTO diaries (id, content, images, type) VALUES (?, ?, ?, ?)"
    ).bind(id, content, imagesJson, type).run();
    
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const DB = env.DB;
    const { results } = await DB.prepare("SELECT * FROM diaries ORDER BY created_at DESC").all();
    
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}