import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, Empty, Alert, Button } from 'antd';
import { useAxiosInstance } from '@/hooks/useAxiosInstance';
import dayjs from 'dayjs';

export default function PaymentHistory() {
  const axios = useAxiosInstance();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [apiMissing, setApiMissing] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // Get userId from localStorage (same approach as RentalHistoryPage)
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.warn('Không tìm thấy userId!');
          return;
        }
        
        // Fetch payments and rental orders so we can filter payments to only those belonging to current renter
        const [res, ordersRes] = await Promise.all([
          axios.get('/Payments'),
          axios.get('/RentalOrders').catch(() => ({ data: [] })),
        ]);

        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];

        // Build set of orderIds that belong to this renter (extract renterId from orders matching current userId)
        let renterId = null;
        const renterOrderIds = new Set();
        const userIdNum = Number(userId);
        
        // First pass: find renterId by matching userId in orders
        orders.forEach((o) => {
          const orderUserId = o.userId ?? o.user_id;
          if (orderUserId && Number(orderUserId) === userIdNum && !renterId) {
            renterId = o.renterId ?? o.renter_id;
          }
        });

        // Fallback: if renterId not found in orders, try localStorage (same as RentalHistoryPage)
        if (!renterId) {
          renterId = localStorage.getItem('renter_Id') || localStorage.getItem('renterId') || localStorage.getItem('renter_id');
        }

        // Second pass: if we found renterId, collect all orders belonging to that renter
        if (renterId != null) {
          orders.forEach((o) => {
            const ownerId = o.renterId ?? o.renter_id ?? o.RenterId ?? o.Renter_Id ?? o.renter;
            const oid = o.orderId ?? o.id ?? o.order_id;
            if (String(ownerId) === String(renterId) && oid != null) renterOrderIds.add(Number(oid));
          });
        }

        // Filter payments: if we have renterOrderIds, keep only payments whose orderId is in that set
        const filtered = renterOrderIds.size > 0
          ? data.filter(p => {
              const pid = p.orderId ?? p.order_id ?? p.OrderId;
              return pid != null && renterOrderIds.has(Number(pid));
            })
          : [];

        setPayments(filtered);
        setApiMissing(false);
      } catch (err) {
        console.error('Error fetching payments', err);
        // If backend doesn't expose Payments endpoint, show friendly message
        if (err?.response?.status === 404) {
          setApiMissing(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [axios]);

  const mockData = [
    {
      paymentId: 1001,
      orderId: 5001,
      typePayment: 'rental',
      amount: 150000,
      paymentMethod: 'VnPay',
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString(),
      externalRef: 'VNPAY-20251113-1001',
    },
    {
      paymentId: 1002,
      orderId: 5002,
      typePayment: 'deposit',
      amount: 50000,
      paymentMethod: 'Cash',
      paymentStatus: 'PAID',
      paymentDate: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      externalRef: 'CASH-20251112-200',
    },
    {
      paymentId: 1003,
      orderId: 5003,
      typePayment: 'refund',
      amount: 50000,
      paymentMethod: 'VnPay',
      paymentStatus: 'REFUNDED',
      paymentDate: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      externalRef: 'VNPAY-REF-300',
    }
  ];

  const paymentsToShow = useMock ? mockData : payments;

  const columns = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (v) => v || '-',
    },
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (v) => v || '-',
    },
    {
      title: 'Loại',
      dataIndex: 'typePayment',
      key: 'typePayment',
      render: (v) => v || '-',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (v) => {
        if (v == null) return '-';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
      }
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (v) => v ? <Tag color={v === 'PAID' ? 'green' : 'red'}>{v}</Tag> : '-'
    },
    {
      title: 'Thời gian',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Card title="Lịch sử giao dịch">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
          ) : apiMissing && !useMock ? (
            <Alert
              message="API chưa có: /Payments"
              description={"Backend chưa cung cấp endpoint /Payments (404). Bạn có thể dùng dữ liệu giả lập (mock) để phát triển giao diện hoặc chờ backend hỗ trợ."}
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary" onClick={() => setUseMock(true)}>
                  Hiển thị dữ liệu giả lập
                </Button>
              }
            />
          ) : payments.length === 0 ? (
            <Empty description="Chưa có giao dịch" />
          ) : (
            <Table dataSource={payments} columns={columns} rowKey={(r) => r.paymentId || `${r.orderId}-${r.paymentDate}`} pagination={{ pageSize: 10 }} />
          )}
        </Card>
      </div>
    </div>
  );
}
