// src/app/about/page.tsx
import Link from 'next/link';
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
        <section 
          className="relative bg-cover bg-center bg-no-repeat py-24 md:py-32 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/about-header-bg.jpg')", // ← Change this path to your image
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-transparent from-blue-900/80 to-indigo-900/80" />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80" /> */}

        {/* Content - on top of overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-lg">
            About RRI Journal
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-4xl mx-auto drop-shadow-md">
            River Research & Innovation Journal – Advancing knowledge on river systems, 
            water resources, and sustainable innovation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Mission & Vision */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The River Research & Innovation Journal (RRI Journal) is dedicated to publishing high-quality, peer-reviewed research 
                that advances understanding of river ecosystems, water resource management, hydrological processes, climate change impacts, 
                and innovative solutions for sustainable river basin development.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become a leading open-access platform in South Asia and beyond for interdisciplinary research on rivers, 
                fostering collaboration between scientists, policymakers, engineers, and communities to address pressing water-related challenges.
              </p>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Key Facts</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-xl">•</span>
                  <span>ISSN: 1234-5678 (Print) | 9876-5432 (Online)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-xl">•</span>
                  <span>Open Access – No subscription fees for readers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-xl">•</span>
                  <span>Double-blind peer review process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-xl">•</span>
                  <span>Published quarterly (March, June, September, December)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - History, Scope, Team */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">History</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Founded in 2024 by a group of river researchers and environmental engineers from leading universities in Bangladesh, 
                RRI Journal emerged from the need for a dedicated platform focused on river-related studies in the context of climate change, 
                delta management, and sustainable development in river-dependent regions.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-700 mb-6">Scope & Topics</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "River Hydrology & Hydraulics",
                  "River Basin Management",
                  "Climate Change & Rivers",
                  "Water Quality & Pollution",
                  "Sediment Transport & Morphology",
                  "Flood & Drought Management",
                  "River Ecology & Biodiversity",
                  "Sustainable Engineering Solutions"
                ].map((topic) => (
                  <div key={topic} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Editorial Team</h2>
              <p className="text-lg text-gray-700">
                Our journal is supported by an international editorial board of experts from Bangladesh, India, Nepal, 
                and other river-dependent countries, ensuring high academic standards and regional relevance.
              </p>
              <Link 
                href="/contact" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Meet the full editorial board →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}