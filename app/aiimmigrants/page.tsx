import type { Metadata } from 'next'
import { BookCover } from '@/components/BookCover'

export const metadata: Metadata = {
  title: 'AI Immigrants:  | The Bloody Algos Are Here! | Kevin Ryan',
  description:
    'A provocative exploration of AI ethics through the lens of immigration. Free to download in EPUB and PDF.',
  openGraph: {
    title: 'AI Immigrants: &ldquo;The Bloody Algos Are Here!&rdquo;',
    description: 'What if algorithms are just the latest scapegoat for problems we refuse to solve?',
    images: ['/aiimmigrants-cover.png'],
  },
}

export default function AIImmigrantsPage() {
  return (
    <main>
      <section className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-16">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <BookCover />
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Headline and Subhead */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content">
                AI Immigrants
              </h1>
              <p className="text-xl md:text-2xl text-primary font-medium mt-2">
                &ldquo;The Bloody Algos Are Here!&rdquo;
              </p>
              <p className="text-lg text-base-content/80 mt-4">
                A provocative exploration of AI ethics through the lens of immigration&mdash;free to
                download.
              </p>

              {/* Description */}
              <div className="mt-6 space-y-4 text-base-content/90">
                <p>
                  Every generation finds its scapegoat. In the 19th century, it was Chinese
                  railroad workers. In 2016, it was EU migrants. Today, it&apos;s algorithms.
                </p>
                <p>
                  <em>AI Immigrants</em> examines how the fears we project onto artificial
                  intelligence&mdash;job theft, cultural erosion, loss of control&mdash;echo centuries of
                  anti-immigrant sentiment. The parallels aren&apos;t coincidental.
                </p>
                <p>
                  But what if the algorithm is just the latest distraction from harder questions
                  about corporate power, labour rights, and democratic accountability?
                </p>
              </div>

              {/* Download Buttons */}
                           <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <a href="/aiimmigrants.epub" download className="btn btn-primary">
                  Download EPUB
                </a>
                <a href="https://open.spotify.com/show/4kmEP6R0vaa5mXVnltwJ0j?si=dc85edc5df984df2" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  🎧 Listen on Spotify
                </a>
              </div>

              {/* Author Bio */}
              <div className="mt-8 pt-8 border-t border-base-300">
                <p className="text-sm text-base-content/70">
                  <span className="font-semibold">Kevin Ryan</span> is a DevOps consultant and AI
                  governance specialist who has worked with organizations from startups to CERN.
                  He splits his time between the UK and Hungary, helping companies adopt AI
                  responsibly while questioning the narratives we tell ourselves about technology.
                </p>
              </div>

              {/* Chapter List */}
              <details className="mt-8">
                <summary className="cursor-pointer text-sm font-medium text-base-content hover:text-primary transition-colors">
                  View all 12 chapters
                </summary>
                <ol className="mt-4 text-sm text-base-content/70 list-decimal list-inside space-y-1">
                  <li>They&apos;re Taking Our Jobs</li>
                  <li>Over Here and Overpaid</li>
                  <li>They Don&apos;t Integrate or Fit In</li>
                  <li>Ruining Our Culture</li>
                  <li>They Overload Our Public Services</li>
                  <li>They Bring Crime and Disorder</li>
                  <li>The Synthetic Scapegoat</li>
                  <li>They&apos;re Here Illegally or Unfairly</li>
                  <li>The Algorithm Class</li>
                  <li>Sentience, Schm-entience</li>
                  <li>Humanity as a Luxury Brand</li>
                  <li>You Are Not Redundant</li>
                </ol>
              </details>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
