import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, CheckCircle2, Clock, Truck, XCircle, Search, Filter, Loader2 } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus, refreshOrders } = useStoreData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshOrders().finally(() => setLoading(false));
  }, [refreshOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Orders ({orders.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track and update order fulfillment statuses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
            />
          </div>

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
        </div>
      </div>

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
                    No orders yet.
                  </td>
                </tr>
              ) : filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-[#6B1518] text-sm">{ord.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{ord.customerName}</div>
                    <div className="text-[10px] text-gray-500">{ord.customerPhone} • {ord.address}</div>
                  </td>
                  <td className="p-4 text-gray-500">{ord.date}</td>
                  <td className="p-4 font-extrabold text-gray-900 text-sm">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        ord.paymentStatus === 'Paid' || (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes('paid'))
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
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
                      className="p-2 rounded-xl text-[#6B1518] hover:bg-[#F8F0F0] font-bold"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
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
              <span className="text-[#6B1518] text-base">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/91${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedOrder.customerName}, this is regarding your order ${selectedOrder.id} at Aalaya Vastra. Your order status is currently: ${selectedOrder.status}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>💬 WhatsApp Customer</span>
              </a>

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
