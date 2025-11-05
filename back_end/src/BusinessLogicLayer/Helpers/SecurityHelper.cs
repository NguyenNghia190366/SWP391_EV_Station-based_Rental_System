using System.Security.Cryptography;
using System.Text;

namespace BusinessLogicLayer.Helpers
{
    public class SecurityHelper
    {
        public static string CreateHmacSha256(string input, string key) // của MoMo
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToHexString(hash).ToLower();
            }
        }

        // --- HÀM MỚI CHO VNPAY (Tạo chữ ký) ---
        public static string CreateVnpayHmacSha512(SortedDictionary<string, string> data, string key)
        {
            var rawHash = new StringBuilder();
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.Value))
                {
                    rawHash.Append($"{item.Key}={item.Value}&");
                }
            }
            rawHash.Remove(rawHash.Length - 1, 1); // Xóa dấu '&' cuối cùng

            using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawHash.ToString()));
                return Convert.ToHexString(hash).ToLower();
            }
        }

        // --- HÀM MỚI CHO VNPAY (Kiểm tra chữ ký IPN) ---
        public static bool ValidateVnpaySignature(Dictionary<string, string> queryParams, string secretKey)
        {
            if (!queryParams.ContainsKey("vnp_SecureHash")) return false;

            string receivedHash = queryParams["vnp_SecureHash"];

            // 1. Tạo SortedDictionary (sắp xếp theo alphabet)
            var data = new SortedDictionary<string, string>(StringComparer.Ordinal);
            foreach (var item in queryParams)
            {
                if (!string.IsNullOrEmpty(item.Value) && 
                    item.Key.StartsWith("vnp_") && 
                    item.Key != "vnp_SecureHash") // Quan trọng: không hash chính nó
                {
                    data.Add(item.Key, item.Value);
                }
            }
            
            // 2. Tạo lại chữ ký
            string calculatedHash = CreateVnpayHmacSha512(data, secretKey);

            return receivedHash.Equals(calculatedHash, StringComparison.OrdinalIgnoreCase);
        }
    }
}