import React from "react";
import { Button, Card } from "antd";

export default function VerifiedSuccessPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg rounded-2xl max-w-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            You're verified! Start booking vehicles now!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Your account has been verified successfully. You can start booking vehicles now.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/home'}
            >
              🏠 Back to home
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => window.location.href = '/vehicles'}
            >
              🚗 View available vehicles
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
