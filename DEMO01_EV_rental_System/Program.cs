
using DEMO01_EV_rental_System.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace DEMO01_EV_rental_System
{
    public class Program
    {
        public static void Main(string[] args)
        { 
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy("allowDevFrontend", p => {
                    p.WithOrigins("http://localhost:5173")
                     .AllowAnyMethod().AllowAnyHeader()
                     .AllowCredentials();
                     });
            });
            // Add services to the container.
            builder.Services.AddDbContext <RentalEvSystemFinalContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddSwaggerGen(options =>
            {
                var jwtSecurityScheme = new OpenApiSecurityScheme
                {
                    BearerFormat="JWT",
                    Name= "Authorization",
                    In= ParameterLocation.Header,
                    Type= SecuritySchemeType.Http,
                    Scheme= JwtBearerDefaults.AuthenticationScheme,
                    Description= "Put **_ONLY_** your JWT Bearer token on textbox below!",
                    Reference= new OpenApiReference
                    {
                        Id= JwtBearerDefaults.AuthenticationScheme,
                        Type= ReferenceType.SecurityScheme
                    }
                };

                options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { jwtSecurityScheme, Array.Empty<string>() }
                });
            });
            builder.Services.AddAuthentication(options =>
            {
                // Chỉ định rằng JWT Bearer là phương thức mặc định để xác thực và "thách thức" người dùng.
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

            })
// Cấu hình chi tiết cho việc xác thực bằng JWT Bearer.
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ClockSkew = TimeSpan.Zero
    };
    //// Định nghĩa các quy tắc để kiểm tra một token có hợp lệ hay không.
    //options.TokenValidationParameters = new TokenValidationParameters
    //{
    //    // Kiểm tra nhà phát hành (người tạo ra token).
    //    ValidateIssuer = true,
    //    ValidIssuer = builder.Configuration["Jwt:Issuer"],

    //    // Kiểm tra đối tượng được phép sử dụng token.
    //    ValidateAudience = true,
    //    ValidAudience = builder.Configuration["Jwt:Audience"],

    //    // Kiểm tra token có hết hạn hay không.
    //    ValidateLifetime = true,

    //    // Kiểm tra chữ ký của token để đảm bảo nó không bị giả mạo.
    //    ValidateIssuerSigningKey = true,
    //    IssuerSigningKey = new SymmetricSecurityKey(
    //        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

    //    // Không cho phép có độ trễ thời gian khi token hết hạn.
    //    ClockSkew = TimeSpan.Zero
    //};
});
            builder.Services.AddAuthorization();
            builder.Services.AddScoped<JwtService>();
            builder.Services.AddScoped<PasswordHasher>();



            var app = builder.Build();
            app.UseCors("allowDevFrontend");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

           
            app.MapControllers();

            app.Run();
        }
    }
}
