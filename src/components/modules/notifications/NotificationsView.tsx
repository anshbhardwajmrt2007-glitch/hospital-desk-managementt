import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Calendar,
  Ticket,
  BedDouble,
  ReceiptText,
  Info,
  ExternalLink
} from 'lucide-react';
import { useHospital } from '../../../context/HospitalContext';
import { AppNotification } from '../../../types';
import { NavTab } from '../../layout/Sidebar';
import { EmptyState } from '../../common/EmptyState';

interface NotificationsViewProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateTab }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = useHospital();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-hospital-600" />;
      case 'queue':
        return <Ticket className="w-4 h-4 text-amber-600" />;
      case 'admission':
        return <BedDouble className="w-4 h-4 text-purple-600" />;
      case 'billing':
        return <ReceiptText className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notification & Activity Center</h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of patient check-ins, queue updates, admissions, and invoice collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-hospital-700 bg-white border border-hospital-200 rounded-xl hover:bg-hospital-50 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-hospital-600" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'appointment', label: 'Appointments' },
          { id: 'queue', label: 'Queue Calls' },
          { id: 'admission', label: 'Admissions' },
          { id: 'billing', label: 'Billing & Cashier' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                !notif.read ? 'bg-sky-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100/90 flex-shrink-0 mt-0.5">
                  {getTypeIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-hospital-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-mono">{notif.timestamp}</span>
                </div>
              </div>

              {notif.linkTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                    onNavigateTab(notif.linkTab as NavTab);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-hospital-600 hover:text-hospital-700 bg-hospital-50 hover:bg-hospital-100 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            title="No notifications in this filter"
            description="You're all caught up! New operational events and patient activities will appear here in real-time."
          />
        )}
      </div>
    </div>
  );
};
