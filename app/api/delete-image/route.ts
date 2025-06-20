import { NextRequest, NextResponse } from "next/server"
import { DeleteFile } from "@/lib/cloudinary/cloud-fun"


function extractPublicIdFromUrl(url: string): string {
    const uploadPath = /upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)/i
    const matches = url.match(uploadPath)

    if (!matches || matches.length < 2) {
      throw new Error('Invalid Cloudinary URL format')
    }

    const publicId = matches[1]
    console.log({ publicId })
    return publicId.split('.')[0]
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    const publicId = extractPublicIdFromUrl(url)

    console.log({ publicId })
    await DeleteFile(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
  }
}