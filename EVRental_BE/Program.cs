using Microsoft.EntityFrameworkCore;
using EVRentalAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// ===== Add services to the container =====
builder.Services.AddControllers();

// ===== Add DbContext with Connection String =====
builder.Services.AddDbContext<EV_Rental_SystemContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== Add Swagger =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== Add CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ===== Use CORS =====
app.UseCors("AllowAll");

// ===== Use Swagger (only in Development) =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===== Map Controllers =====
app.MapControllers();

// ===== Run App =====
app.Run();
