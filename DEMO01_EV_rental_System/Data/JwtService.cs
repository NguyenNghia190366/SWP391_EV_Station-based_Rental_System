using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DEMO01_EV_rental_System.Data
{
    public class JwtService
    {
        private readonly RentalEvSystemFinalContext _dbcontext;
        private readonly IConfiguration _configuration;
        public JwtService(RentalEvSystemFinalContext _Dbcontext, IConfiguration configuration)
        {
            _configuration = configuration;
            _dbcontext = _Dbcontext;
        }

        public async Task<LoginResponseDTO?> Authenticate(LoginRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return null;
            }

            var user = await _dbcontext.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
            PasswordHasher passwordHasher = new PasswordHasher();
            if (user is null || !passwordHasher.VerifyPassword(request.Password,user.Password_Hash))
            {
                return null;
            }

            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var key = _configuration["Jwt:Key"];
            var tokenValidityMins = _configuration.GetValue<int>("Jwt:ExpiresMinutes");
            var tokenExpiry = DateTime.Now.AddMinutes(tokenValidityMins);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Email, request.Email)
                   , new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = tokenExpiry,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key)),
                    SecurityAlgorithms.HmacSha512Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(securityToken);

            return new LoginResponseDTO
            {
                Token = tokenString,
                Email = user.Email,
                Role = user.Role,
                UserName = user.FullName,
                ExpirationInMinutes = (int)tokenExpiry.Subtract(DateTime.UtcNow).TotalSeconds
            }; 
        }

        }
}
