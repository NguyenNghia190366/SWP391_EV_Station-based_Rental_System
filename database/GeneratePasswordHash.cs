using System;
using BCrypt.Net;

namespace EVRental.Tools
{
    /// <summary>
    /// Tool để generate password hash cho dummy accounts
    /// Chạy file này để tạo hash cho passwords
    /// </summary>
    class GeneratePasswordHash
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== EV Rental Password Hash Generator ===\n");

            // Define passwords
            var passwords = new Dictionary<string, string>
            {
                { "Admin", "Admin@123" },
                { "Staff", "Staff@123" },
                { "Renter", "Renter@123" }
            };

            // Generate hashes
            foreach (var kvp in passwords)
            {
                string hash = BCrypt.Net.BCrypt.HashPassword(kvp.Value);
                Console.WriteLine($"{kvp.Key} Password: {kvp.Value}");
                Console.WriteLine($"Hash: {hash}");
                Console.WriteLine();
            }

            Console.WriteLine("\n=== Copy các hash này vào SQL script ===");
            Console.WriteLine("Hoặc update trực tiếp vào database:");
            Console.WriteLine();

            // Generate UPDATE statements
            string adminHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            string staffHash = BCrypt.Net.BCrypt.HashPassword("Staff@123");
            string renterHash = BCrypt.Net.BCrypt.HashPassword("Renter@123");

            Console.WriteLine($"UPDATE Users SET password_hash = '{adminHash}' WHERE email = 'admin@evrental.com';");
            Console.WriteLine($"UPDATE Users SET password_hash = '{staffHash}' WHERE email = 'staff@evrental.com';");
            Console.WriteLine($"UPDATE Users SET password_hash = '{renterHash}' WHERE email LIKE 'renter%@gmail.com';");

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}
