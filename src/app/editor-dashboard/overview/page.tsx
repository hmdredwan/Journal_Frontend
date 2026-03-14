// src/app/editor-dashboard/overview/page.tsx
export default function OverviewContent() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Dashboard Overview</h3>
      <p className="text-gray-600">
        Welcome to the Editor Dashboard. Use the sidebar to manage submissions, perform initial screening,
        assign reviewers, monitor progress, and make final decisions.
      </p>

      {/* You can add real stats cards here later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h4 className="font-semibold text-lg">Pending Screening</h4>
          <p className="text-3xl font-bold mt-2 text-yellow-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h4 className="font-semibold text-lg">Under Review</h4>
          <p className="text-3xl font-bold mt-2 text-blue-600">28</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h4 className="font-semibold text-lg">Decisions Pending</h4>
          <p className="text-3xl font-bold mt-2 text-purple-600">7</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h4 className="font-semibold text-lg">This Month</h4>
          <p className="text-3xl font-bold mt-2 text-green-600">+15</p>
        </div>
      </div>
    </div>
  );
}