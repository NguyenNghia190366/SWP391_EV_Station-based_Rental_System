using System.Security.Cryptography;
using System.Text;

namespace BusinessLogicLayer.Helpers
{
    public class SecurityHelper
    {
        public static string CreateHmacSha256(string input, string key)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToHexString(hash).ToLower();
            }
        }
    }
}