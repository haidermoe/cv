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
    const mimeType = file.type || "image/jpeg";
    const fileName = file.name || "image.png";

    // 1. Permanent Storage: Vercel Blob (Built-in to Vercel, unlimited, permanent)
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (vercelBlobToken) {
      try {
        const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const blobRes = await fetch(`https://blob.vercel-storage.com/${Date.now()}-${cleanName}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${vercelBlobToken}`,
            "x-api-version": "7",
            "content-type": mimeType,
          },
          body: buffer,
        });

        if (blobRes.ok) {
          const blobData = await blobRes.json();
          if (blobData?.url) {
            return NextResponse.json({
              success: true,
              name: fileName,
              url: blobData.url,
              direct_url: blobData.url,
              thumb: blobData.url,
              size: file.size,
            });
          }
        }
      } catch (errBlob) {
        console.warn("Vercel Blob upload failed:", errBlob);
      }
    }

    // 2. Permanent Storage: ImgBB (if custom valid API key provided)
    const customImgbbKey = process.env.IMGBB_API_KEY;
    if (customImgbbKey && customImgbbKey !== "d0c41031f0ca9b626e2e0ea943485c21") {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append("image", base64Image);
        imgbbForm.append("name", fileName.replace(/\.[^/.]+$/, ""));

        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${customImgbbKey}`, {
          method: "POST",
          body: imgbbForm,
        });

        const data = await uploadRes.json();
        if (data?.data && (data.data.url || data.data.display_url)) {
          return NextResponse.json({
            success: true,
            name: fileName,
            url: data.data.url || data.data.display_url,
            direct_url: data.data.display_url || data.data.url,
            thumb: data.data.thumb?.url || data.data.url,
            delete_url: data.data.delete_url,
            size: file.size,
          });
        }
      } catch (err) {
        console.warn("ImgBB custom upload failed:", err);
      }
    }

    // 3. Permanent High-Speed CDN: Imgur API (Direct permanent links)
    const imgurClientIds = ["546c25a59c58ad7", "1ceddedc03a5d71"].sort(() => Math.random() - 0.5);
    for (const clientId of imgurClientIds) {
      try {
        const imgurForm = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        imgurForm.append("image", blob, fileName);

        const imgurRes = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${clientId}`,
          },
          body: imgurForm,
        });

        const imgurData = await imgurRes.json();
        if (imgurData?.success && imgurData?.data?.link) {
          const directLink = imgurData.data.link;
          return NextResponse.json({
            success: true,
            name: fileName,
            url: directLink,
            direct_url: directLink,
            thumb: directLink,
            delete_url: imgurData.data.deletehash
              ? `https://imgur.com/delete/${imgurData.data.deletehash}`
              : directLink,
            size: file.size,
          });
        }
      } catch (err) {
        console.warn(`Imgur upload with client ${clientId} failed:`, err);
      }
    }

    // 4. Permanent Storage: Catbox (Permanent direct file hosting)
    try {
      const catboxForm = new FormData();
      catboxForm.append("reqtype", "fileupload");
      const blob = new Blob([buffer], { type: mimeType });
      catboxForm.append("fileToUpload", blob, fileName);

      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: catboxForm,
      });

      if (catboxRes.ok) {
        const directUrl = (await catboxRes.text()).trim();
        if (directUrl.startsWith("http")) {
          return NextResponse.json({
            success: true,
            name: fileName,
            url: directUrl,
            direct_url: directUrl,
            thumb: directUrl,
            size: file.size,
          });
        }
      }
    } catch (err2) {
      console.warn("Catbox upload failed:", err2);
    }

    return NextResponse.json(
      { error: "Failed to upload image to permanent storage" },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
