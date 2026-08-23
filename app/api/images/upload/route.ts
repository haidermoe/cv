import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Try Uploading to Free Fast Public CDN (ImgBB API)
    const imgbbForm = new FormData();
    imgbbForm.append("image", base64Image);
    imgbbForm.append("name", file.name.replace(/\.[^/.]+$/, ""));

    const apiKey = process.env.IMGBB_API_KEY || "d0c41031f0ca9b626e2e0ea943485c21";

    try {
      const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: imgbbForm,
      });

      const data = await uploadRes.json();

      if (data && data.data && (data.data.url || data.data.display_url)) {
        return NextResponse.json({
          success: true,
          name: file.name,
          url: data.data.url || data.data.display_url,
          direct_url: data.data.display_url || data.data.url,
          thumb: data.data.thumb?.url || data.data.url,
          delete_url: data.data.delete_url,
          size: file.size,
        });
      }
    } catch (err) {
      console.warn("ImgBB upload failed, falling back to alternative host", err);
    }

    // Fallback: Free direct file host (Catbox)
    try {
      const catboxForm = new FormData();
      catboxForm.append("reqtype", "fileupload");
      const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
      catboxForm.append("fileToUpload", blob, file.name);

      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: catboxForm,
      });

      if (catboxRes.ok) {
        const directUrl = (await catboxRes.text()).trim();
        if (directUrl.startsWith("http")) {
          return NextResponse.json({
            success: true,
            name: file.name,
            url: directUrl,
            direct_url: directUrl,
            thumb: directUrl,
            size: file.size,
          });
        }
      }
    } catch (err2) {
      console.error("Secondary upload host failed", err2);
    }

    return NextResponse.json(
      { error: "Failed to upload image to public CDN" },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
