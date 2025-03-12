'use client'
import { useState } from 'react';

export default function Home() {
  const [ytLink, setYtLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
          <div className="relative max-w-2xl bg-gray-800 rounded-md backdrop-blur-sm bg-opacity-10 border border-gray-500">
            <div className="sticky top-0 w-full flex justify-end bg-gray-900 border-b border-gray-700 rounded-t-md">
              <button
                onClick={handleCopy}
                className="mx-5 py-1.5 text-sm transition-colors hover:cursor-pointer flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="max-h-[350px] p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
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