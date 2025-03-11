'use client'
import { useState } from 'react';

export default function Home() {
  const [ytLink, setYtLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false)

  async function downloadVideo(ytLink: string) {
    setLoading(true);
    try {
      if (!ytLink) {
        throw new Error('Please enter a YouTube link');
      }
  
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ytLink }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Download failed');
      }
  
      if (!data.text) {
        throw new Error('No transcript received');
      }
  
      setTranscript(data.text);
    } catch (error) {
      console.error('Error:', error);
      setTranscript(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="flex text-3xl font-extrabold mb-8 bg-gradient-to-bl from-white to-gray-300 bg-clip-text text-transparent">Youtube to text</h1>
        <div className='flex items-center gap-2 md:gap-8 mb-8'>
          <input 
            className='flex p-2 bg-gray-900 rounded-md' 
            placeholder='Copy the youtube link'
            value={ytLink}
            onChange={(e) => setYtLink(e.target.value)}
            ></input>
          <button 
            className='flex py-2 px-4 items-center bg-indigo-500 rounded-md hover:bg-indigo-900 hover:cursor-pointer transition duration-300' 
            onClick={() => downloadVideo(ytLink)}
            disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Transcript'
              )}
          </button>
        </div>
        {transcript.length > 0 && (
          <div className="max-w-2xl p-4 bg-gray-900 rounded-md">
            {transcript}
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>by <a className='underline' href="https://bppm.dev" target="_blank">bppm</a></p>
      </footer>
    </div>
  );
}