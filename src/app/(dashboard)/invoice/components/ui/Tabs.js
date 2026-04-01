'use client';

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer
              ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
