// src/app/guidelines/page.tsx
import Link from 'next/link';

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section 
  className="relative bg-cover bg-center bg-no-repeat py-28 md:py-40 text-white overflow-hidden"
  style={{
    backgroundImage: "url('/images/guidelines-header-bg.jpg')", 
  }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-950/75 to-indigo-950/75" />
  
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-2xl">
      Author Guidelines
    </h1>
    <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-95 drop-shadow-lg">
      Everything you need to know before submitting to River Research & Innovation Journal
    </p>
  </div>
</section>

      {/* Main Guidelines */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100 prose prose-lg max-w-none text-gray-700">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">1. Manuscript Types Accepted</h2>
          <ul className="list-disc pl-6 space-y-2 mb-10">
            <li><strong>Original Research Articles</strong> — 6,000–8,000 words</li>
            <li><strong>Review Articles</strong> — up to 10,000 words</li>
            <li><strong>Short Communications / Technical Notes</strong> — 3,000–4,000 words</li>
            <li><strong>Case Studies</strong> — focused on real-world river projects</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">2. Manuscript Preparation</h2>
          <ul className="list-disc pl-6 space-y-2 mb-10">
            <li>File format: Microsoft Word (.docx) or LaTeX</li>
            <li>Font: Times New Roman, 12 pt, double-spaced</li>
            <li>Margins: 2.5 cm all sides</li>
            <li>Title page (separate): Title, Authors, Affiliations, Corresponding author</li>
            <li>Blind manuscript: No author names/affiliations in main file</li>
            <li>Abstract: 200–300 words</li>
            <li>Keywords: 4–8</li>
            <li>Figures/Tables: High resolution (300 dpi), numbered, with captions</li>
            <li>References: APA 7th edition (or Vancouver if preferred)</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">3. Required Files for Submission</h2>
          <ul className="list-disc pl-6 space-y-2 mb-10">
            <li>Main manuscript (anonymized)</li>
            <li>Title page with full author details</li>
            <li>Cover letter (max 1 page)</li>
            <li>Figures/tables as separate files (if not embedded)</li>
            <li>Declaration of competing interests</li>
            <li>Ethical approval statement (if applicable)</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">4. Important Policies</h2>
          <ul className="list-disc pl-6 space-y-2 mb-10">
            <li><strong>Double-blind peer review</strong></li>
            <li>Plagiarism screening (Turnitin/iThenticate)</li>
            <li>Open Access — CC BY 4.0 license</li>
            <li>Article Processing Charge (APC): Currently waived (until Dec 2026)</li>
            <li>Submission must be original and not under consideration elsewhere</li>
          </ul>

          <div className="bg-blue-50 p-8 rounded-xl mt-12 text-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Ready to Submit?
            </h3>
            <p className="text-lg mb-6">
              Use our online submission system below.
            </p>
            <Link
              href="/submit"
              className="inline-block px-10 py-5 bg-blue-600 text-white font-bold text-xl rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Go to Submission Portal →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}