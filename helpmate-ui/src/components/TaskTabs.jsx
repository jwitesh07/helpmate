// src/components/TaskTabs.jsx

const TaskTabs = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { label: 'All Tasks', value: 'all' },
    { label: '🚚 Delivery', value: 'delivery' },
    { label: '🧹 Cleaning', value: 'cleaning' },
    { label: '💻 Tech Help', value: 'tech' },
    { label: '📦 Moving', value: 'moving' },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? 'filter-active'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            data-filter={filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskTabs;