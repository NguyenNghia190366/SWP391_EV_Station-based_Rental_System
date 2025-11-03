using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.Services;
using BusinessLogicLayer.Helpers; // AutoMapper profile

// Using cho JWT
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Database
// -----------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------
// Controllers
// -----------------------------
builder.Services.AddControllers();

// Add service 
builder.Services.AddScoped<IStationService, StationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVehicleModelsService, VehicleModelsService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IRentalOrdersService, RentalOrdersService>();
builder.Services.AddScoped<IContractsService, ContractsService>();
builder.Services.AddScoped<IExtrasService, ExtrasService>();

// THÊM DÒNG NÀY (Để đọc User ID từ Token):
builder.Services.AddHttpContextAccessor();
builder.Services.AddAutoMapper(typeof(AutoMapperProfile)); // Đăng ký AutoMapper

// -----------------------------
// Authentication + Authorization (JWT)
// -----------------------------
// "Thuê" và "huấn luyện" dịch vụ xác thực (Authentication).
builder.Services.AddAuthentication(options =>
{
    // Chỉ định rằng JWT Bearer là phương thức mặc định để xác thực và "thách thức" người dùng.
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
// Cấu hình chi tiết cho việc xác thực bằng JWT Bearer.
.AddJwtBearer(options =>
{
    // Định nghĩa các quy tắc để kiểm tra một token có hợp lệ hay không.
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Kiểm tra nhà phát hành (người tạo ra token).
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        // Kiểm tra đối tượng được phép sử dụng token.
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],

        // Kiểm tra token có hết hạn hay không.
        ValidateLifetime = true,

        // Kiểm tra chữ ký của token để đảm bảo nó không bị giả mạo.
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

        // Không cho phép có độ trễ thời gian khi token hết hạn.
        ClockSkew = TimeSpan.Zero
    };
});
// Thêm dịch vụ phân quyền (Authorization), cần thiết để `[Authorize]` hoạt động.
builder.Services.AddAuthorization();

// -----------------------------
// Swagger (+ JWT Bearer support)
// -----------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Rental EV API", Version = "v1" });
    
    // Cấu hình để Swagger UI có nút "Authorize", cho phép người dùng nhập JWT token.
    var securityScheme = new OpenApiSecurityScheme
    {   // Name: Tên của HTTP Header chứa thông tin thẻ.
        Name = "Authorization",

        Description = "Nhập JWT token vào ô dưới đây.",
        // In: Vị trí đặt thẻ khi gửi đi.(ở đây là Header)
        In = ParameterLocation.Header,
        // Type: Loại cơ chế bảo mật. SecuritySchemeType.Http là loại phổ biến cho API
        Type = SecuritySchemeType.Http,
        Scheme = "bearer", // Phải là "bearer" viết thường.
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer" // Phải khớp với Id được định nghĩa ở AddSecurityDefinition.
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// -----------------------------
// CORS (cho frontend Vite ở port 5173)
// -----------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Chỉ cho phép origin này.
              .AllowAnyHeader()  // Cho phép mọi loại header.
              .AllowAnyMethod()  // Cho phép mọi phương thức (GET, POST, PUT, DELETE...).
              .AllowCredentials(); // Cho phép gửi cookie hoặc thông tin xác thực.
    });
});

var app = builder.Build();

// -----------------------------
// Middleware pipeline
// Phần này định nghĩa thứ tự các "lớp" xử lý mà một request phải đi qua.
// Thứ tự ở đây RẤT QUAN TRỌNG.
// -----------------------------


// Tự động chuyển hướng từ HTTP sang HTTPS để tăng bảo mật.
app.UseHttpsRedirection();
// Áp dụng CORS policy đã định nghĩa ở trên.
app.UseCors("AllowFrontend");

// Chỉ bật Swagger trong môi trường phát triển (Development).
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Rental EV API v1");
        // Đặt Swagger làm trang chủ khi chạy ở môi trường dev.
        c.RoutePrefix = string.Empty;
    });
}

// Middleware xác thực: kiểm tra token trong header của request.
// Phải đứng TRƯỚC UseAuthorization.
app.UseAuthentication();

// Middleware phân quyền: kiểm tra xem người dùng đã được xác thực có quyền truy cập vào endpoint hay không.
app.UseAuthorization();

// Ánh xạ các request đến đúng API Controller.
app.MapControllers();

// Chuyển hướng trang gốc đến Swagger cho tiện lợi
app.MapGet("/", () => Results.Redirect("/swagger"));

// Khởi chạy ứng dụng.
app.Run();
