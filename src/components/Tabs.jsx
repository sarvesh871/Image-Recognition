import './Tabs.css'

function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="Detail sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tabs__item ${activeTab === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className="tabs__count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
