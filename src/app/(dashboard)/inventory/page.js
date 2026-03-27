'use client';

import { FaBoxes, FaClipboardList, FaShoppingCart, FaChartLine, FaBolt, FaCheckCircle, FaTimesCircle, FaHistory } from 'react-icons/fa';
import { useCurrency } from '../../../contexts/CurrencyContext';
import useInventory from './hooks/useInventory';
import DashboardTab from './components/DashboardTab';
import StockTab from './components/StockTab';
import RecipesTab from './components/RecipesTab';
import UsageTab from './components/UsageTab';
import ProcurementTab from './components/ProcurementTab';
import InsightsTab from './components/InsightsTab';
import InventoryModals from './components/InventoryModals';

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: FaBolt },
  { id: 'stock', name: 'Stock', icon: FaBoxes },
  { id: 'recipes', name: 'Recipes', icon: FaClipboardList },
  { id: 'usage', name: 'Usage', icon: FaHistory },
  { id: 'procurement', name: 'Procurement', icon: FaShoppingCart },
  { id: 'insights', name: 'AI Insights', icon: FaChartLine },
];

export default function InventoryManagement() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const inventory = useInventory();
  const { loading, isMobile, activeTab, setActiveTab, error, setError, success, setSuccess } = inventory;

  if (loading && !inventory.inventoryItems.length) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTop: '4px solid #059669',
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading inventory...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: '#1f2937',
              margin: 0, display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaBoxes color="white" size={16} />
              </div>
              Inventory
            </h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 44px' }}>
              Smart inventory management
            </p>
          </div>
          <button
            onClick={() => inventory.setShowQuickOrderModal(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
              transition: 'all 0.15s',
            }}
          >
            <FaClipboardList size={14} />
            Log External Order
          </button>
        </div>

        {/* Toast Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
            animation: 'slideInUp 0.2s ease-out'
          }}>
            <FaTimesCircle size={14} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{
              background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer',
              fontSize: '18px', padding: '0 4px', lineHeight: 1
            }}>×</button>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
            animation: 'slideInUp 0.2s ease-out'
          }}>
            <FaCheckCircle size={14} />
            <span style={{ flex: 1 }}>{success}</span>
            <button onClick={() => setSuccess(null)} style={{
              background: 'none', border: 'none', color: '#065f46', cursor: 'pointer',
              fontSize: '18px', padding: '0 4px', lineHeight: 1
            }}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          marginBottom: isMobile ? '16px' : '20px', display: 'flex', gap: '2px',
          backgroundColor: 'white', padding: '4px', borderRadius: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: isMobile ? '10px 14px' : '10px 20px',
                  borderRadius: '10px', border: 'none',
                  backgroundColor: isActive ? '#059669' : 'transparent',
                  color: isActive ? 'white' : '#6b7280',
                  fontWeight: '600', fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: isMobile ? '5px' : '8px', transition: 'all 0.2s',
                  whiteSpace: 'nowrap', minHeight: '40px'
                }}
              >
                <Icon size={isMobile ? 12 : 14} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            inventoryItems={inventory.inventoryItems}
            dashboardStats={inventory.dashboardStats}
            suppliers={inventory.suppliers}
            purchaseOrders={inventory.purchaseOrders}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            setShowAddModal={inventory.setShowAddModal}
            setShowQuickStockModal={inventory.setShowQuickStockModal}
            setActiveTab={setActiveTab}
            getStatusColor={inventory.getStatusColor}
          />
        )}

        {activeTab === 'stock' && (
          <StockTab
            sortedItems={inventory.sortedItems}
            categories={inventory.categories}
            searchTerm={inventory.searchTerm}
            setSearchTerm={inventory.setSearchTerm}
            selectedCategory={inventory.selectedCategory}
            setSelectedCategory={inventory.setSelectedCategory}
            sortBy={inventory.sortBy}
            setSortBy={inventory.setSortBy}
            sortOrder={inventory.sortOrder}
            setSortOrder={inventory.setSortOrder}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            setShowAddModal={inventory.setShowAddModal}
            handleEditItem={inventory.handleEditItem}
            handleDeleteItem={inventory.handleDeleteItem}
            getStatusColor={inventory.getStatusColor}
            dashboardStats={inventory.dashboardStats}
            inventoryItems={inventory.inventoryItems}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesTab
            recipes={inventory.recipes}
            inventoryItems={inventory.inventoryItems}
            categories={inventory.categories}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            setShowAddRecipeModal={inventory.setShowAddRecipeModal}
            handleEditRecipe={inventory.handleEditRecipe}
            handleViewRecipe={inventory.handleViewRecipe}
            handleDeleteRecipe={inventory.handleDeleteRecipe}
          />
        )}

        {activeTab === 'usage' && (
          <UsageTab
            usageTransactions={inventory.usageTransactions}
            usageSummary={inventory.usageSummary}
            usagePeriod={inventory.usagePeriod}
            setUsagePeriod={inventory.setUsagePeriod}
            usageStartDate={inventory.usageStartDate}
            setUsageStartDate={inventory.setUsageStartDate}
            usageEndDate={inventory.usageEndDate}
            setUsageEndDate={inventory.setUsageEndDate}
            loadUsageData={inventory.loadUsageData}
            loadingUsage={inventory.loadingUsage}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'procurement' && (
          <ProcurementTab
            procurementSubTab={inventory.procurementSubTab}
            setProcurementSubTab={inventory.setProcurementSubTab}
            suppliers={inventory.suppliers}
            purchaseOrders={inventory.purchaseOrders}
            grns={inventory.grns}
            purchaseRequisitions={inventory.purchaseRequisitions}
            supplierInvoices={inventory.supplierInvoices}
            supplierReturns={inventory.supplierReturns}
            stockTransfers={inventory.stockTransfers}
            supplierPerformance={inventory.supplierPerformance}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            setShowAddSupplierModal={inventory.setShowAddSupplierModal}
            setShowAddPurchaseOrderModal={inventory.setShowAddPurchaseOrderModal}
            setShowAddGRNModal={inventory.setShowAddGRNModal}
            setShowAddRequisitionModal={inventory.setShowAddRequisitionModal}
            setShowAddInvoiceModal={inventory.setShowAddInvoiceModal}
            setShowAddReturnModal={inventory.setShowAddReturnModal}
            setShowAddTransferModal={inventory.setShowAddTransferModal}
            handleDeleteSupplier={inventory.handleDeleteSupplier}
            handleUpdateOrderStatus={inventory.handleUpdateOrderStatus}
            handleEmailPurchaseOrder={inventory.handleEmailPurchaseOrder}
            getOrderStatusColor={inventory.getOrderStatusColor}
            startVoiceListeningPO={inventory.startVoiceListeningPO}
            isListeningVoice={inventory.isListeningVoice}
            voiceTranscript={inventory.voiceTranscript}
            processingVoice={inventory.processingVoice}
            voiceError={inventory.voiceError}
            smartSuggestions={inventory.smartSuggestions}
            loadingSuggestions={inventory.loadingSuggestions}
            selectedPOForGRN={inventory.selectedPOForGRN}
            setSelectedPOForGRN={inventory.setSelectedPOForGRN}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            aiReorderSuggestions={inventory.aiReorderSuggestions}
            wastePredictions={inventory.wastePredictions}
            wasteSummary={inventory.wasteSummary}
            inventoryItems={inventory.inventoryItems}
            suppliers={inventory.suppliers}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            generateReport={inventory.generateReport}
            reportData={inventory.reportData}
            setReportData={inventory.setReportData}
          />
        )}
      </div>

      {/* All Modals */}
      <InventoryModals {...inventory} formatCurrency={formatCurrency} />
    </div>
  );
}
