// src/pages/api/diary.js
export const prerender = false; // 终极指令：告诉 Astro 这个文件不打包成静态，而是作为云函数实时运行！

export async function POST({ request, locals }) {
  try {
    const data = await request.json();
    const { content, images } = data;
    
    // 从 Cloudflare 环境中安全读取你的数据库和 Token
    const DB = locals.runtime.env.DB;
    const GITHUB_TOKEN = locals.runtime.env.GITHUB_TOKEN;
    
    // 👇 请确保这里的仓库名和你的实际 GitHub 对应！
    const REPO = 'liumo666-create/blog-assets'; 
    
    let uploadedImageUrls = [];
    
    // 1. 如果有图片，执行 GitHub 上传动作
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        // 剥离 Base64 前缀，GitHub 接口不需要这个
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
        const fileName = `diary/${Date.now()}-${i}.png`; // 毫秒级时间戳防重名
        
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
          // 2. 魔法转换：把 GitHub 原生链接替换成 jsDelivr 国内秒开加速链接
          const cdnUrl = `https://fastly.jsdelivr.net/gh/${REPO}@main/${fileName}`;
          uploadedImageUrls.push(cdnUrl);
        } else {
          console.error("GitHub Upload Error:", await ghResponse.text());
        }
      }
    }
    
    // 3. 将文字内容和 CDN 图片链接写入 D1 数据库
    const id = Date.now().toString();
    const imagesJson = JSON.stringify(uploadedImageUrls);
    const type = uploadedImageUrls.length > 0 ? 'photo' : 'note';
    
    await DB.prepare(
      "INSERT INTO diaries (id, content, images, type) VALUES (?, ?, ?, ?)"
    ).bind(id, content, imagesJson, type).run();
    
    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

// 这个 GET 方法负责给前端送回已发布的日记
export async function GET({ locals }) {
  try {
    const DB = locals.runtime.env.DB;
    // 按时间倒序提取数据
    const { results } = await DB.prepare("SELECT * FROM diaries ORDER BY created_at DESC").all();
    
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}