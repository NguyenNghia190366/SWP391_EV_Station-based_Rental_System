using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.Services;


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

// Đăng ký các service của bạn (thêm vào đây)
builder.Services.AddScoped<IStationService, StationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

// -----------------------------
// Swagger
// -----------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Rental EV API", Version = "v1" });
});

// -----------------------------
// CORS (cho frontend Vite ở port 5173)
// -----------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173"       // nếu FE chạy cùng máy
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// -----------------------------
// Middleware pipeline
// -----------------------------
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Rental EV API v1");
        c.RoutePrefix = "swagger"; // truy cập Swagger qua /swagger
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
