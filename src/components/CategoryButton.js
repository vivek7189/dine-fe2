'use client';

const CategoryButton = ({ 
  category, 
  isSelected, 
  onClick, 
  itemCount 
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '8px',
        borderRadius: '8px',
        fontWeight: '600',
        border: '1px solid #f3f4f6',
        cursor: 'pointer',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: isSelected ? '#fef2f2' : '#fafafa',
        color: isSelected ? '#dc2626' : '#374151',
        fontSize: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Category Icon */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        backgroundColor: isSelected ? '#ef4444' : '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isSelected ? '🍽️' : category.emoji}
      </div>
      
      {/* Category Info */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '12px', 
          marginBottom: '2px',
          color: isSelected ? '#dc2626' : '#1f2937'
        }}>
          {category.name}
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: isSelected ? '#dc2626' : '#6b7280',
          fontWeight: '500'
        }}>
          {itemCount} items
        </div>
      </div>
    </button>
  );
};

export default CategoryButton;
//df