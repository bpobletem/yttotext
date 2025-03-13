'use client'
import { useState } from 'react';

export default function Home() {
  const [ytLink, setYtLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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
    setError('');

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
      setError(`${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center content-center h-screen w-screen pb-10 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-radial-[at_40%_75%] from-slate-100 to-sky-100 to-90% bg-no-repeat scroll-smooth">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="flex text-3xl md:text-5xl font-extrabold text-slate-800">YouTube to Text</h1>
        <p className="text-center text-slate-600 max-w-md mb-2 md:mb-8">
          Paste a YouTube link to get its transcript. Transcript any video in seconds!
        </p>
        <div className='flex items-center gap-2 md:gap-4 mb-2 md:mb-8'>
          <input
            className='flex p-2 bg-slate-100 rounded-md border border-slate-500 text-slate-700'
            placeholder='YouTube link'
            value={ytLink}
            onChange={(e) => setYtLink(e.target.value)}
          ></input>
          <button
            className='flex py-2 px-4 items-center bg-slate-900 border rounded-md hover:bg-slate-700 hover:cursor-pointer transition duration-300'
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
        { error ? ( <div className='text-red-700'>{ error }</div> ) : null }
        {transcript.length > 0 && (
          <div className="relative max-w-2xl bg-gray-800 rounded-md backdrop-blur-sm border border-gray-500">
            <div className="sticky top-0 w-full flex justify-between items-center bg-gray-900 border-b border-gray-700 rounded-t-md">
              <h3 className='ms-4 text-md'>Transcript</h3>
              <button
                onClick={handleCopy}
                className="me-4 py-1.5 text-sm transition-colors hover:cursor-pointer flex items-center gap-1"
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
            <div className="max-h-[180px] md:max-h-[350px] p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
              {transcript}
            </div>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-slate-700">
        <p>by <a className='underline' href="https://bppm.dev" target="_blank">bppm</a></p>
      </footer>
    </div>
  );
}