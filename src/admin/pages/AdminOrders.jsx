import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Eye, CheckCircle2, Clock, Truck, XCircle, Search, Filter, Loader2, Users, ShoppingBag, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminOrders({ initialTab = 'orders' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'customers' ? 'customers' : initialTab);

  const { orders, updateOrderStatus, refreshOrders } = useStoreData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshOrders().finally(() => setLoading(false));
  }, [refreshOrders]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam === 'customers' ? 'customers' : 'orders');
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Derive unique customers from orders
  const customerList = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.customerPhone || o.customerName || 'Unknown';
      if (!map[key]) {
        map[key] = {
          name: o.customerName || 'Guest Customer',
          phone: o.customerPhone || '',
          email: o.customerEmail || 'n/a',
          address: o.address || '',
          city: o.city || '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: o.date || '',
          ordersList: [],
        };
      }
      map[key].ordersCount += 1;
      map[key].totalSpent += o.totalAmount || 0;
      map[key].ordersList.push(o);
      if (o.date && (!map[key].lastOrderDate || o.date > map[key].lastOrderDate)) {
        map[key].lastOrderDate = o.date;
      }
    });
    return Object.values(map);
  }, [orders]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.id && o.id.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(search));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customerList.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleFilterCustomerOrders = (phone) => {
    setSearch(phone);
    handleTabChange('orders');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-serif text-2xl font-bold text-gray-900">Orders & Customers Management</h2>
          </div>
          <p className="text-xs text-gray-500">
            Track customer orders, update delivery statuses, and browse client purchase history in one unified dashboard.
          </p>

          {/* Unified Tab Selector */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleTabChange('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#6B1518] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>All Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-[#6B1518] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer Directory ({customerList.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'orders' ? 'Search by Order ID, Name, Phone...' : 'Search by Customer Name, Phone...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
            />
          </div>

          {activeTab === 'orders' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 font-serif text-sm">
                      {search ? 'No orders match your search criteria.' : 'No orders yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#6B1518] text-sm">{ord.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-500">{ord.customerPhone} • {ord.address}</div>
                      </td>
                      <td className="p-4 text-gray-500">{ord.date}</td>
                      <td className="p-4 font-extrabold text-gray-900 text-sm">₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              ord.paymentStatus === 'Paid' || (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes('paid'))
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus === 'Paid' ? 'PAID' : 'PENDING'}
                          </span>
                          <span className="text-[11px] font-medium text-gray-700 truncate max-w-[150px]" title={ord.paymentMethod}>
                            {ord.paymentMethod || 'Online'}
                          </span>
                          {ord.paymentId && (
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {ord.paymentId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border focus:outline-none ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : ord.status === 'Confirmed'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-2 rounded-xl text-[#6B1518] hover:bg-[#F8F0F0] font-bold cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER DIRECTORY TABLE */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Last Order</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 font-serif text-sm">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                        {c.address && <div className="text-[10px] text-gray-400 truncate max-w-xs">{c.address}</div>}
                      </td>
                      <td className="p-4 text-gray-700 font-mono">{c.phone}</td>
                      <td className="p-4 text-gray-500">{c.email}</td>
                      <td className="p-4 font-bold text-gray-800">
                        <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-[11px]">
                          {c.ordersCount} {c.ordersCount === 1 ? 'Order' : 'Orders'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-[#6B1518] text-sm">
                        ₹{c.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-[11px]">{c.lastOrderDate || '—'}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFilterCustomerOrders(c.phone || c.name)}
                            className="bg-[#FAF5EE] text-[#6B1518] hover:bg-[#6B1518] hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-lg border border-[#D3923A]/40 flex items-center gap-1 transition-all cursor-pointer"
                            title="View all orders from this customer"
                          >
                            <span>Orders</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {c.phone && (
                            <a
                              href={`https://wa.me/91${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#6B1518]">Order Details ({selectedOrder.id})</h3>
                <p className="text-[11px] text-gray-500">Placed on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="font-bold text-gray-400 hover:text-gray-700 text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400 block text-[10px]">Customer Name</span><span className="font-bold text-gray-900">{selectedOrder.customerName}</span></div>
                <div><span className="text-gray-400 block text-[10px]">Phone Number</span><span className="font-bold text-gray-900">{selectedOrder.customerPhone}</span></div>
              </div>
              <div><span className="text-gray-400 block text-[10px]">Delivery Address</span><span className="font-bold text-gray-900">{selectedOrder.address}</span></div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px]">Payment Method</span>
                  <span className="font-bold text-gray-900">{selectedOrder.paymentMethod || 'Razorpay'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Payment Status</span>
                  <span className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded ${
                    selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.paymentStatus || 'Pending'}
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px]">Razorpay Payment ID</span>
                    <span className="font-mono font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded inline-block">
                      {selectedOrder.paymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold uppercase text-gray-900 text-[10px] tracking-wider">Ordered Items</span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium">
                  <div>
                    <span className="font-bold text-gray-900 block">{item.name}</span>
                    <span className="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-extrabold text-sm">
              <span>Total Paid / Payable</span>
              <span className="text-[#6B1518] text-base">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              {selectedOrder.customerPhone && (
                <a
                  href={`https://wa.me/91${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedOrder.customerName}, this is regarding your order ${selectedOrder.id} at Aalaya Vastra. Your order status is currently: ${selectedOrder.status}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Customer</span>
                </a>
              )}

              <button onClick={() => setSelectedOrder(null)} className="bg-[#6B1518] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
