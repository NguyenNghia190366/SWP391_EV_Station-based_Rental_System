import React from "react";
import { Button, Card } from "antd";

export default function VerifiedSuccessPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg rounded-2xl max-w-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Bạn đã xác thực, hãy bắt đầu đặt xe nào!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Tài khoản của bạn đã được xác thực thành công. Bạn có thể tiến hành đặt xe ngay bây giờ.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/home'}
            >
              🏠 Quay về trang chủ
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => window.location.href = '/vehicles'}
            >
              🚗 Xem xe có sẵn
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
