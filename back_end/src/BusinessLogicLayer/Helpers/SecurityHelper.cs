using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace BusinessLogicLayer.Helpers
{
    public class SecurityHelper
    {
        // --- MOMO ---
        public static string CreateHmacSha256(string input, string key) 
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToHexString(hash).ToLower();
            }
        }

        // --- HÀM MỚI CHO VNPAY (Tạo chữ ký) ---
        public static string CreateVnpayHmacSha512(string inputData, string key) // <-- SỬA: Nhận 'string inputData'
        {
            // (Dùng logic y hệt code demo VNPAY)
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
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
                    item.Key != "vnp_SecureHash") // Chỉ xóa vnp_SecureHash
                {
                    data.Add(item.Key, item.Value);
                }
            }
            
            // --- SỬA LẠI LOGIC TẠO CHUỖI KÝ (RAW HASH) ---
            var signDataBuilder = new StringBuilder();
            foreach (var kvp in data)
            {
                if (signDataBuilder.Length > 0)
                {
                    signDataBuilder.Append('&');
                }
                // Encode CẢ Key VÀ Value
                signDataBuilder.Append($"{WebUtility.UrlEncode(kvp.Key)}={WebUtility.UrlEncode(kvp.Value)}");
            }
            string rawHash = signDataBuilder.ToString();
            // --- HẾT PHẦN SỬA ---

            // 2. Tạo lại chữ ký
            string calculatedHash = CreateVnpayHmacSha512(rawHash, secretKey); 

            return receivedHash.Equals(calculatedHash, StringComparison.OrdinalIgnoreCase);
        }
    }
}