// src/Components/View/VerificationQueueView.jsx
import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Form,
  InputGroup,
  Navbar,
  Dropdown,
  ListGroup,
  Alert,
} from "react-bootstrap";

const VerificationQueueView = ({
  users = [],
  selectedUser,
  loading,
  processing,
  staffInfo,
  searchTerm = "",
  totalPending = 0,
  onSelectUser,
  onVerifyUser,
  onSearch,
  onRefresh,
  onLogout,
  onNavigate,
  onViewDocument,
}) => {
  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Đang tải danh sách xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* ===== NAVBAR ===== */}
      <Navbar bg="dark" variant="dark" className="shadow-sm mb-4">
        <Container>
          <Navbar.Brand
            onClick={() => onNavigate?.("/home")}
            style={{ cursor: "pointer" }}
          >
            📋 Staff Verification Panel
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-light" size="sm" onClick={onRefresh}>
              🔄 Refresh
            </Button>
            {staffInfo && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" size="sm">
                  👤 {staffInfo.name || staffInfo.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => onNavigate?.("/staff/dashboard")}
                  >
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Container>
      </Navbar>

      <Container className="py-4">
        {/* ===== HEADER & STATISTICS ===== */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="h4 mb-1">Xác thực người dùng</h2>
                    <p className="text-muted mb-0">
                      Có <strong>{totalPending}</strong> người dùng đang chờ xác
                      thực
                    </p>
                  </div>
                  <Badge bg="warning" className="fs-5 px-3 py-2">
                    {totalPending} Pending
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ===== SEARCH BAR ===== */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Form onSubmit={(e) => e.preventDefault()}>
                  <InputGroup>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                      placeholder="Tìm kiếm theo tên, email, số điện thoại, CMND..."
                      value={searchTerm}
                      onChange={(e) => onSearch?.(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => onSearch?.("")}
                      >
                        ✕
                      </Button>
                    )}
                  </InputGroup>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ===== MAIN CONTENT: 2 COLUMNS ===== */}
        <Row className="g-4">
          {/* ===== LEFT: DANH SÁCH USER ===== */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">⏳ Danh sách chờ xác thực</h5>
              </Card.Header>
              <Card.Body
                className="p-0"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {users.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <div className="mb-3">✅</div>
                    <p className="mb-0">Không có người dùng chờ xác thực</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {users.map((user) => (
                      <ListGroup.Item
                        key={user.id}
                        action
                        active={selectedUser?.id === user.id}
                        onClick={() => onSelectUser?.(user)}
                        className="border-0"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              backgroundColor: "#e9ecef",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            👤
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {user.fullName || user.name || "No name"}
                                </h6>
                                <p className="text-muted small mb-1">
                                  {user.email}
                                </p>
                                <p className="text-muted small mb-0">
                                  📞 {user.phone || "N/A"}
                                </p>
                              </div>
                              <Badge bg="warning" className="text-dark">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-muted small mb-0 mt-2">
                              Đăng ký:{" "}
                              {new Date(
                                user.createdAt || Date.now()
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* ===== RIGHT: CHI TIẾT USER ===== */}
          <Col lg={7}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📄 Thông tin chi tiết</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {!selectedUser ? (
                  <div className="text-center py-5 text-muted">
                    <div className="mb-3" style={{ fontSize: "3rem" }}>
                      👈
                    </div>
                    <p>Chọn người dùng từ danh sách để xem chi tiết</p>
                  </div>
                ) : (
                  <div>
                    {/* User Info */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">THÔNG TIN CÁ NHÂN</h6>
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <div className="text-muted small">Họ tên</div>
                            <div className="fw-semibold">
                              {selectedUser.fullName ||
                                selectedUser.name ||
                                "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <div className="text-muted small">Email</div>
                            <div className="fw-semibold">
                              {selectedUser.email}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <div className="text-muted small">
                              Số điện thoại
                            </div>
                            <div className="fw-semibold">
                              {selectedUser.phone || "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 bg-light rounded">
                            <div className="text-muted small">CMND/CCCD</div>
                            <div className="fw-semibold">
                              {selectedUser.idCard || "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={12}>
                          <div className="p-3 bg-light rounded">
                            <div className="text-muted small">
                              Giấy phép lái xe
                            </div>
                            <div className="fw-semibold">
                              {selectedUser.driverLicense || "N/A"}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Documents */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">GIẤY TỜ XÁC THỰC</h6>

                      {/* CMND Image */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-semibold">
                            Hình ảnh CMND/CCCD
                          </small>
                          {selectedUser.idCardImage && (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                onViewDocument?.(
                                  selectedUser.idCardImage,
                                  "CMND"
                                )
                              }
                            >
                              🔍 Xem toàn màn hình
                            </Button>
                          )}
                        </div>
                        <div
                          className="border rounded overflow-hidden"
                          style={{
                            height: "200px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          {selectedUser.idCardImage ? (
                            <img
                              src={selectedUser.idCardImage}
                              alt="CMND"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                              Không có hình ảnh
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Driver License Image */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-semibold">Hình ảnh GPLX</small>
                          {selectedUser.driverLicenseImage && (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                onViewDocument?.(
                                  selectedUser.driverLicenseImage,
                                  "GPLX"
                                )
                              }
                            >
                              🔍 Xem toàn màn hình
                            </Button>
                          )}
                        </div>
                        <div
                          className="border rounded overflow-hidden"
                          style={{
                            height: "200px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          {selectedUser.driverLicenseImage ? (
                            <img
                              src={selectedUser.driverLicenseImage}
                              alt="GPLX"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                              Không có hình ảnh
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <Alert variant="info" className="mb-3">
                      <small>
                        💡 <strong>Lưu ý:</strong> Kiểm tra kỹ thông tin và giấy
                        tờ trước khi xác thực
                      </small>
                    </Alert>

                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        size="lg"
                        disabled={processing}
                        onClick={() => onVerifyUser?.(selectedUser.id, true)}
                      >
                        {processing ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>✓ Xác thực</>
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        disabled={processing}
                        onClick={() => onVerifyUser?.(selectedUser.id, false)}
                      >
                        ✕ Từ chối
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerificationQueueView;
