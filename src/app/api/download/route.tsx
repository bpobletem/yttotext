import { NextResponse } from "next/server";
import ytdl from '@distube/ytdl-core';
import fs from "fs";
import { promisify } from "util";
import { pipeline as streamPipeline } from "stream";
import { ElevenLabsClient } from "elevenlabs";
import path from 'path';
import os from 'os';

const pipeline = promisify(streamPipeline);

export async function POST(request: Request) {
  const videoPath = path.join(os.tmpdir(), `video-${Date.now()}.mp3`);

  try {
    const { ytLink } = await request.json();
    
    if (!ytLink) {
      throw new Error('YouTube link is required');
    }

    console.log('Processing video:', ytLink);
    console.log('Temp file path:', videoPath);

    // Download video
    try {
      await pipeline(
        ytdl(ytLink),
        fs.createWriteStream(videoPath)
      );
    } catch (e) {
      console.error('Download error:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Video download failed: ${errorMessage}`);
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Convert to text
    try {
      const speechToTextResult = await client.speechToText.convert({
        file: fs.createReadStream(videoPath),
        model_id: "scribe_v1",
      });

      // Cleanup temp file
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      return NextResponse.json({ 
        success: true, 
        text: speechToTextResult.text 
      });

    } catch (e) {
      console.error('Conversion error:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Text conversion failed: ${errorMessage}`);
    }

  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
}