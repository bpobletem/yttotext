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
        ytdl(ytLink, { 
          filter: 'audioonly',
          quality: 'highestaudio'
        }),
        fs.createWriteStream(videoPath)
      );
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Video download failed: ${downloadError.message}`);
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

    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      throw new Error(`Text conversion failed: ${conversionError.message}`);
    }

  } catch (error) {
    console.error('API Error:', error);
    
    // Cleanup temp file if it exists
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error'
    }, { 
      status: 500 
    });
  }
}